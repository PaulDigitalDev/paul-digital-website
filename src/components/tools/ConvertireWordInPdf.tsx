import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

// Kept in sync with MAX_FILE_BYTES / MAX_PAGES in lib/docxToPdf. The converter is imported lazily,
// so these are repeated here to validate the file before any conversion code is downloaded.
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_PAGES = 300;
const fmt = (bytes: number) => formatBytes(bytes, "it-IT");

interface Result {
  url: string;
  name: string;
  size: number;
  pages: number;
  tables: number;
  images: number;
  notices: string[];
}

const errorMessage = (code: string, fileName: string): string => {
  switch (code) {
    case "invalid":
      return `${fileName}: questo file non è un documento .docx valido. Seleziona un file valido.`;
    case "legacy":
      return `${fileName}: è un vecchio file Word (.doc) oppure un file protetto da password. Aprilo in Word, rimuovi l'eventuale password e salvalo come .docx.`;
    case "encrypted":
      return `${fileName}: il file è protetto da password. Rimuovi la protezione e riprova.`;
    case "corrupt":
      return `${fileName}: il file sembra danneggiato e non è leggibile. Aprilo in Word e salvalo di nuovo come .docx.`;
    case "too-large":
      return `${fileName}: il documento è troppo grande per essere elaborato nel browser (limite: ${MAX_PAGES} pagine e una quantità di contenuto ragionevole). Dividilo in parti più piccole.`;
    case "unsupported":
      return `${fileName}: questo documento usa una compressione o funzioni non supportate dal browser.`;
    case "empty":
      return `${fileName}: nel documento non sono stati trovati testo né immagini convertibili.`;
    default:
      return `${fileName}: si è verificato un errore. Riprova oppure usa un file più piccolo.`;
  }
};

const noticeText: Record<string, string> = {
  headerFooter: "Intestazioni, piè di pagina e numeri di pagina non vengono mantenuti.",
  footnotes: "Note a piè di pagina e note di chiusura non vengono mantenute.",
  textbox: "Le caselle di testo non vengono mantenute.",
  shape: "Forme, disegni vettoriali e oggetti incorporati non vengono mantenuti.",
  chart: "I grafici non vengono mantenuti.",
  equation: "Le formule non vengono mantenute.",
  anchoredImage: "Le immagini con posizione libera vengono inserite nel flusso del testo; la loro posizione può quindi cambiare.",
  unsupportedImage: "Alcune immagini in un formato non supportato sono state saltate.",
  replacedChars: "Alcuni caratteri assenti nei font standard del PDF (emoji, alfabeti non latini…) sono stati sostituiti con «?».",
};

export default function ConvertireWordInPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const urlRef = useRef<string | null>(null);
  const runningRef = useRef(false);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const clearResult = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setResult(null);
  };

  const reset = () => {
    clearResult();
    setFile(null);
    setError("");
    setStatus("File rimosso. Seleziona un altro documento per ricominciare.");
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (/\.doc$/i.test(selected.name)) return setError(errorMessage("legacy", selected.name));
    if (!/\.docx$/i.test(selected.name))
      return setError(`${selected.name}: sono supportati solo file Word in formato .docx. Seleziona un file valido.`);
    if (selected.size === 0) return setError(`${selected.name}: il file è vuoto.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: ${fmt(selected.size)} – supera il limite di ${fmt(MAX_FILE_BYTES)}.`);

    setFile(selected);
    runningRef.current = true;
    setBusy(true);
    try {
      setProgress("Preparazione del convertitore…");
      const { convertDocxToPdf } = await import("../../lib/docxToPdf");
      const bytes = new Uint8Array(await selected.arrayBuffer());
      const out = await convertDocxToPdf(bytes, selected.name, (p) => {
        if (p.stage === "reading") setProgress("Lettura del documento…");
        else if (p.stage === "saving") setProgress("Creazione del PDF…");
        else setProgress(`Impaginazione del documento… ${Math.round((p.done / Math.max(1, p.total)) * 100)}%`);
      });
      const blob = new Blob([out.bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setResult({
        url,
        name: selected.name.replace(/\.docx$/i, "") + ".pdf",
        size: blob.size,
        pages: out.pages,
        tables: out.tables,
        images: out.images,
        notices: out.notices,
      });
      setStatus("Conversione completata. Il file è stato elaborato correttamente.");
    } catch (caught) {
      const code = caught && typeof caught === "object" && "code" in caught ? String((caught as { code: unknown }).code) : "";
      setError(errorMessage(code, selected.name));
      setFile(null);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const notes = result
    ? [
        ...result.notices.map((n) => noticeText[n]).filter(Boolean),
        "Il PDF usa font standard al posto dei font del documento: le interruzioni di riga e di pagina possono quindi differire da Word. Controlla il PDF prima di condividerlo.",
      ]
    : [];

  return (
    <div className="ic" lang="it">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Trascina qui un file Word (.docx)"
        emptySub={`Seleziona un documento .docx da convertire in PDF. Massimo ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Seleziona un file Word"
        moreLabel="Seleziona un altro file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple={false}
        busy={busy}
        ariaLabel="Area di rilascio per il file Word"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Il file viene elaborato sul tuo dispositivo e non viene inviato a nessun server. La conversione è un&apos;approssimazione:
        testo, formattazione di base, elenchi, tabelle e immagini nel flusso del testo vengono mantenuti, ma l&apos;impaginazione può differire da Word.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Elaborazione in corso…" : status}
      </div>
      {busy && progress ? (
        <p className="ic-hint ic-progress" aria-hidden="true">
          {progress}
        </p>
      ) : null}
      {error && (
        <div className="ic-error" role="alert">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {result && (
        <ResultPanel
          ariaLabel="Risultato"
          tone={result.notices.length > 0 ? "warning" : "success"}
          title="Conversione completata. Il file è stato elaborato correttamente."
          fileName={result.name}
          details={[
            { label: "Formato", value: "PDF" },
            { label: "Dimensione", value: fmt(result.size) },
            { label: "Pagine", value: String(result.pages) },
            { label: "Tabelle", value: String(result.tables) },
            { label: "Immagini", value: String(result.images) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Scarica il PDF
            </a>
          }
          resetLabel="Converti un altro documento"
          onReset={reset}
        />
      )}
    </div>
  );
}
