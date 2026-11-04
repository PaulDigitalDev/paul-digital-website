/* Pure geometry and pixel maths for the image-effect tools (grayscale, border, rounded corners, circle crop).
   Nothing here touches the DOM, so it can be tested directly. Drawing lives in the component. */

export type EffectMode = "grayscale" | "border" | "round" | "circle";

/** Rec. 601 luma, the usual weighting for converting colour to grey. Result is a whole number 0–255. */
export function luma(r: number, g: number, b: number): number {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

/** Turns RGBA pixel data grey in place. Alpha is left alone. */
export function grayscaleInPlace(data: Uint8ClampedArray): void {
  for (let i = 0; i + 3 < data.length; i += 4) {
    const y = luma(data[i], data[i + 1], data[i + 2]);
    data[i] = data[i + 1] = data[i + 2] = y;
  }
}

/** The largest corner radius that still makes sense: half the shorter side, which turns a square into a circle. */
export function maxCornerRadius(width: number, height: number): number {
  return Math.floor(Math.min(width, height) / 2);
}

/** Converts a 0–100 slider to a radius in pixels (100 gives the fully rounded "pill"/circle shape). */
export function radiusFromPercent(percent: number, width: number, height: number): number {
  const p = Math.max(0, Math.min(100, percent));
  return Math.round((p / 100) * maxCornerRadius(width, height));
}

/** Size of the picture after a border of `thickness` pixels is added on every side. */
export function borderedSize(width: number, height: number, thickness: number) {
  const t = Math.max(0, Math.round(thickness));
  return { w: width + 2 * t, h: height + 2 * t };
}

/** Centred square used for a circle crop: the biggest square that fits in the picture. */
export function circleSquare(width: number, height: number) {
  const side = Math.min(width, height);
  return { x: Math.floor((width - side) / 2), y: Math.floor((height - side) / 2), side };
}

/** Parses a #rgb or #rrggbb colour. Returns null when it is not a valid hex colour. */
export function parseHex(value: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
