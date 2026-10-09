import { useEffect, useRef, useState } from "react";
import type { FormatTool } from "../../data/formatTools";
import { buildDocx } from "../../lib/docx";
import type { DocxImage, DocxPage } from "../../lib/docx";
import {
  KIND_LABEL,
  MAX_FILE_BYTES,
  MAX_PIXELS,
  baseName,
  decodeImage,
  encodeBitmap,
  formatBytes,
  sniffKind,
} from "../../lib/imageFormats";
import type { ImageKind } from "../../lib/imageFormats";
import { parseJpeg } from "../../lib/jpegPdf";
import { DropArea, ResultPanel, StatusArea } from "./shared";

const MAX_FILES = 50;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

interface Item {
  id: number;
  file: File;
  kind: ImageKind;
}

interface Result {
  url: string;
  name: string;
  size: number;
  pages: number;
  notes: string[];
}

export default function ImageToWord({ tool }: { tool: FormatTool }) {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState<DocxPage>("a4");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const idRef = useRef(0);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const clearResult = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setResult(null);
  };

  const reset = () => {
    clearResult();
    setItems([]);
    setErrors([]);
    setStatus("");
  };

  const addFiles = async (incoming: File[]) => {
    if (busy || incoming.length === 0) return;
    clearResult();
    setStatus("");
    const problems: string[] = [];
    const accepted: Item[] = [];
    let total = items.reduce((sum, item) => sum + item.file.size, 0);
    for (const file of incoming) {
      if (items.length + accepted.length >= MAX_FILES) {
        problems.push(`${file.name}: not added. A maximum of ${MAX_FILES} images is allowed.`);
        continue;
      }
      if (file.size === 0) {
        problems.push(`${file.name}: the file is empty.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        problems.push(`${file.name}: ${formatBytes(file.size)} is over the ${formatBytes(MAX_FILE_BYTES)} per-image limit.`);
        continue;
      }
      if (total + file.size > MAX_TOTAL_BYTES) {
        problems.push(`${file.name}: not added because the total would exceed ${formatBytes(MAX_TOTAL_BYTES)}.`);
        continue;
      }
      const kind = await sniffKind(file);
      if (!tool.inputs.includes(kind)) {
        problems.push(
          `${file.name}: this is ${kind === "unknown" ? "not a recognised image format" : `a ${KIND_LABEL[kind]} file`}. Accepted: ${tool.inputLabel}.`,
        );
        continue;
      }
      total += file.size;
      accepted.push({ id: ++idRef.current, file, kind });
    }
    setErrors(problems);
    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      setStatus(`${accepted.length} image${accepted.length === 1 ? "" : "s"} added.`);
    }
  };

  const move = (index: number, delta: number) => {
    if (busy) return;
    clearResult();
    setItems((current) => {
      const next = [...current];
      const to = index + delta;
      if (to < 0 || to >= next.length) return current;
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  };

  const remove = (id: number) => {
    if (busy) return;
    clearResult();
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const run = async () => {
    if (items.length === 0) return setErrors(["Add at least one image first."]);
    setErrors([]);
    clearResult();
    setBusy(true);
    const notes: string[] = [];
    let converted = 0;
    let rotated = 0;
    try {
      const images: DocxImage[] = [];
      for (let i = 0; i < items.length; i++) {
        const { file, kind } = items[i];
        setProgress(`Preparing image ${i + 1} of ${items.length}: ${file.name}…`);
        await new Promise((resolve) => setTimeout(resolve));
        const bytes = new Uint8Array(await file.arrayBuffer());
        const alt = baseName(file.name);

        if (kind === "jpeg") {
          const info = parseJpeg(bytes);
          if (!info) throw new Error(`${file.name} could not be read as a JPEG. It may be corrupt.`);
          if (info.width * info.height > MAX_PIXELS) throw new Error(`${file.name} is too large to process safely.`);
          if (info.embeddable && info.orientation === 1) {
            images.push({ bytes, ext: "jpeg", width: info.width, height: info.height, alt });
            continue;
          }
          rotated++;
        } else if (kind === "png") {
          // PNG header: width and height are big-endian 32-bit values at offset 16.
          const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
          const width = view.getUint32(16);
          const height = view.getUint32(20);
          if (width > 0 && height > 0 && width * height <= MAX_PIXELS) {
            images.push({ bytes, ext: "png", width, height, alt });
            continue;
          }
          throw new Error(`${file.name} has invalid or oversized dimensions.`);
        } else {
          converted++;
        }

        const bitmap = await decodeImage(file, kind);
        try {
          if (bitmap.width * bitmap.height > MAX_PIXELS) throw new Error(`${file.name} is too large to process safely.`);
          const encoded = await encodeBitmap(bitmap, "png");
          images.push({
            bytes: new Uint8Array(await encoded.blob.arrayBuffer()),
            ext: "png",
            width: encoded.width,
            height: encoded.height,
            alt,
          });
        } finally {
          bitmap.close();
        }
      }

      setProgress("Building the Word document…");
      const blob = buildDocx(images, page);
      const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
      if (head[0] !== 0x50 || head[1] !== 0x4b) throw new Error("The document failed its integrity check, so it was not offered for download.");

      if (converted > 0) notes.push(`${converted} image${converted === 1 ? " was" : "s were"} converted to PNG so Word can display ${converted === 1 ? "it" : "them"}.`);
      if (rotated > 0) notes.push(`${rotated} JPEG${rotated === 1 ? " was" : "s were"} re-saved upright because it used a rotation flag or colour mode Word does not apply.`);
      notes.push("The images are pictures inside the document. Their text is not editable. Use JPG to Text or PNG to Text to extract text.");

      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const name = items.length === 1 ? `${baseName(items[0].file.name)}.docx` : "images.docx";
      setResult({ url, name, size: blob.size, pages: items.length, notes });
      setStatus("Done. Your Word document is ready to download.");
    } catch (caught) {
      setStatus("");
      setErrors([caught instanceof Error && caught.message ? caught.message : "The document could not be created."]);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="ic">
      <DropArea
        title={`${items.length} image${items.length === 1 ? "" : "s"} selected`}
        hasFiles={items.length > 0}
        emptyTitle="Drag and drop images here"
        emptySub={`Accepts ${tool.inputLabel} · select several at once · up to 50 MB each`}
        filledSub={`${formatBytes(totalSize)} in total · add more any time`}
        buttonLabel="Choose images"
        moreLabel="Add more images"
        accept={tool.accept}
        multiple
        busy={busy}
        ariaLabel="Image to Word drop area"
        onFiles={(files) => void addFiles(files)}
      />
      <p className="ic-hint">Your images are placed into the document on this device and are never uploaded.</p>

      {items.length > 0 && (
        <ol className="jp-list" aria-label="Selected images in page order">
          {items.map((item, index) => (
            <li key={item.id} className="jp-item">
              <span className="jp-num" aria-hidden="true">
                {index + 1}
              </span>
              <span className="jp-name">
                {item.file.name}
                <small>
                  {KIND_LABEL[item.kind]} · {formatBytes(item.file.size)}
                </small>
              </span>
              <span className="jp-actions">
                <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={`Move ${item.file.name} up`}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={busy || index === items.length - 1}
                  aria-label={`Move ${item.file.name} down`}
                >
                  ↓
                </button>
                <button type="button" onClick={() => remove(item.id)} disabled={busy} aria-label={`Remove ${item.file.name}`}>
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="iw-page">Page size</label>
          <select id="iw-page" value={page} onChange={(event) => setPage(event.target.value as DocxPage)} disabled={busy}>
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
          </select>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={items.length === 0 || busy}>
          {busy ? "Working…" : tool.actionLabel}
        </button>
      </form>
      <p className="ic-hint">
        Each image goes on its own page, scaled down to fit the margins and never enlarged. This places images in the document; it does
        not extract editable text.
      </p>

      <StatusArea busy={busy} progress={progress} status={status} errors={errors} />

      {result && (
        <ResultPanel
          ariaLabel="Result"
          tone="success"
          title="Your Word document is ready"
          fileName={result.name}
          details={[
            { label: "Format", value: "Word (.docx)" },
            { label: "Size", value: formatBytes(result.size) },
            { label: "Pages", value: String(result.pages) },
          ]}
          notes={result.notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Download {result.name}
            </a>
          }
          resetLabel="Convert more images"
          onReset={reset}
        />
      )}
    </div>
  );
}
