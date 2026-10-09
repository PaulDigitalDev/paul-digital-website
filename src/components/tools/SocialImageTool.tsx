import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SocialTool } from "../../data/socialTools";
import { EXT, canvasToBlob, computeLayout, drawScene, makePreviewSource, releaseCanvas, supportsBlur, verifyExport } from "../../lib/canvasLayout";
import type { BgKind, ExportFormat, FitMode, Scene } from "../../lib/canvasLayout";
import { KIND_LABEL, MAX_FILE_BYTES, MAX_PIXELS, baseName, decodeImage, formatBytes, sniffKind } from "../../lib/imageFormats";
import { DropArea, ResultPanel, StatusArea } from "./shared";

/* Instagram no-crop, WhatsApp DP, YouTube banner and Zoom Out share one fit-on-canvas tool.
   The live preview and the export use the same layout code at different resolutions. */

type Mode = "instagram" | "whatsapp" | "youtube" | "zoomout";
interface Preset {
  id: string;
  label: string;
  w: number;
  h: number;
}

const ACCEPT = ".jpg,.jpeg,.jfif,.png,.webp,.avif,.heic,.heif,.gif,.bmp,image/*";
const YT_MAX_BYTES = 6 * 1024 * 1024;
const MAX_SIDE = 8000;
const MAX_OUTPUT_PIXELS = 40_000_000;

const PRESETS: Record<Mode, Preset[]> = {
  instagram: [
    { id: "square", label: "Square 1:1 — 1080×1080", w: 1080, h: 1080 },
    { id: "portrait", label: "Portrait 4:5 — 1080×1350", w: 1080, h: 1350 },
    { id: "landscape", label: "Landscape 1.91:1 — 1080×566", w: 1080, h: 566 },
    { id: "story", label: "Story / Reel 9:16 — 1080×1920", w: 1080, h: 1920 },
  ],
  whatsapp: [
    { id: "640", label: "640×640 (recommended)", w: 640, h: 640 },
    { id: "512", label: "512×512", w: 512, h: 512 },
    { id: "1080", label: "1080×1080", w: 1080, h: 1080 },
  ],
  youtube: [
    { id: "recommended", label: "2560×1440 (recommended)", w: 2560, h: 1440 },
    { id: "minimum", label: "2048×1152 (minimum)", w: 2048, h: 1152 },
  ],
  zoomout: [
    { id: "match", label: "Same shape as the image (2000 px long side)", w: 0, h: 0 },
    { id: "square", label: "Square — 1080×1080", w: 1080, h: 1080 },
    { id: "wide", label: "Wide 16:9 — 1920×1080", w: 1920, h: 1080 },
    { id: "portrait", label: "Portrait 4:5 — 1080×1350", w: 1080, h: 1350 },
    { id: "custom", label: "Custom size", w: 0, h: 0 },
  ],
};

const FILE_SUFFIX: Record<Mode, string> = { instagram: "instagram", whatsapp: "whatsapp-dp", youtube: "youtube-banner", zoomout: "zoomed-out" };
const RESULT_TITLE: Record<Mode, string> = {
  instagram: "Your Instagram image is ready",
  whatsapp: "Your WhatsApp DP is ready",
  youtube: "Your YouTube banner is ready",
  zoomout: "Your zoomed-out image is ready",
};

/* YouTube guides as a share of the canvas. Safe area is YouTube's 1235×338 at 2048×1152; tablet and desktop are approximate. */
const YT_GUIDES = [
  { id: "safe", label: "Safe area (all devices, mobile)", w: 1235 / 2048, h: 338 / 1152, tone: "safe" },
  { id: "tablet", label: "Tablet view (approx.)", w: 1855 / 2560, h: 423 / 1440, tone: "tablet" },
  { id: "desktop", label: "Desktop view (approx.)", w: 1, h: 423 / 1440, tone: "desktop" },
] as const;

interface Settings {
  presetId: string;
  customW: string;
  customH: string;
  bg: BgKind;
  color: string;
  fit: FitMode;
  zoom: number;
  offX: number;
  offY: number;
  padding: number;
  format: ExportFormat;
  circleGuide: boolean;
  circleExport: boolean;
  guides: Record<string, boolean>;
  bakeGuides: boolean;
}

function initialSettings(mode: Mode): Settings {
  return {
    presetId: PRESETS[mode][0].id,
    customW: "1600",
    customH: "1200",
    bg: mode === "instagram" ? "white" : mode === "whatsapp" ? "white" : mode === "youtube" ? "color" : "white",
    color: mode === "youtube" ? "#0b1f5e" : "#f7faff",
    fit: "contain",
    zoom: mode === "zoomout" ? 50 : 100,
    offX: 0,
    offY: 0,
    padding: mode === "whatsapp" ? 10 : 0,
    format: mode === "whatsapp" || mode === "zoomout" ? "png" : "jpeg",
    circleGuide: true,
    circleExport: false,
    guides: { safe: true, tablet: true, desktop: true },
    bakeGuides: false,
  };
}

interface Exported {
  url: string;
  blob: Blob;
  name: string;
  w: number;
  h: number;
  format: ExportFormat;
  notes: string[];
  overLimit: boolean;
}

export default function SocialImageTool({ tool }: { tool: SocialTool }) {
  const mode = tool.mode as Mode;
  const presets = PRESETS[mode];
  const blurOk = useMemo(() => (typeof document === "undefined" ? false : supportsBlur()), []);

  const [file, setFile] = useState<File | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [s, setS] = useState<Settings>(() => initialSettings(mode));
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Exported | null>(null);

  const bitmapRef = useRef<ImageBitmap | null>(null);
  const previewSrcRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<Exported | null>(null);

  const patch = (change: Partial<Settings>) => {
    clearResult();
    setS((current) => ({ ...current, ...change }));
  };

  const clearResult = () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = null;
    setResult(null);
  };

  const releaseImage = () => {
    bitmapRef.current?.close();
    bitmapRef.current = null;
    releaseCanvas(previewSrcRef.current);
    previewSrcRef.current = null;
  };

  useEffect(
    () => () => {
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
      bitmapRef.current?.close();
      releaseCanvas(previewSrcRef.current);
    },
    [],
  );

  /* Output size */
  const preset = presets.find((item) => item.id === s.presetId) ?? presets[0];
  const output = useMemo(() => {
    if (mode === "zoomout" && preset.id === "match") {
      if (!dims) return { w: 2000, h: 2000, error: "" };
      const k = 2000 / Math.max(dims.w, dims.h);
      return { w: Math.max(1, Math.round(dims.w * k)), h: Math.max(1, Math.round(dims.h * k)), error: "" };
    }
    if (preset.id === "custom") {
      const w = Number(s.customW);
      const h = Number(s.customH);
      if (!Number.isInteger(w) || !Number.isInteger(h) || w < 64 || h < 64) {
        return { w: 0, h: 0, error: "Enter whole-number width and height of at least 64 pixels." };
      }
      if (w > MAX_SIDE || h > MAX_SIDE || w * h > MAX_OUTPUT_PIXELS) {
        return { w: 0, h: 0, error: `Keep each side under ${MAX_SIDE} pixels and the total under ${MAX_OUTPUT_PIXELS / 1_000_000} megapixels.` };
      }
      return { w, h, error: "" };
    }
    return { w: preset.w, h: preset.h, error: "" };
  }, [mode, preset, dims, s.customW, s.customH]);

  const scene = useCallback(
    (): Scene => ({
      bg: s.bg,
      color: s.color,
      circle: mode === "whatsapp" && s.circleExport,
      placement: { fit: s.fit, zoom: s.zoom, offX: s.offX, offY: s.offY, padding: s.padding },
    }),
    [s, mode],
  );

  /* Live preview: same layout code as the export, drawn at a smaller size. */
  const previewSize = useMemo(() => {
    if (!output.w || !output.h) return null;
    const k = Math.min(1, 760 / output.w, 560 / output.h);
    return { w: Math.max(1, Math.round(output.w * k)), h: Math.max(1, Math.round(output.h * k)) };
  }, [output]);

  const overflow = useMemo(() => {
    if (!dims || !output.w) return false;
    return computeLayout(dims.w, dims.h, output.w, output.h, scene().placement).overflow;
  }, [dims, output, scene]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const src = previewSrcRef.current;
    if (!canvas || !src || !previewSize) return;
    try {
      drawScene(canvas, src, previewSize.w, previewSize.h, scene());
    } catch {
      /* Preview failures are reported when the user exports. */
    }
  }, [file, dims, previewSize, scene]);

  /* Adding / resetting an image */
  const onFiles = async (incoming: File[]) => {
    const next = incoming[0];
    if (!next || busy) return;
    clearResult();
    setStatus("");
    if (next.size === 0) return setErrors([`${next.name}: the file is empty.`]);
    if (next.size > MAX_FILE_BYTES) return setErrors([`${next.name}: ${formatBytes(next.size)} is over the ${formatBytes(MAX_FILE_BYTES)} limit.`]);
    const kind = await sniffKind(next);
    if (kind === "unknown") return setErrors([`${next.name}: this is not a recognised image format. Use JPG, PNG, WebP, AVIF, HEIC, GIF or BMP.`]);
    setBusy(true);
    setProgress("Reading the image…");
    try {
      const bitmap = await decodeImage(next, kind);
      if (bitmap.width * bitmap.height > MAX_PIXELS) {
        bitmap.close();
        throw new Error(`${next.name} is too large to process safely.`);
      }
      releaseImage();
      bitmapRef.current = bitmap;
      previewSrcRef.current = makePreviewSource(bitmap);
      setDims({ w: bitmap.width, h: bitmap.height });
      setFile(next);
      setErrors([]);
      setStatus(`${next.name} added (${KIND_LABEL[kind]}, ${bitmap.width}×${bitmap.height}).`);
    } catch (caught) {
      setErrors([caught instanceof Error && caught.message ? caught.message : "The image could not be read."]);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const reset = () => {
    clearResult();
    releaseImage();
    setFile(null);
    setDims(null);
    setErrors([]);
    setStatus("");
    setS(initialSettings(mode));
  };

  /* Export */
  const run = async () => {
    const bitmap = bitmapRef.current;
    if (!file || !bitmap) return setErrors(["Add an image first."]);
    if (output.error) return setErrors([output.error]);
    setErrors([]);
    clearResult();
    setBusy(true);
    const canvas = document.createElement("canvas");
    try {
      setProgress("Drawing the image…");
      const sc = scene();
      const format: ExportFormat = sc.circle ? "png" : s.format;
      const layout = drawScene(canvas, bitmap, output.w, output.h, sc);
      if (mode === "youtube" && s.bakeGuides) drawGuidesOnto(canvas, s.guides);

      setProgress("Encoding…");
      let quality = 0.92;
      let blob = await canvasToBlob(canvas, format, quality);
      const notes: string[] = [];
      if (mode === "youtube" && format === "jpeg") {
        while (blob.size > YT_MAX_BYTES && quality > 0.6) {
          quality = Math.round((quality - 0.08) * 100) / 100;
          blob = await canvasToBlob(canvas, format, quality);
        }
        if (quality < 0.92 && blob.size <= YT_MAX_BYTES) notes.push(`JPG quality was lowered to ${Math.round(quality * 100)}% to stay under YouTube's 6 MB limit.`);
      }
      setProgress("Checking the file…");
      await verifyExport(blob, format, output.w, output.h);

      const overLimit = mode === "youtube" && blob.size > YT_MAX_BYTES;
      if (overLimit) notes.push(`This file is ${formatBytes(blob.size)}, over YouTube's 6 MB banner limit. Try JPG output, or compress it with the Image Compressor.`);
      if (layout.overflow) notes.push("Part of the image falls outside the canvas and was cut off, as set by your fit, zoom or position.");
      else if (mode === "instagram" || mode === "zoomout" || mode === "whatsapp" || s.fit === "contain") notes.push("The whole image is included and nothing was cropped.");
      if (layout.dw > bitmap.width * 1.001) notes.push(`The image was enlarged ${(layout.dw / bitmap.width).toFixed(2)}× to fit, so it may look softer than the original.`);
      if (sc.circle) notes.push("The corners outside the circle are transparent, so the file is a PNG.");
      if (mode === "youtube" && s.bakeGuides) notes.push("Guide lines were drawn into this file as you asked. Turn that option off for an upload-ready banner.");
      if (format === "jpeg" && (s.bg === "transparent" || sc.circle)) notes.push("JPG cannot store transparency.");

      const name = `${baseName(file.name)}-${FILE_SUFFIX[mode]}-${output.w}x${output.h}.${EXT[format]}`;
      const exported: Exported = { url: URL.createObjectURL(blob), blob, name, w: output.w, h: output.h, format, notes, overLimit };
      resultRef.current = exported;
      setResult(exported);
      setStatus("Done. Your image is ready.");
    } catch (caught) {
      setStatus("");
      setErrors([caught instanceof Error && caught.message ? caught.message : "The image could not be created."]);
    } finally {
      releaseCanvas(canvas);
      setBusy(false);
      setProgress("");
    }
  };

  const bgOptions: { value: BgKind; label: string; disabled?: boolean }[] = [
    { value: "white", label: "White" },
    { value: "black", label: "Black" },
    { value: "color", label: "Custom colour" },
    ...(blurOk ? [{ value: "blur" as BgKind, label: "Blurred copy of the image" }] : []),
    ...(mode !== "instagram" ? [{ value: "transparent" as BgKind, label: "Transparent (PNG only)", disabled: s.format === "jpeg" && !s.circleExport }] : []),
  ];

  const stageStyle = previewSize ? { aspectRatio: `${previewSize.w} / ${previewSize.h}`, maxWidth: `${Math.min(previewSize.w, 640)}px` } : undefined;
  const hasPlacement = mode === "youtube" || mode === "zoomout";

  return (
    <div className="ic st">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Drag and drop an image here"
        emptySub="JPG, PNG, WebP, AVIF, HEIC, GIF or BMP · one file · up to 50 MB"
        filledSub={file && dims ? `${formatBytes(file.size)} · ${dims.w}×${dims.h} · choose another to replace it` : ""}
        buttonLabel="Choose image"
        moreLabel="Choose a different image"
        accept={ACCEPT}
        multiple={false}
        busy={busy}
        ariaLabel={`${tool.h1} drop area`}
        onFiles={(files) => void onFiles(files)}
      />
      <p className="ic-hint">Your image stays on this device and is never uploaded.</p>

      {mode === "instagram" && (
        <p className="st-note">
          <strong>Fit, not crop:</strong> the whole picture is scaled down until all of it is visible, and spare space is filled with the background. Nothing is cut off.
        </p>
      )}

      {file && dims && (
        <form
          className="st-form"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <div className="ic-controls">
            <div className="ic-field">
              <label htmlFor="st-size">Output size</label>
              <select id="st-size" value={s.presetId} onChange={(e) => patch({ presetId: e.target.value })} disabled={busy}>
                {presets.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            {preset.id === "custom" && (
              <>
                <div className="ic-field ic-field-unit">
                  <label htmlFor="st-w">Width (px)</label>
                  <input id="st-w" type="number" inputMode="numeric" min={64} max={MAX_SIDE} value={s.customW} onChange={(e) => patch({ customW: e.target.value })} disabled={busy} />
                </div>
                <div className="ic-field ic-field-unit">
                  <label htmlFor="st-h">Height (px)</label>
                  <input id="st-h" type="number" inputMode="numeric" min={64} max={MAX_SIDE} value={s.customH} onChange={(e) => patch({ customH: e.target.value })} disabled={busy} />
                </div>
              </>
            )}
            <div className="ic-field">
              <label htmlFor="st-bg">Background</label>
              <select id="st-bg" value={s.bg} onChange={(e) => patch({ bg: e.target.value as BgKind })} disabled={busy}>
                {bgOptions.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {s.bg === "color" && (
              <div className="ic-field ic-field-unit">
                <label htmlFor="st-color">Colour</label>
                <input id="st-color" type="color" value={s.color} onChange={(e) => patch({ color: e.target.value })} disabled={busy} />
              </div>
            )}
            <div className="ic-field ic-field-unit">
              <label htmlFor="st-format">Format</label>
              <select
                id="st-format"
                value={s.format}
                onChange={(e) => {
                  const format = e.target.value as ExportFormat;
                  patch(format === "jpeg" && s.bg === "transparent" ? { format, bg: "white" } : { format });
                }}
                disabled={busy || (mode === "whatsapp" && s.circleExport)}
              >
                <option value="jpeg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>

          {(mode === "whatsapp" || mode === "zoomout") && (
            <div className="st-sliders">
              {mode === "zoomout" && (
                <Slider id="st-zoom" label="Image scale" value={s.zoom} min={10} max={100} unit="%" disabled={busy} onChange={(zoom) => patch({ zoom })} />
              )}
              <Slider id="st-pad" label="Padding" value={s.padding} min={0} max={40} unit="%" disabled={busy} onChange={(padding) => patch({ padding })} />
            </div>
          )}

          {mode === "youtube" && (
            <>
              <div className="ic-controls">
                <div className="ic-field">
                  <label htmlFor="st-fit">Placement</label>
                  <select id="st-fit" value={s.fit} onChange={(e) => patch({ fit: e.target.value as FitMode, zoom: 100, offX: 0, offY: 0 })} disabled={busy}>
                    <option value="contain">Fit the whole image (no cropping)</option>
                    <option value="cover">Fill the canvas (crops the edges)</option>
                  </select>
                </div>
              </div>
              <div className="st-sliders">
                <Slider id="st-zoom" label="Zoom" value={s.zoom} min={s.fit === "contain" ? 20 : 100} max={s.fit === "contain" ? 100 : 250} unit="%" disabled={busy} onChange={(zoom) => patch({ zoom })} />
                <Slider id="st-ox" label="Horizontal position" value={s.offX} min={-50} max={50} unit="%" disabled={busy} onChange={(offX) => patch({ offX })} />
                <Slider id="st-oy" label="Vertical position" value={s.offY} min={-50} max={50} unit="%" disabled={busy} onChange={(offY) => patch({ offY })} />
              </div>
            </>
          )}
          {mode === "zoomout" && (
            <div className="st-sliders">
              <Slider id="st-ox" label="Horizontal position" value={s.offX} min={-50} max={50} unit="%" disabled={busy} onChange={(offX) => patch({ offX })} />
              <Slider id="st-oy" label="Vertical position" value={s.offY} min={-50} max={50} unit="%" disabled={busy} onChange={(offY) => patch({ offY })} />
            </div>
          )}

          {mode === "whatsapp" && (
            <div className="st-checks">
              <label>
                <input type="checkbox" checked={s.circleGuide} onChange={(e) => setS({ ...s, circleGuide: e.target.checked })} /> Show circle guide on the preview
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={s.circleExport}
                  onChange={(e) => patch(e.target.checked ? { circleExport: true, format: "png" } : { circleExport: false })}
                />{" "}
                Also cut the exported file into a circle (transparent PNG)
              </label>
            </div>
          )}
          {mode === "youtube" && (
            <div className="st-checks">
              {YT_GUIDES.map((g) => (
                <label key={g.id}>
                  <input type="checkbox" checked={s.guides[g.id]} onChange={(e) => setS({ ...s, guides: { ...s.guides, [g.id]: e.target.checked } })} /> Show {g.label.toLowerCase()}
                </label>
              ))}
              <label>
                <input type="checkbox" checked={s.bakeGuides} onChange={(e) => patch({ bakeGuides: e.target.checked })} /> Draw the guides into the downloaded file (not recommended)
              </label>
            </div>
          )}

          {output.error ? (
            <div className="ic-error" role="alert">
              <p style={{ margin: 0 }}>{output.error}</p>
            </div>
          ) : (
            previewSize && (
              <figure className="st-figure">
                <figcaption className="st-caption">
                  Live preview · output {output.w}×{output.h} px
                </figcaption>
                <div className={`st-stage${s.bg === "transparent" || (mode === "whatsapp" && s.circleExport) ? " is-checker" : ""}`} style={stageStyle}>
                  <canvas ref={canvasRef} className="st-canvas" aria-label="Preview of the output image" />
                  {mode === "whatsapp" && s.circleGuide && <div className="st-circle" aria-hidden="true" />}
                  {mode === "youtube" &&
                    YT_GUIDES.filter((g) => s.guides[g.id]).map((g) => (
                      <div key={g.id} className={`st-guide st-guide-${g.tone}`} style={{ width: `${g.w * 100}%`, height: `${g.h * 100}%` }} aria-hidden="true">
                        <span>{g.label}</span>
                      </div>
                    ))}
                </div>
                {mode === "whatsapp" && s.circleGuide && <p className="ic-hint">The circle is a preview guide only{s.circleExport ? " (your export is also cut into a circle)" : " and is not part of the exported file"}.</p>}
                {mode === "youtube" && <p className="ic-hint">Guides are overlays on the preview{s.bakeGuides ? ", but you chose to draw them into the file" : " and are not exported"}. Tablet and desktop guides are approximate.</p>}
              </figure>
            )
          )}
          {overflow && hasPlacement && (
            <p className="st-warn" role="status">
              Part of the image is outside the canvas and will be cut off. {s.fit === "contain" ? "Lower the zoom to keep all of it." : "Choose “Fit the whole image” to avoid cropping."}
            </p>
          )}

          <button type="submit" className="button button-primary ic-submit" disabled={!file || busy || Boolean(output.error)}>
            {busy ? "Working…" : "Create image"}
          </button>
        </form>
      )}

      <StatusArea busy={busy} progress={progress} status={status} errors={errors} />

      {result && (
        <ResultPanel
          ariaLabel="Result"
          tone={result.overLimit ? "warning" : "success"}
          title={result.overLimit ? "Your image is ready, but over YouTube's size limit" : RESULT_TITLE[mode]}
          fileName={result.name}
          details={[
            { label: "Dimensions", value: `${result.w} × ${result.h}`, hint: "pixels" },
            { label: "File size", value: formatBytes(result.blob.size) },
            { label: "Format", value: result.format === "jpeg" ? "JPG" : "PNG" },
          ]}
          notes={result.notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Download {result.format === "jpeg" ? "JPG" : "PNG"}
            </a>
          }
          secondary={
            <button type="button" className="button" onClick={clearResult}>
              Edit settings
            </button>
          }
          resetLabel="Process another image"
          onReset={reset}
        >
          <img className="ic-preview" src={result.url} alt="Exported image preview" width={result.w} height={result.h} />
        </ResultPanel>
      )}
    </div>
  );
}

function Slider(props: { id: string; label: string; value: number; min: number; max: number; unit: string; disabled: boolean; onChange: (v: number) => void }) {
  return (
    <div className="ic-field st-slider">
      <label htmlFor={props.id}>
        {props.label}: {props.value}
        {props.unit}
      </label>
      <input id={props.id} type="range" min={props.min} max={props.max} step={1} value={props.value} disabled={props.disabled} onChange={(e) => props.onChange(Number(e.target.value))} />
    </div>
  );
}

/** Only used when the user explicitly asks for the guides to be part of the file. */
function drawGuidesOnto(canvas: HTMLCanvasElement, enabled: Record<string, boolean>) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.save();
  ctx.lineWidth = Math.max(2, canvas.width / 640);
  ctx.setLineDash([canvas.width / 80, canvas.width / 120]);
  ctx.strokeStyle = "#ff6b00";
  for (const g of YT_GUIDES) {
    if (!enabled[g.id]) continue;
    const w = g.w * canvas.width;
    const h = g.h * canvas.height;
    ctx.strokeRect((canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  }
  ctx.restore();
}
