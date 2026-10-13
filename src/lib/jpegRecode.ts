/** Browser JPEG re-encoder for the PDF compressor: decodes with the browser, scales, and re-encodes via canvas. */
import type { RecodeInput, RecodeOutput } from "./pdfCompress";

export async function recodeJpegInBrowser({ bytes, width, height, quality, maxDimension }: RecodeInput): Promise<RecodeOutput | null> {
  let bitmap: ImageBitmap | null = null;
  try {
    // "none" keeps the stored pixel values (PDF ignores EXIF rotation and applies its own colour space).
    bitmap = await createImageBitmap(new Blob([bytes as BlobPart], { type: "image/jpeg" }), {
      imageOrientation: "none",
      colorSpaceConversion: "none",
    });
    // If the decoded size disagrees with the PDF's declared size, leave the image alone.
    if (bitmap.width !== width || bitmap.height !== height) return null;

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    let blob: Blob | null;
    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, w, h);
      blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, w, h);
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    }
    if (!blob || blob.type !== "image/jpeg") return null;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width: w, height: h };
  } catch {
    return null;
  } finally {
    bitmap?.close();
  }
}
