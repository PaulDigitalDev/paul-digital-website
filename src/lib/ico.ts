/* ICO container with PNG-compressed images (supported by Windows Vista+, macOS and every current browser). */

export interface IconImage {
  size: number;
  png: Uint8Array;
}

export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function isPng(bytes: Uint8Array): boolean {
  return PNG_SIGNATURE.every((value, index) => bytes[index] === value);
}

export function buildIco(images: IconImage[]): Blob {
  if (images.length === 0 || images.length > 255) throw new Error("An icon needs between 1 and 255 images.");
  const sorted = [...images].sort((a, b) => a.size - b.size);
  const headerSize = 6 + 16 * sorted.length;
  const header = new DataView(new ArrayBuffer(headerSize));
  header.setUint16(0, 0, true); // reserved
  header.setUint16(2, 1, true); // type: icon
  header.setUint16(4, sorted.length, true);
  let offset = headerSize;
  sorted.forEach((image, index) => {
    if (image.size < 1 || image.size > 256) throw new Error("ICO images must be between 1 and 256 pixels.");
    if (!isPng(image.png)) throw new Error("ICO image data must be a valid PNG.");
    const at = 6 + index * 16;
    header.setUint8(at, image.size === 256 ? 0 : image.size);
    header.setUint8(at + 1, image.size === 256 ? 0 : image.size);
    header.setUint8(at + 2, 0); // palette colours
    header.setUint8(at + 3, 0);
    header.setUint16(at + 4, 1, true); // colour planes
    header.setUint16(at + 6, 32, true); // bits per pixel
    header.setUint32(at + 8, image.png.length, true);
    header.setUint32(at + 12, offset, true);
    offset += image.png.length;
  });
  return new Blob([new Uint8Array(header.buffer), ...sorted.map((image) => image.png as BlobPart)], {
    type: "image/x-icon",
  });
}

/** Reads an ICO back and returns the declared image sizes, or null when it is malformed. */
export function inspectIco(bytes: Uint8Array): number[] | null {
  if (bytes.length < 22) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint16(0, true) !== 0 || view.getUint16(2, true) !== 1) return null;
  const count = view.getUint16(4, true);
  if (count === 0 || bytes.length < 6 + 16 * count) return null;
  const sizes: number[] = [];
  for (let i = 0; i < count; i++) {
    const at = 6 + i * 16;
    const length = view.getUint32(at + 8, true);
    const start = view.getUint32(at + 12, true);
    if (start + length > bytes.length || !isPng(bytes.subarray(start, start + 8))) return null;
    sizes.push(bytes[at] || 256);
  }
  return sizes;
}
