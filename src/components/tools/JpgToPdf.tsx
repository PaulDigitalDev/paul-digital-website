import { useEffect, useRef, useState } from "react";
import { toBytes } from "../../data/imageSizeRoutes";
import type { SizeUnit } from "../../data/imageSizeRoutes";
import { buildPdf, isJpegSignature, parseJpeg } from "../../lib/jpegPdf";
import type { PageSizeChoice, PdfImage } from "../../lib/jpegPdf";
import { ActionButton, DoneView, DropOverlay, ErrorBox, SidePanel, UploadHero, Workspace, useFilePicker, useWindowDrop } from "./premium";

/* Everything runs locally: files are read with File APIs, the PDF is assembled in memory. */

const MAX_FILES = 100;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;
const MAX_PIXELS = 100_000_000;
const BASE_QUALITY = 0.92;
const MIN_LONG_SIDE = 800;

/** Quality / scale steps tried in order when the untouched JPEGs are too large. Never goes below these floors. */
const LADDER: { quality: number; scale: number }[] = [
  { quality: 0.85, scale: 1 },
  { quality: 0.75, scale: 1 },
  { quality: 0.65, scale: 1 },
  { quality: 0.55, scale: 1 },
  { quality: 0.65, scale: 0.85 },
  { quality: 0.6, scale: 0.7 },
  { quality: 0.55, scale: 0.6 },
  { quality: 0.5, scale: 0.5 },
];

interface Item {
  id: number;
  file: File;
  /** Object URL used for the page thumbnail; revoked when the item is removed. */
  thumb: string;
}

interface Result {
  url: string;
  fileName: string;
  size: number;
  target: number;
  ok: boolean;
  pages: number;
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

async function toPdfImage(bytes: Uint8Array): Promise<PdfImage | null> {
  const info = parseJpeg(bytes);
  if (!info || !info.embeddable) return null;
  return { bytes, width: info.width, height: info.height, components: info.components };
}

async function encodeBitmap(bitmap: ImageBitmap, scale: number, quality: number): Promise<PdfImage> {
  const long = Math.max(bitmap.width, bitmap.height);
  // Never shrink below the minimum long side (or below the original, if it is already smaller).
  const effective = Math.max(scale, Math.min(1, MIN_LONG_SIDE / long));
  const width = Math.max(1, Math.round(bitmap.width * effective));
  const height = Math.max(1, Math.round(bitmap.height * effective));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create a drawing surface for re-encoding.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  canvas.width = canvas.height = 0;
  if (!blob) throw new Error("Your browser could not re-encode an image.");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const image = await toPdfImage(bytes);
  if (!image) throw new Error("Your browser produced an unreadable JPEG while re-encoding.");
  return image;
}

export default function JpgToPdf({
  target,
  unit: initialUnit,
  label,
}: {
  target: number;
  unit: SizeUnit;
  label: "JPG" | "JPEG";
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [targetValue, setTargetValue] = useState(String(target));
  const [unit, setUnit] = useState<SizeUnit>(initialUnit);
  const [pageSize, setPageSize] = useState<PageSizeChoice>("a4");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const idRef = useRef(0);
  const urlRef = useRef<string | null>(null);

  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.thumb));
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
    items.forEach((item) => URL.revokeObjectURL(item.thumb));
    setItems([]);
    setErrors([]);
    setStatus("");
  };

  const addFiles = async (incoming: File[]) => {
    if (busy || incoming.length === 0) return;
    clearResult();
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
      const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      if (!isJpegSignature(head)) {
        problems.push(`${file.name}: this is not a valid JPG/JPEG file. Only .jpg and .jpeg images are accepted.`);
        continue;
      }
      total += file.size;
      accepted.push({ id: ++idRef.current, file, thumb: URL.createObjectURL(file) });
    }

    setErrors(problems);
    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      setStatus(`${accepted.length} image${accepted.length === 1 ? "" : "s"} added.`);
    } else {
      setStatus("");
    }
  };

  const picker = useFilePicker(".jpg,.jpeg,image/jpeg", true, (files) => void addFiles(files));
  const dropActive = useWindowDrop(!busy && !result, (files) => void addFiles(files));

  const removeItem = (id: number) => {
    if (busy) return;
    clearResult();
    setItems((current) => {
      const gone = current.find((item) => item.id === id);
      if (gone) URL.revokeObjectURL(gone.thumb);
      return current.filter((item) => item.id !== id);
    });
    setStatus("Image removed.");
  };

  const moveItem = (index: number, delta: number) => {
    if (busy) return;
    clearResult();
    setItems((current) => {
      const next = [...current];
      const to = index + delta;
      if (to < 0 || to >= next.length) return current;
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  };

  const run = async () => {
    const value = parsePositive(targetValue);
    if (value === null) return setErrors(["Enter a target size greater than zero."]);
    if (items.length === 0) return setErrors([`Add at least one ${label} image first.`]);
    const limit = toBytes(value, unit);

    setErrors([]);
    clearResult();
    setBusy(true);
    const bitmaps = new Map<number, ImageBitmap>();
    const notes: string[] = [];

    try {
      setProgress("Reading images…");
      const originals: (PdfImage | null)[] = [];
      for (const item of items) {
        const bytes = new Uint8Array(await item.file.arrayBuffer());
        const info = parseJpeg(bytes);
        if (!info) throw new Error(`${item.file.name} could not be read as a JPEG. It may be corrupt.`);
        if (info.width * info.height > MAX_PIXELS) {
          throw new Error(`${item.file.name} is ${info.width}×${info.height}px, which is too large to process safely.`);
        }
        originals.push(info.embeddable && info.orientation === 1 ? await toPdfImage(bytes) : null);
      }

      const getBitmap = async (index: number) => {
        let bitmap = bitmaps.get(index);
        if (!bitmap) {
          try {
            bitmap = await createImageBitmap(items[index].file);
          } catch {
            throw new Error(`${items[index].file.name} could not be decoded by your browser. It may be corrupt.`);
          }
          bitmaps.set(index, bitmap);
        }
        return bitmap;
      };

      // Step 0: images exactly as supplied. Only images PDF cannot show correctly (rotated by EXIF, CMYK, etc.) are re-encoded.
      const base: PdfImage[] = [];
      let normalised = 0;
      for (let i = 0; i < items.length; i++) {
        setProgress(`Preparing image ${i + 1} of ${items.length}…`);
        const original = originals[i];
        if (original) {
          base.push(original);
        } else {
          base.push(await encodeBitmap(await getBitmap(i), 1, BASE_QUALITY));
          normalised++;
        }
      }
      if (normalised > 0) {
        notes.push(
          `${normalised} image${normalised === 1 ? " was" : "s were"} re-encoded at high quality because the original used a rotation flag or colour mode that PDF viewers do not handle.`,
        );
      }

      let current = buildPdf(base, pageSize);
      let description = "";
      let usedStep = -1;

      if (current.size > limit) {
        let smallest = current;
        let smallestStep = -1;
        for (let step = 0; step < LADDER.length; step++) {
          const { quality, scale } = LADDER[step];
          setProgress(
            `Target not met yet (${formatBytes(current.size)}). Trying quality ${Math.round(quality * 100)}%` +
              (scale < 1 ? ` at ${Math.round(scale * 100)}% size` : "") +
              "…",
          );
          await new Promise((resolve) => setTimeout(resolve));
          const images: PdfImage[] = [];
          for (let i = 0; i < items.length; i++) {
            const candidate = await encodeBitmap(await getBitmap(i), scale, quality);
            // Keep whichever is smaller; a re-encode can be larger than an already well-compressed JPEG.
            images.push(candidate.bytes.length < base[i].bytes.length ? candidate : base[i]);
          }
          current = buildPdf(images, pageSize);
          if (current.size < smallest.size) {
            smallest = current;
            smallestStep = step;
          }
          if (current.size <= limit) break;
        }
        current = smallest;
        usedStep = smallestStep;
        if (usedStep >= 0) {
          const { quality, scale } = LADDER[usedStep];
          description = `re-encoded at ${Math.round(quality * 100)}% JPEG quality${scale < 1 ? ` and about ${Math.round(scale * 100)}% of the original dimensions` : ""}`;
        }
      }

      // Verify the real byte size by reading the finished file back.
      setProgress("Checking the finished PDF…");
      const buffer = new Uint8Array(await current.arrayBuffer());
      const text = (from: number, to: number) => String.fromCharCode(...buffer.subarray(from, to));
      const size = buffer.byteLength;
      if (size !== current.size || text(0, 5) !== "%PDF-" || !text(Math.max(0, size - 8), size).includes("%%EOF")) {
        throw new Error("The generated PDF failed its integrity check, so it was not offered for download.");
      }

      const ok = size <= limit;
      if (usedStep >= 0) {
        notes.push(`To approach your target, images were ${description}. Page order is unchanged and no image was dropped.`);
      } else if (ok) {
        notes.push(
          normalised === 0
            ? "Your JPEG files were embedded without any recompression, so image quality is unchanged."
            : "All other JPEG files were embedded without any recompression.",
        );
      }
      if (!ok) {
        const lowest = LADDER[LADDER.length - 1];
        notes.push(
          `The target was not reached. The smallest PDF this tool will produce is ${exactBytes(size)}, which is above your ${exactBytes(limit)} limit. ` +
            `To protect readability it will not go below ${Math.round(lowest.quality * 100)}% JPEG quality, about ${Math.round(lowest.scale * 100)}% of the original size, or roughly ${MIN_LONG_SIDE}px on the long side. ` +
            "Try fewer images, smaller or simpler originals (compress them first), or a larger target.",
        );
      }

      const url = URL.createObjectURL(current);
      urlRef.current = url;
      const base0 = items.length === 1 ? items[0].file.name.replace(/\.[^.]+$/, "") || "images" : "images";
      setResult({
        url,
        fileName: `${base0}.pdf`,
        size,
        target: limit,
        ok,
        pages: items.length,
        notes,
      });
      setStatus(ok ? "Done. Your PDF is ready to download." : "Finished, but the target was not met. See the details below.");
    } catch (caught) {
      setStatus("");
      setErrors([caught instanceof Error && caught.message ? caught.message : "The PDF could not be created."]);
    } finally {
      bitmaps.forEach((bitmap) => bitmap.close());
      setBusy(false);
      setProgress("");
    }
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);
  const stage = result ? "done" : items.length ? "work" : "upload";
  const originalTotal = totalSize;

  return (
    <div className="ic pt" data-stage={stage}>
      {picker.input}
      <DropOverlay active={dropActive} label={items.length ? `Drop to add more ${label} images` : `Drop your ${label} images here`} />

      {stage === "upload" && (
        <UploadHero
          buttonLabel={`Select ${label} images`}
          dropLabel="or drop images anywhere on this page"
          sub={`${label} only (.jpg, .jpeg) · select several at once · up to 50 MB each`}
          busy={busy}
          onOpen={picker.open}
        >
          <ErrorBox errors={errors} />
        </UploadHero>
      )}

      {stage === "work" && (
        <Workspace
          main={
            <>
              <p className="pt-main-head">
                {items.length} page{items.length === 1 ? "" : "s"} · {formatBytes(totalSize)}
                <span> · each image becomes one page, in this order</span>
              </p>
              <ol className="pt-pages" aria-label="Selected images in PDF page order">
                {items.map((item, index) => (
                  <li key={item.id} className={`pt-page${busy ? " is-busy" : ""}`}>
                    <div className="pt-page-thumb">
                      <img src={item.thumb} alt="" loading="lazy" />
                      <span className="pt-page-num" aria-hidden="true">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        className="pt-file-remove"
                        onClick={() => removeItem(item.id)}
                        disabled={busy}
                        aria-label={`Remove ${item.file.name}`}
                      >
                        ×
                      </button>
                    </div>
                    <span className="pt-page-name" title={item.file.name}>
                      {item.file.name}
                    </span>
                    <span className="pt-page-move">
                      <button type="button" onClick={() => moveItem(index, -1)} disabled={busy || index === 0} aria-label={`Move ${item.file.name} earlier`}>
                        ←
                      </button>
                      <small>{formatBytes(item.file.size)}</small>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={busy || index === items.length - 1}
                        aria-label={`Move ${item.file.name} later`}
                      >
                        →
                      </button>
                    </span>
                  </li>
                ))}
                <li className="pt-page pt-page-add">
                  <button type="button" onClick={picker.open} disabled={busy}>
                    <span aria-hidden="true">+</span>
                    Add images
                  </button>
                </li>
              </ol>
            </>
          }
          side={
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void run();
              }}
            >
              <SidePanel
                title="PDF options"
                action={<ActionButton label="Convert to PDF" busyLabel={progress || "Working…"} busy={busy} disabled={items.length === 0} />}
                footer={
                  <div className="ic-status sr-only" role="status" aria-live="polite">
                    {busy ? "Working…" : status}
                  </div>
                }
              >
                <fieldset className="pt-cards">
                  <legend className="pt-label">Page size</legend>
                  {(
                    [
                      ["a4", "A4", "Fits each image, auto orientation"],
                      ["letter", "US Letter", "Fits each image, auto orientation"],
                      ["image", "Image size", "Page matches the image, no margins"],
                    ] as [PageSizeChoice, string, string][]
                  ).map(([value, name, hint]) => (
                    <label key={value} className={`pt-card-option${pageSize === value ? " is-checked" : ""}`}>
                      <input
                        type="radio"
                        name="jp-page"
                        value={value}
                        checked={pageSize === value}
                        onChange={() => setPageSize(value)}
                        disabled={busy}
                      />
                      <span>
                        <strong>{name}</strong>
                        <small>{hint}</small>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div className="pt-row">
                  <div className="ic-field">
                    <label htmlFor="jp-target">Maximum PDF size</label>
                    <input
                      id="jp-target"
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
                    <label htmlFor="jp-unit">Unit</label>
                    <select id="jp-unit" value={unit} onChange={(event) => setUnit(event.target.value as SizeUnit)} disabled={busy}>
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>
                </div>
                <p className="pt-help">
                  Images are embedded unchanged when they already fit; otherwise they are recompressed gradually. The finished PDF is
                  measured. 1 KB = 1,024 bytes.
                </p>
                <ErrorBox errors={errors} />
              </SidePanel>
            </form>
          }
        />
      )}

      {stage === "done" && result && (
        <DoneView
          ok={result.ok}
          title={result.ok ? "Your PDF is ready!" : "PDF created, but over the target"}
          summary={
            result.ok
              ? `${result.pages} page${result.pages === 1 ? "" : "s"}, ${formatBytes(result.size)}: within your ${formatBytes(result.target)} limit.`
              : `The smallest PDF this tool will produce is ${formatBytes(result.size)}, above your ${formatBytes(result.target)} limit.`
          }
          downloadHref={result.url}
          downloadName={result.fileName}
          downloadLabel="Download PDF"
          saving={
            result.size < originalTotal
              ? {
                  percent: Math.round((1 - result.size / originalTotal) * 100),
                  before: `${formatBytes(originalTotal)} of images`,
                  after: formatBytes(result.size),
                }
              : undefined
          }
          stats={[
            { label: "Pages", value: String(result.pages) },
            { label: "Size", value: formatBytes(result.size) },
            { label: "Exact size", value: exactBytes(result.size) },
          ]}
          notes={result.notes}
          onBack={clearResult}
          backLabel="Back to the pages and options"
          onReset={reset}
          resetLabel="Convert more images"
        />
      )}
    </div>
  );
}
