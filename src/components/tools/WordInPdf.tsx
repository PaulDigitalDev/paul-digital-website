import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

// Kept in sync with MAX_FILE_BYTES / MAX_PAGES in lib/docxToPdf. The converter is imported lazily,
// so these are repeated here to validate the file before any conversion code is downloaded.
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_PAGES = 300;
const fmt = (bytes: number) => formatBytes(bytes, "de-DE");

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
      return `${fileName}: Diese Datei ist kein gültiges .docx-Dokument. Bitte wählen Sie eine gültige Datei aus.`;
    case "legacy":
      return `${fileName}: Dies ist eine ältere Word-Datei (.doc) oder eine passwortgeschützte Datei. Öffnen Sie sie in Word, entfernen Sie gegebenenfalls das Passwort und speichern Sie sie als .docx.`;
    case "encrypted":
      return `${fileName}: Die Datei ist passwortgeschützt. Entfernen Sie den Schutz und versuchen Sie es erneut.`;
    case "corrupt":
      return `${fileName}: Die Datei scheint beschädigt zu sein und ist nicht lesbar. Öffnen Sie sie in Word und speichern Sie sie erneut als .docx.`;
    case "too-large":
      return `${fileName}: Das Dokument ist zu umfangreich für die Verarbeitung im Browser (Limit: ${MAX_PAGES} Seiten und ein angemessener Inhaltsumfang). Teilen Sie es in kleinere Teile auf.`;
    case "unsupported":
      return `${fileName}: Dieses Dokument verwendet eine vom Browser nicht unterstützte Komprimierung oder nicht kompatible Funktionen.`;
    case "empty":
      return `${fileName}: In diesem Dokument wurden weder Text noch umwandelbare Bilder gefunden.`;
    default:
      return `${fileName}: Die Datei konnte nicht verarbeitet werden. Versuchen Sie es erneut oder verwenden Sie eine kleinere Datei.`;
  }
};

const noticeText: Record<string, string> = {
  headerFooter: "Kopfzeilen, Fußzeilen und Seitenzahlen werden nicht übernommen.",
  footnotes: "Fußnoten und Endnoten werden nicht übernommen.",
  textbox: "Textfelder werden nicht übernommen.",
  shape: "Formen, Vektorzeichnungen und eingebettete Objekte werden nicht übernommen.",
  chart: "Diagramme werden nicht übernommen.",
  equation: "Formeln werden nicht übernommen.",
  anchoredImage: "Frei positionierte Bilder werden in den Textfluss eingefügt; ihre Position kann sich daher ändern.",
  unsupportedImage: "Einige Bilder in einem nicht unterstützten Format wurden übersprungen.",
  replacedChars: "Einige Zeichen, die in den PDF-Standardschriften fehlen (Emojis, nicht lateinische Schriften …), wurden durch „?“ ersetzt.",
};

export default function WordInPdf() {
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
    setStatus("Datei entfernt. Wählen Sie ein anderes Dokument, um neu zu beginnen.");
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (/\.doc$/i.test(selected.name)) return setError(errorMessage("legacy", selected.name));
    if (!/\.docx$/i.test(selected.name)) return setError(`${selected.name}: Es werden nur Word-Dateien im Format .docx unterstützt. Bitte wählen Sie eine gültige Datei aus.`);
    if (selected.size === 0) return setError(`${selected.name}: Die Datei ist leer.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: ${fmt(selected.size)} – das überschreitet das Limit von ${fmt(MAX_FILE_BYTES)}.`);

    setFile(selected);
    runningRef.current = true;
    setBusy(true);
    try {
      setProgress("Konverter wird vorbereitet …");
      const { convertDocxToPdf } = await import("../../lib/docxToPdf");
      const bytes = new Uint8Array(await selected.arrayBuffer());
      const out = await convertDocxToPdf(bytes, selected.name, (p) => {
        if (p.stage === "reading") setProgress("Dokument wird gelesen …");
        else if (p.stage === "saving") setProgress("PDF wird erstellt …");
        else setProgress(`Dokument wird gesetzt … ${Math.round((p.done / Math.max(1, p.total)) * 100)}%`);
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
      setStatus("Umwandlung abgeschlossen. Das PDF wurde erstellt.");
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
        "Das PDF verwendet Standardschriften statt der Schriften des Dokuments; Zeilen- und Seitenumbrüche können daher von Word abweichen. Prüfen Sie das PDF, bevor Sie es weitergeben.",
      ]
    : [];

  return (
    <div className="ic" lang="de">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Word-Datei (.docx) hierher ziehen und ablegen"
        emptySub={`Wählen Sie ein .docx-Dokument aus, das in PDF umgewandelt werden soll. Maximal ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Word-Datei auswählen"
        moreLabel="Andere Datei auswählen"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple={false}
        busy={busy}
        ariaLabel="Ablagebereich für die Word-Datei"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Ihre Datei wird auf Ihrem Gerät verarbeitet und an keinen Server gesendet. Die Umwandlung ist eine Annäherung:
        Text, Grundformatierung, Listen, Tabellen und Bilder im Textfluss bleiben erhalten, das Layout kann jedoch von Word abweichen.
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
          tone={result.notices.length > 0 ? "warning" : "success"}
          title="Umwandlung abgeschlossen. Das PDF wurde erstellt."
          fileName={result.name}
          details={[
            { label: "Format", value: "PDF" },
            { label: "Größe", value: fmt(result.size) },
            { label: "Pages", value: String(result.pages) },
            { label: "Tabellen", value: String(result.tables) },
            { label: "Bilder", value: String(result.images) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              PDF herunterladen
            </a>
          }
          resetLabel="Weiteres Dokument umwandeln"
          onReset={reset}
        />
      )}
    </div>
  );
}
