import { sniffKind } from "./imageFormats";

/* Canvas helpers shared by the social image tools. Everything is computed relative to the canvas size,
   so a small preview and the full-size export use exactly the same layout. */

export type BgKind = "white" | "black" | "color" | "blur" | "transparent";
export type FitMode = "contain" | "cover";
export type SourceImage = CanvasImageSource & { width: number; height: number };

export interface Placement {
  fit: FitMode;
  /** Percent of the base size (100 = exactly fitted or filled). */
  zoom: number;
  /** Offsets in percent of the canvas width / height. */
  offX: number;
  offY: number;
  /** Empty margin on every side, in percent of the shorter canvas side. */
  padding: number;
}

export interface Scene {
  bg: BgKind;
  color: string;
  placement: Placement;
  /** Clip the whole canvas to a circle (only when the user asks for it). */
  circle?: boolean;
}

export interface Layout {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  /** True when part of the image falls outside the canvas. */
  overflow: boolean;
}

export function computeLayout(srcW: number, srcH: number, W: number, H: number, p: Placement): Layout {
  const pad = (Math.min(W, H) * p.padding) / 100;
  const aw = Math.max(1, W - 2 * pad);
  const ah = Math.max(1, H - 2 * pad);
  const base = p.fit === "cover" ? Math.max(aw / srcW, ah / srcH) : Math.min(aw / srcW, ah / srcH);
  const scale = (base * p.zoom) / 100;
  const dw = srcW * scale;
  const dh = srcH * scale;
  let dx = (W - dw) / 2 + (W * p.offX) / 100;
  let dy = (H - dh) / 2 + (H * p.offY) / 100;
  // Fitting never crops: while the image is smaller than the canvas, keep it fully inside.
  if (p.fit === "contain") {
    if (dw <= W) dx = Math.min(Math.max(dx, 0), W - dw);
    if (dh <= H) dy = Math.min(Math.max(dy, 0), H - dh);
  }
  dx = Math.round(dx);
  dy = Math.round(dy);
  const rw = Math.max(1, Math.round(dw));
  const rh = Math.max(1, Math.round(dh));
  return { dx, dy, dw: rw, dh: rh, overflow: dx < 0 || dy < 0 || dx + rw > W || dy + rh > H };
}

export function supportsBlur(): boolean {
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    return Boolean(ctx && "filter" in ctx);
  } catch {
    return false;
  }
}

/** Draws the scene onto the canvas, sizing it to W×H. Returns the layout used. */
export function drawScene(canvas: HTMLCanvasElement, src: SourceImage, W: number, H: number, scene: Scene): Layout {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create a drawing surface.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, W, H);

  if (scene.circle) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, Math.min(W, H) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  if (scene.bg === "white" || scene.bg === "black" || scene.bg === "color") {
    ctx.fillStyle = scene.bg === "white" ? "#ffffff" : scene.bg === "black" ? "#000000" : scene.color;
    ctx.fillRect(0, 0, W, H);
  } else if (scene.bg === "blur") {
    // A zoomed, blurred copy of the same picture fills the space the fitted image leaves empty.
    const cover = Math.max(W / src.width, H / src.height) * 1.15;
    const bw = src.width * cover;
    const bh = src.height * cover;
    ctx.save();
    ctx.filter = `blur(${Math.max(2, Math.round(Math.min(W, H) * 0.035))}px)`;
    ctx.drawImage(src, (W - bw) / 2, (H - bh) / 2, bw, bh);
    ctx.restore();
  }

  const layout = computeLayout(src.width, src.height, W, H, scene.placement);
  ctx.drawImage(src, layout.dx, layout.dy, layout.dw, layout.dh);
  if (scene.circle) ctx.restore();
  return layout;
}

/** A reduced copy of the bitmap, so sliders stay responsive on large photos. */
export function makePreviewSource(bitmap: ImageBitmap, maxSide = 1400): HTMLCanvasElement {
  const k = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * k));
  canvas.height = Math.max(1, Math.round(bitmap.height * k));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create a drawing surface.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export type ExportFormat = "jpeg" | "png";
export const MIME: Record<ExportFormat, string> = { jpeg: "image/jpeg", png: "image/png" };
export const EXT: Record<ExportFormat, string> = { jpeg: "jpg", png: "png" };

export async function canvasToBlob(canvas: HTMLCanvasElement, format: ExportFormat, quality = 0.92): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, MIME[format], quality));
  if (!blob) throw new Error("Your browser could not encode the image.");
  if (blob.type !== MIME[format]) throw new Error("Your browser produced a different format than requested.");
  return blob;
}

/** Re-reads the exported file and confirms its type and pixel size. */
export async function verifyExport(blob: Blob, format: ExportFormat, W: number, H: number): Promise<void> {
  const kind = await sniffKind(blob);
  if (kind !== format) throw new Error(`The exported file failed its check (expected ${format}, got ${kind}).`);
  const back = await createImageBitmap(blob);
  const ok = back.width === W && back.height === H;
  back.close();
  if (!ok) throw new Error("The exported file failed its size check, so it was not offered for download.");
}

export function releaseCanvas(canvas: HTMLCanvasElement | null) {
  if (canvas) canvas.width = canvas.height = 0;
}
