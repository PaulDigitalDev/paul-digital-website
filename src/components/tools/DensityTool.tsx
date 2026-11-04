import { useEffect, useMemo, useRef, useState } from "react";
import { baseName, formatBytes } from "../../lib/imageFormats";
import { MAX_DPI, detectDensityKind, padToSize, readDensity, setDensity } from "../../lib/imageDensity";
import type { Density } from "../../lib/imageDensity";
import { ActionButton, DoneView, DropOverlay, ErrorBox, PresetChips, SidePanel, UploadHero, Workspace, useFilePicker, useWindowDrop } from "./premium";

/* DPI checker, DPI converter and file-size increaser. All three work on the file's own bytes in the browser:
   the pixels are never decoded or re-encoded, so the picture itself is not changed. */

export type DensityMode = "check" | "convert" | "increase";

const MAX_BYTES = 100 * 1024 * 1024;
const PRESETS = [72, 96, 150, 200, 300, 600];
const KB = 1024;

interface Loaded {
  file: File;
  bytes: Uint8Array;
  density: Density;
  w: number;
  h: number;
}

interface Result {
  url: string;
  name: string;
  size: number;
  before: number;
  notes: string[];
  stats: { label: string; value: string }[];
  summary: string;
}

const ACTION = { check: "Choose another image", convert: "Set DPI", increase: "Increase file size" } as const;
const TITLE = { check: "", convert: "Your DPI has been changed!", increase: "Your file size has been increased!" } as const;
const PANEL = { check: "Image details", convert: "DPI options", increase: "Size options" } as const;

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));

async function dimensions(file: File): Promise<{ w: number; h: number }> {
  const bitmap = await createImageBitmap(file);
  const out = { w: bitmap.width, h: bitmap.height };
  bitmap.close();
  return out;
}

export default function DensityTool({ mode }: { mode: DensityMode }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dpi, setDpi] = useState("300");
  const [targetKb, setTargetKb] = useState("100");
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<Result | null>(null);

  const clearResult = () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = null;
    setResult(null);
  };
  useEffect(
    () => () => {
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    },
    [],
  );

  const load = async (files: File[]) => {
    const file = files[0];
    if (!file || busy) return;
    clearResult();
    setErrors([]);
    if (file.size === 0) return setErrors([`${file.name}: the file is empty.`]);
    if (file.size > MAX_BYTES) return setErrors([`${file.name}: ${formatBytes(file.size)} is over the ${formatBytes(MAX_BYTES)} limit.`]);
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const kind = detectDensityKind(bytes);
      const density = readDensity(bytes);
      if (!kind || !density) {
        throw new Error(`${file.name}: this tool reads and writes DPI inside JPG and PNG files only. Convert the picture to JPG or PNG first with the Image Converter.`);
      }
      const size = await dimensions(file);
      setLoaded({ file, bytes, density, w: size.w, h: size.h });
    } catch (caught) {
      setLoaded(null);
      setErrors([caught instanceof Error && caught.message ? caught.message : "The image could not be read. It may be damaged."]);
    } finally {
      setBusy(false);
    }
  };

  const previewUrl = useMemo(() => (loaded ? URL.createObjectURL(loaded.file) : ""), [loaded]);
  useEffect(() => () => (previewUrl ? URL.revokeObjectURL(previewUrl) : undefined), [previewUrl]);

  const picker = useFilePicker(".jpg,.jpeg,.png,image/jpeg,image/png", false, (files) => void load(files));
  const dropActive = useWindowDrop(!busy && !result, (files) => void load(files));

  const reset = () => {
    clearResult();
    setLoaded(null);
    setErrors([]);
  };

  const dpiValue = Number(dpi);
  const dpiError = mode === "convert" && (!Number.isInteger(dpiValue) || dpiValue < 1 || dpiValue > MAX_DPI) ? `Enter a whole-number DPI from 1 to ${MAX_DPI}.` : "";
  const kbValue = Number(targetKb);
  const kbError =
    mode === "increase" && (!Number.isFinite(kbValue) || kbValue < 1 || kbValue * KB > MAX_BYTES) ? "Enter a target of at least 1 KB and at most 100 MB (102,400 KB)." : "";

  const run = async () => {
    if (!loaded || busy || dpiError || kbError) return;
    clearResult();
    setErrors([]);
    setBusy(true);
    try {
      const { file, bytes, w, h } = loaded;
      const notes: string[] = [];
      const stats: { label: string; value: string }[] = [];
      let out: Uint8Array;
      let name: string;
      let summary: string;
      const ext = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? (loaded.density.kind === "png" ? ".png" : ".jpg");
      if (mode === "convert") {
        out = setDensity(bytes, dpiValue);
        name = `${baseName(file.name)}-${dpiValue}dpi${ext}`;
        const check = readDensity(out);
        if (!check || check.dpiX === null || Math.abs(check.dpiX - dpiValue) > 1) throw new Error("The new DPI could not be verified in the saved file, so it was not offered for download.");
        stats.push({ label: "New DPI", value: String(dpiValue) }, { label: "Pixels", value: `${w}×${h}` }, { label: "Print size", value: `${fmt((w / dpiValue) * 2.54)}×${fmt((h / dpiValue) * 2.54)} cm` });
        summary = `The file now says ${dpiValue} DPI. Pixels are unchanged at ${w}×${h}.`;
        notes.push("DPI only describes how large the picture prints. The pixels were not changed, so the sharpness and quality are exactly the same.");
      } else {
        const target = Math.round(kbValue * KB);
        out = padToSize(bytes, target);
        name = `${baseName(file.name)}-${fmt(kbValue)}kb${ext}`;
        const verify = await createImageBitmap(new Blob([out as BlobPart]));
        const same = verify.width === w && verify.height === h;
        verify.close();
        if (!same) throw new Error("The padded file failed its check, so it was not offered for download.");
        stats.push({ label: "File size", value: formatBytes(out.length) }, { label: "Pixels", value: `${w}×${h}` });
        summary = `The file is now ${formatBytes(out.length)} (${out.length.toLocaleString("en-US")} bytes). The picture looks exactly the same.`;
        if (bytes.length >= target) notes.push(`The file was already ${formatBytes(bytes.length)}, which is at or above your target, so it was kept the same size. This tool only makes files bigger.`);
        else if (out.length !== target) notes.push(`The file is ${out.length - target} bytes over your target because padding comes in blocks of at least 4 bytes.`);
        notes.push("The extra size is invisible padding stored inside the file. It does not add detail or quality, and a site that re-compresses the upload will remove it. 1 KB = 1,024 bytes.");
      }
      const url = URL.createObjectURL(new Blob([out as BlobPart], { type: loaded.density.kind === "png" ? "image/png" : "image/jpeg" }));
      const next: Result = { url, name, size: out.length, before: bytes.length, notes, stats, summary };
      resultRef.current = next;
      setResult(next);
    } catch (caught) {
      setErrors([caught instanceof Error && caught.message ? caught.message : "The file could not be processed."]);
    } finally {
      setBusy(false);
    }
  };

  const stage = result ? "done" : loaded ? "work" : "upload";
  const d = loaded?.density;
  const hasDpi = d && d.dpiX !== null && d.dpiY !== null;

  return (
    <div className="ic pt" data-stage={stage}>
      {picker.input}
      <DropOverlay active={dropActive} label={loaded ? "Drop to replace the image" : "Drop your image here"} />

      {stage === "upload" && (
        <UploadHero buttonLabel="Select image" dropLabel="or drop an image anywhere on this page" sub="JPG or PNG · up to 100 MB" busy={busy} onOpen={picker.open}>
          <ErrorBox errors={errors} />
        </UploadHero>
      )}

      {stage === "work" && loaded && d && (
        <Workspace
          main={
            <div className="pt-files">
              <figure className="pt-file">
                <div className="pt-thumb">
                  <img src={previewUrl} alt={`Preview of ${loaded.file.name}`} />
                </div>
                <figcaption>
                  <span className="pt-file-name">{loaded.file.name}</span>
                  <span className="pt-file-meta">
                    {d.kind === "png" ? "PNG" : "JPG"} · {formatBytes(loaded.file.size)} · {loaded.w}×{loaded.h}px
                  </span>
                </figcaption>
                <button type="button" className="pt-file-remove" onClick={reset} disabled={busy} aria-label={`Remove ${loaded.file.name}`}>
                  ×
                </button>
              </figure>
              <button type="button" className="pt-secondary" onClick={picker.open} disabled={busy}>
                Choose a different image
              </button>
            </div>
          }
          side={
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (mode === "check") picker.open();
                else void run();
              }}
            >
              <SidePanel title={PANEL[mode]} action={<ActionButton label={ACTION[mode]} busy={busy} disabled={!loaded || !!dpiError || !!kbError} />}>
                {mode === "check" && (
                  <dl className="pt-stats">
                    <div>
                      <dt>DPI stored in file</dt>
                      <dd>{hasDpi ? (d.dpiX === d.dpiY ? fmt(d.dpiX!) : `${fmt(d.dpiX!)} × ${fmt(d.dpiY!)}`) : "Not set"}</dd>
                    </div>
                    <div>
                      <dt>Pixels</dt>
                      <dd>
                        {loaded.w}×{loaded.h}
                      </dd>
                    </div>
                    {hasDpi && (
                      <div>
                        <dt>Print size at that DPI</dt>
                        <dd>
                          {fmt((loaded.w / d.dpiX!) * 2.54)}×{fmt((loaded.h / d.dpiY!) * 2.54)} cm ({fmt(loaded.w / d.dpiX!)}×{fmt(loaded.h / d.dpiY!)} in)
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt>Found in</dt>
                      <dd>{d.source === "none" ? "No density information" : d.source}</dd>
                    </div>
                  </dl>
                )}
                {mode === "check" && !hasDpi && <p className="pt-help">This file does not say what DPI it is. Programs then assume 72 or 96. Use the Convert DPI tool to set a value such as 300.</p>}
                {mode === "check" && hasDpi && <p className="pt-help">DPI is only a label for printing size. It does not change how many pixels the picture has.</p>}

                {mode === "convert" && (
                  <>
                    <PresetChips label="Common DPI values" disabled={busy} options={PRESETS.map((p) => ({ label: String(p), active: dpiValue === p, onSelect: () => setDpi(String(p)) }))} />
                    <div className="ic-field">
                      <label htmlFor="dn-dpi">DPI</label>
                      <input id="dn-dpi" type="number" inputMode="numeric" min={1} max={MAX_DPI} step={1} value={dpi} disabled={busy} onChange={(e) => setDpi(e.target.value)} />
                    </div>
                    <p className="pt-help">
                      Currently {hasDpi ? fmt(d.dpiX!) : "not set"}. At {Number.isInteger(dpiValue) && dpiValue > 0 ? dpiValue : "this"} DPI the picture prints{" "}
                      {Number.isInteger(dpiValue) && dpiValue > 0 ? `${fmt((loaded.w / dpiValue) * 2.54)}×${fmt((loaded.h / dpiValue) * 2.54)} cm` : "at a size shown here"}. Pixels stay the same.
                    </p>
                  </>
                )}

                {mode === "increase" && (
                  <>
                    <PresetChips label="Common sizes" disabled={busy} options={[50, 100, 200, 500, 1024].map((p) => ({ label: p === 1024 ? "1 MB" : `${p} KB`, active: kbValue === p, onSelect: () => setTargetKb(String(p)) }))} />
                    <div className="ic-field">
                      <label htmlFor="dn-kb">Minimum file size (KB)</label>
                      <input id="dn-kb" type="number" inputMode="decimal" min={1} step="any" value={targetKb} disabled={busy} onChange={(e) => setTargetKb(e.target.value)} />
                    </div>
                    <p className="pt-help">
                      Current file: {formatBytes(loaded.file.size)}. Invisible padding is added until the file reaches your size. Pixels and quality are not changed.
                    </p>
                  </>
                )}
                <ErrorBox errors={[...(dpiError ? [dpiError] : []), ...(kbError ? [kbError] : []), ...errors]} />
              </SidePanel>
            </form>
          }
        />
      )}

      {stage === "done" && result && loaded && (
        <DoneView
          ok
          title={TITLE[mode]}
          summary={result.summary}
          downloadHref={result.url}
          downloadName={result.name}
          downloadLabel="Download image"
          stats={result.stats}
          notes={result.notes}
          onBack={clearResult}
          backLabel="Back to the options"
          onReset={reset}
          resetLabel="Process another image"
        />
      )}
    </div>
  );
}
