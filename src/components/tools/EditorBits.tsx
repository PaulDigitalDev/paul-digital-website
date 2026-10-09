import { useEffect, useRef } from "react";
import { FORMAT_LABEL } from "../../lib/imageEdit";
import type { OutputKind } from "../../lib/imageFormats";

/* Small pieces shared by the resize / crop / passport tools. */

export function FormatFields(props: {
  idPrefix: string;
  encoders: OutputKind[];
  format: OutputKind;
  quality: number;
  disabled: boolean;
  onFormat: (format: OutputKind) => void;
  onQuality: (quality: number) => void;
  hideQuality?: boolean;
}) {
  const lossy = props.format !== "png";
  return (
    <>
      <div className="ic-field ic-field-unit">
        <label htmlFor={`${props.idPrefix}-format`}>Format</label>
        <select id={`${props.idPrefix}-format`} value={props.format} disabled={props.disabled} onChange={(e) => props.onFormat(e.target.value as OutputKind)}>
          {props.encoders.map((kind) => (
            <option key={kind} value={kind}>
              {FORMAT_LABEL[kind]}
            </option>
          ))}
        </select>
      </div>
      {lossy && !props.hideQuality && (
        <div className="ic-field st-slider">
          <label htmlFor={`${props.idPrefix}-quality`}>Quality: {Math.round(props.quality * 100)}%</label>
          <input id={`${props.idPrefix}-quality`} type="range" min={30} max={100} step={1} value={Math.round(props.quality * 100)} disabled={props.disabled} onChange={(e) => props.onQuality(Number(e.target.value) / 100)} />
        </div>
      )}
    </>
  );
}

/** Which formats the browser could really encode is only known after the page loads, so say so when one is missing. */
export function EncoderNote({ encoders }: { encoders: OutputKind[] }) {
  const missing = (["jpeg", "png", "webp"] as OutputKind[]).filter((k) => !encoders.includes(k));
  if (!missing.length) return null;
  return <p className="ic-hint">This browser cannot save {missing.map((k) => FORMAT_LABEL[k]).join(" or ")} files, so that option is not offered.</p>;
}

/** Draws a bitmap or canvas into a small preview canvas. */
export function Thumb({ source, label, max = 320 }: { source: CanvasImageSource & { width: number; height: number }; label: string; max?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const k = Math.min(1, max / Math.max(source.width, source.height));
    canvas.width = Math.max(1, Math.round(source.width * k));
    canvas.height = Math.max(1, Math.round(source.height * k));
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    }
  }, [source, max]);
  return <canvas ref={ref} className="ed-thumb" role="img" aria-label={label} />;
}
