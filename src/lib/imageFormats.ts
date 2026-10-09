/* Signature sniffing and browser-side decoding/encoding for the Format Conversions tools. */

export type ImageKind = "jpeg" | "png" | "webp" | "avif" | "heic" | "gif" | "bmp" | "unknown";
export type OutputKind = "jpeg" | "png" | "webp";

export const KIND_LABEL: Record<ImageKind, string> = {
  jpeg: "JPG/JPEG",
  png: "PNG",
  webp: "WebP",
  avif: "AVIF",
  heic: "HEIC/HEIF",
  gif: "GIF",
  bmp: "BMP",
  unknown: "an unrecognised format",
};

export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_PIXELS = 100_000_000;

const ascii = (bytes: Uint8Array, from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));

export async function sniffKind(file: Blob): Promise<ImageKind> {
  const b = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length >= 8 && b[0] === 0x89 && ascii(b, 1, 4) === "PNG") return "png";
  if (b.length >= 12 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") return "webp";
  if (b.length >= 6 && ascii(b, 0, 4) === "GIF8") return "gif";
  if (b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d) return "bmp";
  if (b.length >= 16 && ascii(b, 4, 8) === "ftyp") {
    const brands: string[] = [ascii(b, 8, 12)];
    for (let i = 16; i + 4 <= Math.min(b.length, 64); i += 4) brands.push(ascii(b, i, i + 4));
    if (brands.some((x) => x === "avif" || x === "avis")) return "avif";
    if (brands.some((x) => ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(x))) return "heic";
  }
  return "unknown";
}

export function isJfif(bytes: Uint8Array): boolean {
  return bytes.length > 10 && ascii(bytes, 6, 10) === "JFIF";
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export const baseName = (name: string) => name.replace(/\.[^.]+$/, "") || "image";

const BROWSER_HINT: Partial<Record<ImageKind, string>> = {
  avif: "AVIF decoding needs Chrome 85+, Edge 121+, Firefox 93+ or Safari 16.4+.",
  webp: "WebP decoding needs a current browser (Chrome, Edge, Firefox, or Safari 14+).",
};

/** Decodes a supported image into an ImageBitmap, or throws an error that says what actually went wrong. */
export async function decodeImage(file: File, kind: ImageKind): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    if (kind !== "heic") {
      throw new Error(
        `${file.name} could not be decoded by this browser. It may be corrupt or use an unsupported variant. ${BROWSER_HINT[kind] ?? ""}`.trim(),
      );
    }
  }
  // HEIC: Safari decodes it natively (handled above); other browsers use a lazily loaded WebAssembly decoder.
  try {
    const { default: heic2any } = await import("heic2any");
    const out = await heic2any({ blob: file, toType: "image/png" });
    const blob = Array.isArray(out) ? out[0] : out;
    return await createImageBitmap(blob);
  } catch {
    throw new Error(
      `${file.name} could not be decoded as HEIC. The file may be corrupt, protected, or use a HEIF variant that the decoder does not support.`,
    );
  }
}

export interface Encoded {
  blob: Blob;
  width: number;
  height: number;
}

const MIME: Record<OutputKind, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Draws the bitmap to a canvas and encodes it. JPEG output is flattened onto white; PNG/WebP keep transparency. */
export async function encodeBitmap(bitmap: ImageBitmap, kind: OutputKind, quality = 0.92): Promise<Encoded> {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create a drawing surface.");
  if (kind === "jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(bitmap, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, MIME[kind], quality));
  canvas.width = canvas.height = 0;
  if (!blob) throw new Error("Your browser could not encode the image.");
  if (blob.type !== MIME[kind]) {
    throw new Error(`Your browser cannot encode ${kind.toUpperCase()} files (it produced ${blob.type || "an unknown type"} instead).`);
  }
  return { blob, width: bitmap.width, height: bitmap.height };
}

/** Confirms the encoded file has the right signature and decodes back to the expected size. */
export async function verifyEncoded(encoded: Encoded, kind: OutputKind): Promise<void> {
  const actual = await sniffKind(encoded.blob);
  if (actual !== kind) throw new Error(`The output failed its check (expected ${kind}, got ${actual}).`);
  const back = await createImageBitmap(encoded.blob);
  const ok = back.width === encoded.width && back.height === encoded.height;
  back.close();
  if (!ok) throw new Error("The output failed its size check, so it was not offered for download.");
}
