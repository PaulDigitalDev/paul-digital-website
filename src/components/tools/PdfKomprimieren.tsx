import { useEffect, useRef, useState } from "react";
import { CompressError, compressPdf, inspectForCompression, savedPercent } from "../../lib/pdfCompress";
import type { CompressLevel, CompressStage, CompressStats } from "../../lib/pdfCompress";
import { recodeJpegInBrowser } from "../../lib/jpegRecode";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const LOCALE = "de-DE";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Below this gain the result is reported as "no meaningful change" rather than a success. */
const MEANINGFUL_PERCENT = 1;

const LEVELS: { id: CompressLevel; label: string; hint: string }[] = [
  { id: "lossless", label: "Leichte Komprimierung", hint: "Ordnet die Datei neu und komprimiert ihre Struktur. Bilder werden nicht verändert." },
  {
    id: "balanced",
    label: "Mittlere Komprimierung (empfohlen)",
    hint: "Verkleinert zusätzlich JPEG-Bilder: mittlere bis hohe Qualität, höchstens 2.000 Pixel pro Seite.",
  },
  {
    id: "strong",
    label: "Starke Komprimierung",
    hint: "Verkleinert JPEG-Bilder stärker: mittlere Qualität, höchstens 1.400 Pixel pro Seite. Der Qualitätsverlust kann bei Fotos und gescannten Dokumenten sichtbar sein.",
  },
];

const STAGE_TEXT: Record<CompressStage, string> = {
  reading: "PDF wird gelesen …",
  images: "Bilder werden optimiert",
  streams: "Inhalt wird komprimiert",
  saving: "Neues PDF wird gespeichert …",
  verifying: "Ergebnis wird auf korrekte Lesbarkeit geprüft …",
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

/** German-formatted percentage: one decimal below 10, e.g. "37 %" or "4,2 %". */
const formatPercent = (value: number, _locale: string) => {
  const abs = Math.abs(value);
  const digits = abs < 10 ? 1 : 0;
  return `${abs.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits })}\u202f%`;
};
const fmt = (bytes: number) => formatBytes(bytes, LOCALE);

function outputName(name: string) {
  return `${name.replace(/\.pdf$/i, "") || "document"}-komprimiert.pdf`;
}

export default function PdfKomprimieren() {
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
    setStatus("Datei entfernt. Wählen Sie eine andere PDF-Datei, um neu zu beginnen.");
  };

  const pickFile = async (files: File[]) => {
    if (busy || files.length === 0) return;
    const file = files[0];
    clearResult();
    setStatus("");
    setErrors([]);
    setSelected(null);
    const problems: string[] = [];
    if (files.length > 1) problems.push("Es kann jeweils nur eine PDF-Datei komprimiert werden. Die erste Datei wurde verwendet.");
    if (file.size === 0) return setErrors([`${file.name}: Die Datei ist leer.`]);
    if (file.size > MAX_FILE_BYTES)
      return setErrors([`${file.name}: ${fmt(file.size)} – das überschreitet das Limit von ${fmt(MAX_FILE_BYTES)}.`]);
    setBusy(true);
    setProgress(`${file.name} wird gelesen …`);
    try {
      const info = await inspectForCompression(new Uint8Array(await file.arrayBuffer()));
      if (!info.ok) {
        problems.push(
          info.reason === "encrypted"
            ? `${file.name}: Dieses PDF ist passwortgeschützt. Dieses Tool kann den Schutz nicht entfernen; entfernen Sie ihn zuerst in der Anwendung, mit der Sie die Datei öffnen, und versuchen Sie es dann erneut.`
            : info.reason === "invalid"
              ? `${file.name}: Diese Datei ist kein PDF. Bitte wählen Sie eine gültige Datei aus.`
              : `${file.name}: Dieses PDF kann nicht gelesen werden. Die Datei ist möglicherweise beschädigt.`,
        );
        return setErrors(problems);
      }
      setErrors(problems);
      setSelected({ file, pages: info.pages });
      setStatus("PDF bereit. Wählen Sie eine Komprimierungsstufe und klicken Sie auf „Komprimierung starten“.");
    } catch {
      setErrors([`${file.name}: Diese Datei kann nicht gelesen werden.`]);
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
          setProgress(stage === "images" || stage === "streams" ? `${STAGE_TEXT[stage]} (${Math.min(done + 1, total)} von ${total}) …` : STAGE_TEXT[stage]);
          setPercent(stage === "images" && total > 0 ? Math.round((done / total) * 100) : null);
        },
      });
      original = null; // release the input buffer
      const smaller = bytes.length < file.size;
      const compressedUrl = smaller ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })) : null;
      const originalUrl = URL.createObjectURL(file);
      urls.current = [originalUrl, ...(compressedUrl ? [compressedUrl] : [])];
      setOutcome({ stats, compressedUrl, originalUrl, level });
      setStatus(smaller ? "Komprimierung abgeschlossen." : "Komprimierung abgeschlossen: Dieses PDF konnte nicht verkleinert werden.");
    } catch (error) {
      const reason = error instanceof CompressError ? error.reason : "other";
      setErrors([
        reason === "encrypted"
          ? "Dieses PDF ist passwortgeschützt und kann nicht komprimiert werden."
          : reason === "invalid"
            ? "Diese Datei ist kein PDF. Bitte wählen Sie eine gültige Datei aus."
            : reason === "corrupt"
              ? "Dieses PDF kann nicht gelesen werden. Die Datei ist möglicherweise beschädigt."
              : reason === "verify"
                ? "Das erzeugte PDF hat die Prüfung nicht bestanden und wird daher nicht angeboten. Ihre Originaldatei wurde nicht verändert."
                : "Die Datei konnte nicht verarbeitet werden. Versuchen Sie eine andere Stufe oder eine kleinere Datei.",
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
      notes.push(`Optimierte Bilder: ${stats.imagesRecompressed} von ${stats.imagesFound}.`);
    else if (outcome.level !== "lossless" && stats.imagesFound > 0)
      notes.push("Es konnte kein JPEG-Bild risikofrei verkleinert werden; Bilder in anderen Formaten bleiben unverändert.");
    if (stats.streamsCompressed > 0) notes.push(`Komprimierte Inhaltsblöcke: ${stats.streamsCompressed}.`);
    if (stats.unusedObjectsRemoved > 0) notes.push(`Entfernte ungenutzte Daten: ${stats.unusedObjectsRemoved} Objekt(e).`);
    if (stats.metadataRemoved) notes.push("Dokument-Metadaten entfernt.");
    notes.push("Enthält das PDF eine digitale Signatur, ist diese in der komprimierten Datei nicht mehr gültig.");

    const downloadOriginal = (primary: boolean) => (
      <a className={primary ? "button button-download" : "button"} href={originalUrl} download={selected.file.name}>
        Originaldatei herunterladen
      </a>
    );

    if (smaller) {
      return (
        <ResultPanel
          ariaLabel="Ergebnis"
          tone="success"
          title="Komprimierung abgeschlossen"
          summary={`Die Dateigröße hat sich um ${formatPercent(change, LOCALE)} verringert.`}
          fileName={outputName(selected.file.name)}
          details={[
            { label: "Originalgröße", value: fmt(original) },
            { label: "Größe nach Komprimierung", value: fmt(stats.size) },
            { label: "Verringerung", value: formatPercent(change, LOCALE) },
            { label: "Seiten", value: String(stats.pages) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={compressedUrl!} download={outputName(selected.file.name)}>
              PDF herunterladen
            </a>
          }
          secondary={downloadOriginal(false)}
          resetLabel="Weitere PDF-Datei komprimieren"
          onReset={reset}
        />
      );
    }
    return (
      <ResultPanel
        ariaLabel="Ergebnis"
        tone="warning"
        title={larger ? "Das Ergebnis wäre größer" : "Dieses PDF konnte nicht verkleinert werden"}
        summary={
          larger
            ? `Das erzeugte PDF wäre ${fmt(stats.size)} groß, also ${formatPercent(-change, LOCALE)} größer als das Original (${fmt(original)}). Es wird nicht zum Download angeboten; behalten Sie besser die Originaldatei.`
            : `Die Größe ändert sich kaum (${fmt(original)} → ${fmt(stats.size)}). Die Datei ist vermutlich bereits optimiert; behalten Sie besser die Originaldatei.`
        }
        details={[
          { label: "Originalgröße", value: fmt(original) },
          { label: "Größe des Ergebnisses", value: fmt(stats.size) },
          { label: "Änderung", value: Math.abs(change) < 0.05 ? "Unverändert" : `${change < 0 ? "+" : "−"}${formatPercent(change, LOCALE)}` },
          { label: "Seiten", value: String(stats.pages) },
        ]}
        notes={outcome.level === "strong" ? notes.slice(0, -1) : [...notes.slice(0, -1), "Probieren Sie eine andere Komprimierungsstufe: Das Ergebnis hängt vom Inhalt des PDFs ab."]}
        primary={downloadOriginal(true)}
        resetLabel="Andere PDF-Datei versuchen"
        onReset={reset}
      />
    );
  };

  return (
    <div className="ic" lang="de">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="PDF-Datei hierher ziehen und ablegen"
        emptySub={`Wählen Sie ein PDF zum Komprimieren aus. Maximal ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={selected ? `${selected.pages} Seite(n) · ${fmt(selected.file.size)} · Sie können eine andere Datei auswählen` : ""}
        buttonLabel="PDF-Datei auswählen"
        moreLabel="Andere Datei auswählen"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Ablagebereich für die PDF-Datei"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Ihre Datei wird auf Ihrem Gerät verarbeitet und an keinen Server gesendet.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="cp-level">Komprimierungsstufe</label>
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
            Dokument-Metadaten entfernen (Titel, Autor, Ursprungsanwendung)
          </label>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={!selected || busy}>
          {busy ? "Verarbeitung läuft …" : "Komprimierung starten"}
        </button>
      </form>
      <p className="ic-hint">
        {LEVELS.find((item) => item.id === level)?.hint} Das Ergebnis hängt vom Inhalt des PDFs ab; eine bestimmte Verkleinerung kann nicht garantiert werden.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Verarbeitung läuft …" : status}
      </div>
      {busy && progress ? (
        <div className="ic-hint ic-progress">
          <span aria-hidden="true">{progress}</span>
          {percent !== null ? <progress value={percent} max={100} aria-label="Fortschritt der Bildverarbeitung" style={{ display: "block", width: "100%", marginTop: 6 }} /> : null}
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
