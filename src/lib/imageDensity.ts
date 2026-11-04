import { crc32 } from "./zip.ts";

/* Read and write the DPI stored inside a JPEG or PNG file without decoding or re-encoding the picture.
   A file's DPI is only a label (pixels are not changed), so rewriting it is lossless: the new file has exactly the same pixels. */

export type DensityKind = "jpeg" | "png";
export interface Density {
  kind: DensityKind;
  /** Pixels per inch as stored, or null when the file does not say. */
  dpiX: number | null;
  dpiY: number | null;
  /** Where the value came from, for display. */
  source: "JFIF" | "EXIF" | "pHYs" | "none";
}

export function detectDensityKind(bytes: Uint8Array): DensityKind | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  return null;
}

const u16 = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const u32 = (b: Uint8Array, o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const ascii = (b: Uint8Array, o: number, n: number) => String.fromCharCode(...b.slice(o, o + n));
const round2 = (n: number) => Math.round(n * 100) / 100;

interface JpegSegment {
  marker: number;
  start: number;
  length: number;
}

function jpegSegments(bytes: Uint8Array): JpegSegment[] {
  const segments: JpegSegment[] = [];
  let pos = 2;
  while (pos + 4 <= bytes.length) {
    if (bytes[pos] !== 0xff) break;
    const marker = bytes[pos + 1];
    if (marker === 0xff) {
      pos += 1;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) break;
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      pos += 2;
      continue;
    }
    const length = u16(bytes, pos + 2);
    if (length < 2 || pos + 2 + length > bytes.length) break;
    segments.push({ marker, start: pos, length: length + 2 });
    pos += 2 + length;
  }
  return segments;
}

interface ExifTags {
  xRes?: { valueOffset: number; value: number };
  yRes?: { valueOffset: number; value: number };
  unit?: { valueOffset: number; value: number };
  little: boolean;
}

/** Walks IFD0 of an Exif APP1 segment for XResolution (0x011A), YResolution (0x011B) and ResolutionUnit (0x0128). */
function readExif(bytes: Uint8Array, seg: JpegSegment): ExifTags | null {
  const body = seg.start + 4;
  if (ascii(bytes, body, 6) !== "Exif\0\0") return null;
  const tiff = body + 6;
  const bo = ascii(bytes, tiff, 2);
  if (bo !== "II" && bo !== "MM") return null;
  const little = bo === "II";
  const r16 = (o: number) => (little ? bytes[o] | (bytes[o + 1] << 8) : (bytes[o] << 8) | bytes[o + 1]);
  const r32 = (o: number) =>
    (little ? bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16) | (bytes[o + 3] << 24) : (bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]) >>> 0;
  const end = seg.start + seg.length;
  const ifd = tiff + r32(tiff + 4);
  if (ifd + 2 > end) return null;
  const count = r16(ifd);
  const out: ExifTags = { little };
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > end) break;
    const tag = r16(entry);
    if (tag === 0x011a || tag === 0x011b) {
      const at = tiff + r32(entry + 8);
      if (at + 8 > end) continue;
      const den = r32(at + 4);
      if (den === 0) continue;
      const item = { valueOffset: at, value: r32(at) / den };
      if (tag === 0x011a) out.xRes = item;
      else out.yRes = item;
    } else if (tag === 0x0128) {
      out.unit = { valueOffset: entry + 8, value: r16(entry + 8) };
    }
  }
  return out;
}

export function readDensity(bytes: Uint8Array): Density | null {
  const kind = detectDensityKind(bytes);
  if (kind === "png") {
    let pos = 8;
    while (pos + 12 <= bytes.length) {
      const len = u32(bytes, pos);
      const type = ascii(bytes, pos + 4, 4);
      if (type === "pHYs" && len === 9) {
        const x = u32(bytes, pos + 8);
        const y = u32(bytes, pos + 12);
        const unit = bytes[pos + 16];
        if (unit === 1 && x > 0 && y > 0) return { kind, dpiX: round2(x * 0.0254), dpiY: round2(y * 0.0254), source: "pHYs" };
        return { kind, dpiX: null, dpiY: null, source: "pHYs" };
      }
      if (type === "IDAT" || type === "IEND") break;
      pos += 12 + len;
    }
    return { kind, dpiX: null, dpiY: null, source: "none" };
  }
  if (kind === "jpeg") {
    const segments = jpegSegments(bytes);
    for (const seg of segments) {
      if (seg.marker === 0xe1) {
        const tags = readExif(bytes, seg);
        if (tags?.xRes && tags.yRes) {
          const unit = tags.unit?.value ?? 2;
          const f = unit === 3 ? 2.54 : unit === 2 ? 1 : 0;
          if (f) return { kind, dpiX: round2(tags.xRes.value * f), dpiY: round2(tags.yRes.value * f), source: "EXIF" };
        }
      }
    }
    for (const seg of segments) {
      if (seg.marker === 0xe0 && ascii(bytes, seg.start + 4, 5) === "JFIF\0") {
        const units = bytes[seg.start + 11];
        const x = u16(bytes, seg.start + 12);
        const y = u16(bytes, seg.start + 14);
        if (units === 1 && x > 0 && y > 0) return { kind, dpiX: x, dpiY: y, source: "JFIF" };
        if (units === 2 && x > 0 && y > 0) return { kind, dpiX: round2(x * 2.54), dpiY: round2(y * 2.54), source: "JFIF" };
        return { kind, dpiX: null, dpiY: null, source: "JFIF" };
      }
    }
    return { kind, dpiX: null, dpiY: null, source: "none" };
  }
  return null;
}

export const MAX_DPI = 65535;

/** Returns a copy of the file whose stored DPI is `dpi`. Pixels and image data are untouched. */
export function setDensity(bytes: Uint8Array, dpi: number): Uint8Array {
  if (!Number.isInteger(dpi) || dpi < 1 || dpi > MAX_DPI) throw new Error(`DPI must be a whole number from 1 to ${MAX_DPI}.`);
  const kind = detectDensityKind(bytes);
  if (kind === "png") return setPngDensity(bytes, dpi);
  if (kind === "jpeg") return setJpegDensity(bytes, dpi);
  throw new Error("Only JPG and PNG files can carry a DPI value here.");
}

function setPngDensity(bytes: Uint8Array, dpi: number): Uint8Array {
  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  chunk.set([0, 0, 0, 9, 0x70, 0x48, 0x59, 0x73], 0);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(8, ppm);
  dv.setUint32(12, ppm);
  chunk[16] = 1;
  dv.setUint32(17, crc32(chunk.subarray(4, 17)));
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  let pos = 8;
  let inserted = false;
  while (pos + 12 <= bytes.length) {
    const len = u32(bytes, pos);
    const type = ascii(bytes, pos + 4, 4);
    const next = pos + 12 + len;
    if (next > bytes.length) throw new Error("This PNG file looks damaged.");
    if (type !== "pHYs") parts.push(bytes.subarray(pos, next));
    if (type === "IHDR" && !inserted) {
      parts.push(chunk);
      inserted = true;
    }
    pos = next;
  }
  if (!inserted) throw new Error("This PNG file looks damaged.");
  return concat(parts);
}

function setJpegDensity(bytes: Uint8Array, dpi: number): Uint8Array {
  const out = bytes.slice();
  const segments = jpegSegments(out);
  let jfif = false;
  for (const seg of segments) {
    if (seg.marker === 0xe0 && ascii(out, seg.start + 4, 5) === "JFIF\0") {
      out[seg.start + 11] = 1;
      out[seg.start + 12] = dpi >> 8;
      out[seg.start + 13] = dpi & 255;
      out[seg.start + 14] = dpi >> 8;
      out[seg.start + 15] = dpi & 255;
      jfif = true;
    } else if (seg.marker === 0xe1) {
      const tags = readExif(out, seg);
      if (tags) {
        const little = tags.little;
        const w32 = (o: number, v: number) => {
          if (little) [out[o], out[o + 1], out[o + 2], out[o + 3]] = [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
          else [out[o], out[o + 1], out[o + 2], out[o + 3]] = [(v >>> 24) & 255, (v >> 16) & 255, (v >> 8) & 255, v & 255];
        };
        for (const res of [tags.xRes, tags.yRes]) {
          if (res) {
            w32(res.valueOffset, dpi);
            w32(res.valueOffset + 4, 1);
          }
        }
        if (tags.unit) {
          const o = tags.unit.valueOffset;
          if (little) [out[o], out[o + 1]] = [2, 0];
          else [out[o], out[o + 1]] = [0, 2];
        }
      }
    }
  }
  if (jfif) return out;
  const app0 = new Uint8Array([0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 1, dpi >> 8, dpi & 255, dpi >> 8, dpi & 255, 0, 0]);
  return concat([out.subarray(0, 2), app0, out.subarray(2)]);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Makes a JPEG or PNG at least `target` bytes by adding invisible padding (JPEG comment segments or a PNG text chunk). Pixels are not changed. */
export function padToSize(bytes: Uint8Array, target: number): Uint8Array {
  const kind = detectDensityKind(bytes);
  if (!kind) throw new Error("Only JPG and PNG files can be padded.");
  if (bytes.length >= target) return bytes.slice();
  let need = target - bytes.length;
  const parts: Uint8Array[] = [];
  if (kind === "jpeg") {
    // Each COM segment: FF FE, 2-byte length (counts itself and the data), then data. Total = 4 + data, data up to 65533.
    while (need > 0) {
      let total = Math.min(need, 65537);
      if (need > 65537 && need - 65537 < 4) total = 65533;
      if (total < 4) total = 4;
      const seg = new Uint8Array(total);
      seg[0] = 0xff;
      seg[1] = 0xfe;
      seg[2] = (total - 2) >> 8;
      seg[3] = (total - 2) & 255;
      seg.fill(0x20, 4);
      parts.push(seg);
      need -= total;
    }
    return concat([bytes.subarray(0, 2), ...parts, bytes.subarray(2)]);
  }
  // PNG: one tEXt chunk before IEND. Total = 12 + keyword(7) + NUL + padding.
  const total = Math.max(need, 21);
  const data = total - 12;
  const chunk = new Uint8Array(total);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, data);
  chunk.set([0x74, 0x45, 0x58, 0x74], 4);
  chunk.set([...("Comment").split("").map((c) => c.charCodeAt(0)), 0], 8);
  chunk.fill(0x20, 16, 8 + data);
  dv.setUint32(8 + data, crc32(chunk.subarray(4, 8 + data)));
  const iend = bytes.length - 12;
  if (ascii(bytes, iend + 4, 4) !== "IEND") throw new Error("This PNG file looks damaged.");
  return concat([bytes.subarray(0, iend), chunk, bytes.subarray(iend)]);
}
