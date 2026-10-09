import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { toBytes } from "../../data/imageSizeRoutes";
import { ResultPanel, StatusArea } from "./shared";
import type { ImageFormatScope, ImageSizeMode, SizeUnit } from "../../data/imageSizeRoutes";

/* ------------------------------------------------------------------ */
/* Processing engine — everything runs locally with canvas APIs.       */
/* ------------------------------------------------------------------ */

type MimeType = "image/jpeg" | "image/png" | "image/webp";

const MAX_INPUT_BYTES = 50 * 1024 * 1024;
const MAX_PIXELS = 100_000_000;
const MAX_ENCODES = 28;
const MIN_SIDE_PX = 16;
const Q_FLOOR = 0.3;
const Q_COMPRESS_FLOOR = 0.4;
const Q_HIGH = 0.92;
const Q_RESIZE = 0.85;

const EXTENSIONS: Record<MimeType, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const FORMAT_NAMES: Record<MimeType, string> = { "image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WebP" };

class Stopped extends Error {}
class Cancelled extends Error {}

interface Attempt {
  blob: Blob;
  width: number;
  height: number;
  quality: number | null;
  scale: number;
}

interface Goal {
  upper: number;
  /** Preferred lower bound (soft); only the upper bound is a hard limit. */
  lower: number;
}

interface FitContext {
  source: CanvasImageSource;
  naturalWidth: number;
  naturalHeight: number;
  mime: MimeType;
  goal: Goal;
  resizeFirst: boolean;
  onProgress: (message: string) => void;
  isCancelled: () => boolean;
}

interface FitOutcome {
  best: Attempt | null;
  smallest: Attempt | null;
  encodes: number;
}

async function sniffType(file: File): Promise<MimeType | null> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

function canEncode(mime: MimeType): boolean {
  if (mime === "image/jpeg" || mime === "image/png") return true;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    return canvas.toDataURL(mime).startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

interface Decoded {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      /* fall through to <img> decoding */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => undefined };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function isLossy(mime: MimeType) {
  return mime !== "image/png";
}

async function fit(ctx: FitContext): Promise<FitOutcome> {
  const { goal, mime, naturalWidth, naturalHeight } = ctx;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");
  const minScale = Math.min(1, MIN_SIDE_PX / Math.min(naturalWidth, naturalHeight));

  let encodes = 0;
  let best: Attempt | null = null;
  let smallest: Attempt | null = null;

  const encode = async (scale: number, quality: number | null): Promise<Attempt> => {
    if (ctx.isCancelled()) throw new Cancelled();
    if (encodes >= MAX_ENCODES) throw new Stopped();
    encodes += 1;
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));
    canvas.width = width;
    canvas.height = height;
    if (mime === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(ctx.source, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, quality === null ? undefined : quality),
    );
    if (!blob || blob.type !== mime) throw new Error(`This browser could not encode ${FORMAT_NAMES[mime]}.`);
    const attempt = { blob, width, height, quality, scale };
    if (!smallest || blob.size < smallest.blob.size) smallest = attempt;
    if (blob.size <= goal.upper && (!best || blob.size > best.blob.size)) best = attempt;
    const kb = (blob.size / 1024).toFixed(1);
    ctx.onProgress(`Attempt ${encodes}: ${width}×${height}px → ${kb} KB`);
    return attempt;
  };

  const inGoal = (a: Attempt) => a.blob.size <= goal.upper && a.blob.size >= goal.lower;

  /** Binary-search quality between a known-good low and an unknown high at a fixed scale. */
  const refineQuality = async (scale: number, low: number, high: number, iterations: number) => {
    for (let i = 0; i < iterations; i += 1) {
      const mid = (low + high) / 2;
      const attempt = await encode(scale, mid);
      if (attempt.blob.size <= goal.upper) {
        if (inGoal(attempt)) return;
        low = mid;
      } else {
        high = mid;
      }
      if (high - low < 0.02) return;
    }
  };

  const compressFirst = async () => {
    const full = await encode(1, Q_HIGH);
    if (full.blob.size <= goal.upper) {
      return;
    }
    const lowest = await encode(1, Q_COMPRESS_FLOOR);
    if (lowest.blob.size <= goal.upper) {
      await refineQuality(1, Q_COMPRESS_FLOOR, Q_HIGH, 6);
      return;
    }
    let scale = 1;
    let size = lowest.blob.size;
    for (let i = 0; i < 8; i += 1) {
      const factor = Math.min(0.92, Math.max(0.5, Math.sqrt(goal.upper / size) * 0.9));
      const next = Math.max(minScale, scale * factor);
      if (next >= scale - 0.001) return;
      scale = next;
      const attempt = await encode(scale, Q_COMPRESS_FLOOR);
      size = attempt.blob.size;
      if (size <= goal.upper) {
        await refineQuality(scale, Q_COMPRESS_FLOOR, Q_HIGH, 5);
        return;
      }
    }
  };

  const resizeFirst = async () => {
    const quality = isLossy(mime) ? Q_RESIZE : null;
    const aim = (goal.lower + goal.upper) / 2;
    let scale = 1;
    let lastScale = 1;
    for (let i = 0; i < 9; i += 1) {
      const attempt = await encode(scale, quality);
      lastScale = scale;
      if (inGoal(attempt)) return;
      const next = Math.min(1, Math.max(minScale, scale * Math.min(1.5, Math.sqrt(aim / attempt.blob.size))));
      if (Math.abs(next - scale) / scale < 0.01) break;
      if (next >= 1 && scale >= 1) break; // cannot enlarge beyond the original
      scale = next;
    }
    // Quality is lowered only when scaling alone could not reach the target.
    if (!best && isLossy(mime)) {
      const lowest = await encode(lastScale, Q_FLOOR);
      if (lowest.blob.size <= goal.upper) await refineQuality(lastScale, Q_FLOOR, Q_RESIZE, 5);
    }
  };

  try {
    if (ctx.resizeFirst || !isLossy(mime)) await resizeFirst();
    else await compressFirst();
  } catch (error) {
    if (!(error instanceof Stopped)) throw error;
  } finally {
    // Release the canvas backing store.
    canvas.width = 0;
    canvas.height = 0;
  }
  return { best, smallest, encodes };
}

/* ------------------------------------------------------------------ */
/* UI                                                                  */
/* ------------------------------------------------------------------ */

export interface ImageCompressorProps {
  mode: ImageSizeMode;
  scope: ImageFormatScope;
  target: number;
  unit: SizeUnit;
}

type OutputChoice = "keep" | "image/jpeg" | "image/webp";

interface Result {
  url: string;
  fileName: string;
  originalSize: number;
  outputSize: number;
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  format: MimeType;
  ok: boolean;
  limit: number;
  notes: string[];
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function exactBytes(bytes: number): string {
  return `${bytes.toLocaleString("en-US")} bytes`;
}

function parsePositive(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default function ImageCompressor(props: ImageCompressorProps) {
  const { mode, scope, unit: initialUnit } = props;
  const isJpegOnly = scope === "jpeg";

  const [file, setFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<MimeType | null>(null);
  const [targetValue, setTargetValue] = useState(String(props.target));
  const [unit, setUnit] = useState<SizeUnit>(initialUnit);
  const [output, setOutput] = useState<OutputChoice>("keep");
  const [webpOk, setWebpOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);
  const runRef = useRef(0);

  useEffect(() => {
    setWebpOk(canEncode("image/webp"));
    return () => {
      runRef.current += 1;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const clearResult = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setResult(null);
  }, []);

  const reset = useCallback(() => {
    clearResult();
    setFile(null);
    setInputType(null);
    setError("");
    setStatus("");
  }, [clearResult]);

  const accept = isJpegOnly ? "image/jpeg,.jpg,.jpeg" : "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

  const pickFile = useCallback(
    async (candidate: File | undefined) => {
      if (!candidate || busy) return;
      clearResult();
      setError("");
      setStatus("");
      if (candidate.size === 0) {
        setFile(null);
        return setError("That file is empty.");
      }
      if (candidate.size > MAX_INPUT_BYTES) {
        setFile(null);
        return setError(`That file is ${formatBytes(candidate.size)}. The limit is ${formatBytes(MAX_INPUT_BYTES)}.`);
      }
      const type = await sniffType(candidate);
      if (!type || (isJpegOnly && type !== "image/jpeg")) {
        setFile(null);
        return setError(
          isJpegOnly
            ? "This page accepts JPEG files only (.jpg or .jpeg). For PNG or WebP, use one of the general image pages."
            : "Unsupported file. Please choose a JPEG, PNG or WebP image. HEIC and AVIF are not supported.",
        );
      }
      setFile(candidate);
      setInputType(type);
      setStatus(`Selected ${candidate.name} (${formatBytes(candidate.size)}).`);
    },
    [busy, clearResult, isJpegOnly],
  );

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void pickFile(event.dataTransfer.files[0]);
  };

  const onDropzoneKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void pickFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const run = async () => {
    if (!file || !inputType || busy) return;
    setError("");
    clearResult();

    const value = parsePositive(targetValue);
    if (value === null) return setError("Enter a target size greater than zero.");
    const upper = toBytes(value, unit);
    const lower = Math.round(upper * 0.9);
    if (upper < 1024 || upper > MAX_INPUT_BYTES) return setError("Choose a target between 1 KB and 50 MB.");

    const mime: MimeType = isJpegOnly || output === "keep" ? (isJpegOnly ? "image/jpeg" : inputType) : output;
    if (!canEncode(mime)) {
      return setError(`This browser cannot create ${FORMAT_NAMES[mime]} files. Choose JPEG as the output format instead.`);
    }

    const notes: string[] = [];
    const runId = ++runRef.current;
    setBusy(true);
    setStatus("Working on your image…");
    let decoded: Decoded | null = null;
    try {
      decoded = await decode(file);
      if (decoded.width * decoded.height > MAX_PIXELS) {
        throw new Error(
          `This image is ${decoded.width}×${decoded.height}px, which is too large to process safely in a browser.`,
        );
      }

      let finalBlob: Blob;
      let width = decoded.width;
      let height = decoded.height;
      let ok: boolean;

      if (mime === inputType && file.size <= upper) {
        finalBlob = file;
        ok = true;
        notes.push("The original file already meets your target, so it was left unchanged.");
      } else {
        const outcome = await fit({
          source: decoded.source,
          naturalWidth: decoded.width,
          naturalHeight: decoded.height,
          mime,
          goal: { upper, lower },
          resizeFirst: mode === "resize",
          onProgress: (message) => runRef.current === runId && setProgress(message),
          isCancelled: () => runRef.current !== runId,
        });
        const chosen = outcome.best ?? outcome.smallest;
        if (!chosen) throw new Error("The image could not be encoded.");
        finalBlob = chosen.blob;
        width = chosen.width;
        height = chosen.height;
        ok = chosen.blob.size <= upper;

        if (!ok) {
          notes.push(
            `The target could not be reached: the smallest result was ${exactBytes(chosen.blob.size)}, above your ${exactBytes(upper)} limit. ` +
              (mime === "image/png"
                ? "PNG is lossless, so only fewer pixels reduce its size. Try JPEG or WebP output, or a larger target."
                : "The image would have to become too small to be useful. Try a larger target."),
          );
        }
        if (mime === "image/png") {
          notes.push("PNG encoding is lossless, so this tool reduced the pixel dimensions rather than the quality.");
        }
      }

      if (runRef.current !== runId) return;
      if (mime === "image/jpeg" && inputType !== "image/jpeg") {
        notes.push("JPEG has no transparency, so any transparent areas were filled with white.");
      }
      if (mime !== inputType) notes.push(`Output format: ${FORMAT_NAMES[mime]} (you chose to convert from ${FORMAT_NAMES[inputType]}).`);

      const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
      const url = URL.createObjectURL(finalBlob);
      urlRef.current = url;
      setResult({
        url,
        fileName: `${baseName}-${finalBlob === file ? "original" : "compressed"}.${EXTENSIONS[mime]}`,
        originalSize: file.size,
        outputSize: finalBlob.size,
        originalWidth: decoded.width,
        originalHeight: decoded.height,
        width,
        height,
        format: mime,
        ok,
        limit: upper,
        notes,
      });
      setStatus(ok ? "Done. Your image is ready to download." : "Finished, but the target was not met. See the details below.");
    } catch (caught) {
      if (caught instanceof Cancelled) return;
      const message = caught instanceof Error ? caught.message : "";
      setStatus("");
      setError(
        message ||
          "The image could not be processed. It may be corrupt, in an unsupported format, or too large for this device's memory.",
      );
    } finally {
      decoded?.release();
      if (runRef.current === runId) {
        setBusy(false);
        setProgress("");
      }
    }
  };

  const actionLabel = mode === "resize" ? "Resize image" : "Compress image";
  const sizeInfo = result
    ? result.outputSize <= result.originalSize
      ? `${Math.round((1 - result.outputSize / result.originalSize) * 100)}% smaller`
      : "larger than the original"
    : "";

  return (
    <div className="ic">
      <div
        className={`ic-drop${dragging ? " is-dragging" : ""}${file ? " has-file" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onKeyDown={onDropzoneKey}
        tabIndex={0}
        role="group"
        aria-label="Image drop area"
      >
        <p className="ic-drop-title">{file ? file.name : "Drag and drop an image here"}</p>
        <p className="ic-drop-sub">
          {file
            ? `${FORMAT_NAMES[inputType ?? "image/jpeg"]} · ${formatBytes(file.size)}`
            : isJpegOnly
              ? "JPEG only (.jpg, .jpeg) · up to 50 MB"
              : "JPEG, PNG or WebP · up to 50 MB"}
        </p>
        <button type="button" className="button" onClick={() => inputRef.current?.click()} disabled={busy}>
          {file ? "Choose a different image" : "Choose image"}
        </button>
        <input
          ref={inputRef}
          className="ic-file"
          type="file"
          accept={accept}
          onChange={onInputChange}
          aria-label="Choose an image file"
          tabIndex={-1}
        />
      </div>
      <p className="ic-hint">
        {isJpegOnly
          ? "This page works with JPEG files only. PNG and WebP images are not accepted here."
          : "Supported input: JPEG, PNG and WebP (WebP depends on your browser). HEIC and AVIF are not supported."}{" "}
        Your image is processed on this device and is never uploaded.
      </p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="ic-target">Target size (maximum)</label>
          <input
            id="ic-target"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
            disabled={busy}
          />
        </div>
        <div className="ic-field ic-field-unit">
          <label htmlFor="ic-unit">Unit</label>
          <select id="ic-unit" value={unit} onChange={(event) => setUnit(event.target.value as SizeUnit)} disabled={busy}>
            <option value="KB">KB</option>
            <option value="MB">MB</option>
          </select>
        </div>
        {!isJpegOnly && (
          <div className="ic-field">
            <label htmlFor="ic-format">Output format</label>
            <select
              id="ic-format"
              value={output}
              onChange={(event) => setOutput(event.target.value as OutputChoice)}
              disabled={busy}
            >
              <option value="keep">Same as original</option>
              <option value="image/jpeg">JPEG</option>
              {webpOk && <option value="image/webp">WebP</option>}
            </select>
          </div>
        )}
        <button type="submit" className="button button-primary ic-submit" disabled={!file || busy}>
          {busy ? "Working…" : actionLabel}
        </button>
      </form>
      <p className="ic-hint">
        1 KB = 1,024 bytes. Output is measured after encoding; the size is a goal, not a guarantee.
        {output === "image/jpeg" || isJpegOnly ? " JPEG has no transparency, so transparent areas become white." : ""}
      </p>

      <StatusArea busy={busy} progress={progress} status={status} errors={error ? [error] : []} />

      {result && (
        <ResultPanel
          ariaLabel="Result"
          tone={result.ok ? "success" : "warning"}
          title={result.ok ? "Target met" : "Target not met"}
          summary={
            result.ok
              ? `The image is ${formatBytes(result.outputSize)}, within your ${formatBytes(result.limit)} limit.`
              : `The smallest result is ${formatBytes(result.outputSize)}, above your ${formatBytes(result.limit)} limit.`
          }
          fileName={result.fileName}
          details={[
            { label: "Format", value: FORMAT_NAMES[result.format] },
            { label: "Size", value: formatBytes(result.outputSize), hint: `${exactBytes(result.outputSize)} · ${sizeInfo}` },
            {
              label: "Dimensions",
              value: `${result.width}×${result.height}px`,
              hint:
                result.width === result.originalWidth && result.height === result.originalHeight
                  ? "unchanged"
                  : `was ${result.originalWidth}×${result.originalHeight}px`,
            },
            { label: "Original", value: formatBytes(result.originalSize) },
          ]}
          notes={result.notes}
          primary={
            <a className="button button-download" href={result.url} download={result.fileName}>
              Download {result.fileName}
            </a>
          }
          resetLabel="Process another image"
          onReset={reset}
        >
          <img
            className="ic-preview"
            src={result.url}
            width={result.width}
            height={result.height}
            alt={`Preview of the ${result.ok ? "processed" : "processed (target not met)"} image, ${result.width} by ${result.height} pixels`}
          />
        </ResultPanel>
      )}
    </div>
  );
}
