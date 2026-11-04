import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

// Kept in sync with MAX_FILE_BYTES / MAX_PAGES in lib/docxToPdf. The converter is imported lazily,
// so these are repeated here to validate the file before any conversion code is downloaded.
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_PAGES = 300;
const fmt = (bytes: number) => formatBytes(bytes, "en");

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
      return `${fileName}: this file is not a valid .docx document.`;
    case "legacy":
      return `${fileName}: it is an old Word file (.doc) or is password protected. Open it in Word, remove the password if it has one and save it as .docx.`;
    case "encrypted":
      return `${fileName}: the file is password protected. Remove the protection and try again.`;
    case "corrupt":
      return `${fileName}: the file seems damaged and could not be read. Try opening it in Word and saving it again as .docx.`;
    case "too-large":
      return `${fileName}: the document is too large to process in the browser (the limit is ${MAX_PAGES} pages and a reasonable amount of internal content). Split it into smaller parts.`;
    case "unsupported":
      return `${fileName}: this document uses a compression the browser does not support, or an unsupported feature.`;
    case "empty":
      return `${fileName}: we found no text or images to convert in this document.`;
    default:
      return `${fileName}: the document could not be converted. Try again or use a smaller file.`;
  }
};

const noticeText: Record<string, string> = {
  headerFooter: "Headers, footers and page numbers are not included.",
  footnotes: "Footnotes and endnotes are not included.",
  textbox: "Text boxes are not included.",
  shape: "Shapes, drawings and embedded objects are not included.",
  chart: "Charts are not included.",
  equation: "Equations are not included.",
  anchoredImage: "Floating images were placed in line with the text, so their position may change.",
  unsupportedImage: "Some images use an unsupported format and were left out.",
  replacedChars: "Some characters that do not exist in the standard PDF fonts (for example emoji or non-Latin alphabets) were replaced with “?”.",
};

export default function WordToPdf() {
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
    setStatus("File removed. Select another document to start.");
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (/\.doc$/i.test(selected.name)) return setError(errorMessage("legacy", selected.name));
    if (!/\.docx$/i.test(selected.name)) return setError(`${selected.name}: only Word .docx files are supported.`);
    if (selected.size === 0) return setError(`${selected.name}: the file is empty.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: it is ${fmt(selected.size)}, over the ${fmt(MAX_FILE_BYTES)} limit.`);

    setFile(selected);
    runningRef.current = true;
    setBusy(true);
    try {
      setProgress("Preparing the converter…");
      const { convertDocxToPdf } = await import("../../lib/docxToPdf");
      const bytes = new Uint8Array(await selected.arrayBuffer());
      const out = await convertDocxToPdf(bytes, selected.name, (p) => {
        if (p.stage === "reading") setProgress("Reading the document…");
        else if (p.stage === "saving") setProgress("Creating the PDF…");
        else setProgress(`Formatting the document… ${Math.round((p.done / Math.max(1, p.total)) * 100)}%`);
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
      setStatus("Your PDF was created!");
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
        "Standard PDF fonts are used instead of the document's own, so line and page breaks may differ from Word. Check the PDF before you send it.",
      ]
    : [];

  return (
    <div className="ic" lang="en">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Drag and drop your Word (.docx) file here"
        emptySub={`Select a .docx document to convert it to PDF. Up to ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Select Word file"
        moreLabel="Choose another document"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple={false}
        busy={busy}
        ariaLabel="Drop area for the Word file"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Your file is processed on your device and is not sent to any server. This is an approximate conversion: text,
        basic formatting, lists, tables and in-line images are kept, but the layout may differ from Word.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Converting the document…" : status}
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
          ariaLabel="Result"
          tone={result.notices.length > 0 ? "warning" : "success"}
          title="Your PDF is ready!"
          fileName={result.name}
          details={[
            { label: "Format", value: "PDF" },
            { label: "Size", value: fmt(result.size) },
            { label: "Pages", value: String(result.pages) },
            { label: "Tables", value: String(result.tables) },
            { label: "Images", value: String(result.images) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Download PDF
            </a>
          }
          resetLabel="Convert another document"
          onReset={reset}
        />
      )}
    </div>
  );
}
