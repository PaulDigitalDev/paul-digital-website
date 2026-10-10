import { sniffKind } from "./imageFormats";
import type { OutputKind } from "./imageFormats";
import { encodeInRangeWith, fitWithin, rangeOutcome } from "./sizeRange";
import type { RangedBlob, SizedBlob } from "./sizeRange";

/* Canvas helpers shared by the Image Resizer, Crop/Rotate/Flip and the passport/signature tools. */

export const MAX_SIDE = 12000;
export const MAX_OUTPUT_PIXELS = 50_000_000;

export const MIME: Record<OutputKind, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
export const EXT: Record<OutputKind, string> = { jpeg: "jpg", png: "png", webp: "webp" };
export const FORMAT_LABEL: Record<OutputKind, string> = { jpeg: "JPG", png: "PNG", webp: "WebP" };

export type Drawable = CanvasImageSource & { width: number; height: number };

/** Output kinds this browser can really encode (checked by encoding a 1×1 canvas, not by guessing from the user agent). */
export async function detectEncoders(): Promise<OutputKind[]> {
  const found: OutputKind[] = [];
  for (const kind of ["jpeg", "png", "webp"] as OutputKind[]) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, MIME[kind], 0.9));
    if (blob && blob.type === MIME[kind]) found.push(kind);
  }
  return found;
}

export function newCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create a drawing surface. The image may be too large for it.");
  return ctx;
}

export function release(canvas: HTMLCanvasElement | null) {
  if (canvas) canvas.width = canvas.height = 0;
}

/** JPEG has no transparency, so transparent areas are flattened onto white. */
export function fillWhiteForJpeg(ctx: CanvasRenderingContext2D, kind: OutputKind, width: number, height: number) {
  if (kind !== "jpeg") return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
}

/** Scales a source to the requested size, halving repeatedly for big reductions so detail is not lost to aliasing. */
export function resampleTo(src: Drawable, width: number, height: number, kind: OutputKind): HTMLCanvasElement {
  let current: Drawable = src;
  let cw = src.width;
  let ch = src.height;
  const temp: HTMLCanvasElement[] = [];
  while (cw / 2 >= width && ch / 2 >= height) {
    const nw = Math.max(width, Math.floor(cw / 2));
    const nh = Math.max(height, Math.floor(ch / 2));
    const step = newCanvas(nw, nh);
    const sctx = context2d(step);
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(current, 0, 0, nw, nh);
    temp.push(step);
    current = step;
    cw = nw;
    ch = nh;
  }
  const out = newCanvas(width, height);
  const ctx = context2d(out);
  fillWhiteForJpeg(ctx, kind, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(current, 0, 0, width, height);
  temp.forEach(release);
  return out;
}

export async function encodeCanvas(canvas: HTMLCanvasElement, kind: OutputKind, quality = 0.92): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, MIME[kind], quality));
  if (!blob) throw new Error("Your browser could not encode the image. It may be too large for this device.");
  if (blob.type !== MIME[kind]) throw new Error(`Your browser cannot save ${FORMAT_LABEL[kind]} files (it produced ${blob.type || "an unknown type"} instead). Choose another format.`);
  return blob;
}

export type { SizedBlob, RangedBlob } from "./sizeRange";

/** Lowers JPEG/WebP quality in steps until the file fits maxBytes. PNG is lossless here, so it cannot be tuned. */
export async function encodeWithin(canvas: HTMLCanvasElement, kind: OutputKind, maxBytes: number, startQuality = 0.92): Promise<SizedBlob> {
  return fitWithin((q) => encodeCanvas(canvas, kind, q), kind === "png", maxBytes, startQuality);
}

/** Fits the requested [min, max] byte range by tuning quality only; see encodeInRangeWith. */
export async function encodeInRange(canvas: HTMLCanvasElement, kind: OutputKind, minBytes: number | null, maxBytes: number | null, startQuality = 0.92): Promise<RangedBlob> {
  // Development-only diagnostics (stripped from production builds): sizes only, never image data.
  const dev = import.meta.env.DEV;
  const log = (...args: unknown[]) => dev && console.debug("[size-range]", ...args);
  log("request", { minBytes, maxBytes, mime: MIME[kind], canvas: `${canvas.width}x${canvas.height}`, startQuality });
  const result = await encodeInRangeWith(
    async (q) => {
      const blob = await encodeCanvas(canvas, kind, q);
      log("attempt", { quality: q, type: blob.type, bytes: blob.size });
      return blob;
    },
    kind === "png",
    minBytes,
    maxBytes,
    startQuality,
  );
  log("final", { quality: result.quality, bytes: result.blob.size, inRange: rangeOutcome(result.blob.size, minBytes, maxBytes), attempts: result.attempts });
  return result;
}

/** Re-reads an exported file and confirms its real type and pixel size. */
export async function verifyBlob(blob: Blob, kind: OutputKind, width: number, height: number): Promise<void> {
  const actual = await sniffKind(blob);
  if (actual !== kind) throw new Error(`The exported file failed its check (expected ${FORMAT_LABEL[kind]}, got ${actual}), so it was not offered for download.`);
  const back = await createImageBitmap(blob);
  const ok = back.width === width && back.height === height;
  back.close();
  if (!ok) throw new Error("The exported file failed its size check, so it was not offered for download.");
}

export function checkOutputSize(width: number, height: number): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return "Width and height must be at least 1 pixel.";
  if (!Number.isInteger(width) || !Number.isInteger(height)) return "Width and height must be whole numbers of pixels.";
  if (width > MAX_SIDE || height > MAX_SIDE) return `Each side must be ${MAX_SIDE.toLocaleString()} pixels or fewer.`;
  if (width * height > MAX_OUTPUT_PIXELS) return `The output would be ${(width * height / 1_000_000).toFixed(1)} megapixels. The limit is ${MAX_OUTPUT_PIXELS / 1_000_000} megapixels so browsers can handle it.`;
  return "";
}

/* ---------- Rotate / flip / crop ---------- */

export type Rotation = 0 | 90 | 180 | 270;
export interface Transform {
  rotation: Rotation;
  flipH: boolean;
  flipV: boolean;
}
/** A crop rectangle as fractions (0–1) of the rotated-and-flipped image, so it does not depend on preview resolution. */
export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };

/** Size of the image after rotation (flips do not change it). */
export function transformedSize(srcW: number, srcH: number, rotation: Rotation) {
  return rotation === 90 || rotation === 270 ? { w: srcH, h: srcW } : { w: srcW, h: srcH };
}

/** Crop rectangle converted to whole pixels of the transformed image, always inside it and at least 1×1. */
export function cropToPixels(crop: CropRect, tw: number, th: number) {
  const x = Math.min(tw - 1, Math.max(0, Math.round(crop.x * tw)));
  const y = Math.min(th - 1, Math.max(0, Math.round(crop.y * th)));
  const w = Math.min(tw - x, Math.max(1, Math.round(crop.w * tw)));
  const h = Math.min(th - y, Math.max(1, Math.round(crop.h * th)));
  return { x, y, w, h };
}

/**
 * Draws src rotated, then flipped, then cropped to the pixel rectangle (in transformed-image pixels).
 * The same function drives the on-screen preview (small source, scale < 1) and the final export.
 */
export function drawTransformed(
  ctx: CanvasRenderingContext2D,
  src: Drawable,
  t: Transform,
  area: { x: number; y: number; w: number; h: number },
  scale = 1,
) {
  const { w: tw, h: th } = transformedSize(src.width, src.height, t.rotation);
  ctx.save();
  ctx.imageSmoothingQuality = "high";
  ctx.scale(scale, scale);
  ctx.translate(-area.x, -area.y);
  if (t.flipH || t.flipV) {
    ctx.translate(t.flipH ? tw : 0, t.flipV ? th : 0);
    ctx.scale(t.flipH ? -1 : 1, t.flipV ? -1 : 1);
  }
  if (t.rotation === 90) ctx.translate(src.height, 0);
  else if (t.rotation === 180) ctx.translate(src.width, src.height);
  else if (t.rotation === 270) ctx.translate(0, src.width);
  ctx.rotate((t.rotation * Math.PI) / 180);
  ctx.drawImage(src, 0, 0);
  ctx.restore();
}

/** Renders the transformed (and optionally cropped) image at full size. */
export function renderTransformed(src: Drawable, t: Transform, area: { x: number; y: number; w: number; h: number }, kind: OutputKind): HTMLCanvasElement {
  const canvas = newCanvas(area.w, area.h);
  const ctx = context2d(canvas);
  fillWhiteForJpeg(ctx, kind, area.w, area.h);
  drawTransformed(ctx, src, t, area, 1);
  return canvas;
}
