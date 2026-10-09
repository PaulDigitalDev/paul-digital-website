import { useEffect, useMemo, useRef, useState } from "react";
import { EXT, FORMAT_LABEL, checkOutputSize, encodeCanvas, release, resampleTo, verifyBlob } from "../../lib/imageEdit";
import { baseName, formatBytes } from "../../lib/imageFormats";
import type { OutputKind } from "../../lib/imageFormats";
import { EncoderNote, FormatFields, Thumb } from "./EditorBits";
import { DropArea, ResultPanel, StatusArea } from "./shared";
import { IMAGE_ACCEPT, useImageSource } from "./useImageSource";

type Mode = "pixels" | "percent" | "cm";

interface Exported {
  url: string;
  blob: Blob;
  name: string;
  w: number;
  h: number;
  format: OutputKind;
  notes: string[];
}

const CM_PER_INCH = 2.54;
const fmt = (n: number, digits = 2) => String(Number(n.toFixed(digits)));

export default function ImageResizer() {
  const [mode, setMode] = useState<Mode>("pixels");
  const [lock, setLock] = useState(true);
  const [wStr, setWStr] = useState("");
  const [hStr, setHStr] = useState("");
  const [pct, setPct] = useState("50");
  const [cmW, setCmW] = useState("");
  const [cmH, setCmH] = useState("");
  const [dpi, setDpi] = useState("300");
  const [format, setFormat] = useState<OutputKind>("jpeg");
  const [quality, setQuality] = useState(0.92);
  const [result, setResult] = useState<Exported | null>(null);
  const resultRef = useRef<Exported | null>(null);

  const clearResult = () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = null;
    setResult(null);
  };
  const src = useImageSource(clearResult);
  const { file, dims, busy, encoders } = src;

  useEffect(() => () => void (resultRef.current && URL.revokeObjectURL(resultRef.current.url)), []);

  // A fresh image starts at its own size, with a format matching the original where the browser can save it.
  useEffect(() => {
    if (!dims) return;
    setWStr(String(dims.w));
    setHStr(String(dims.h));
    setPct("50");
    const d = Number(dpi) > 0 ? Number(dpi) : 300;
    setCmW(fmt((dims.w / d) * CM_PER_INCH));
    setCmH(fmt((dims.h / d) * CM_PER_INCH));
    setLock(true);
    const own = src.kind === "png" ? "png" : src.kind === "webp" ? "webp" : "jpeg";
    setFormat(encoders.includes(own) ? own : encoders[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims]);

  useEffect(() => {
    if (!encoders.includes(format)) setFormat(encoders[0]);
  }, [encoders, format]);

  const ratio = dims ? dims.h / dims.w : 1;
  const positive = (v: string) => v.trim() !== "" && Number.isFinite(Number(v)) && Number(v) > 0;

  const changeW = (v: string) => {
    setWStr(v);
    if (lock && positive(v)) setHStr(String(Math.max(1, Math.round(Number(v) * ratio))));
  };
  const changeH = (v: string) => {
    setHStr(v);
    if (lock && positive(v)) setWStr(String(Math.max(1, Math.round(Number(v) / ratio))));
  };
  const changeCmW = (v: string) => {
    setCmW(v);
    if (lock && positive(v)) setCmH(fmt(Number(v) * ratio));
  };
  const changeCmH = (v: string) => {
    setCmH(v);
    if (lock && positive(v)) setCmW(fmt(Number(v) / ratio));
  };
  const toggleLock = (on: boolean) => {
    setLock(on);
    if (!on) return;
    if (positive(wStr)) setHStr(String(Math.max(1, Math.round(Number(wStr) * ratio))));
    if (positive(cmW)) setCmH(fmt(Number(cmW) * ratio));
  };

  const target = useMemo(() => {
    if (!dims) return { w: 0, h: 0, error: "" };
    const dpiN = Number(dpi);
    let w = NaN;
    let h = NaN;
    if (mode === "pixels") {
      if (!positive(wStr) || !positive(hStr)) return { w: 0, h: 0, error: "Enter a width and height greater than zero." };
      w = Number(wStr);
      h = Number(hStr);
      if (!Number.isInteger(w) || !Number.isInteger(h)) return { w: 0, h: 0, error: "Width and height must be whole numbers of pixels." };
    } else if (mode === "percent") {
      if (!positive(pct)) return { w: 0, h: 0, error: "Enter a percentage greater than zero." };
      w = Math.round((dims.w * Number(pct)) / 100);
      h = Math.round((dims.h * Number(pct)) / 100);
    } else {
      if (!positive(cmW) || !positive(cmH)) return { w: 0, h: 0, error: "Enter a width and height in centimetres greater than zero." };
      if (!(dpiN >= 1 && dpiN <= 2400)) return { w: 0, h: 0, error: "Enter a DPI between 1 and 2400." };
      w = Math.round((Number(cmW) / CM_PER_INCH) * dpiN);
      h = Math.round((Number(cmH) / CM_PER_INCH) * dpiN);
    }
    if (w < 1 || h < 1) return { w: 0, h: 0, error: "That would make the image smaller than 1 pixel on one side. Use a larger size." };
    return { w, h, error: checkOutputSize(w, h) };
  }, [dims, mode, wStr, hStr, pct, cmW, cmH, dpi]);

  const dpiN = Number(dpi);
  const printCm = target.w && dpiN >= 1 ? { w: (target.w / dpiN) * CM_PER_INCH, h: (target.h / dpiN) * CM_PER_INCH } : null;
  const aspectChanged = dims && target.w > 0 && Math.abs(target.w / target.h - dims.w / dims.h) / (dims.w / dims.h) > 0.01;
  const enlarged = dims && target.w > 0 && (target.w > dims.w || target.h > dims.h);

  const reset = () => {
    clearResult();
    src.clear();
  };

  const run = async () => {
    const bitmap = src.bitmapRef.current;
    if (!file || !bitmap) return src.setErrors(["Add an image first."]);
    if (target.error) return src.setErrors([target.error]);
    src.setErrors([]);
    clearResult();
    src.setBusy(true);
    let canvas: HTMLCanvasElement | null = null;
    try {
      src.setProgress("Resizing…");
      canvas = resampleTo(bitmap, target.w, target.h, format);
      src.setProgress("Encoding…");
      const blob = await encodeCanvas(canvas, format, quality);
      src.setProgress("Checking the file…");
      await verifyBlob(blob, format, target.w, target.h);
      const notes: string[] = [];
      if (format === "jpeg" && src.kind !== "jpeg") notes.push("JPG cannot store transparency, so any transparent areas were filled with white.");
      if (enlarged) notes.push("The image was enlarged. Resizing cannot add detail, so it may look soft or blocky.");
      if (aspectChanged) notes.push("The proportions were changed, so the picture is stretched or squashed compared with the original.");
      if (blob.size > file.size && format !== "png") notes.push("The new file is larger than the original because of the size or quality chosen.");
      const name = `${baseName(file.name)}-${target.w}x${target.h}.${EXT[format]}`;
      const out: Exported = { url: URL.createObjectURL(blob), blob, name, w: target.w, h: target.h, format, notes };
      resultRef.current = out;
      setResult(out);
      src.setStatus("Done. Your resized image is ready.");
    } catch (caught) {
      src.setStatus("");
      src.setErrors([caught instanceof Error && caught.message ? caught.message : "The image could not be resized."]);
    } finally {
      release(canvas);
      src.setBusy(false);
      src.setProgress("");
    }
  };

  const modeBtn = (value: Mode, label: string) => (
    <button type="button" className={`ed-tab${mode === value ? " is-active" : ""}`} aria-pressed={mode === value} disabled={busy} onClick={() => { clearResult(); setMode(value); }}>
      {label}
    </button>
  );

  return (
    <div className="ic st">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Drag and drop an image here"
        emptySub="JPG, PNG, WebP, AVIF, HEIC, GIF or BMP · one file · up to 50 MB"
        filledSub={file && dims ? `${formatBytes(file.size)} · ${dims.w}×${dims.h} · choose another to replace it` : ""}
        buttonLabel="Choose image"
        moreLabel="Choose a different image"
        accept={IMAGE_ACCEPT}
        multiple={false}
        busy={busy}
        ariaLabel="Image resizer drop area"
        onFiles={(files) => void src.load(files)}
      />
      <p className="ic-hint">Your image stays on this device and is never uploaded.</p>

      {file && dims && (
        <form
          className="st-form"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <div className="ed-tabs" role="group" aria-label="Resize by">
            {modeBtn("pixels", "Pixels")}
            {modeBtn("percent", "Percentage")}
            {modeBtn("cm", "Centimetres + DPI")}
          </div>

          <div className="ic-controls">
            {mode === "pixels" && (
              <>
                <div className="ic-field ic-field-unit">
                  <label htmlFor="rz-w">Width (px)</label>
                  <input id="rz-w" type="number" inputMode="numeric" min={1} value={wStr} disabled={busy} onChange={(e) => changeW(e.target.value)} />
                </div>
                <div className="ic-field ic-field-unit">
                  <label htmlFor="rz-h">Height (px)</label>
                  <input id="rz-h" type="number" inputMode="numeric" min={1} value={hStr} disabled={busy} onChange={(e) => changeH(e.target.value)} />
                </div>
              </>
            )}
            {mode === "percent" && (
              <div className="ic-field ic-field-unit">
                <label htmlFor="rz-pct">Scale (%)</label>
                <input id="rz-pct" type="number" inputMode="decimal" min={1} step="any" value={pct} disabled={busy} onChange={(e) => setPct(e.target.value)} />
              </div>
            )}
            {mode === "cm" && (
              <>
                <div className="ic-field ic-field-unit">
                  <label htmlFor="rz-cmw">Width (cm)</label>
                  <input id="rz-cmw" type="number" inputMode="decimal" min={0.1} step="any" value={cmW} disabled={busy} onChange={(e) => changeCmW(e.target.value)} />
                </div>
                <div className="ic-field ic-field-unit">
                  <label htmlFor="rz-cmh">Height (cm)</label>
                  <input id="rz-cmh" type="number" inputMode="decimal" min={0.1} step="any" value={cmH} disabled={busy} onChange={(e) => changeCmH(e.target.value)} />
                </div>
              </>
            )}
            <div className="ic-field ic-field-unit">
              <label htmlFor="rz-dpi">DPI</label>
              <input id="rz-dpi" type="number" inputMode="numeric" min={1} max={2400} value={dpi} disabled={busy} onChange={(e) => setDpi(e.target.value)} />
            </div>
            <FormatFields idPrefix="rz" encoders={encoders} format={format} quality={quality} disabled={busy} onFormat={(f) => { clearResult(); setFormat(f); }} onQuality={setQuality} />
          </div>

          {mode !== "percent" && (
            <div className="st-checks">
              <label>
                <input type="checkbox" checked={lock} disabled={busy} onChange={(e) => toggleLock(e.target.checked)} /> Lock aspect ratio (keeps the original proportions)
              </label>
            </div>
          )}
          <EncoderNote encoders={encoders} />

          <p className="st-note">
            <strong>About DPI:</strong> a digital image is a grid of pixels. Centimetres only mean something once you choose how many pixels print per inch, so the pixel count here is worked out as cm ÷ 2.54 × DPI. The saved file does not carry a DPI value, so the printed size also depends on the printer or software you use.
          </p>

          {target.error ? (
            <div className="ic-error" role="alert">
              <p style={{ margin: 0 }}>{target.error}</p>
            </div>
          ) : (
            <div className="ed-compare" aria-live="polite">
              <figure className="ed-compare-item">
                <Thumb source={src.bitmapRef.current!} label="Original image" />
                <figcaption>
                  <strong>Original</strong>
                  <span>{dims.w} × {dims.h} px</span>
                  {printCm && <span>≈ {fmt((dims.w / dpiN) * CM_PER_INCH, 1)} × {fmt((dims.h / dpiN) * CM_PER_INCH, 1)} cm at {dpiN} DPI</span>}
                </figcaption>
              </figure>
              <div className="ed-compare-arrow" aria-hidden="true">→</div>
              <div className="ed-compare-item">
                <div className="ed-box" style={{ aspectRatio: `${target.w} / ${target.h}`, width: `${Math.max(14, Math.min(100, (target.w / dims.w) * 100))}%`, maxWidth: "320px" }} aria-hidden="true" />
                <div className="ed-compare-text">
                  <strong>New size</strong>
                  <span>{target.w} × {target.h} px</span>
                  {printCm && <span>≈ {fmt(printCm.w, 1)} × {fmt(printCm.h, 1)} cm at {dpiN} DPI</span>}
                  <span>{fmt(((target.w * target.h) / (dims.w * dims.h)) * 100, 1)}% of the original pixels</span>
                </div>
              </div>
            </div>
          )}
          {!target.error && enlarged && <p className="st-warn" role="status">This is larger than the original, so the image will be enlarged and may look soft.</p>}
          {!target.error && aspectChanged && <p className="st-warn" role="status">These proportions differ from the original, so the picture will look stretched or squashed.</p>}

          <button type="submit" className="button button-primary ic-submit" disabled={busy || Boolean(target.error)}>
            {busy ? "Working…" : "Resize image"}
          </button>
        </form>
      )}

      <StatusArea busy={busy} progress={src.progress} status={src.status} errors={src.errors} />

      {result && (
        <ResultPanel
          ariaLabel="Result"
          tone="success"
          title="Your resized image is ready"
          fileName={result.name}
          details={[
            { label: "Dimensions", value: `${result.w} × ${result.h}`, hint: "pixels" },
            { label: "File size", value: formatBytes(result.blob.size), hint: dims ? `original ${formatBytes(file!.size)}` : undefined },
            { label: "Format", value: FORMAT_LABEL[result.format] },
          ]}
          notes={result.notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Download {FORMAT_LABEL[result.format]}
            </a>
          }
          secondary={
            <button type="button" className="button" onClick={clearResult}>
              Change size
            </button>
          }
          resetLabel="Start again with another image"
          onReset={reset}
        >
          <img className="ic-preview" src={result.url} alt="Preview of the resized image" width={result.w} height={result.h} />
        </ResultPanel>
      )}
    </div>
  );
}
