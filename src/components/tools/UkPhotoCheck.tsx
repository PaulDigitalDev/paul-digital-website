import { useEffect, useRef, useState } from "react";
import { EXT, encodeCanvas, release, resampleTo, verifyBlob } from "../../lib/imageEdit";
import { baseName, formatBytes } from "../../lib/imageFormats";
import { UK_DIGITAL } from "../../data/photoPresets";
import { DropArea, ResultPanel, StatusArea } from "./shared";
import { IMAGE_ACCEPT, useImageSource } from "./useImageSource";

/* Checks a photo against the two measurable GOV.UK digital-photo rules (pixel size and file size) and, only when the
   file is over the maximum, makes a smaller copy. It never crops: GOV.UK says "Do not crop your photo - it will be done for you." */

interface Copy {
  url: string;
  blob: Blob;
  name: string;
  w: number;
  h: number;
}

const MAX_BYTES = UK_DIGITAL.maxMb * 1024 * 1024;
const MIN_BYTES = UK_DIGITAL.minKb * 1024;
const SCALES = [1, 0.85, 0.7, 0.55, 0.4, 0.3, 0.2];

export default function UkPhotoCheck() {
  const [copy, setCopy] = useState<Copy | null>(null);
  const copyRef = useRef<Copy | null>(null);
  const clearCopy = () => {
    if (copyRef.current) URL.revokeObjectURL(copyRef.current.url);
    copyRef.current = null;
    setCopy(null);
  };
  const src = useImageSource(clearCopy);
  const { file, dims, busy } = src;

  useEffect(() => () => void (copyRef.current && URL.revokeObjectURL(copyRef.current.url)), []);

  const sizeOk = dims ? dims.w >= UK_DIGITAL.minW && dims.h >= UK_DIGITAL.minH : false;
  const tooBig = file ? file.size > MAX_BYTES : false;
  const tooSmall = file ? file.size < MIN_BYTES : false;
  const passes = sizeOk && !tooBig && !tooSmall;

  const makeSmaller = async () => {
    const bitmap = src.bitmapRef.current;
    if (!file || !bitmap || !dims) return;
    src.setErrors([]);
    clearCopy();
    src.setBusy(true);
    let canvas: HTMLCanvasElement | null = null;
    try {
      for (const scale of SCALES) {
        const w = Math.round(dims.w * scale);
        const h = Math.round(dims.h * scale);
        if (w < UK_DIGITAL.minW || h < UK_DIGITAL.minH) break;
        src.setProgress(`Trying ${w} × ${h} px…`);
        release(canvas);
        canvas = resampleTo(bitmap, w, h, "jpeg");
        const blob = await encodeCanvas(canvas, "jpeg", 0.9);
        if (blob.size <= MAX_BYTES * 0.98) {
          await verifyBlob(blob, "jpeg", w, h);
          const out: Copy = { url: URL.createObjectURL(blob), blob, name: `${baseName(file.name)}-under-${UK_DIGITAL.maxMb}mb.${EXT.jpeg}`, w, h };
          copyRef.current = out;
          setCopy(out);
          src.setStatus("Done. A smaller copy is ready.");
          return;
        }
      }
      src.setErrors([`This photo could not be brought under ${UK_DIGITAL.maxMb} MB without dropping below ${UK_DIGITAL.minW} × ${UK_DIGITAL.minH} px, so no copy was made. Use a different photo.`]);
    } catch (caught) {
      src.setStatus("");
      src.setErrors([caught instanceof Error && caught.message ? caught.message : "The smaller copy could not be made."]);
    } finally {
      release(canvas);
      src.setBusy(false);
      src.setProgress("");
    }
  };

  const reset = () => {
    clearCopy();
    src.clear();
  };

  return (
    <div className="ic st">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Drag and drop your photo here"
        emptySub="JPG, PNG, WebP, AVIF, HEIC, GIF or BMP · one file · up to 50 MB"
        filledSub={file && dims ? `${formatBytes(file.size)} · ${dims.w}×${dims.h} · choose another to replace it` : ""}
        buttonLabel="Choose photo"
        moreLabel="Choose a different photo"
        accept={IMAGE_ACCEPT}
        multiple={false}
        busy={busy}
        ariaLabel="UK passport photo check drop area"
        onFiles={(files) => void src.load(files)}
      />
      <p className="ic-hint">Your photo stays on this device and is never uploaded. It is only measured, and never cropped.</p>

      {file && dims && (
        <ResultPanel
          ariaLabel="Check result"
          tone={passes ? "success" : "warning"}
          title={passes ? "Meets the two size rules this tool can check" : "Does not meet the GOV.UK size rules"}
          summary="This only measures pixel size and file size. It cannot check background, lighting, expression, how recent the photo is or whether it has been altered."
          details={[
            { label: "Pixel size", value: `${dims.w} × ${dims.h}`, hint: sizeOk ? `OK: at least ${UK_DIGITAL.minW} × ${UK_DIGITAL.minH}` : `Needs at least ${UK_DIGITAL.minW} × ${UK_DIGITAL.minH}` },
            { label: "File size", value: formatBytes(file.size), hint: tooBig ? `Over the ${UK_DIGITAL.maxMb} MB maximum` : tooSmall ? `Under the ${UK_DIGITAL.minKb} KB minimum` : `OK: ${UK_DIGITAL.minKb} KB to ${UK_DIGITAL.maxMb} MB` },
          ]}
          notes={[
            ...(!sizeOk ? ["The photo has too few pixels. Enlarging it would not add real detail, so this tool will not do that. Take or find a larger photo."] : []),
            ...(tooSmall ? ["The file is smaller than the minimum. Use the original, uncompressed photo from your camera or phone rather than a shared or compressed copy."] : []),
            ...(tooBig && sizeOk ? ["The file is over the maximum. You can make a smaller copy below; it is re-saved as a JPG without cropping."] : []),
          ]}
          primary={
            tooBig && sizeOk && !copy ? (
              <button type="button" className="button button-primary" disabled={busy} onClick={() => void makeSmaller()}>
                {busy ? "Working…" : `Make a copy under ${UK_DIGITAL.maxMb} MB`}
              </button>
            ) : undefined
          }
          resetLabel="Check another photo"
          onReset={reset}
        />
      )}

      <StatusArea busy={busy} progress={src.progress} status={src.status} errors={src.errors} />

      {copy && (
        <ResultPanel
          ariaLabel="Smaller copy"
          tone="success"
          title="Your smaller copy is ready"
          fileName={copy.name}
          details={[
            { label: "Pixel size", value: `${copy.w} × ${copy.h}`, hint: `Not cropped` },
            { label: "File size", value: formatBytes(copy.blob.size), hint: `Limit ${UK_DIGITAL.maxMb} MB` },
          ]}
          notes={["Re-saving a photo changes its pixels slightly. GOV.UK asks for a photo unaltered by computer software, so use the original if it is accepted as it is."]}
          primary={
            <a className="button button-download" href={copy.url} download={copy.name}>
              Download JPG
            </a>
          }
          resetLabel="Check another photo"
          onReset={reset}
        >
          <img className="ic-preview" src={copy.url} alt="Preview of the smaller copy" width={copy.w} height={copy.h} />
        </ResultPanel>
      )}
    </div>
  );
}
