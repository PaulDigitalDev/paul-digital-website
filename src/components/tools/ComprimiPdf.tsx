import { useEffect, useRef, useState } from "react";
import { CompressError, compressPdf, inspectForCompression, savedPercent } from "../../lib/pdfCompress";
import type { CompressLevel, CompressStage, CompressStats } from "../../lib/pdfCompress";
import { recodeJpegInBrowser } from "../../lib/jpegRecode";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const LOCALE = "it-IT";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Below this gain the result is reported as "no meaningful change" rather than a success. */
const MEANINGFUL_PERCENT = 1;

const LEVELS: { id: CompressLevel; label: string; hint: string }[] = [
  { id: "lossless", label: "Compressione leggera", hint: "Riorganizza il file e comprime la sua struttura. Le immagini non vengono modificate." },
  {
    id: "balanced",
    label: "Compressione bilanciata (consigliata)",
    hint: "Riduce anche le immagini JPEG: qualità da media ad alta, al massimo 2.000 pixel per lato.",
  },
  {
    id: "strong",
    label: "Compressione elevata",
    hint: "Riduce le immagini JPEG in modo più deciso: qualità media, al massimo 1.400 pixel per lato. La perdita di qualità può essere visibile in fotografie e documenti scansionati.",
  },
];

const STAGE_TEXT: Record<CompressStage, string> = {
  reading: "Lettura del PDF…",
  images: "Ottimizzazione delle immagini",
  streams: "Compressione del contenuto",
  saving: "Salvataggio del nuovo PDF…",
  verifying: "Verifica della leggibilità del risultato…",
};

interface Selected {
  file: File;
  pages: number;
}

interface Outcome {
  stats: CompressStats;
  /** Object URL of the compressed file (only created when it is smaller). */
  compressedUrl: string | null;
  /** Object URL of the untouched original, for "keep the original". */
  originalUrl: string;
  level: CompressLevel;
}

/** Italian-formatted percentage: one decimal below 10, e.g. "37%" or "4,2%". */
const formatPercent = (value: number) => {
  const abs = Math.abs(value);
  const digits = abs < 10 ? 1 : 0;
  return `${abs.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
};
const fmt = (bytes: number) => formatBytes(bytes, LOCALE);

function outputName(name: string) {
  return `${name.replace(/\.pdf$/i, "") || "documento"}-compresso.pdf`;
}

export default function ComprimiPdf() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [level, setLevel] = useState<CompressLevel>("balanced");
  const [stripMetadata, setStripMetadata] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [percent, setPercent] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const urls = useRef<string[]>([]);
  const running = useRef(false);

  const revokeUrls = () => {
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current = [];
  };
  useEffect(() => revokeUrls, []);

  const clearResult = () => {
    revokeUrls();
    setOutcome(null);
  };

  const reset = () => {
    clearResult();
    setSelected(null);
    setErrors([]);
    setStatus("File rimosso. Seleziona un altro file PDF per ricominciare.");
  };

  const pickFile = async (files: File[]) => {
    if (busy || files.length === 0) return;
    const file = files[0];
    clearResult();
    setStatus("");
    setErrors([]);
    setSelected(null);
    const problems: string[] = [];
    if (files.length > 1) problems.push("È possibile comprimere un solo PDF alla volta. È stato usato il primo file.");
    if (file.size === 0) return setErrors([`${file.name}: il file è vuoto.`]);
    if (file.size > MAX_FILE_BYTES)
      return setErrors([`${file.name}: ${fmt(file.size)} – supera il limite di ${fmt(MAX_FILE_BYTES)}.`]);
    setBusy(true);
    setProgress(`Lettura di ${file.name}…`);
    try {
      const info = await inspectForCompression(new Uint8Array(await file.arrayBuffer()));
      if (!info.ok) {
        problems.push(
          info.reason === "encrypted"
            ? `${file.name}: questo PDF è protetto da password. Lo strumento non può rimuovere la protezione: toglila prima con l'applicazione che usi per aprire il file e riprova.`
            : info.reason === "invalid"
              ? `${file.name}: questo file non è un PDF. Seleziona un file valido.`
              : `${file.name}: impossibile leggere questo PDF. Il file potrebbe essere danneggiato.`,
        );
        return setErrors(problems);
      }
      setErrors(problems);
      setSelected({ file, pages: info.pages });
      setStatus("PDF pronto. Scegli un livello di compressione e fai clic su «Avvia la compressione».");
    } catch {
      setErrors([`${file.name}: impossibile leggere questo file.`]);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const run = async () => {
    if (running.current || !selected) return;
    running.current = true;
    clearResult();
    setErrors([]);
    setStatus("");
    setPercent(0);
    setBusy(true);
    const { file } = selected;
    try {
      let original: Uint8Array | null = new Uint8Array(await file.arrayBuffer());
      const { bytes, stats } = await compressPdf(original, {
        level,
        stripMetadata,
        recodeJpeg: recodeJpegInBrowser,
        onProgress: (stage, done, total) => {
          setProgress(stage === "images" || stage === "streams" ? `${STAGE_TEXT[stage]} (${Math.min(done + 1, total)} di ${total})…` : STAGE_TEXT[stage]);
          setPercent(stage === "images" && total > 0 ? Math.round((done / total) * 100) : null);
        },
      });
      original = null; // release the input buffer
      const smaller = bytes.length < file.size;
      const compressedUrl = smaller ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })) : null;
      const originalUrl = URL.createObjectURL(file);
      urls.current = [originalUrl, ...(compressedUrl ? [compressedUrl] : [])];
      setOutcome({ stats, compressedUrl, originalUrl, level });
      setStatus(smaller ? "Compressione completata." : "Compressione completata: non è stato possibile ridurre questo PDF.");
    } catch (error) {
      const reason = error instanceof CompressError ? error.reason : "other";
      setErrors([
        reason === "encrypted"
          ? "Questo PDF è protetto da password e non può essere compresso."
          : reason === "invalid"
            ? "Questo file non è un PDF. Seleziona un file valido."
            : reason === "corrupt"
              ? "Impossibile leggere questo PDF. Il file potrebbe essere danneggiato."
              : reason === "verify"
                ? "Il PDF generato non ha superato la verifica e quindi non viene proposto. Il file originale non è stato modificato."
                : "Si è verificato un errore. Prova un altro livello oppure un file più piccolo.",
      ]);
    } finally {
      running.current = false;
      setBusy(false);
      setProgress("");
      setPercent(null);
    }
  };

  const renderResult = () => {
    if (!outcome || !selected) return null;
    const { stats, compressedUrl, originalUrl } = outcome;
    const original = selected.file.size;
    const change = savedPercent(original, stats.size);
    const smaller = compressedUrl !== null && change >= MEANINGFUL_PERCENT;
    const larger = stats.size > original;
    const notes: string[] = [];
    if (stats.imagesRecompressed > 0)
      notes.push(`Immagini ottimizzate: ${stats.imagesRecompressed} su ${stats.imagesFound}.`);
    else if (outcome.level !== "lossless" && stats.imagesFound > 0)
      notes.push("Non è stato possibile ridurre in sicurezza nessuna immagine JPEG; le immagini in altri formati restano invariate.");
    if (stats.streamsCompressed > 0) notes.push(`Blocchi di contenuto compressi: ${stats.streamsCompressed}.`);
    if (stats.unusedObjectsRemoved > 0) notes.push(`Dati inutilizzati rimossi: ${stats.unusedObjectsRemoved} oggetto/i.`);
    if (stats.metadataRemoved) notes.push("Metadati del documento rimossi.");
    notes.push("Se il PDF contiene una firma digitale, questa non sarà più valida nel file compresso.");

    const downloadOriginal = (primary: boolean) => (
      <a className={primary ? "button button-download" : "button"} href={originalUrl} download={selected.file.name}>
        Scarica il file originale
      </a>
    );

    if (smaller) {
      return (
        <ResultPanel
          ariaLabel="Risultato"
          tone="success"
          title="Compressione completata"
          summary={`La dimensione del file si è ridotta del ${formatPercent(change)}.`}
          fileName={outputName(selected.file.name)}
          details={[
            { label: "Dimensione originale", value: fmt(original) },
            { label: "Dimensione dopo la compressione", value: fmt(stats.size) },
            { label: "Riduzione", value: formatPercent(change) },
            { label: "Pagine", value: String(stats.pages) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={compressedUrl!} download={outputName(selected.file.name)}>
              Scarica il PDF
            </a>
          }
          secondary={downloadOriginal(false)}
          resetLabel="Comprimi un altro PDF"
          onReset={reset}
        />
      );
    }
    return (
      <ResultPanel
        ariaLabel="Risultato"
        tone="warning"
        title={larger ? "Il risultato sarebbe più grande" : "Non è stato possibile ridurre questo PDF"}
        summary={
          larger
            ? `Il PDF generato sarebbe di ${fmt(stats.size)}, cioè il ${formatPercent(-change)} più grande dell'originale (${fmt(original)}). Non viene proposto per il download: conviene tenere il file originale.`
            : `La dimensione cambia appena (${fmt(original)} → ${fmt(stats.size)}). Il file è probabilmente già ottimizzato: conviene tenere il file originale.`
        }
        details={[
          { label: "Dimensione originale", value: fmt(original) },
          { label: "Dimensione del risultato", value: fmt(stats.size) },
          { label: "Variazione", value: Math.abs(change) < 0.05 ? "Invariata" : `${change < 0 ? "+" : "−"}${formatPercent(change)}` },
          { label: "Pagine", value: String(stats.pages) },
        ]}
        notes={outcome.level === "strong" ? notes.slice(0, -1) : [...notes.slice(0, -1), "Prova un altro livello di compressione: il risultato dipende dal contenuto del PDF."]}
        primary={downloadOriginal(true)}
        resetLabel="Prova con un altro PDF"
        onReset={reset}
      />
    );
  };

  return (
    <div className="ic" lang="it">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Trascina qui un file PDF"
        emptySub={`Seleziona un PDF da comprimere. Massimo ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={selected ? `${selected.pages} pagina/e · ${fmt(selected.file.size)} · Puoi selezionare un altro file` : ""}
        buttonLabel="Seleziona un file PDF"
        moreLabel="Seleziona un altro file"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Area di rilascio per il file PDF"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Il file viene elaborato sul tuo dispositivo e non viene inviato a nessun server.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="cp-level">Livello di compressione</label>
          <select
            id="cp-level"
            value={level}
            onChange={(event) => {
              clearResult();
              setLevel(event.target.value as CompressLevel);
            }}
            disabled={busy}
          >
            {LEVELS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="st-checks">
          <label>
            <input
              type="checkbox"
              checked={stripMetadata}
              disabled={busy}
              onChange={(event) => {
                clearResult();
                setStripMetadata(event.target.checked);
              }}
            />{" "}
            Rimuovi i metadati del documento (titolo, autore, applicazione di origine)
          </label>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={!selected || busy}>
          {busy ? "Elaborazione in corso…" : "Avvia la compressione"}
        </button>
      </form>
      <p className="ic-hint">
        {LEVELS.find((item) => item.id === level)?.hint} Il risultato dipende dal contenuto del PDF: non è possibile garantire una riduzione specifica.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Elaborazione in corso…" : status}
      </div>
      {busy && progress ? (
        <div className="ic-hint ic-progress">
          <span aria-hidden="true">{progress}</span>
          {percent !== null ? <progress value={percent} max={100} aria-label="Avanzamento dell'elaborazione delle immagini" style={{ display: "block", width: "100%", marginTop: 6 }} /> : null}
        </div>
      ) : null}
      {errors.length > 0 && (
        <div className="ic-error" role="alert">
          {errors.map((message) => (
            <p key={message} style={{ margin: 0 }}>
              {message}
            </p>
          ))}
        </div>
      )}
      {renderResult()}
    </div>
  );
}
