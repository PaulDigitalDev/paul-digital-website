import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fmt = (bytes: number) => formatBytes(bytes, "de-DE");

interface Result {
  url: string;
  name: string;
  size: number;
  pages: number;
  pagesWithoutText: number;
  paragraphs: number;
  headings: number;
}

const errorMessage = (error: unknown, fileName: string): string => {
  if (error instanceof PdfToWordError) {
    switch (error.code) {
      case "invalid":
        return `${fileName}: Diese Datei ist kein PDF. Bitte wählen Sie eine gültige Datei aus.`;
      case "encrypted":
        return `${fileName}: Dieses PDF ist passwortgeschützt. Entfernen Sie den Schutz und versuchen Sie es erneut.`;
      case "no-text":
        return `${fileName}: In diesem PDF wurde kein markierbarer Text gefunden. Vermutlich handelt es sich um ein eingescanntes Dokument (Seiten als Bilder). Texterkennung (OCR) wird nicht unterstützt – nur PDFs mit echtem Text können umgewandelt werden.`;
      case "too-many-pages":
        return `${fileName}: Dieses PDF hat mehr als ${MAX_PAGES} Seiten und überschreitet damit das Limit dieses Tools.`;
      default:
        return `${fileName}: Dieses PDF kann nicht gelesen werden. Die Datei ist möglicherweise beschädigt oder wird nicht unterstützt.`;
    }
  }
  return "Die Datei konnte nicht verarbeitet werden. Versuchen Sie es erneut oder verwenden Sie eine kleinere Datei.";
};

export default function PdfInWord() {
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
    setStatus("Datei entfernt. Wählen Sie eine andere PDF-Datei, um neu zu beginnen.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "PDF wird geöffnet …";
    if (p.stage === "building") return "Word-Dokument wird erstellt …";
    return `Text wird extrahiert: Seite ${p.page} von ${p.pages} …`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (selected.size === 0) return setError(`${selected.name}: Die Datei ist leer.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${selected.name}: Diese Datei ist kein PDF. Bitte wählen Sie eine gültige Datei aus.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: ${fmt(selected.size)} – das überschreitet das Limit von ${fmt(MAX_FILE_BYTES)}.`);

    setFile(selected);
    runningRef.current = true;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer());
      const out = await convertPdfToDocx(bytes, selected.name, (p) => setProgress(describe(p)));
      const url = URL.createObjectURL(out.blob);
      urlRef.current = url;
      setResult({
        url,
        name: selected.name.replace(/\.pdf$/i, "") + ".docx",
        size: out.blob.size,
        pages: out.pages,
        pagesWithoutText: out.pagesWithoutText,
        paragraphs: out.paragraphs,
        headings: out.headings,
      });
      setStatus("Umwandlung abgeschlossen. Das Word-Dokument wurde erstellt.");
    } catch (caught) {
      setError(errorMessage(caught, selected.name));
      setFile(null);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const notes = result
    ? [
        ...(result.pagesWithoutText > 0
          ? [
              `${result.pagesWithoutText} Seite(n) ohne markierbaren Text (vermutlich eingescannt) wurden nicht in das Dokument übernommen. Texterkennung (OCR) wird nicht unterstützt.`,
            ]
          : []),
        "Tabellen, Spalten, Bilder und das exakte Seitenlayout bleiben nicht zwingend erhalten. Prüfen Sie das Dokument in Word, bevor Sie es verwenden.",
      ]
    : [];

  return (
    <div className="ic" lang="de">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="PDF-Datei hierher ziehen und ablegen"
        emptySub={`Wählen Sie ein PDF mit Text aus, das in Word umgewandelt werden soll. Maximal ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="PDF-Datei auswählen"
        moreLabel="Andere Datei auswählen"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Ablagebereich für die PDF-Datei"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Ihre Datei wird auf Ihrem Gerät verarbeitet und an keinen Server gesendet. Das Tool funktioniert mit PDFs, die
        markierbaren Text enthalten; eingescannte PDFs (Bilder) werden nicht unterstützt.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Verarbeitung läuft …" : status}
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
          ariaLabel="Ergebnis"
          tone={result.pagesWithoutText > 0 ? "warning" : "success"}
          title="Umwandlung abgeschlossen. Das Word-Dokument wurde erstellt."
          fileName={result.name}
          details={[
            { label: "Format", value: "DOCX (Word)" },
            { label: "Größe", value: fmt(result.size) },
            { label: "Gelesene Seiten", value: String(result.pages - result.pagesWithoutText) },
            { label: "Überschriften", value: String(result.headings) },
            { label: "Absätze", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Word-Datei herunterladen
            </a>
          }
          resetLabel="Weitere PDF-Datei umwandeln"
          onReset={reset}
        />
      )}
    </div>
  );
}
