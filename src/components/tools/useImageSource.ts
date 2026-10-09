import { useEffect, useRef, useState } from "react";
import { KIND_LABEL, MAX_FILE_BYTES, MAX_PIXELS, decodeImage, formatBytes, sniffKind } from "../../lib/imageFormats";
import type { ImageKind } from "../../lib/imageFormats";
import { detectEncoders } from "../../lib/imageEdit";
import type { OutputKind } from "../../lib/imageFormats";

export const IMAGE_ACCEPT = ".jpg,.jpeg,.jfif,.png,.webp,.avif,.heic,.heif,.gif,.bmp,image/*";

/** Loads one image file into an ImageBitmap with the same validation as the other image tools, and tracks which encoders this browser has. */
export function useImageSource(onNewImage?: () => void) {
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<ImageKind>("unknown");
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [encoders, setEncoders] = useState<OutputKind[]>(["jpeg", "png"]);
  const bitmapRef = useRef<ImageBitmap | null>(null);

  useEffect(() => {
    let live = true;
    void detectEncoders().then((found) => live && found.length && setEncoders(found));
    return () => {
      live = false;
      bitmapRef.current?.close();
    };
  }, []);

  const load = async (incoming: File[]) => {
    const next = incoming[0];
    if (!next || busy) return;
    setStatus("");
    if (next.size === 0) return setErrors([`${next.name}: the file is empty.`]);
    if (next.size > MAX_FILE_BYTES) return setErrors([`${next.name}: ${formatBytes(next.size)} is over the ${formatBytes(MAX_FILE_BYTES)} limit.`]);
    const sniffed = await sniffKind(next);
    if (sniffed === "unknown") return setErrors([`${next.name}: this is not a recognised image format. Use JPG, PNG, WebP, AVIF, HEIC, GIF or BMP.`]);
    setBusy(true);
    setProgress("Reading the image…");
    try {
      const bitmap = await decodeImage(next, sniffed);
      if (bitmap.width * bitmap.height > MAX_PIXELS) {
        const mp = Math.round((bitmap.width * bitmap.height) / 1_000_000);
        bitmap.close();
        throw new Error(`${next.name} is ${mp} megapixels, which is too large to process safely in a browser.`);
      }
      bitmapRef.current?.close();
      bitmapRef.current = bitmap;
      onNewImage?.();
      setKind(sniffed);
      setDims({ w: bitmap.width, h: bitmap.height });
      setFile(next);
      setErrors([]);
      setStatus(`${next.name} added (${KIND_LABEL[sniffed]}, ${bitmap.width}×${bitmap.height}).`);
    } catch (caught) {
      setErrors([caught instanceof Error && caught.message ? caught.message : "The image could not be read."]);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const clear = () => {
    bitmapRef.current?.close();
    bitmapRef.current = null;
    setFile(null);
    setDims(null);
    setKind("unknown");
    setErrors([]);
    setStatus("");
  };

  return { file, kind, dims, busy, setBusy, progress, setProgress, status, setStatus, errors, setErrors, encoders, bitmapRef, load, clear };
}
