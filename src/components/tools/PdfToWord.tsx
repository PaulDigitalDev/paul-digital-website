import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fmt = (bytes: number) => formatBytes(bytes, "en");

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
        return `${fileName}: this file is not a PDF.`;
      case "encrypted":
        return `${fileName}: the PDF is password protected. Remove the protection and try again.`;
      case "no-text":
        return `${fileName}: we found no selectable text in this PDF. It looks like a scanned document (page images). This version has no OCR and only converts PDFs that contain text.`;
      case "too-many-pages":
        return `${fileName}: the PDF has more than ${MAX_PAGES} pages, over this tool's limit.`;
      default:
        return `${fileName}: this PDF could not be read. It may be damaged or use an unsupported format.`;
    }
  }
  return "The PDF could not be converted. Try again or use a smaller file.";
};

export default function PdfToWord() {
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
    setStatus("File removed. Select another PDF to start.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "Opening the PDF…";
    if (p.stage === "building") return "Creating the Word document…";
    return `Extracting text from page ${p.page} of ${p.pages}…`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (selected.size === 0) return setError(`${selected.name}: the file is empty.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${selected.name}: this file is not a PDF.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: it is ${fmt(selected.size)}, over the ${fmt(MAX_FILE_BYTES)} limit.`);

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
      setStatus("Your Word document was created!");
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
              `${result.pagesWithoutText === 1 ? "1 page has" : `${result.pagesWithoutText} pages have`} no selectable text (possibly scanned) and ${result.pagesWithoutText === 1 ? "was" : "were"} left out of the document. This version has no OCR.`,
            ]
          : []),
        "Tables, columns, images and the exact page layout may not be kept. Check the document in Word before you use it.",
      ]
    : [];

  return (
    <div className="ic" lang="en">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Drag and drop your PDF file here"
        emptySub={`Select a PDF that contains text to convert it to Word. Up to ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Select PDF file"
        moreLabel="Choose another PDF"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Drop area for the PDF file"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Your file is processed on your device and is not sent to any server. It works with PDFs that have selectable
        text; scanned PDFs (images) are not supported in this version.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Converting the PDF…" : status}
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
          tone={result.pagesWithoutText > 0 ? "warning" : "success"}
          title="Your Word document is ready!"
          fileName={result.name}
          details={[
            { label: "Format", value: "DOCX (Word)" },
            { label: "Size", value: fmt(result.size) },
            { label: "Pages read", value: String(result.pages - result.pagesWithoutText) },
            { label: "Headings", value: String(result.headings) },
            { label: "Paragraphs", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Download DOCX
            </a>
          }
          resetLabel="Convert another PDF"
          onReset={reset}
        />
      )}
    </div>
  );
}
