import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { fitAspectRect, largestAspectRect, moveRect, resizeRect } from "../../lib/cropMath";
import type { Handle, PxRect } from "../../lib/cropMath";
import { ACCEPTANCE_NOTICE, passportPresets, signaturePresets } from "../../data/photoPresets";
import type { SizePreset } from "../../data/photoPresets";
import {
  EXT,
  FORMAT_LABEL,
  checkOutputSize,
  cropToPixels,
  drawTransformed,
  encodeCanvas,
  encodeInRange,
  release,
  renderTransformed,
  resampleTo,
  transformedSize,
  verifyBlob,
} from "../../lib/imageEdit";
import type { CropRect, Rotation, Transform } from "../../lib/imageEdit";
import { baseName, formatBytes } from "../../lib/imageFormats";
import { parseKb } from "../../lib/sizeRange";
import type { OutputKind } from "../../lib/imageFormats";
import { makePreviewSource } from "../../lib/canvasLayout";
import { EncoderNote, FormatFields } from "./EditorBits";
import { DropArea, ResultPanel, StatusArea } from "./shared";
import { IMAGE_ACCEPT, useImageSource } from "./useImageSource";

/* One interactive crop / rotate / flip editor.
   variant "crop": free or fixed-shape crop, exported at its natural size.
   variant "passport" | "signature": the crop is locked to a preset (or custom) shape and the result is resized to exactly that size. */

export type EditorVariant = "crop" | "passport" | "signature" | "government";

interface Exported {
  url: string;
  blob: Blob;
  name: string;
  w: number;
  h: number;
  format: OutputKind;
  notes: string[];
  overLimit: boolean;
  underMin: boolean;
}

const HANDLES: { id: string; handle: Handle; label: string }[] = [
  { id: "nw", handle: { l: true, t: true }, label: "top-left corner" },
  { id: "n", handle: { t: true }, label: "top edge" },
  { id: "ne", handle: { r: true, t: true }, label: "top-right corner" },
  { id: "e", handle: { r: true }, label: "right edge" },
  { id: "se", handle: { r: true, b: true }, label: "bottom-right corner" },
  { id: "s", handle: { b: true }, label: "bottom edge" },
  { id: "sw", handle: { l: true, b: true }, label: "bottom-left corner" },
  { id: "w", handle: { l: true }, label: "left edge" },
];

const ASPECTS: { id: string; label: string; value: number | "original" | null }[] = [
  { id: "free", label: "Free (any shape)", value: null },
  { id: "original", label: "Same shape as the image", value: "original" },
  { id: "1:1", label: "Square 1:1", value: 1 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
  { id: "3:4", label: "3:4", value: 3 / 4 },
  { id: "3:2", label: "3:2", value: 3 / 2 },
  { id: "2:3", label: "2:3", value: 2 / 3 },
  { id: "16:9", label: "16:9", value: 16 / 9 },
  { id: "9:16", label: "9:16", value: 9 / 16 },
];

const MIN_CROP_PX = 8;
const fraction = (r: PxRect, tw: number, th: number): CropRect => ({ x: r.x / tw, y: r.y / th, w: r.w / tw, h: r.h / th });
const toPx = (c: CropRect, tw: number, th: number): PxRect => ({ x: c.x * tw, y: c.y * th, w: c.w * tw, h: c.h * th });
const nextRotation = (r: Rotation, delta: 90 | -90): Rotation => (((r + delta + 360) % 360) as Rotation);

export default function CropEditor({ variant }: { variant: EditorVariant }) {
  const isPreset = variant !== "crop";
  /* "government" has no presets: the user types the pixel size and KB limits from their own notification. */
  const isGov = variant === "government";
  const presets = variant === "passport" ? passportPresets : isGov ? [] : signaturePresets;
  const initialPresetId = isGov ? "custom" : presets[0].id;

  const [result, setResult] = useState<Exported | null>(null);
  const resultRef = useRef<Exported | null>(null);
  const clearResult = () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = null;
    setResult(null);
  };
  const src = useImageSource(clearResult);
  const { file, dims, busy, encoders } = src;

  const [t, setT] = useState<Transform>({ rotation: 0, flipH: false, flipV: false });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 1, h: 1 });
  const [aspectId, setAspectId] = useState("free");
  const [presetId, setPresetId] = useState(initialPresetId);
  const [customW, setCustomW] = useState(isGov ? "" : variant === "passport" ? "413" : "300");
  const [customH, setCustomH] = useState(isGov ? "" : variant === "passport" ? "531" : "100");
  const [format, setFormat] = useState<OutputKind>("jpeg");
  const [quality, setQuality] = useState(0.92);
  const [maxKb, setMaxKb] = useState("");
  const [minKb, setMinKb] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});

  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ start: PxRect; x: number; y: number; handle: Handle | null } | null>(null);

  useEffect(() => () => void (resultRef.current && URL.revokeObjectURL(resultRef.current.url)), []);
  useEffect(() => () => release(previewRef.current), []);

  /* Target shape / size */
  const preset: SizePreset | null = presets.find((p) => p.id === presetId) ?? null;
  const target = useMemo(() => {
    if (!isPreset) return { w: 0, h: 0, error: "" };
    if (presetId !== "custom" && preset) return { w: preset.w, h: preset.h, error: "" };
    const w = Number(customW);
    const h = Number(customH);
    if (!customW.trim() || !customH.trim() || !Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) {
      return { w: 0, h: 0, error: "Enter a whole-number width and height of at least 1 pixel." };
    }
    return { w, h, error: checkOutputSize(w, h) };
  }, [isPreset, presetId, preset, customW, customH]);

  const tSize = dims ? transformedSize(dims.w, dims.h, t.rotation) : { w: 1, h: 1 };
  const aspect: number | null = useMemo(() => {
    if (isPreset) return target.w && target.h ? target.w / target.h : null;
    const found = ASPECTS.find((a) => a.id === aspectId);
    if (!found) return null;
    return found.value === "original" ? tSize.w / tSize.h : found.value;
  }, [isPreset, target, aspectId, tSize.w, tSize.h]);

  /* Keep the crop box consistent with the chosen shape. */
  const resetCrop = useCallback(
    (a: number | null, w: number, h: number) => setCrop(fraction(largestAspectRect(a, w, h), w, h)),
    [],
  );

  /* New image: build the reduced preview source and start from the untouched image. */
  useEffect(() => {
    release(previewRef.current);
    previewRef.current = null;
    const bitmap = src.bitmapRef.current;
    if (!dims || !bitmap) return;
    previewRef.current = makePreviewSource(bitmap, 1400);
    setT({ rotation: 0, flipH: false, flipV: false });
    setDraft({});
    const own = src.kind === "png" ? "png" : src.kind === "webp" ? "webp" : "jpeg";
    setFormat(isPreset ? (encoders.includes("jpeg") ? "jpeg" : encoders[0]) : encoders.includes(own) ? own : encoders[0]);
    resetCrop(aspect, dims.w, dims.h);
    setPreviewVersion((v) => v + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims]);

  useEffect(() => {
    if (!encoders.includes(format)) setFormat(encoders[0]);
  }, [encoders, format]);

  /* Changing the target shape re-fits the box around its current centre. */
  const lastAspect = useRef<number | null>(null);
  useEffect(() => {
    if (!dims) return;
    if (lastAspect.current !== aspect) {
      const px = toPx(crop, tSize.w, tSize.h);
      setCrop(fraction(aspect ? fitAspectRect(px, aspect, tSize.w, tSize.h) : px, tSize.w, tSize.h));
      lastAspect.current = aspect;
      clearResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect, dims]);

  /* Draw the rotated / flipped image behind the crop box. */
  const previewSrc = previewRef.current;
  const pSize = previewSrc ? transformedSize(previewSrc.width, previewSrc.height, t.rotation) : { w: 1, h: 1 };
  useEffect(() => {
    const canvas = canvasRef.current;
    const source = previewRef.current;
    if (!canvas || !source) return;
    const size = transformedSize(source.width, source.height, t.rotation);
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size.w, size.h);
    drawTransformed(ctx, source, t, { x: 0, y: 0, w: size.w, h: size.h }, 1);
  }, [t, previewVersion, file]);

  /* Crop box interaction (pointer + keyboard) */
  const px = toPx(crop, tSize.w, tSize.h);
  const commit = (r: PxRect) => {
    clearResult();
    setCrop(fraction(r, tSize.w, tSize.h));
  };

  const onPointerDown = (event: ReactPointerEvent, handle: Handle | null) => {
    if (busy) return;
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragRef.current = { start: px, x: event.clientX, y: event.clientY, handle };
  };
  const onPointerMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || !stage) return;
    const box = stage.getBoundingClientRect();
    const dx = ((event.clientX - drag.x) / box.width) * tSize.w;
    const dy = ((event.clientY - drag.y) / box.height) * tSize.h;
    commit(drag.handle ? resizeRect(drag.start, drag.handle, dx, dy, tSize.w, tSize.h, aspect, MIN_CROP_PX) : moveRect(drag.start, dx, dy, tSize.w, tSize.h));
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const step = Math.max(1, Math.round(Math.max(tSize.w, tSize.h) / 200));
  const onKey = (event: ReactKeyboardEvent, handle: Handle | null) => {
    const move: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const dir = move[event.key];
    if (!dir || busy) return;
    event.preventDefault();
    event.stopPropagation();
    const amount = step * (event.shiftKey ? 10 : 1);
    const dx = dir[0] * amount;
    const dy = dir[1] * amount;
    commit(handle ? resizeRect(px, handle, dx, dy, tSize.w, tSize.h, aspect, MIN_CROP_PX) : moveRect(px, dx, dy, tSize.w, tSize.h));
  };

  /* Numeric fields: exact values, and the keyboard-free alternative to dragging. */
  const setField = (field: "x" | "y" | "w" | "h", value: number) => {
    if (!Number.isFinite(value)) return;
    const v = Math.round(value);
    let r = { ...px };
    if (field === "x") r.x = Math.min(Math.max(0, v), tSize.w - r.w);
    if (field === "y") r.y = Math.min(Math.max(0, v), tSize.h - r.h);
    if (field === "w") {
      r.w = Math.min(Math.max(1, v), tSize.w - r.x);
      if (aspect) {
        r.h = r.w / aspect;
        if (r.y + r.h > tSize.h) {
          r.h = tSize.h - r.y;
          r.w = r.h * aspect;
        }
      }
    }
    if (field === "h") {
      r.h = Math.min(Math.max(1, v), tSize.h - r.y);
      if (aspect) {
        r.w = r.h * aspect;
        if (r.x + r.w > tSize.w) {
          r.w = tSize.w - r.x;
          r.h = r.w / aspect;
        }
      }
    }
    commit(r);
  };
  const shown = (field: "x" | "y" | "w" | "h") => draft[field] ?? String(Math.round(px[field]));
  const numberField = (field: "x" | "y" | "w" | "h", label: string) => (
    <div className="ic-field ic-field-unit">
      <label htmlFor={`cr-${field}`}>{label}</label>
      <input
        id={`cr-${field}`}
        type="number"
        inputMode="numeric"
        min={field === "w" || field === "h" ? 1 : 0}
        value={shown(field)}
        disabled={busy}
        onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
        onBlur={() => {
          if (draft[field] !== undefined) setField(field, Number(draft[field]));
          const { [field]: _gone, ...rest } = draft;
          setDraft(rest);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    </div>
  );

  /* Rotate / flip */
  const rotate = (delta: 90 | -90) => {
    clearResult();
    const rotation = nextRotation(t.rotation, delta);
    const size = transformedSize(dims!.w, dims!.h, rotation);
    setT({ ...t, rotation });
    // Rotating changes the image shape, so the box starts again from the largest allowed one.
    const a = isPreset ? aspect : ASPECTS.find((x) => x.id === aspectId)?.value === "original" ? size.w / size.h : aspect;
    lastAspect.current = a;
    resetCrop(a, size.w, size.h);
  };
  const flip = (axis: "flipH" | "flipV") => {
    clearResult();
    setT({ ...t, [axis]: !t[axis] });
    // Mirror the box so it keeps framing the same part of the picture.
    setCrop(axis === "flipH" ? { ...crop, x: 1 - crop.x - crop.w } : { ...crop, y: 1 - crop.y - crop.h });
  };
  const resetEdits = () => {
    clearResult();
    setT({ rotation: 0, flipH: false, flipV: false });
    lastAspect.current = aspect;
    resetCrop(isPreset ? aspect : ASPECTS.find((x) => x.id === aspectId)?.value === "original" ? dims!.w / dims!.h : aspect, dims!.w, dims!.h);
  };

  const reset = () => {
    clearResult();
    src.clear();
    setAspectId("free");
    setPresetId(initialPresetId);
    setMaxKb("");
    setMinKb("");
    lastAspect.current = null;
  };

  /* Export */
  const area = dims ? cropToPixels(crop, tSize.w, tSize.h) : { x: 0, y: 0, w: 0, h: 0 };
  const exportW = isPreset ? target.w : area.w;
  const exportH = isPreset ? target.h : area.h;
  const exportError = isPreset ? target.error : area.w < 1 || area.h < 1 ? "The crop is empty. Drag the box larger." : checkOutputSize(area.w, area.h);
  const hasMax = isPreset && maxKb.trim() !== "";
  const hasMin = isGov && minKb.trim() !== "";
  const maxParsed = hasMax ? parseKb(maxKb, "maximum") : { bytes: null, error: "" };
  const minParsed = hasMin ? parseKb(minKb, "minimum") : { bytes: null, error: "" };
  const minBytes = minParsed.bytes;
  const maxBytes = maxParsed.bytes;
  const limitKb = maxBytes === null ? 0 : maxBytes / 1024;
  const limitMinKb = minBytes === null ? 0 : minBytes / 1024;
  const limitError = maxParsed.error || minParsed.error
    || (minBytes !== null && maxBytes !== null && minBytes > maxBytes ? "The minimum file size is larger than the maximum. Check both values." : "");

  const run = async () => {
    const bitmap = src.bitmapRef.current;
    if (!file || !bitmap || !dims) return src.setErrors(["Add an image first."]);
    const problem = exportError || limitError;
    if (problem) return src.setErrors([problem]);
    src.setErrors([]);
    clearResult();
    src.setBusy(true);
    let cropped: HTMLCanvasElement | null = null;
    let final: HTMLCanvasElement | null = null;
    try {
      src.setProgress("Applying your edits…");
      cropped = renderTransformed(bitmap, t, area, format);
      final = isPreset ? resampleTo(cropped, target.w, target.h, format) : cropped;
      src.setProgress("Encoding…");
      const notes: string[] = [];
      let blob: Blob;
      let overLimit = false;
      let underMin = false;
      if (hasMax || hasMin) {
        const sized = await encodeInRange(final, format, minBytes, maxBytes, quality);
        blob = sized.blob;
        overLimit = hasMax && !sized.met;
        underMin = sized.belowMin;
        if (format === "png") notes.push("PNG is lossless, so its size cannot be tuned. Choose JPG or WebP to aim for a file-size limit.");
        else if (overLimit) notes.push(`The file is ${formatBytes(blob.size)}, over your ${limitKb} KB limit even at the lowest quality tried. Use a smaller pixel size or crop less.`);
        else if (sized.quality < quality) notes.push(`Quality was lowered to ${Math.round(sized.quality * 100)}% to get under ${limitKb} KB.`);
        else if (sized.quality > quality) notes.push(`Quality was raised to ${Math.round(sized.quality * 100)}% to reach ${limitMinKb} KB.`);
        if (underMin) {
          const reason = sized.quality >= 1
            ? "Quality is already at its maximum for this picture."
            : "Your browser's next quality step jumps from below the minimum to above your maximum, so no quality setting lands inside the range.";
          notes.push(`The file is ${formatBytes(blob.size)}, below your ${limitMinKb} KB minimum, so the requested minimum was not reached. ${reason} A small or simple picture can stay small; use a larger original or a larger pixel size if the form allows it, or try WebP if the form accepts it. The file was not padded or altered to inflate its size.`);
        }
      } else {
        blob = await encodeCanvas(final, format, quality);
      }
      src.setProgress("Checking the file…");
      await verifyBlob(blob, format, final.width, final.height);

      if (format === "jpeg" && src.kind !== "jpeg") notes.push("JPG cannot store transparency, so any transparent areas were filled with white.");
      if (isPreset && (area.w < target.w || area.h < target.h)) notes.push(`The selected area is ${area.w} × ${area.h} px, smaller than the ${target.w} × ${target.h} px output, so it was enlarged and may look soft.`);
      if (!isPreset) notes.push("Only the area inside the crop box was exported; the original file was not changed.");

      const suffix = isPreset ? `${variant}-${target.w}x${target.h}` : `edited-${area.w}x${area.h}`;
      const name = `${baseName(file.name)}-${suffix}.${EXT[format]}`;
      const out: Exported = { url: URL.createObjectURL(blob), blob, name, w: final.width, h: final.height, format, notes, overLimit, underMin };
      resultRef.current = out;
      setResult(out);
      src.setStatus(overLimit || underMin ? "Finished, but the file size is outside your requested range. See the warning below." : "Done. Your image is ready.");
    } catch (caught) {
      src.setStatus("");
      src.setErrors([caught instanceof Error && caught.message ? caught.message : "The image could not be exported."]);
    } finally {
      if (final !== cropped) release(final);
      release(cropped);
      src.setBusy(false);
      src.setProgress("");
    }
  };

  const boxStyle = { left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` };
  const hasEdits = t.rotation !== 0 || t.flipH || t.flipV;
  const shapeLabel = isPreset ? "Locked to the output shape" : aspect ? "Shape locked" : "Free shape";

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
        accept={IMAGE_ACCEPT}
        multiple={false}
        busy={busy}
        ariaLabel={`${variant === "crop" ? "Crop, rotate and flip" : variant === "passport" ? "Passport photo" : isGov ? "Application photo or signature" : "Signature"} drop area`}
        onFiles={(files) => void src.load(files)}
      />
      <p className="ic-hint">Your image stays on this device and is never uploaded. The original file is not changed.</p>

      {file && dims && (
        <form
          className="st-form"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          {isPreset && (
            <>
              <div className="ic-controls">
                {!isGov && (
                <div className="ic-field">
                  <label htmlFor="cr-preset">{variant === "passport" ? "Photo size" : "Signature size"}</label>
                  <select id="cr-preset" value={presetId} disabled={busy} onChange={(e) => setPresetId(e.target.value)}>
                    {[...new Set(presets.map((p) => p.region))].map((region) => (
                      <optgroup key={region} label={region}>
                        {presets.filter((p) => p.region === region).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="custom">Custom size…</option>
                  </select>
                </div>
                )}
                {presetId === "custom" && (
                  <>
                    <div className="ic-field ic-field-unit">
                      <label htmlFor="cr-cw">Width (px)</label>
                      <input id="cr-cw" type="number" inputMode="numeric" min={1} value={customW} disabled={busy} onChange={(e) => setCustomW(e.target.value)} />
                    </div>
                    <div className="ic-field ic-field-unit">
                      <label htmlFor="cr-ch">Height (px)</label>
                      <input id="cr-ch" type="number" inputMode="numeric" min={1} value={customH} disabled={busy} onChange={(e) => setCustomH(e.target.value)} />
                    </div>
                  </>
                )}
                {isGov && (
                  <div className="ic-field ic-field-unit">
                    <label htmlFor="cr-minkb">Min size (KB)</label>
                    <input id="cr-minkb" type="number" inputMode="decimal" min={0} step="any" placeholder="optional" value={minKb} disabled={busy} onChange={(e) => { clearResult(); setMinKb(e.target.value); }} />
                  </div>
                )}
                <div className="ic-field ic-field-unit">
                  <label htmlFor="cr-kb">Max size (KB)</label>
                  <input id="cr-kb" type="number" inputMode="decimal" min={0} step="any" placeholder="optional" value={maxKb} disabled={busy} onChange={(e) => { clearResult(); setMaxKb(e.target.value); }} />
                </div>
              </div>
              {isGov && (
                <p className="st-note">
                  File sizes use 1 KB = 1,024 bytes, the same unit shown in the result. Enter the width, height and file-size range exactly as your application notice states them. This page has no built-in exam presets because requirements change with each notification.
                </p>
              )}
              {preset && presetId !== "custom" && (
                <p className="st-note">
                  <strong>{preset.region}:</strong> {preset.w} × {preset.h} px{preset.physical ? ` (${preset.physical})` : ""}. {preset.note}
                </p>
              )}
              {target.error && (
                <div className="ic-error" role="alert">
                  <p style={{ margin: 0 }}>{target.error}</p>
                </div>
              )}
            </>
          )}

          <div className="ed-toolbar" role="group" aria-label="Rotate and flip">
            <button type="button" className="button" disabled={busy} onClick={() => rotate(-90)}>
              ↺ Rotate left
            </button>
            <button type="button" className="button" disabled={busy} onClick={() => rotate(90)}>
              ↻ Rotate right
            </button>
            <button type="button" className="button" aria-pressed={t.flipH} disabled={busy} onClick={() => flip("flipH")}>
              ⇆ Flip horizontal
            </button>
            <button type="button" className="button" aria-pressed={t.flipV} disabled={busy} onClick={() => flip("flipV")}>
              ⇅ Flip vertical
            </button>
            <button type="button" className="button" disabled={busy} onClick={() => { resetEdits(); }}>
              Reset
            </button>
          </div>

          {!isPreset && (
            <div className="ic-controls">
              <div className="ic-field">
                <label htmlFor="cr-aspect">Crop shape</label>
                <select id="cr-aspect" value={aspectId} disabled={busy} onChange={(e) => setAspectId(e.target.value)}>
                  {ASPECTS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <figure className="st-figure">
            <figcaption className="st-caption">
              {hasEdits ? `Rotated ${t.rotation}°${t.flipH ? ", flipped horizontally" : ""}${t.flipV ? ", flipped vertically" : ""} · ` : ""}
              Image {tSize.w} × {tSize.h} px · selection {Math.round(px.w)} × {Math.round(px.h)} px · {shapeLabel}
            </figcaption>
            <div className="cr-wrap">
              <div className="cr-stage" ref={stageRef} style={{ aspectRatio: `${pSize.w} / ${pSize.h}`, maxWidth: `${Math.min(pSize.w, 720)}px` }} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
                <div className="cr-clip">
                  <canvas ref={canvasRef} className="st-canvas" role="img" aria-label="Image being edited" />
                  <div className="cr-dim" aria-hidden="true" style={boxStyle} />
                </div>
                <div
                  className="cr-box"
                  tabIndex={0}
                  role="group"
                  aria-label={`Crop area, ${Math.round(px.w)} by ${Math.round(px.h)} pixels. Use the arrow keys to move it. Hold Shift for bigger steps.`}
                  style={boxStyle}
                  onPointerDown={(e) => onPointerDown(e, null)}
                  onKeyDown={(e) => onKey(e, null)}
                >
                  <span className="cr-grid" aria-hidden="true" />
                  {HANDLES.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      className={`cr-handle cr-handle-${h.id}`}
                      aria-label={`Resize crop from the ${h.label}. Use the arrow keys.`}
                      onPointerDown={(e) => onPointerDown(e, h.handle)}
                      onKeyDown={(e) => onKey(e, h.handle)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="ic-hint">Drag the box to move it and the handles to resize it. With a keyboard, focus the box or a handle and use the arrow keys (Shift for bigger steps), or type exact values below.</p>
          </figure>

          <div className="ic-controls">
            {numberField("x", "Left (px)")}
            {numberField("y", "Top (px)")}
            {numberField("w", "Width (px)")}
            {numberField("h", "Height (px)")}
            <FormatFields idPrefix="cr" encoders={encoders} format={format} quality={quality} disabled={busy} onFormat={(f) => { clearResult(); setFormat(f); }} onQuality={setQuality} />
          </div>
          <EncoderNote encoders={encoders} />

          {isPreset && <p className="st-note">{ACCEPTANCE_NOTICE}</p>}

          {(exportError || limitError) && (
            <div className="ic-error" role="alert">
              <p style={{ margin: 0 }}>{exportError || limitError}</p>
            </div>
          )}
          <button type="submit" className="button button-primary ic-submit" disabled={busy || Boolean(exportError) || Boolean(limitError)}>
            {busy ? "Working…" : isPreset ? `Create ${exportW} × ${exportH} px image` : `Export ${exportW} × ${exportH} px image`}
          </button>
        </form>
      )}

      <StatusArea busy={busy} progress={src.progress} status={src.status} errors={src.errors} />

      {result && (
        <ResultPanel
          ariaLabel="Result"
          tone={result.overLimit || result.underMin ? "warning" : "success"}
          title={result.overLimit ? "Your image is ready, but over your size limit" : result.underMin ? "Your image is ready, but under your minimum size" : "Your image is ready"}
          fileName={result.name}
          details={[
            { label: "Dimensions", value: `${result.w} × ${result.h}`, hint: "pixels" },
            { label: "File size", value: formatBytes(result.blob.size) },
            { label: "Format", value: FORMAT_LABEL[result.format] },
          ]}
          notes={result.notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Download {FORMAT_LABEL[result.format]}
            </a>
          }
          secondary={
            <button type="button" className="button" onClick={clearResult}>
              Edit again
            </button>
          }
          resetLabel="Start again with another image"
          onReset={reset}
        >
          <img className="ic-preview" src={result.url} alt="Preview of the exported image" width={result.w} height={result.h} />
        </ResultPanel>
      )}
    </div>
  );
}
