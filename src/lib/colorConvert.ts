/* Color conversion between HEX, RGB and HSL. All maths runs in the browser. */

export interface Rgb { r: number; g: number; b: number }
export interface Hsl { h: number; s: number; l: number }

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Reads #RGB or #RRGGBB (the # is optional). */
export function parseHex(raw: string): Rgb | null {
  let s = raw.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return { r: parseInt(s.slice(0, 2), 16), g: parseInt(s.slice(2, 4), 16), b: parseInt(s.slice(4, 6), 16) };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const h = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0").toUpperCase();
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const S = s / 100, L = l / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = L - c / 2;
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
}

export const rgbCss = ({ r, g, b }: Rgb) => `rgb(${r}, ${g}, ${b})`;
export const hslCss = (h: Hsl) => `hsl(${Math.round(h.h)}, ${Math.round(h.s)}%, ${Math.round(h.l)}%)`;

/** Parses "rgb(1, 2, 3)" or "1, 2, 3" or "1 2 3". */
export function parseRgb(raw: string): Rgb | null {
  const m = raw.match(/-?\d+(\.\d+)?/g);
  if (!m || m.length !== 3) return null;
  const [r, g, b] = m.map(Number);
  if ([r, g, b].some((n) => n < 0 || n > 255)) return null;
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

export function parseHsl(raw: string): Hsl | null {
  const m = raw.match(/-?\d+(\.\d+)?/g);
  if (!m || m.length !== 3) return null;
  const [h, s, l] = m.map(Number);
  if (s < 0 || s > 100 || l < 0 || l > 100 || h < -360 || h > 720) return null;
  return { h, s, l };
}
