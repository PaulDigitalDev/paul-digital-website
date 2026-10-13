import { parseJpeg } from "./jpegPdf.ts";
import type { JpegInfo } from "./jpegPdf.ts";

export type JpegCheck =
  | { ok: true; info: JpegInfo; displayWidth: number; displayHeight: number }
  | { ok: false; reason: "empty" | "not-jpeg" | "corrupt" };

/** Validates by content (JPEG signature and frame header), not by file name or declared type. */
export function checkJpeg(bytes: Uint8Array): JpegCheck {
  if (bytes.length === 0) return { ok: false, reason: "empty" };
  if (!(bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) return { ok: false, reason: "not-jpeg" };
  const info = parseJpeg(bytes);
  if (!info || !hasEndMarker(bytes)) return { ok: false, reason: "corrupt" };
  const swap = info.orientation >= 5;
  return { ok: true, info, displayWidth: swap ? info.height : info.width, displayHeight: swap ? info.width : info.height };
}

/** A complete JPEG ends with an EOI marker (FF D9); allow a little trailing padding. Catches truncated files. */
function hasEndMarker(bytes: Uint8Array): boolean {
  for (let i = bytes.length - 2; i >= Math.max(2, bytes.length - 4096); i--) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) return true;
  }
  return false;
}
