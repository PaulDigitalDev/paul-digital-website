import { useEffect, useRef, useState } from "react";
import type { FormatTool } from "../../data/formatTools";
import { KIND_LABEL, MAX_FILE_BYTES, baseName, decodeImage, formatBytes, sniffKind } from "../../lib/imageFormats";
import { DropArea, ResultPanel, StatusArea } from "./shared";

/* Local OCR with Tesseract (WebAssembly). The engine, worker and English data are served from this site. */

const OCR_MAX_PIXELS = 25_000_000;
const ASSET_BASE = "/vendor/tesseract";

interface OcrResult {
  text: string;
  confidence: number;
  words: number;
}

interface WorkerLike {
  recognize: (image: Blob) => Promise<{ data: { text: string; confidence: number; words?: unknown[] } }>;
  terminate: () => Promise<unknown>;
}

export default function OcrTool({ tool }: { tool: FormatTool }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const workerRef = useRef<WorkerLike | null>(null);
  const cancelledRef = useRef(false);

  useEffect(
    () => () => {
      void workerRef.current?.terminate();
    },
    [],
  );
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const onFiles = async (incoming: File[]) => {
    const next = incoming[0];
    if (!next || busy) return;
    setResult(null);
    setText("");
    setStatus("");
    if (next.size === 0) return setErrors([`${next.name}: the file is empty.`]);
    if (next.size > MAX_FILE_BYTES) {
      return setErrors([`${next.name}: ${formatBytes(next.size)} is over the ${formatBytes(MAX_FILE_BYTES)} limit.`]);
    }
    const kind = await sniffKind(next);
    if (!tool.inputs.includes(kind)) {
      return setErrors([
        `${next.name}: this is ${kind === "unknown" ? "not a recognised image format" : `a ${KIND_LABEL[kind]} file`}. ${tool.h1} accepts ${tool.inputLabel} only.`,
      ]);
    }
    setErrors([]);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setStatus(`${next.name} added.`);
  };

  const run = async () => {
    if (!file) return setErrors(["Add an image first."]);
    setErrors([]);
    setResult(null);
    setText("");
    setCopied(false);
    setBusy(true);
    cancelledRef.current = false;
    let bitmap: ImageBitmap | null = null;
    try {
      setProgress("Reading the image…");
      bitmap = await decodeImage(file, await sniffKind(file));
      if (bitmap.width * bitmap.height > OCR_MAX_PIXELS) {
        throw new Error(
          `${file.name} is ${bitmap.width}×${bitmap.height}px, which is too large for in-browser OCR (limit about 25 megapixels). Resize or crop it first.`,
        );
      }
      // Recognise on a white-backed copy so text on transparent PNGs is readable.
      const whiteBacked = await whiteBackground(bitmap);
      if (!whiteBacked) throw new Error("Your browser could not prepare the image for recognition.");

      setProgress("Loading the OCR engine (first run downloads about 8 MB, then it is cached)…");
      const { createWorker } = await import("tesseract.js");
      const base = `${location.origin}${ASSET_BASE}`;
      const worker = (await createWorker("eng", 1, {
        workerPath: `${base}/worker.min.js`,
        corePath: base,
        langPath: `${base}/lang`,
        logger: (message: { status: string; progress: number }) => {
          const percent = Math.round((message.progress ?? 0) * 100);
          if (message.status === "recognizing text") setProgress(`Recognising text… ${percent}%`);
          else if (message.status.startsWith("loading") || message.status.startsWith("initializ")) {
            setProgress(`Preparing the OCR engine (${message.status})…`);
          }
        },
      })) as unknown as WorkerLike;
      workerRef.current = worker;
      if (cancelledRef.current) return;

      const { data } = await worker.recognize(whiteBacked);
      await worker.terminate();
      workerRef.current = null;

      const recognised = data.text.replace(/\r\n/g, "\n").trim();
      if (!recognised) {
        setStatus("");
        setErrors([
          "No text was recognised in this image. OCR needs clear, printed English text. Try a sharper, higher-contrast or cropped image.",
        ]);
        return;
      }
      const words = recognised.split(/\s+/).filter(Boolean).length;
      setResult({ text: recognised, confidence: Math.round(data.confidence), words });
      setText(recognised);
      setStatus("Done. Check the text carefully before using it.");
    } catch (caught) {
      if (cancelledRef.current) {
        setStatus("Cancelled.");
      } else {
        setStatus("");
        setErrors([
          caught instanceof Error && caught.message
            ? caught.message
            : "Text recognition failed. Your browser may not support WebAssembly workers, or the OCR files could not be loaded.",
        ]);
      }
    } finally {
      bitmap?.close();
      void workerRef.current?.terminate();
      workerRef.current = null;
      setBusy(false);
      setProgress("");
    }
  };

  const reset = () => {
    setResult(null);
    setText("");
    setCopied(false);
    setFile(null);
    setPreview(null);
    setErrors([]);
    setStatus("");
  };

  const cancel = () => {
    cancelledRef.current = true;
    void workerRef.current?.terminate();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setErrors(["Copying was blocked by your browser. Select the text and copy it manually."]);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file ? baseName(file.name) : "text"}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  return (
    <div className="ic">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle={`Drag and drop a ${tool.inputLabel} image here`}
        emptySub={`Accepts ${tool.inputLabel} · one image · up to 50 MB · English text`}
        filledSub={file ? `${formatBytes(file.size)} · choose another to replace it` : ""}
        buttonLabel="Choose image"
        moreLabel="Choose a different image"
        accept={tool.accept}
        multiple={false}
        busy={busy}
        ariaLabel={`${tool.h1} drop area`}
        onFiles={(files) => void onFiles(files)}
      />
      <p className="ic-hint">Text is recognised on this device. Your image is never uploaded.</p>
      {preview && <img className="ic-preview" src={preview} alt="Selected image" />}

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <button type="submit" className="button button-primary ic-submit" disabled={!file || busy}>
          {busy ? "Working…" : tool.actionLabel}
        </button>
        {busy && (
          <button type="button" className="button" onClick={cancel}>
            Cancel
          </button>
        )}
      </form>
      <p className="ic-hint">
        English printed text only. Accuracy depends on image quality, and handwriting, tiny or stylised text and low contrast are often
        misread. Always proofread the result.
      </p>

      <StatusArea busy={busy} progress={progress} status={status} errors={errors} />

      {result && (
        <ResultPanel
          ariaLabel="Extracted text"
          tone={result.confidence >= 60 ? "success" : "warning"}
          title={result.confidence >= 60 ? "Text extracted" : "Text extracted with low confidence"}
          summary={
            result.confidence >= 60
              ? "Proofread the text before using it."
              : "Expect mistakes. A sharper, higher-contrast or cropped image usually helps."
          }
          details={[
            { label: "Words", value: String(result.words) },
            { label: "Average confidence", value: `${result.confidence}%` },
          ]}
          primary={
            <button type="button" className="button button-primary" onClick={() => void copy()}>
              {copied ? "Copied" : "Copy text"}
            </button>
          }
          secondary={
            <button type="button" className="button button-download" onClick={download}>
              Download .txt
            </button>
          }
          resetLabel="Extract from another image"
          onReset={reset}
        >
          <div className="fc-snippet">
            <label htmlFor="ocr-text" className="fc-label">
              Recognised text (you can edit it)
            </label>
            <textarea id="ocr-text" className="fc-text" rows={10} value={text} onChange={(event) => setText(event.target.value)} />
          </div>
        </ResultPanel>
      )}
    </div>
  );
}

async function whiteBackground(bitmap: ImageBitmap): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  canvas.width = canvas.height = 0;
  return blob;
}
