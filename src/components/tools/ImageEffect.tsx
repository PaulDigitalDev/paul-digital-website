import { useEffect, useMemo, useRef, useState } from "react";
import { EXT, FORMAT_LABEL, MAX_OUTPUT_PIXELS, MAX_SIDE, checkOutputSize, context2d, encodeCanvas, newCanvas, release, verifyBlob } from "../../lib/imageEdit";
import { baseName, formatBytes } from "../../lib/imageFormats";
import type { OutputKind } from "../../lib/imageFormats";
import { borderedSize, circleSquare, grayscaleInPlace, parseHex, radiusFromPercent } from "../../lib/imageEffects";
import type { EffectMode } from "../../lib/imageEffects";
import { EncoderNote } from "./EditorBits";
import { ActionButton, DoneView, DropOverlay, ErrorBox, SidePanel, UploadHero, Workspace, useFilePicker, useWindowDrop } from "./premium";
import { IMAGE_ACCEPT, useImageSource } from "./useImageSource";

/* Grayscale, border, rounded corners and circle crop share one tool. All pixels are processed in the browser. */

interface Options {
  mode: EffectMode;
  format: OutputKind;
  quality: number;
  thickness: number;
  color: string;
  radius: number;
  circleSize: number;
}

const FILE_SUFFIX: Record<EffectMode, string> = { grayscale: "grayscale", border: "border", round: "rounded", circle: "circle" };
const DONE_TITLE: Record<EffectMode, string> = {
  grayscale: "Your black and white image is ready!",
  border: "Your image with a border is ready!",
  round: "Your rounded image is ready!",
  circle: "Your circle image is ready!",
};
const ACTION: Record<EffectMode, string> = { grayscale: "Convert to grayscale", border: "Add border", round: "Round corners", circle: "Crop to circle" };
const PANEL: Record<EffectMode, string> = { grayscale: "Grayscale options", border: "Border options", round: "Corner options", circle: "Circle options" };

/** Output pixel size for a mode. */
function outputSize(mode: EffectMode, w: number, h: number, o: Options) {
  if (mode === "border") return borderedSize(w, h, o.thickness);
  if (mode === "circle") return { w: o.circleSize, h: o.circleSize };
  return { w, h };
}

/** Draws the effect at `k` times the final size (k < 1 for the live preview). Colours and shapes scale with k. */
function render(src: CanvasImageSource & { width: number; height: number }, o: Options, k: number): HTMLCanvasElement {
  const w = src.width;
  const h = src.height;
  const full = outputSize(o.mode, w, h, o);
  const cw = Math.max(1, Math.round(full.w * k));
  const ch = Math.max(1, Math.round(full.h * k));
  const canvas = newCanvas(cw, ch);
  const ctx = context2d(canvas);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const flat = o.format === "jpeg";
  const fillWhite = () => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cw, ch);
  };

  if (o.mode === "grayscale") {
    if (flat) fillWhite();
    ctx.drawImage(src, 0, 0, cw, ch);
    const data = ctx.getImageData(0, 0, cw, ch);
    grayscaleInPlace(data.data);
    ctx.putImageData(data, 0, 0);
  } else if (o.mode === "border") {
    const t = Math.round(o.thickness * k);
    ctx.fillStyle = parseHex(o.color) ? (o.color.startsWith("#") ? o.color : `#${o.color}`) : "#000000";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(src, t, t, cw - 2 * t, ch - 2 * t);
  } else if (o.mode === "round") {
    if (flat) fillWhite();
    const r = Math.min(radiusFromPercent(o.radius, cw, ch), Math.floor(Math.min(cw, ch) / 2));
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(cw, 0, cw, ch, r);
    ctx.arcTo(cw, ch, 0, ch, r);
    ctx.arcTo(0, ch, 0, 0, r);
    ctx.arcTo(0, 0, cw, 0, r);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(src, 0, 0, cw, ch);
  } else {
    if (flat) fillWhite();
    const sq = circleSquare(w, h);
    ctx.beginPath();
    ctx.arc(cw / 2, ch / 2, cw / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(src, sq.x, sq.y, sq.side, sq.side, 0, 0, cw, ch);
  }
  return canvas;
}

interface Result {
  url: string;
  name: string;
  size: number;
  w: number;
  h: number;
  format: OutputKind;
  notes: string[];
}

export default function ImageEffect({ mode }: { mode: EffectMode }) {
  const resultRef = useRef<Result | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const clearResult = () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = null;
    setResult(null);
  };
  const src = useImageSource(clearResult);
  const { file, dims, busy, encoders, bitmapRef } = src;

  const transparent = mode === "round" || mode === "circle";
  const [format, setFormat] = useState<OutputKind>(transparent ? "png" : "jpeg");
  const [quality, setQuality] = useState(0.92);
  const [thickness, setThickness] = useState(20);
  const [color, setColor] = useState("#000000");
  const [radius, setRadius] = useState(25);
  const [circleSize, setCircleSize] = useState(0);
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(
    () => () => {
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    },
    [],
  );

  /* Use a format this browser can really save. */
  useEffect(() => {
    if (!encoders.includes(format)) setFormat(encoders.includes("png") ? "png" : encoders[0]);
  }, [encoders, format]);

  /* A new picture resets the circle's output size to the biggest square that fits. */
  useEffect(() => {
    if (dims) setCircleSize(Math.min(dims.w, dims.h, MAX_SIDE));
  }, [dims]);

  const picker = useFilePicker(IMAGE_ACCEPT, false, (files) => void src.load(files));
  const dropActive = useWindowDrop(!busy && !result, (files) => void src.load(files));

  const options: Options = useMemo(
    () => ({ mode, format, quality, thickness, color, radius, circleSize }),
    [mode, format, quality, thickness, color, radius, circleSize],
  );

  const problem = useMemo(() => {
    if (!dims) return "";
    if (mode === "border") {
      if (!Number.isInteger(thickness) || thickness < 1) return "Enter a border thickness of at least 1 pixel (whole number).";
      if (!parseHex(color)) return "Enter the border colour as a hex code such as #000000.";
    }
    if (mode === "circle") {
      if (!Number.isInteger(circleSize) || circleSize < 16) return "Enter a circle size of at least 16 pixels (whole number).";
    }
    const out = outputSize(mode, dims.w, dims.h, options);
    return checkOutputSize(out.w, out.h);
  }, [dims, mode, thickness, color, circleSize, options]);

  /* Live preview, drawn from the same code as the export at a smaller scale. */
  useEffect(() => {
    const bitmap = bitmapRef.current;
    const target = previewRef.current;
    if (!file || !dims || !bitmap || !target || problem) return;
    const full = outputSize(mode, dims.w, dims.h, options);
    const k = Math.min(1, 560 / full.w, 420 / full.h);
    const out = render(bitmap, options, k);
    target.width = out.width;
    target.height = out.height;
    context2d(target).drawImage(out, 0, 0);
    release(out);
  }, [file, dims, options, problem, mode, bitmapRef]);

  const run = async () => {
    const bitmap = bitmapRef.current;
    if (!file || !dims || !bitmap || busy || problem) return;
    clearResult();
    src.setErrors([]);
    src.setBusy(true);
    src.setProgress("Applying the effect…");
    let canvas: HTMLCanvasElement | null = null;
    try {
      canvas = render(bitmap, options, 1);
      const blob = await encodeCanvas(canvas, format, quality);
      await verifyBlob(blob, format, canvas.width, canvas.height);
      const notes: string[] = [];
      if (transparent && format === "jpeg") notes.push("JPG cannot store transparency, so the corners are white. Choose PNG or WebP to keep them transparent.");
      if (mode === "circle" && circleSize < Math.min(dims.w, dims.h)) notes.push("The circle was scaled down to the size you chose.");
      if (mode === "circle" && circleSize > Math.min(dims.w, dims.h)) notes.push("The circle is larger than the original picture, so it was enlarged and may look soft.");
      const url = URL.createObjectURL(blob);
      const next: Result = { url, name: `${baseName(file.name)}-${FILE_SUFFIX[mode]}.${EXT[format]}`, size: blob.size, w: canvas.width, h: canvas.height, format, notes };
      resultRef.current = next;
      setResult(next);
    } catch (caught) {
      src.setErrors([caught instanceof Error && caught.message ? caught.message : "The image could not be processed. It may be too large for this device."]);
    } finally {
      release(canvas);
      src.setBusy(false);
      src.setProgress("");
    }
  };

  const stage = result ? "done" : file ? "work" : "upload";
  const outDims = dims && !problem ? outputSize(mode, dims.w, dims.h, options) : null;
  const lossy = format !== "png";

  return (
    <div className="ic pt" data-stage={stage}>
      {picker.input}
      <DropOverlay active={dropActive} label={file ? "Drop to replace the image" : "Drop your image here"} />

      {stage === "upload" && (
        <UploadHero buttonLabel="Select image" dropLabel="or drop an image anywhere on this page" sub="JPG, PNG, WebP, AVIF, HEIC, GIF or BMP" busy={busy} onOpen={picker.open}>
          <ErrorBox errors={src.errors} />
        </UploadHero>
      )}

      {stage === "work" && file && dims && (
        <Workspace
          main={
            <div className="pt-files">
              <figure className={`pt-file${busy ? " is-busy" : ""}`}>
                <div className="pt-thumb">
                  <canvas ref={previewRef} role="img" aria-label="Live preview of the result" style={{ maxWidth: "100%", height: "auto" }} />
                  {busy && (
                    <div className="pt-file-busy" aria-hidden="true">
                      <span className="ic-spinner" />
                      <span>{src.progress || "Working…"}</span>
                    </div>
                  )}
                </div>
                <figcaption>
                  <span className="pt-file-name">{file.name}</span>
                  <span className="pt-file-meta">
                    {formatBytes(file.size)} · {dims.w}×{dims.h}px{outDims ? ` → ${outDims.w}×${outDims.h}px` : ""}
                  </span>
                </figcaption>
                <button type="button" className="pt-file-remove" onClick={src.clear} disabled={busy} aria-label={`Remove ${file.name}`}>
                  ×
                </button>
              </figure>
              <button type="button" className="pt-secondary" onClick={picker.open} disabled={busy}>
                Choose a different image
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
                title={PANEL[mode]}
                action={<ActionButton label={ACTION[mode]} busy={busy} disabled={!file || !!problem} />}
                footer={
                  <div className="ic-status sr-only" role="status" aria-live="polite">
                    {busy ? "Working…" : src.status}
                  </div>
                }
              >
                {mode === "border" && (
                  <>
                    <div className="pt-row">
                      <div className="ic-field">
                        <label htmlFor="fx-thick">Thickness (px)</label>
                        <input id="fx-thick" type="number" inputMode="numeric" min={1} step={1} value={thickness} disabled={busy} onChange={(e) => setThickness(Number(e.target.value))} />
                      </div>
                      <div className="ic-field">
                        <label htmlFor="fx-color">Colour</label>
                        <input id="fx-color" type="color" value={parseHex(color) ? `#${[parseHex(color)!.r, parseHex(color)!.g, parseHex(color)!.b].map((n) => n.toString(16).padStart(2, "0")).join("")}` : "#000000"} disabled={busy} onChange={(e) => setColor(e.target.value)} />
                      </div>
                    </div>
                    <p className="pt-help">The border is added around the picture, so the output is larger by twice the thickness in each direction.</p>
                  </>
                )}
                {mode === "round" && (
                  <div className="ic-field st-slider">
                    <label htmlFor="fx-radius">Roundness: {radius}%</label>
                    <input id="fx-radius" type="range" min={0} max={100} step={1} value={radius} disabled={busy} onChange={(e) => setRadius(Number(e.target.value))} />
                    <p className="pt-help">100% rounds the shorter sides fully, which gives a circle for a square picture.</p>
                  </div>
                )}
                {mode === "circle" && (
                  <>
                    <div className="ic-field">
                      <label htmlFor="fx-circle">Circle size (px)</label>
                      <input id="fx-circle" type="number" inputMode="numeric" min={16} step={1} value={circleSize || ""} disabled={busy} onChange={(e) => setCircleSize(Number(e.target.value))} />
                    </div>
                    <p className="pt-help">The circle is cut from the centre of the picture. Up to {Math.min(dims.w, dims.h)} px keeps full detail.</p>
                  </>
                )}
                {mode === "grayscale" && <p className="pt-help">Every pixel is converted to its grey brightness. Transparency is kept in PNG and WebP.</p>}

                <div className="ic-field ic-field-unit">
                  <label htmlFor="fx-format">Format</label>
                  <select id="fx-format" value={format} disabled={busy} onChange={(e) => setFormat(e.target.value as OutputKind)}>
                    {encoders.map((kind) => (
                      <option key={kind} value={kind}>
                        {FORMAT_LABEL[kind]}
                      </option>
                    ))}
                  </select>
                </div>
                {lossy && (
                  <div className="ic-field st-slider">
                    <label htmlFor="fx-quality">Quality: {Math.round(quality * 100)}%</label>
                    <input id="fx-quality" type="range" min={30} max={100} step={1} value={Math.round(quality * 100)} disabled={busy} onChange={(e) => setQuality(Number(e.target.value) / 100)} />
                  </div>
                )}
                {transparent && format === "jpeg" && <p className="pt-help">JPG has no transparency, so the corners become white. Use PNG or WebP for transparent corners.</p>}
                <EncoderNote encoders={encoders} />
                <p className="pt-help">Output is limited to {MAX_SIDE.toLocaleString()} px a side and {MAX_OUTPUT_PIXELS / 1_000_000} megapixels.</p>
                <ErrorBox errors={[...(problem ? [problem] : []), ...src.errors]} />
              </SidePanel>
            </form>
          }
        />
      )}

      {stage === "done" && result && (
        <DoneView
          ok
          title={DONE_TITLE[mode]}
          summary={`${result.w}×${result.h}px, ${formatBytes(result.size)}, ${FORMAT_LABEL[result.format]}.`}
          downloadHref={result.url}
          downloadName={result.name}
          downloadLabel="Download image"
          stats={[
            { label: "Format", value: FORMAT_LABEL[result.format] },
            { label: "Size", value: `${result.w}×${result.h}px` },
            { label: "File size", value: formatBytes(result.size) },
          ]}
          preview={<img src={result.url} alt="Your finished image" style={{ maxWidth: "100%", height: "auto" }} />}
          notes={result.notes}
          onBack={clearResult}
          backLabel="Back to the options"
          onReset={() => {
            clearResult();
            src.clear();
          }}
          resetLabel="Process another image"
        />
      )}
    </div>
  );
}
