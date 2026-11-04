import { useEffect, useRef, useState } from "react";
import { CompressError, compressPdf, formatPercent, inspectForCompression, savedPercent } from "../../lib/pdfCompress";
import type { CompressLevel, CompressStage, CompressStats } from "../../lib/pdfCompress";
import { recodeJpegInBrowser } from "../../lib/jpegRecode";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const LOCALE = "en";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Below this gain the result is reported as "no meaningful change" rather than a success. */
const MEANINGFUL_PERCENT = 1;

const LEVELS: { id: CompressLevel; label: string; hint: string }[] = [
  { id: "lossless", label: "No quality loss", hint: "Only reorganises and compresses the file structure. Images are not touched." },
  {
    id: "balanced",
    label: "Balanced (recommended)",
    hint: "Also shrinks JPEG images: medium-high quality and at most 2000 pixels per side.",
  },
  {
    id: "strong",
    label: "Maximum reduction",
    hint: "Shrinks JPEG images further: medium quality and at most 1400 pixels per side. It may show in photos and scans.",
  },
];

const STAGE_TEXT: Record<CompressStage, string> = {
  reading: "Reading the PDF…",
  images: "Optimising images",
  streams: "Compressing content",
  saving: "Saving the new PDF…",
  verifying: "Checking that the result opens correctly…",
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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const fmt = (bytes: number) => formatBytes(bytes, LOCALE);

function outputName(name: string) {
  return `${name.replace(/\.pdf$/i, "") || "document"}-compressed.pdf`;
}

/** `targetKb` is the size a landing page is aiming for. It only starts the tool on the strongest level and reports whether the file got under it; it is never promised. */
export default function CompressPdf({ targetKb }: { targetKb?: number }) {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [level, setLevel] = useState<CompressLevel>(targetKb ? "strong" : "balanced");
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
    setStatus("File removed. Select another PDF to start.");
  };

  const pickFile = async (files: File[]) => {
    if (busy || files.length === 0) return;
    const file = files[0];
    clearResult();
    setStatus("");
    setErrors([]);
    setSelected(null);
    const problems: string[] = [];
    if (files.length > 1) problems.push("Only one PDF can be compressed at a time. The first file was used.");
    if (file.size === 0) return setErrors([`${file.name}: the file is empty.`]);
    if (file.size > MAX_FILE_BYTES)
      return setErrors([`${file.name}: it is ${fmt(file.size)}, over the ${fmt(MAX_FILE_BYTES)} limit.`]);
    setBusy(true);
    setProgress(`Reading ${file.name}…`);
    try {
      const info = await inspectForCompression(new Uint8Array(await file.arrayBuffer()));
      if (!info.ok) {
        problems.push(
          info.reason === "encrypted"
            ? `${file.name}: the PDF is password protected. This tool cannot remove the protection; do it in the program you open it with and try again.`
            : info.reason === "invalid"
              ? `${file.name}: this file is not a PDF.`
              : `${file.name}: this PDF could not be read. It may be damaged.`,
        );
        return setErrors(problems);
      }
      setErrors(problems);
      setSelected({ file, pages: info.pages });
      setStatus("PDF ready. Choose the compression level and press “Compress PDF”.");
    } catch {
      setErrors([`${file.name}: this file could not be read.`]);
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
          setProgress(stage === "images" || stage === "streams" ? `${STAGE_TEXT[stage]} (${Math.min(done + 1, total)} of ${total})…` : STAGE_TEXT[stage]);
          setPercent(stage === "images" && total > 0 ? Math.round((done / total) * 100) : null);
        },
      });
      original = null; // release the input buffer
      const smaller = bytes.length < file.size;
      const compressedUrl = smaller ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })) : null;
      const originalUrl = URL.createObjectURL(file);
      urls.current = [originalUrl, ...(compressedUrl ? [compressedUrl] : [])];
      setOutcome({ stats, compressedUrl, originalUrl, level });
      setStatus(smaller ? "Compression finished." : "Compression finished: this PDF could not be reduced.");
    } catch (error) {
      const reason = error instanceof CompressError ? error.reason : "other";
      setErrors([
        reason === "encrypted"
          ? "The PDF is password protected and cannot be compressed."
          : reason === "invalid"
            ? "This file is not a PDF."
            : reason === "corrupt"
              ? "This PDF could not be read. It may be damaged."
              : reason === "verify"
                ? "The resulting PDF failed the check, so it is not offered. Your original file has not changed."
                : "The PDF could not be compressed. Try another level or a smaller file.",
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
      notes.push(`Images optimised: ${stats.imagesRecompressed} of ${stats.imagesFound}.`);
    else if (outcome.level !== "lossless" && stats.imagesFound > 0)
      notes.push("No JPEG images were found that could be reduced safely; other image formats are kept unchanged.");
    if (stats.streamsCompressed > 0) notes.push(`Content blocks compressed: ${stats.streamsCompressed}.`);
    if (stats.unusedObjectsRemoved > 0) notes.push(`Unused data removed: ${stats.unusedObjectsRemoved} objects.`);
    if (stats.metadataRemoved) notes.push("Document metadata was removed.");
    if (targetKb) notes.push(stats.size <= targetKb * 1024 ? `The file is now under ${targetKb} KB.` : `The file is still above ${targetKb} KB. Compressing again will not help much; a PDF made mostly of photos or scans may need fewer pages or lower-resolution scans.`);
    notes.push("If the PDF has a digital signature, the signature is no longer valid in the compressed file.");

    const downloadOriginal = (primary: boolean) => (
      <a className={primary ? "button button-download" : "button"} href={originalUrl} download={selected.file.name}>
        Keep the original
      </a>
    );

    if (smaller) {
      return (
        <ResultPanel
          ariaLabel="Result"
          tone="success"
          title="Your PDF is compressed"
          summary={`The file is ${formatPercent(change, LOCALE)} smaller.`}
          fileName={outputName(selected.file.name)}
          details={[
            { label: "Original size", value: fmt(original) },
            { label: "New size", value: fmt(stats.size) },
            { label: "Reduction", value: formatPercent(change, LOCALE) },
            { label: "Pages", value: String(stats.pages) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={compressedUrl!} download={outputName(selected.file.name)}>
              Download compressed PDF
            </a>
          }
          secondary={downloadOriginal(false)}
          resetLabel="Compress another PDF"
          onReset={reset}
        />
      );
    }
    return (
      <ResultPanel
        ariaLabel="Result"
        tone="warning"
        title={larger ? "The result would have been larger" : "This PDF could not be reduced"}
        summary={
          larger
            ? `The processed PDF would be ${fmt(stats.size)}, which is ${formatPercent(-change, LOCALE)} more than the original (${fmt(original)}). It is not offered for download: we recommend keeping the original.`
            : `The size barely changes (${fmt(original)} → ${fmt(stats.size)}). The file is probably already optimised, so we recommend keeping the original.`
        }
        details={[
          { label: "Original size", value: fmt(original) },
          { label: "Processed size", value: fmt(stats.size) },
          { label: "Change", value: Math.abs(change) < 0.05 ? "No change" : `${change < 0 ? "+" : "−"}${formatPercent(change, LOCALE)}` },
          { label: "Pages", value: String(stats.pages) },
        ]}
        notes={outcome.level === "strong" ? notes.slice(0, -1) : [...notes.slice(0, -1), "Try another compression level: the result depends on what is inside the PDF."]}
        primary={downloadOriginal(true)}
        resetLabel="Try another PDF"
        onReset={reset}
      />
    );
  };

  return (
    <div className="ic" lang="en">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Drag and drop your PDF file here"
        emptySub={`Select a PDF to compress. Up to ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={selected ? `${plural(selected.pages, "page", "pages")} · ${fmt(selected.file.size)} · you can choose another file` : ""}
        buttonLabel="Select PDF file"
        moreLabel="Change file"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Drop area for a PDF file"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Your file is processed on your device and is not sent to any server.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="cp-level">Compression level</label>
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
            Remove document metadata (title, author, creating program)
          </label>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={!selected || busy}>
          {busy ? "Compressing..." : "Compress PDF"}
        </button>
      </form>
      <p className="ic-hint">
        {LEVELS.find((item) => item.id === level)?.hint} The result depends on what is inside the PDF, and a particular reduction cannot be guaranteed.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Compressing…" : status}
      </div>
      {busy && progress ? (
        <div className="ic-hint ic-progress">
          <span aria-hidden="true">{progress}</span>
          {percent !== null ? <progress value={percent} max={100} aria-label="Image progress" style={{ display: "block", width: "100%", marginTop: 6 }} /> : null}
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
