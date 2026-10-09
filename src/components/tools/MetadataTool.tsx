import { useEffect, useRef, useState } from "react";
import { readMetadata, stripMetadata, verifyStripped } from "../../lib/metadata";
import type { MetaFormat, MetaReport } from "../../lib/metadata";
import { EXT, FORMAT_LABEL, context2d, encodeCanvas, fillWhiteForJpeg, newCanvas, release, verifyBlob, detectEncoders } from "../../lib/imageEdit";
import { KIND_LABEL, MAX_FILE_BYTES, MAX_PIXELS, baseName, decodeImage, formatBytes, sniffKind } from "../../lib/imageFormats";
import type { ImageKind, OutputKind } from "../../lib/imageFormats";
import { DropArea, ResultPanel, StatusArea } from "./shared";
import { IMAGE_ACCEPT } from "./useImageSource";

/* Metadata viewer and remover. Reads JPEG, PNG and WebP structure directly from the file bytes in the browser.
   Other formats are reported as unsupported rather than guessed at. */

type Method = "lossless" | "redraw";

interface Loaded {
  file: File;
  bytes: Uint8Array;
  kind: ImageKind;
  report: MetaReport | null;
}

interface Cleaned {
  url: string;
  blob: Blob;
  name: string;
  removed: string[];
  kept: string[];
  method: Method;
  format: string;
  verified: string;
  problems: string[];
  width?: number;
  height?: number;
}

export default function MetadataTool() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [keepIcc, setKeepIcc] = useState(true);
  const [method, setMethod] = useState<Method>("lossless");
  const [redrawFormat, setRedrawFormat] = useState<OutputKind>("jpeg");
  const [encoders, setEncoders] = useState<OutputKind[]>(["jpeg", "png"]);
  const [result, setResult] = useState<Cleaned | null>(null);
  const resultRef = useRef<Cleaned | null>(null);

  useEffect(() => {
    let live = true;
    void detectEncoders().then((found) => live && found.length && setEncoders(found));
    return () => {
      live = false;
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    };
  }, []);

  const clearResult = () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = null;
    setResult(null);
  };

  const onFiles = async (incoming: File[]) => {
    const file = incoming[0];
    if (!file || busy) return;
    clearResult();
    setStatus("");
    if (file.size === 0) return setErrors([`${file.name}: the file is empty.`]);
    if (file.size > MAX_FILE_BYTES) return setErrors([`${file.name}: ${formatBytes(file.size)} is over the ${formatBytes(MAX_FILE_BYTES)} limit.`]);
    setBusy(true);
    setProgress("Reading the file…");
    try {
      const kind = await sniffKind(file);
      if (kind === "unknown") throw new Error(`${file.name}: this is not a recognised image format. Use JPG, PNG, WebP, AVIF, HEIC, GIF or BMP.`);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const report = readMetadata(bytes);
      setLoaded({ file, bytes, kind, report });
      setMethod(report ? "lossless" : "redraw");
      setRedrawFormat(kind === "png" ? "png" : "jpeg");
      setErrors([]);
      setStatus(report ? `${file.name} read (${KIND_LABEL[kind]}).` : `${file.name} added (${KIND_LABEL[kind]}).`);
    } catch (caught) {
      setErrors([caught instanceof Error && caught.message ? caught.message : "The file could not be read."]);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const reset = () => {
    clearResult();
    setLoaded(null);
    setErrors([]);
    setStatus("");
  };

  const run = async () => {
    if (!loaded) return setErrors(["Add an image first."]);
    setErrors([]);
    clearResult();
    setBusy(true);
    try {
      const { file } = loaded;
      let cleaned: Cleaned;
      if (method === "lossless" && loaded.report) {
        setProgress("Removing metadata blocks…");
        const stripped = stripMetadata(loaded.bytes, { keepIcc });
        if (!stripped) throw new Error("This file's structure could not be processed, so nothing was changed.");
        setProgress("Checking the new file…");
        const problems = verifyStripped(stripped.bytes, { keepIcc });
        if (problems.length) throw new Error(`The cleaned file still contains ${problems.join(", ")}, so it was not offered for download.`);
        const format = loaded.kind as MetaFormat;
        const blob = new Blob([stripped.bytes as BlobPart], { type: file.type || `image/${format}` });
        const check = await createImageBitmap(blob).catch(() => null);
        if (!check) throw new Error("The cleaned file could not be opened again, so it was not offered for download.");
        const original = await createImageBitmap(file).catch(() => null);
        const same = original && original.width === check.width && original.height === check.height;
        const dims = { width: check.width, height: check.height };
        check.close();
        original?.close();
        if (!same) throw new Error("The cleaned file has a different size from the original, so it was not offered for download.");
        cleaned = {
          url: URL.createObjectURL(blob),
          blob,
          name: `${baseName(file.name)}-no-metadata.${EXT[format]}`,
          removed: stripped.removed,
          kept: stripped.kept,
          method,
          format: FORMAT_LABEL[format],
          verified: "Re-read the new file: no EXIF, XMP, IPTC or comment blocks found, and no EXIF/XMP/IPTC marker text found anywhere in its bytes. It opens at the original pixel size.",
          problems: [],
          ...dims,
        };
      } else {
        setProgress("Decoding the image…");
        const bitmap = await decodeImage(file, loaded.kind);
        if (bitmap.width * bitmap.height > MAX_PIXELS) {
          bitmap.close();
          throw new Error("This image is too large to redraw safely in a browser.");
        }
        let canvas: HTMLCanvasElement | null = null;
        try {
          setProgress("Redrawing the image…");
          canvas = newCanvas(bitmap.width, bitmap.height);
          const ctx = context2d(canvas);
          fillWhiteForJpeg(ctx, redrawFormat, canvas.width, canvas.height);
          ctx.drawImage(bitmap, 0, 0);
          const blob = await encodeCanvas(canvas, redrawFormat, 0.95);
          setProgress("Checking the new file…");
          await verifyBlob(blob, redrawFormat, bitmap.width, bitmap.height);
          const bytes = new Uint8Array(await blob.arrayBuffer());
          const problems = verifyStripped(bytes, { keepIcc: true });
          const after = readMetadata(bytes);
          if (problems.length) {
            throw new Error(`The redrawn file still contains ${problems.join(", ")}, so it was not offered for download.`);
          }
          cleaned = {
            url: URL.createObjectURL(blob),
            blob,
            name: `${baseName(file.name)}-no-metadata.${EXT[redrawFormat]}`,
            removed: ["All metadata of the original file (the image was redrawn from its pixels)"],
            kept: after?.icc === "present" ? ["An ICC colour profile added by this browser's encoder"] : [],
            method,
            format: FORMAT_LABEL[redrawFormat],
            verified: "Re-read the new file: no EXIF, XMP, IPTC or comment blocks found. It opens at the original pixel size.",
            problems: [],
            width: bitmap.width,
            height: bitmap.height,
          };
        } finally {
          bitmap.close();
          release(canvas);
        }
      }
      resultRef.current = cleaned;
      setResult(cleaned);
      setStatus("Done. Your cleaned file is ready.");
    } catch (caught) {
      setStatus("");
      setErrors([caught instanceof Error && caught.message ? caught.message : "The metadata could not be removed."]);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const report = loaded?.report ?? null;
  const groups = report ? [...new Set(report.fields.map((f) => f.group))] : [];
  const supportedKind = Boolean(report);
  const hasOrientation = report?.orientation != null && report.orientation !== 1;
  const nothingFound = report && report.exif === "absent" && report.xmp === "absent" && report.iptc === "absent" && report.comments === "absent" && report.icc === "absent";

  return (
    <div className="ic st">
      <DropArea
        title={loaded ? loaded.file.name : ""}
        hasFiles={Boolean(loaded)}
        emptyTitle="Drag and drop an image here"
        emptySub="JPG, PNG or WebP are read and cleaned directly · other image types can be redrawn · up to 50 MB"
        filledSub={loaded ? `${formatBytes(loaded.file.size)} · ${KIND_LABEL[loaded.kind]} · choose another to replace it` : ""}
        buttonLabel="Choose image"
        moreLabel="Choose a different image"
        accept={IMAGE_ACCEPT}
        multiple={false}
        busy={busy}
        ariaLabel="Image metadata drop area"
        onFiles={(files) => void onFiles(files)}
      />
      <p className="ic-hint">Your image stays on this device and is never uploaded. This tool does not ask for your location or any other permission.</p>

      {loaded && (
        <section className="md-report" aria-label="Metadata found in this file">
          <h2 className="md-heading">What this file contains</h2>
          {!supportedKind ? (
            <p className="st-warn" role="status">
              Reading metadata from {KIND_LABEL[loaded.kind]} files is <strong>not supported</strong> by this tool, so it cannot tell you whether this file has metadata. You can still redraw the picture into a new JPG, PNG or WebP below, which does not carry the original file's metadata across.
            </p>
          ) : (
            <>
              <ul className="md-presence">
                <PresenceItem label="EXIF (camera, date, GPS)" value={report!.exif} />
                <PresenceItem label="XMP" value={report!.xmp} />
                <PresenceItem label="IPTC / Photoshop" value={report!.iptc} />
                <PresenceItem label="Comments / text" value={report!.comments} />
                <PresenceItem label="ICC colour profile" value={report!.icc} />
              </ul>
              {report!.fields.length > 0 ? (
                <div className="md-groups">
                  {groups.map((group) => (
                    <div key={group} className="md-group">
                      <h3>{group}</h3>
                      <dl>
                        {report!.fields.filter((f) => f.group === group).map((f, i) => (
                          <div key={`${f.label}-${i}`}>
                            <dt>{f.label}</dt>
                            <dd>{f.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ic-hint">{nothingFound ? "No metadata blocks were found in this file." : "No readable fields were found, although some metadata blocks are present (see the notes)."}</p>
              )}
              {report!.notes.length > 0 && (
                <ul className="rp-notes">
                  {report!.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
              <p className="ic-hint">Only fields this viewer could decode are listed. Metadata it cannot decode is still counted above and is removed by the cleaner.</p>
            </>
          )}

          <form
            className="st-form md-clean"
            onSubmit={(event) => {
              event.preventDefault();
              void run();
            }}
          >
            <h2 className="md-heading">Remove metadata</h2>
            {supportedKind && (
              <div className="ic-controls">
                <div className="ic-field">
                  <label htmlFor="md-method">Method</label>
                  <select id="md-method" value={method} disabled={busy} onChange={(e) => { clearResult(); setMethod(e.target.value as Method); }}>
                    <option value="lossless">Remove metadata blocks, keep the picture data untouched (recommended)</option>
                    <option value="redraw">Redraw the picture into a new file</option>
                  </select>
                </div>
              </div>
            )}
            {method === "redraw" && (
              <div className="ic-controls">
                <div className="ic-field ic-field-unit">
                  <label htmlFor="md-format">Save as</label>
                  <select id="md-format" value={redrawFormat} disabled={busy} onChange={(e) => { clearResult(); setRedrawFormat(e.target.value as OutputKind); }}>
                    {encoders.map((k) => (
                      <option key={k} value={k}>
                        {FORMAT_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {method === "lossless" && supportedKind && (
              <div className="st-checks">
                <label>
                  <input type="checkbox" checked={keepIcc} disabled={busy} onChange={(e) => { clearResult(); setKeepIcc(e.target.checked); }} /> Keep the ICC colour profile (recommended; removing it can change how colours look)
                </label>
              </div>
            )}
            {method === "lossless" && hasOrientation && (
              <p className="st-warn" role="status">
                This file stores an orientation tag ({report!.orientation}). Removing it can make some viewers show the picture sideways. If that happens, use “Redraw the picture” instead, which applies the rotation.
              </p>
            )}
            <p className="st-note">
              {method === "lossless"
                ? "This copies the picture data byte for byte and drops the metadata blocks around it, so image quality does not change."
                : "Redrawing decodes the picture and saves it again, so JPG and WebP are recompressed once. Metadata does not carry over, and any EXIF rotation is applied to the pixels."}{" "}
              What can be removed depends on the file format and on what this tool can recognise. After cleaning, the new file is re-read and checked, and the result tells you exactly what was found.
            </p>
            <button type="submit" className="button button-primary ic-submit" disabled={busy}>
              {busy ? "Working…" : "Create file without metadata"}
            </button>
          </form>
        </section>
      )}

      <StatusArea busy={busy} progress={progress} status={status} errors={errors} />

      {result && loaded && (
        <ResultPanel
          ariaLabel="Result"
          tone="success"
          title="Your cleaned file is ready"
          summary="The original file was not changed."
          fileName={result.name}
          details={[
            { label: "Format", value: result.format },
            ...(result.width ? [{ label: "Dimensions", value: `${result.width} × ${result.height}`, hint: "pixels" }] : []),
            { label: "File size", value: formatBytes(result.blob.size), hint: `original ${formatBytes(loaded.file.size)}` },
            { label: "Removed", value: result.removed.length ? result.removed.join(", ") : "Nothing needed removing" },
            ...(result.kept.length ? [{ label: "Kept on purpose", value: result.kept.join(", ") }] : []),
          ]}
          notes={[
            result.verified,
            "This check covers the metadata types this tool recognises. It cannot prove that no other identifying information exists, for example faces, text or objects shown in the picture itself.",
          ]}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Download cleaned {result.format}
            </a>
          }
          resetLabel="Start again with another image"
          onReset={reset}
        />
      )}
    </div>
  );
}

function PresenceItem({ label, value }: { label: string; value: "present" | "absent" }) {
  return (
    <li className={`md-pill md-pill-${value}`}>
      <span>{label}</span>
      <strong>{value === "present" ? "Found" : "Not found"}</strong>
    </li>
  );
}
