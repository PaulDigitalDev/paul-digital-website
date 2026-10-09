import { useEffect, useRef, useState } from "react";
import type { FormatTool } from "../../data/formatTools";
import { buildIco, inspectIco } from "../../lib/ico";
import {
  KIND_LABEL,
  MAX_FILE_BYTES,
  MAX_PIXELS,
  baseName,
  decodeImage,
  formatBytes,
  sniffKind,
} from "../../lib/imageFormats";
import { DropArea, ResultPanel, StatusArea, ZipButton, makeOutput } from "./shared";
import type { OutputFile } from "./shared";

/* PNG to ICO and Favicon Generator. Icons are drawn with canvas and packed into a real ICO container in the browser. */

const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
const DEFAULT_ICO_SIZES = [16, 32, 48, 256];
const FAVICON_ICO_SIZES = [16, 32, 48];

type Fit = "contain" | "cover";

interface Generated {
  files: OutputFile[];
  previews: { size: number; url: string }[];
  snippet: string;
  notes: string[];
}

const toBytes = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

/** Draws the bitmap into a size×size square, stepping down by halves so small icons stay crisp. */
function renderSquare(bitmap: ImageBitmap, size: number, fit: Fit, background: string | null): HTMLCanvasElement {
  const scale = fit === "cover" ? Math.max(size / bitmap.width, size / bitmap.height) : Math.min(size / bitmap.width, size / bitmap.height);
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  let source: CanvasImageSource = bitmap;
  let w = bitmap.width;
  let h = bitmap.height;
  while (w / 2 >= targetW && h / 2 >= targetH) {
    const step = document.createElement("canvas");
    step.width = Math.max(targetW, Math.floor(w / 2));
    step.height = Math.max(targetH, Math.floor(h / 2));
    const ctx = step.getContext("2d");
    if (!ctx) throw new Error("Your browser could not create a drawing surface.");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, step.width, step.height);
    source = step;
    w = step.width;
    h = step.height;
  }

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create a drawing surface.");
  context.imageSmoothingQuality = "high";
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, size, size);
  }
  context.drawImage(source, (size - targetW) / 2, (size - targetH) / 2, targetW, targetH);
  return canvas;
}

async function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Your browser could not encode a PNG icon.");
  return toBytes(blob);
}

export default function IconGenerator({ tool }: { tool: FormatTool }) {
  const favicon = tool.kind === "favicon";
  const [file, setFile] = useState<File | null>(null);
  const [sizes, setSizes] = useState<number[]>(DEFAULT_ICO_SIZES);
  const [fit, setFit] = useState<Fit>("contain");
  const [touchBg, setTouchBg] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Generated | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<Generated | null>(null);

  const clearResult = () => {
    resultRef.current?.files.forEach((item) => URL.revokeObjectURL(item.url));
    resultRef.current?.previews.forEach((item) => URL.revokeObjectURL(item.url));
    resultRef.current = null;
    setResult(null);
    setCopied(false);
  };
  useEffect(() => () => clearResult(), []);

  const onFiles = async (incoming: File[]) => {
    const next = incoming[0];
    if (!next || busy) return;
    clearResult();
    setStatus("");
    if (next.size === 0) return setErrors([`${next.name}: the file is empty.`]);
    if (next.size > MAX_FILE_BYTES) {
      return setErrors([`${next.name}: ${formatBytes(next.size)} is over the ${formatBytes(MAX_FILE_BYTES)} limit.`]);
    }
    const kind = await sniffKind(next);
    if (!tool.inputs.includes(kind)) {
      return setErrors([
        `${next.name}: this is ${kind === "unknown" ? "not a recognised image format" : `a ${KIND_LABEL[kind]} file`}. ${tool.h1} accepts ${tool.inputLabel}.`,
      ]);
    }
    setErrors([]);
    setFile(next);
    setStatus(`${next.name} added.`);
  };

  const reset = () => {
    clearResult();
    setFile(null);
    setErrors([]);
    setStatus("");
  };

  const toggleSize = (size: number) => {
    clearResult();
    setSizes((current) => (current.includes(size) ? current.filter((value) => value !== size) : [...current, size].sort((a, b) => a - b)));
  };

  const run = async () => {
    if (!file) return setErrors(["Add an image first."]);
    if (!favicon && sizes.length === 0) return setErrors(["Select at least one icon size."]);
    setErrors([]);
    clearResult();
    setBusy(true);
    let bitmap: ImageBitmap | null = null;
    try {
      setProgress("Reading the image…");
      bitmap = await decodeImage(file, await sniffKind(file));
      if (bitmap.width * bitmap.height > MAX_PIXELS) throw new Error(`${file.name} is too large to process safely.`);

      const notes: string[] = [];
      const files: OutputFile[] = [];
      const previews: { size: number; url: string }[] = [];
      const stem = favicon ? "favicon" : baseName(file.name);
      const icoSizes = favicon ? FAVICON_ICO_SIZES : sizes;
      const largest = favicon ? 512 : Math.max(...icoSizes);

      if (Math.min(bitmap.width, bitmap.height) < largest) {
        notes.push(
          `The source image is ${bitmap.width}×${bitmap.height}px, smaller than the largest icon (${largest}px), so that size is enlarged and will look soft. Start from a larger image for sharper results.`,
        );
      }
      if (bitmap.width !== bitmap.height) {
        notes.push(
          fit === "contain"
            ? "The image is not square, so it was fitted inside the square with transparent padding."
            : "The image is not square, so it was cropped to fill the square from the centre.",
        );
      }

      setProgress("Drawing icon sizes…");
      const pngBySize = new Map<number, Uint8Array>();
      const png = async (size: number) => {
        let bytes = pngBySize.get(size);
        if (!bytes) {
          bytes = await canvasToPng(renderSquare(bitmap!, size, fit, null));
          pngBySize.set(size, bytes);
        }
        return bytes;
      };

      const icoBlob = buildIco(await Promise.all(icoSizes.map(async (size) => ({ size, png: await png(size) }))));
      const icoBytes = await toBytes(icoBlob);
      const declared = inspectIco(icoBytes);
      if (!declared || declared.join() !== [...icoSizes].sort((a, b) => a - b).join()) {
        throw new Error("The ICO file failed its integrity check, so it was not offered for download.");
      }
      files.push(makeOutput(`${stem}.ico`, icoBlob));

      let snippet = "";
      if (favicon) {
        for (const [size, name] of [
          [16, "favicon-16x16.png"],
          [32, "favicon-32x32.png"],
          [192, "android-chrome-192x192.png"],
          [512, "android-chrome-512x512.png"],
        ] as const) {
          files.push(makeOutput(name, new Blob([(await png(size)) as BlobPart], { type: "image/png" })));
        }
        // iOS fills transparency with black, so the touch icon gets a solid background.
        const touch = await canvasToPng(renderSquare(bitmap, 180, fit, touchBg));
        files.push(makeOutput("apple-touch-icon.png", new Blob([touch as BlobPart], { type: "image/png" })));

        const manifest = JSON.stringify(
          {
            name: "",
            short_name: "",
            icons: [
              { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
              { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
            ],
            theme_color: touchBg,
            background_color: touchBg,
            display: "standalone",
          },
          null,
          2,
        );
        files.push(makeOutput("site.webmanifest", new Blob([manifest], { type: "application/manifest+json" })));
        snippet = [
          '<link rel="icon" href="/favicon.ico" sizes="48x48">',
          '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
          '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
          '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
          '<link rel="manifest" href="/site.webmanifest">',
        ].join("\n");
        notes.push("Fill in the name and short_name fields of site.webmanifest before publishing it, and upload every file to your site root.");
        notes.push("The Apple touch icon uses your chosen background colour because iOS does not support transparent touch icons.");
      }

      for (const size of favicon ? [16, 32, 48, 180, 192] : icoSizes) {
        const bytes = size === 180 ? await canvasToPng(renderSquare(bitmap, 180, fit, touchBg)) : await png(size);
        previews.push({ size, url: URL.createObjectURL(new Blob([bytes as BlobPart], { type: "image/png" })) });
      }

      const generated: Generated = { files, previews, snippet, notes };
      resultRef.current = generated;
      setResult(generated);
      setStatus(favicon ? "Done. Your favicon files are ready." : "Done. Your ICO file is ready.");
    } catch (caught) {
      setStatus("");
      setErrors([caught instanceof Error && caught.message ? caught.message : "The icon could not be created."]);
    } finally {
      bitmap?.close();
      setBusy(false);
      setProgress("");
    }
  };

  const copySnippet = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.snippet);
      setCopied(true);
    } catch {
      setErrors(["Copying was blocked by your browser. Select the code and copy it manually."]);
    }
  };

  return (
    <div className="ic">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle={`Drag and drop a ${favicon ? "square logo or image" : "PNG"} here`}
        emptySub={`Accepts ${tool.inputLabel} · one file · up to 50 MB`}
        filledSub={file ? `${formatBytes(file.size)} · choose another to replace it` : ""}
        buttonLabel="Choose image"
        moreLabel="Choose a different image"
        accept={tool.accept}
        multiple={false}
        busy={busy}
        ariaLabel={`${tool.h1} drop area`}
        onFiles={(files) => void onFiles(files)}
      />
      <p className="ic-hint">Your image is turned into icons on this device and is never uploaded.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        {!favicon && (
          <fieldset className="ic-field fc-sizes">
            <legend>Icon sizes (pixels)</legend>
            <div className="fc-checks">
              {ICO_SIZES.map((size) => (
                <label key={size}>
                  <input type="checkbox" checked={sizes.includes(size)} onChange={() => toggleSize(size)} disabled={busy} /> {size}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div className="ic-field">
          <label htmlFor="ig-fit">If the image is not square</label>
          <select
            id="ig-fit"
            value={fit}
            onChange={(event) => {
              clearResult();
              setFit(event.target.value as Fit);
            }}
            disabled={busy}
          >
            <option value="contain">Fit with transparent padding</option>
            <option value="cover">Crop to fill from the centre</option>
          </select>
        </div>
        {favicon && (
          <div className="ic-field">
            <label htmlFor="ig-bg">Apple touch icon background</label>
            <input
              id="ig-bg"
              type="color"
              value={touchBg}
              onChange={(event) => {
                clearResult();
                setTouchBg(event.target.value);
              }}
              disabled={busy}
            />
          </div>
        )}
        <button type="submit" className="button button-primary ic-submit" disabled={!file || busy}>
          {busy ? "Working…" : tool.actionLabel}
        </button>
      </form>
      <p className="ic-hint">
        {favicon
          ? "Creates favicon.ico (16, 32, 48 px), PNG favicons, an Apple touch icon, Android icons, a web manifest and the HTML to use them."
          : "The ICO stores each size as a PNG image inside a standard icon container, which keeps transparency. Windows Vista and later, macOS and all current browsers read it."}
      </p>

      <StatusArea busy={busy} progress={progress} status={status} errors={errors} />

      {result && (
        <ResultPanel
          ariaLabel="Result"
          tone="success"
          title={favicon ? "Your favicon files are ready" : "Your ICO file is ready"}
          fileName={result.files.length === 1 ? result.files[0].name : undefined}
          details={
            result.files.length === 1
              ? [
                  { label: "Format", value: "ICO" },
                  { label: "Size", value: formatBytes(result.files[0].blob.size) },
                  { label: "Icon sizes", value: result.previews.map((item) => item.size).join(", "), hint: "pixels" },
                ]
              : [
                  { label: "Files", value: String(result.files.length) },
                  { label: "Total size", value: formatBytes(result.files.reduce((sum, item) => sum + item.blob.size, 0)) },
                ]
          }
          notes={result.notes}
          primary={
            result.files.length === 1 ? (
              <a className="button button-download" href={result.files[0].url} download={result.files[0].name}>
                Download {result.files[0].name}
              </a>
            ) : (
              <ZipButton primary files={result.files} zipName="favicons.zip" />
            )
          }
          resetLabel="Make another icon"
          onReset={reset}
        >
          <ul className="fc-icons" aria-label="Icon previews">
            {result.previews.map((item) => (
              <li key={item.size}>
                <img src={item.url} alt={`${item.size} pixel icon preview`} width={Math.min(item.size, 96)} height={Math.min(item.size, 96)} />
                <small>{item.size}px</small>
              </li>
            ))}
          </ul>
          {result.files.length > 1 && (
            <ul className="fc-results" aria-label="Individual files">
              {result.files.map((item) => (
                <li key={item.name} className="fc-result">
                  <div className="fc-meta">
                    <strong>{item.name}</strong>
                    <small>{formatBytes(item.blob.size)}</small>
                  </div>
                  <a className="button button-download" href={item.url} download={item.name}>
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
          {result.snippet && (
            <div className="fc-snippet">
              <label htmlFor="ig-snippet">HTML for your page&apos;s &lt;head&gt;</label>
              <textarea id="ig-snippet" readOnly rows={5} value={result.snippet} />
              <button type="button" className="button" onClick={() => void copySnippet()}>
                {copied ? "Copied" : "Copy HTML"}
              </button>
            </div>
          )}
        </ResultPanel>
      )}
    </div>
  );
}
