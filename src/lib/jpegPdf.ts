/**
 * Minimal, dependency-free PDF writer for JPEG images.
 *
 * JPEG data is embedded unchanged (DCTDecode), so a PDF built from untouched
 * JPEGs is only a few hundred bytes larger than the images themselves.
 */

export interface JpegInfo {
  width: number;
  height: number;
  components: 1 | 3;
  /** EXIF orientation (1 when absent). Values above 1 are not applied by PDF viewers. */
  orientation: number;
  /** True when the data can be embedded as-is (8-bit baseline/progressive, grey or RGB). */
  embeddable: boolean;
}

export interface PdfImage {
  bytes: Uint8Array;
  width: number;
  height: number;
  components: 1 | 3;
}

export type PageSizeChoice = "a4" | "letter" | "image";

const POINTS: Record<"a4" | "letter", [number, number]> = { a4: [595.28, 841.89], letter: [612, 792] };
const MARGIN = 18;
const MATCH_IMAGE_LONG_SIDE = 842;

export function isJpegSignature(bytes: Uint8Array): boolean {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

/** Reads dimensions, colour layout and EXIF orientation from JPEG bytes. Returns null if not parseable. */
export function parseJpeg(data: Uint8Array): JpegInfo | null {
  if (!isJpegSignature(data)) return null;
  let orientation = 1;
  let offset = 2;
  while (offset + 4 <= data.length) {
    if (data[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = data[offset + 1];
    if (marker === 0xff) {
      offset++;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x00) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null; // reached image data without a frame header
    const length = (data[offset + 2] << 8) | data[offset + 3];
    if (length < 2) return null;
    const body = offset + 4;

    if (marker === 0xe1 && length >= 16) orientation = readExifOrientation(data, body, offset + 2 + length) ?? orientation;

    const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) {
      if (body + 6 > data.length) return null;
      const precision = data[body];
      const height = (data[body + 1] << 8) | data[body + 2];
      const width = (data[body + 3] << 8) | data[body + 4];
      const components = data[body + 5];
      if (!width || !height) return null;
      const baselineOrProgressive = marker === 0xc0 || marker === 0xc1 || marker === 0xc2;
      return {
        width,
        height,
        components: components === 1 ? 1 : 3,
        orientation,
        embeddable: baselineOrProgressive && precision === 8 && (components === 1 || components === 3),
      };
    }
    offset += 2 + length;
  }
  return null;
}

function readExifOrientation(data: Uint8Array, start: number, end: number): number | null {
  const header = String.fromCharCode(...data.subarray(start, start + 4));
  if (header !== "Exif") return null;
  const tiff = start + 6;
  if (tiff + 8 > end) return null;
  const little = data[tiff] === 0x49;
  const u16 = (at: number) => (little ? data[at] | (data[at + 1] << 8) : (data[at] << 8) | data[at + 1]);
  const u32 = (at: number) =>
    little
      ? (data[at] | (data[at + 1] << 8) | (data[at + 2] << 16) | (data[at + 3] << 24)) >>> 0
      : ((data[at] << 24) | (data[at + 1] << 16) | (data[at + 2] << 8) | data[at + 3]) >>> 0;
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > end) return null;
  const count = u16(ifd);
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > end) return null;
    if (u16(entry) === 0x0112) {
      const value = u16(entry + 8);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return null;
}

const encoder = new TextEncoder();
const ascii = (text: string) => encoder.encode(text);

function pageGeometry(image: PdfImage, choice: PageSizeChoice) {
  if (choice === "image") {
    const scale = Math.min(1, MATCH_IMAGE_LONG_SIDE / Math.max(image.width, image.height));
    const w = Math.max(1, image.width * scale);
    const h = Math.max(1, image.height * scale);
    return { pageW: w, pageH: h, x: 0, y: 0, w, h };
  }
  const [shortSide, longSide] = POINTS[choice];
  const landscape = image.width > image.height;
  const pageW = landscape ? longSide : shortSide;
  const pageH = landscape ? shortSide : longSide;
  const maxW = pageW - MARGIN * 2;
  const maxH = pageH - MARGIN * 2;
  const scale = Math.min(maxW / image.width, maxH / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  return { pageW, pageH, x: (pageW - w) / 2, y: (pageH - h) / 2, w, h };
}

const n = (value: number) => value.toFixed(2).replace(/\.?0+$/, "") || "0";

/** Builds a complete PDF (one image per page, in the given order). */
export function buildPdf(images: PdfImage[], choice: PageSizeChoice): Blob {
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let position = 0;
  const push = (chunk: Uint8Array) => {
    parts.push(chunk);
    position += chunk.length;
  };
  const startObject = (id: number) => {
    offsets[id] = position;
  };

  push(ascii("%PDF-1.4\n"));
  // Binary marker comment (bytes > 127) so transfer tools treat the file as binary.
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  const count = images.length;
  const pageId = (i: number) => 4 + i * 3;
  const kids = images.map((_, i) => `${pageId(i)} 0 R`).join(" ");

  startObject(1);
  push(ascii("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));
  startObject(2);
  push(ascii(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${count} >>\nendobj\n`));
  startObject(3);
  push(ascii("3 0 obj\n<< /Producer (Paul Digital JPG to PDF) >>\nendobj\n"));

  images.forEach((image, i) => {
    const g = pageGeometry(image, choice);
    const page = pageId(i);
    const content = ascii(`q ${n(g.w)} 0 0 ${n(g.h)} ${n(g.x)} ${n(g.y)} cm /Im0 Do Q`);

    startObject(page);
    push(
      ascii(
        `${page} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(g.pageW)} ${n(g.pageH)}] ` +
          `/Resources << /XObject << /Im0 ${page + 2} 0 R >> /ProcSet [/PDF /ImageB /ImageC] >> /Contents ${page + 1} 0 R >>\nendobj\n`,
      ),
    );
    startObject(page + 1);
    push(ascii(`${page + 1} 0 obj\n<< /Length ${content.length} >>\nstream\n`));
    push(content);
    push(ascii("\nendstream\nendobj\n"));
    startObject(page + 2);
    push(
      ascii(
        `${page + 2} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} ` +
          `/ColorSpace /${image.components === 1 ? "DeviceGray" : "DeviceRGB"} /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`,
      ),
    );
    push(image.bytes);
    push(ascii("\nendstream\nendobj\n"));
  });

  const total = 4 + count * 3; // object ids 0..total-1
  const xrefAt = position;
  let xref = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let id = 1; id < total; id++) xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  xref += `trailer\n<< /Size ${total} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  push(ascii(xref));

  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}
