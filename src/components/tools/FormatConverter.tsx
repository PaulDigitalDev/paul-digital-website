import { useEffect, useRef, useState } from "react";
import type { FormatTool } from "../../data/formatTools";
import {
  KIND_LABEL,
  MAX_FILE_BYTES,
  MAX_PIXELS,
  baseName,
  decodeImage,
  encodeBitmap,
  formatBytes,
  isJfif,
  sniffKind,
  verifyEncoded,
} from "../../lib/imageFormats";
import type { ImageKind, OutputKind } from "../../lib/imageFormats";
import { DropArea, ResultPanel, StatusArea, ZipButton, makeOutput, uniqueName } from "./shared";
import type { OutputFile } from "./shared";

/* Image Converter and the fixed-format converters (X to JPG, X to PNG). Decoding and encoding stay in the browser. */

const MAX_FILES = 100;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;

interface Item {
  id: number;
  file: File;
  kind: ImageKind;
}

interface Converted {
  id: number;
  source: string;
  sourceSize: number;
  width: number;
  height: number;
  output: OutputFile;
  notes: string[];
}

const BLOB_LABEL: Record<string, string> = { "image/jpeg": "JPG", "image/png": "PNG", "image/webp": "WebP" };
const OUT_LABEL: Record<OutputKind, string> = { jpeg: "JPG", png: "PNG", webp: "WebP" };
const OUT_EXT: Record<OutputKind, string> = { jpeg: "jpg", png: "png", webp: "webp" };

export default function FormatConverter({ tool }: { tool: FormatTool }) {
  const choose = tool.output === "choose";
  const [items, setItems] = useState<Item[]>([]);
  const [inputFilter, setInputFilter] = useState<ImageKind | "auto">("auto");
  const [outKind, setOutKind] = useState<OutputKind>(choose ? "png" : (tool.output as OutputKind));
  const [quality, setQuality] = useState(92);
  const [webpOk, setWebpOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [results, setResults] = useState<Converted[]>([]);
  const idRef = useRef(0);
  const resultsRef = useRef<Converted[]>([]);

  useEffect(() => {
    // Safari cannot encode WebP; canvas silently falls back to PNG, which we detect here.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    canvas.toBlob((blob) => setWebpOk(blob?.type === "image/webp"), "image/webp");
    return () => resultsRef.current.forEach((item) => URL.revokeObjectURL(item.output.url));
  }, []);

  const clearResults = () => {
    resultsRef.current.forEach((item) => URL.revokeObjectURL(item.output.url));
    resultsRef.current = [];
    setResults([]);
  };

  const reset = () => {
    clearResults();
    setItems([]);
    setErrors([]);
    setStatus("");
  };

  const allowedKinds: ImageKind[] = inputFilter === "auto" ? tool.inputs : [inputFilter];

  const addFiles = async (incoming: File[]) => {
    if (busy || incoming.length === 0) return;
    clearResults();
    setStatus("");
    const problems: string[] = [];
    const accepted: Item[] = [];
    let total = items.reduce((sum, item) => sum + item.file.size, 0);

    for (const file of incoming) {
      if (items.length + accepted.length >= MAX_FILES) {
        problems.push(`${file.name}: not added. A maximum of ${MAX_FILES} images is allowed.`);
        continue;
      }
      if (file.size === 0) {
        problems.push(`${file.name}: the file is empty.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        problems.push(`${file.name}: ${formatBytes(file.size)} is over the ${formatBytes(MAX_FILE_BYTES)} per-image limit.`);
        continue;
      }
      if (total + file.size > MAX_TOTAL_BYTES) {
        problems.push(`${file.name}: not added because the total would exceed ${formatBytes(MAX_TOTAL_BYTES)}.`);
        continue;
      }
      const kind = await sniffKind(file);
      if (!allowedKinds.includes(kind)) {
        const found = kind === "unknown" ? "not a recognised image format" : `a ${KIND_LABEL[kind]} file`;
        problems.push(
          `${file.name}: this is ${found}, but ${tool.h1} accepts ${tool.inputLabel}.` +
            (tool.slug === "image-converter" ? "" : " Use the Image Converter for other formats."),
        );
        continue;
      }
      total += file.size;
      accepted.push({ id: ++idRef.current, file, kind });
    }

    setErrors(problems);
    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      setStatus(`${accepted.length} image${accepted.length === 1 ? "" : "s"} added.`);
    }
  };

  const removeItem = (id: number) => {
    if (busy) return;
    clearResults();
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const run = async () => {
    if (items.length === 0) return setErrors(["Add at least one image first."]);
    if (outKind === "webp" && !webpOk) {
      return setErrors(["This browser cannot create WebP files. Choose JPG or PNG, or use Chrome, Edge or Firefox."]);
    }
    setErrors([]);
    clearResults();
    setBusy(true);
    const done: Converted[] = [];
    const problems: string[] = [];
    const names = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const { id, file, kind } = items[i];
      setProgress(`Converting ${i + 1} of ${items.length}: ${file.name}…`);
      await new Promise((resolve) => setTimeout(resolve));
      let bitmap: ImageBitmap | null = null;
      try {
        bitmap = await decodeImage(file, kind);
        if (bitmap.width * bitmap.height > MAX_PIXELS) {
          throw new Error(`${file.name} is ${bitmap.width}×${bitmap.height}px, which is too large to process safely.`);
        }
        const encoded = await encodeBitmap(bitmap, outKind, quality / 100);
        await verifyEncoded(encoded, outKind);
        const notes: string[] = [];
        if (outKind === "jpeg" && kind !== "jpeg") {
          notes.push("Any transparent areas were filled with white because JPG cannot store transparency.");
        }
        if (tool.slug === "jfif-to-jpg") {
          const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
          if (!isJfif(head)) notes.push("This file had no JFIF header, but it is valid JPEG data and was converted normally.");
        }
        if (kind === "gif" || kind === "webp" || kind === "avif") {
          notes.push("If the source was animated, only the first frame was converted.");
        }
        const ext = tool.outExt ?? OUT_EXT[outKind];
        const name = uniqueName(`${baseName(file.name)}.${ext}`, names);
        done.push({
          id,
          source: file.name,
          sourceSize: file.size,
          width: encoded.width,
          height: encoded.height,
          output: makeOutput(name, encoded.blob),
          notes,
        });
      } catch (caught) {
        problems.push(caught instanceof Error && caught.message ? caught.message : `${file.name} could not be converted.`);
      } finally {
        bitmap?.close();
      }
    }

    resultsRef.current = done;
    setResults(done);
    setErrors(problems);
    setStatus(
      done.length === 0
        ? ""
        : `Done. ${done.length} file${done.length === 1 ? "" : "s"} converted${problems.length ? `, ${problems.length} failed` : ""}.`,
    );
    setBusy(false);
    setProgress("");
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);
  const lossy = outKind !== "png";

  return (
    <div className="ic">
      <DropArea
        title={`${items.length} image${items.length === 1 ? "" : "s"} selected`}
        hasFiles={items.length > 0}
        emptyTitle={`Drag and drop ${tool.inputLabel} files here`}
        emptySub={`Accepts ${tool.inputLabel} · select several at once · up to 50 MB each`}
        filledSub={`${formatBytes(totalSize)} in total · add more any time`}
        buttonLabel="Choose files"
        moreLabel="Add more images"
        accept={tool.accept}
        multiple
        busy={busy}
        ariaLabel={`${tool.h1} drop area`}
        onFiles={(files) => void addFiles(files)}
      />
      <p className="ic-hint">Your images are converted on this device and are never uploaded.</p>

      {items.length > 0 && (
        <ol className="jp-list" aria-label="Selected images">
          {items.map((item, index) => (
            <li key={item.id} className="jp-item">
              <span className="jp-num" aria-hidden="true">
                {index + 1}
              </span>
              <span className="jp-name">
                {item.file.name}
                <small>
                  {KIND_LABEL[item.kind]} · {formatBytes(item.file.size)}
                </small>
              </span>
              <span className="jp-actions">
                <button type="button" onClick={() => removeItem(item.id)} disabled={busy} aria-label={`Remove ${item.file.name}`}>
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        {choose && (
          <>
            <div className="ic-field">
              <label htmlFor="fc-in">Input format</label>
              <select
                id="fc-in"
                value={inputFilter}
                onChange={(event) => setInputFilter(event.target.value as ImageKind | "auto")}
                disabled={busy || items.length > 0}
              >
                <option value="auto">Detect automatically</option>
                {tool.inputs.map((kind) => (
                  <option key={kind} value={kind}>
                    {KIND_LABEL[kind]} only
                  </option>
                ))}
              </select>
            </div>
            <div className="ic-field">
              <label htmlFor="fc-out">Output format</label>
              <select id="fc-out" value={outKind} onChange={(event) => setOutKind(event.target.value as OutputKind)} disabled={busy}>
                <option value="png">PNG (lossless, keeps transparency)</option>
                <option value="jpeg">JPG (smaller, white background)</option>
                <option value="webp" disabled={!webpOk}>
                  WebP{webpOk ? " (small, keeps transparency)" : " (not supported by this browser)"}
                </option>
              </select>
            </div>
          </>
        )}
        {lossy && (
          <div className="ic-field">
            <label htmlFor="fc-quality">
              {OUT_LABEL[outKind]} quality: {quality}%
            </label>
            <input
              id="fc-quality"
              type="range"
              min="40"
              max="100"
              step="1"
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              disabled={busy}
            />
          </div>
        )}
        <button type="submit" className="button button-primary ic-submit" disabled={items.length === 0 || busy}>
          {busy ? "Working…" : choose ? `Convert to ${OUT_LABEL[outKind]}` : tool.actionLabel}
        </button>
      </form>
      <p className="ic-hint">
        {outKind === "jpeg"
          ? "JPG cannot store transparency, so transparent areas are filled with white. "
          : outKind === "png"
            ? "PNG keeps transparency and every pixel, so files are often larger. "
            : "WebP keeps transparency; it is not understood by some older software. "}
        {choose && items.length > 0 ? "Remove all files to change the input format." : ""}
      </p>

      <StatusArea busy={busy} progress={progress} status={status} errors={errors} />

      {results.length > 0 && (
        <ResultPanel
          ariaLabel="Converted files"
          tone={errors.length > 0 ? "warning" : "success"}
          title={
            errors.length > 0
              ? `${results.length} of ${items.length} file${items.length === 1 ? "" : "s"} converted`
              : results.length === 1
                ? "Your file is ready"
                : `${results.length} files are ready`
          }
          summary={errors.length > 0 ? "Some files could not be converted. See the errors above." : undefined}
          fileName={results.length === 1 ? results[0].output.name : undefined}
          details={
            results.length === 1
              ? [
                  { label: "Format", value: BLOB_LABEL[results[0].output.blob.type] ?? OUT_LABEL[outKind] },
                  {
                    label: "Size",
                    value: formatBytes(results[0].output.blob.size),
                    hint: `from ${formatBytes(results[0].sourceSize)}`,
                  },
                  { label: "Dimensions", value: `${results[0].width}×${results[0].height}px` },
                ]
              : [
                  { label: "Format", value: BLOB_LABEL[results[0].output.blob.type] ?? OUT_LABEL[outKind] },
                  { label: "Files", value: String(results.length) },
                  { label: "Total size", value: formatBytes(results.reduce((sum, item) => sum + item.output.blob.size, 0)) },
                ]
          }
          notes={results.length === 1 ? results[0].notes : [...new Set(results.flatMap((item) => item.notes))]}
          primary={
            results.length === 1 ? (
              <a className="button button-download" href={results[0].output.url} download={results[0].output.name}>
                Download {results[0].output.name}
              </a>
            ) : (
              <ZipButton primary files={results.map((item) => item.output)} zipName="converted-images.zip" />
            )
          }
          resetLabel="Convert more images"
          onReset={reset}
        >
          <ul className="fc-results">
            {results.map((item) => (
              <li key={item.id} className="fc-result">
                <img className="fc-thumb" src={item.output.url} alt={`Preview of ${item.output.name}`} />
                {results.length > 1 && (
                  <div className="fc-meta">
                    <strong>{item.output.name}</strong>
                    <small>
                      {item.width}×{item.height}px · {formatBytes(item.sourceSize)} → {formatBytes(item.output.blob.size)}
                    </small>
                  </div>
                )}
                {results.length > 1 && (
                  <a className="button button-download" href={item.output.url} download={item.output.name}>
                    Download
                  </a>
                )}
              </li>
            ))}
          </ul>
        </ResultPanel>
      )}
    </div>
  );
}
