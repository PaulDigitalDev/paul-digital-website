import { useEffect, useRef, useState } from "react";
import { baseName, formatBytes } from "../../lib/imageFormats";
import { DPI_CHOICES, MAX_PAGES, PdfToJpgError, renderPdfToJpg } from "../../lib/pdfToJpg";
import type { RenderedPage } from "../../lib/pdfToJpg";
import { buildZip } from "../../lib/zip";
import { ActionButton, DoneView, DropOverlay, ErrorBox, PresetChips, SidePanel, UploadHero, Workspace, useFilePicker, useWindowDrop } from "./premium";

const MAX_FILE_BYTES = 100 * 1024 * 1024;

interface Result {
  url: string;
  name: string;
  size: number;
  pages: number;
  width: number;
  height: number;
  zip: boolean;
  reduced: boolean;
  thumbs: { url: string; name: string }[];
}

const message = (error: unknown, name: string) => {
  if (error instanceof PdfToJpgError) {
    switch (error.code) {
      case "invalid":
        return `${name}: this file is not a PDF.`;
      case "encrypted":
        return `${name}: the PDF is password protected. Remove the protection and try again.`;
      case "too-many-pages":
        return `${name}: the PDF has more than ${MAX_PAGES} pages, over this tool's limit.`;
      case "render":
        return `${name}: ${error.message}`;
      default:
        return `${name}: this PDF could not be read. It may be damaged or use an unsupported format.`;
    }
  }
  return "The PDF could not be converted. Try a smaller file or a lower DPI.";
};

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<number>(150);
  const [quality, setQuality] = useState(0.9);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<Result | null>(null);
  const runRef = useRef(0);

  const revoke = (r: Result | null) => {
    if (!r) return;
    URL.revokeObjectURL(r.url);
    r.thumbs.forEach((t) => URL.revokeObjectURL(t.url));
  };
  const clearResult = () => {
    revoke(resultRef.current);
    resultRef.current = null;
    setResult(null);
  };
  useEffect(
    () => () => {
      runRef.current += 1;
      revoke(resultRef.current);
    },
    [],
  );

  const pick = (files: File[]) => {
    const next = files[0];
    if (!next || busy) return;
    clearResult();
    if (next.size === 0) return setErrors([`${next.name}: the file is empty.`]);
    if (next.size > MAX_FILE_BYTES) return setErrors([`${next.name}: ${formatBytes(next.size)} is over the ${formatBytes(MAX_FILE_BYTES)} limit.`]);
    setErrors([]);
    setFile(next);
  };

  const picker = useFilePicker(".pdf,application/pdf", false, pick);
  const dropActive = useWindowDrop(!busy && !result, pick);

  const reset = () => {
    clearResult();
    setFile(null);
    setErrors([]);
  };

  const run = async () => {
    if (!file || busy) return;
    clearResult();
    setErrors([]);
    const runId = ++runRef.current;
    setBusy(true);
    setProgress("Reading the PDF…");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const base = baseName(file.name);
      const { pages } = await renderPdfToJpg(bytes, {
        dpi,
        quality,
        baseName: base,
        onProgress: (p) => runRef.current === runId && setProgress(`Page ${p.page} of ${p.pages}…`),
        isCancelled: () => runRef.current !== runId,
      });
      if (runRef.current !== runId) return;
      const zip = pages.length > 1;
      let blob: Blob;
      let name: string;
      if (zip) {
        const entries = await Promise.all(pages.map(async (p: RenderedPage) => ({ name: p.name, data: new Uint8Array(await p.blob.arrayBuffer()) })));
        blob = buildZip(entries);
        name = `${base}-jpg-pages.zip`;
      } else {
        blob = pages[0].blob;
        name = pages[0].name;
      }
      const thumbs = pages.slice(0, 12).map((p) => ({ url: URL.createObjectURL(p.blob), name: p.name }));
      const next: Result = {
        url: URL.createObjectURL(blob),
        name,
        size: blob.size,
        pages: pages.length,
        width: pages[0].width,
        height: pages[0].height,
        zip,
        reduced: pages.some((p) => p.reduced),
        thumbs,
      };
      resultRef.current = next;
      setResult(next);
    } catch (caught) {
      setErrors([message(caught, file.name)]);
    } finally {
      if (runRef.current === runId) {
        setBusy(false);
        setProgress("");
      }
    }
  };

  const stage = result ? "done" : file ? "work" : "upload";

  return (
    <div className="ic pt" data-stage={stage}>
      {picker.input}
      <DropOverlay active={dropActive} label={file ? "Drop to replace the PDF" : "Drop your PDF here"} />

      {stage === "upload" && (
        <UploadHero buttonLabel="Select PDF" dropLabel="or drop a PDF anywhere on this page" sub={`PDF up to 100 MB and ${MAX_PAGES} pages`} busy={busy} onOpen={picker.open}>
          <ErrorBox errors={errors} />
        </UploadHero>
      )}

      {stage === "work" && file && (
        <Workspace
          main={
            <div className="pt-files">
              <figure className={`pt-file${busy ? " is-busy" : ""}`}>
                <div className="pt-thumb">
                  {busy ? (
                    <div className="pt-file-busy" aria-hidden="true">
                      <span className="ic-spinner" />
                      <span>{progress || "Working…"}</span>
                    </div>
                  ) : (
                    <span className="pt-file-meta">PDF</span>
                  )}
                </div>
                <figcaption>
                  <span className="pt-file-name">{file.name}</span>
                  <span className="pt-file-meta">{formatBytes(file.size)}</span>
                </figcaption>
                <button type="button" className="pt-file-remove" onClick={reset} disabled={busy} aria-label={`Remove ${file.name}`}>
                  ×
                </button>
              </figure>
              <button type="button" className="pt-secondary" onClick={picker.open} disabled={busy}>
                Choose a different PDF
              </button>
            </div>
          }
          side={
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void run();
              }}
            >
              <SidePanel
                title="Image options"
                action={<ActionButton label="Convert to JPG" busyLabel={progress || "Converting…"} busy={busy} disabled={!file} />}
                footer={
                  <div className="ic-status sr-only" role="status" aria-live="polite">
                    {busy ? progress || "Working…" : ""}
                  </div>
                }
              >
                <p className="pt-label">Resolution</p>
                <PresetChips label="Resolution in DPI" disabled={busy} options={DPI_CHOICES.map((value) => ({ label: `${value} DPI`, active: dpi === value, onSelect: () => setDpi(value) }))} />
                <div className="ic-field st-slider">
                  <label htmlFor="pj-quality">Quality: {Math.round(quality * 100)}%</label>
                  <input id="pj-quality" type="range" min={50} max={100} step={1} value={Math.round(quality * 100)} disabled={busy} onChange={(e) => setQuality(Number(e.target.value) / 100)} />
                </div>
                <p className="pt-help">150 DPI suits screens and sharing, 300 DPI suits printing but makes bigger files. Every page is drawn on a white background and saved as its own JPG.</p>
                <ErrorBox errors={errors} />
              </SidePanel>
            </form>
          }
        />
      )}

      {stage === "done" && result && (
        <DoneView
          ok
          title={result.pages === 1 ? "Your JPG is ready!" : `Your ${result.pages} JPG images are ready!`}
          summary={result.zip ? `One JPG per page, packed into a ZIP (${formatBytes(result.size)}).` : `1 page, ${result.width}×${result.height}px, ${formatBytes(result.size)}.`}
          downloadHref={result.url}
          downloadName={result.name}
          downloadLabel={result.zip ? "Download ZIP" : "Download JPG"}
          stats={[
            { label: "Pages", value: String(result.pages) },
            { label: "First page size", value: `${result.width}×${result.height}px` },
            { label: "Download", value: formatBytes(result.size) },
          ]}
          preview={
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
              {result.thumbs.map((t) => (
                <a key={t.name} href={t.url} download={t.name} title={`Download ${t.name}`}>
                  <img src={t.url} alt={t.name} style={{ width: "120px", height: "auto", border: "1px solid #d7dde8", borderRadius: "6px" }} />
                </a>
              ))}
            </div>
          }
          notes={[
            ...(result.pages > result.thumbs.length ? [`Showing the first ${result.thumbs.length} pages. All ${result.pages} are in the ZIP.`] : []),
            ...(result.thumbs.length > 1 ? ["Tap a preview to download that page on its own."] : []),
            ...(result.reduced ? ["One or more pages were very large, so they were drawn at a lower resolution to stay within your browser's limits."] : []),
          ]}
          onBack={clearResult}
          backLabel="Back to the options"
          onReset={reset}
          resetLabel="Convert another PDF"
        />
      )}
    </div>
  );
}
