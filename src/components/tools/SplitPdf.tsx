import { useEffect, useMemo, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import {
  baseName,
  combineGroups,
  formatPageRanges,
  inspectSourcePdf,
  outputFileName,
  parsePageRanges,
  singlePageGroups,
  splitPdf,
} from "../../lib/pdfSplit";
import type { PageGroup, RangeError } from "../../lib/pdfSplit";
import { buildZip } from "../../lib/zip";
import { DropArea, ResultPanel, triggerDownload, uniqueName } from "./shared";

const LOCALE = "en";
const WORDS = { one: "page", many: "pages" };
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_PAGES = 1000;
const MAX_OUTPUT_FILES = 200;
const MAX_OUTPUT_BYTES = 500 * 1024 * 1024;
const MAX_CHIP_PAGES = 120;

type Mode = "ranges" | "single" | "all";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "ranges", label: "One PDF for each range", hint: "Each comma-separated part (for example “1-3, 5, 8-10”) is saved as its own PDF." },
  { id: "single", label: "One PDF with the selected pages", hint: "Puts all the pages you choose into a single new PDF." },
  { id: "all", label: "Every page as a separate PDF", hint: `Makes one PDF per page (up to ${MAX_OUTPUT_FILES} pages) and offers them in a ZIP too.` },
];

interface Selected {
  file: File;
  pages: number;
}

interface Output {
  name: string;
  pages: number;
  blob: Blob;
  url: string;
}

const count = (n: number, _word = "") => `${n} ${n === 1 ? "page" : "pages"}`;

function rangeMessage(error: RangeError): string {
  switch (error.code) {
    case "empty":
      return "Type the pages you want to take, for example “1-3, 5, 8-10”.";
    case "syntax":
      return `“${error.token}” is not valid. Use numbers separated by commas and a hyphen for ranges, for example “1-3, 5, 8-10”.`;
    case "zero":
      return `“${error.token}”: the first page of a document is page 1.`;
    case "reversed":
      return `“${error.token}”: the range is backwards. Write the smaller page first, for example “${error.token.split(/\s*[-–—]\s*/).reverse().join("-")}”.`;
    case "outOfRange":
      return `“${error.token}” is beyond the end of the document, which has only ${count(error.total)}.`;
    case "duplicate":
      return `Page ${error.token} appears more than once. Each page can be listed only once.`;
  }
}

export default function SplitPdf() {
  const fmt = (bytes: number) => formatBytes(bytes, LOCALE);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [mode, setMode] = useState<Mode>("ranges");
  const [text, setText] = useState("");
  const [keepOrder, setKeepOrder] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [zipBusy, setZipBusy] = useState(false);
  const outputsRef = useRef<Output[]>([]);
  const runningRef = useRef(false);

  const revokeOutputs = () => {
    outputsRef.current.forEach((output) => URL.revokeObjectURL(output.url));
    outputsRef.current = [];
  };
  useEffect(() => revokeOutputs, []);

  const clearResult = () => {
    revokeOutputs();
    setOutputs([]);
  };

  const parsed = useMemo(
    () => (selected && mode !== "all" ? parsePageRanges(text, selected.pages, keepOrder) : null),
    [selected, mode, text, keepOrder],
  );
  const rangeError = parsed && !parsed.ok ? parsed.error : null;
  const chosenPages = useMemo(() => {
    const pages = new Set<number>();
    if (parsed?.ok) parsed.groups.forEach((group) => group.pages.forEach((page) => pages.add(page)));
    return pages;
  }, [parsed]);

  const pickFile = async (files: File[]) => {
    const file = files[0];
    if (!file || busy) return;
    clearResult();
    setErrors([]);
    setStatus("");
    setAttempted(false);
    setBusy(true);
    setProgress(`Reading ${file.name}…`);
    try {
      let problem = "";
      let pages = 0;
      if (file.size === 0) problem = `${file.name}: the file is empty.`;
      else if (file.size > MAX_FILE_BYTES) problem = `${file.name}: it is ${fmt(file.size)}, over the ${fmt(MAX_FILE_BYTES)} limit.`;
      else {
        const info = await inspectSourcePdf(new Uint8Array(await file.arrayBuffer()));
        if (!info.ok) {
          problem =
            info.reason === "encrypted"
              ? `${file.name}: this PDF is password protected. Remove the protection and try again.`
              : info.reason === "invalid"
                ? `${file.name}: this file is not a PDF.`
                : `${file.name}: this PDF could not be read. It may be damaged.`;
        } else if (info.pages === 0) problem = `${file.name}: this PDF has no pages.`;
        else if (info.pages > MAX_PAGES) problem = `${file.name}: it has ${info.pages} pages, over the ${MAX_PAGES} limit.`;
        else pages = info.pages;
      }
      if (problem) {
        setErrors([problem]);
        return;
      }
      setSelected({ file, pages });
      setText("");
      setStatus(`${file.name} loaded: ${count(pages)}.`);
    } catch {
      setErrors([`${file.name}: the file could not be read.`]);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const reset = () => {
    clearResult();
    setSelected(null);
    setText("");
    setErrors([]);
    setAttempted(false);
    setStatus("File removed. Choose another PDF to start.");
  };

  const togglePage = (page: number) => {
    if (busy) return;
    clearResult();
    setErrors([]);
    const next = new Set(chosenPages);
    if (next.has(page)) next.delete(page);
    else next.add(page);
    setText(formatPageRanges(next));
  };

  const run = async () => {
    if (runningRef.current || !selected) return;
    setAttempted(true);
    let groups: PageGroup[];
    if (mode === "all") {
      if (selected.pages > MAX_OUTPUT_FILES) {
        return setErrors([`To split every page, the PDF can have at most ${MAX_OUTPUT_FILES} pages; this one has ${selected.pages}. Choose a page range instead.`]);
      }
      groups = singlePageGroups(selected.pages);
    } else {
      const result = parsePageRanges(text, selected.pages, keepOrder);
      if (!result.ok) return setErrors([rangeMessage(result.error)]);
      groups = mode === "single" ? [combineGroups(result.groups)] : result.groups;
      if (groups.length > MAX_OUTPUT_FILES) return setErrors([`This would create ${groups.length} files; the maximum is ${MAX_OUTPUT_FILES}.`]);
    }
    runningRef.current = true;
    setErrors([]);
    clearResult();
    setStatus("");
    setBusy(true);
    try {
      const source = new Uint8Array(await selected.file.arrayBuffer());
      const parts = await splitPdf(source, groups, {
        maxOutputBytes: MAX_OUTPUT_BYTES,
        producer: "Paul Digital - Split PDF",
        onProgress: (done, total) => setProgress(done < total ? `Creating file ${done + 1} of ${total}…` : "Finishing…"),
      });
      const base = baseName(selected.file.name, "document");
      const taken = new Set<string>();
      const made: Output[] = parts.map((part) => {
        const blob = new Blob([part.bytes as BlobPart], { type: "application/pdf" });
        return {
          name: uniqueName(outputFileName(base, part.group, WORDS), taken),
          pages: part.group.pages.length,
          blob,
          url: URL.createObjectURL(blob),
        };
      });
      outputsRef.current = made;
      setOutputs(made);
      setStatus(`Done: ${made.length} ${made.length === 1 ? "file" : "files"} created.`);
    } catch (error) {
      setErrors([
        error instanceof Error && error.message === "output-too-large"
          ? `The result would be over ${fmt(MAX_OUTPUT_BYTES)} and could use up your device's memory. Try choosing fewer pages.`
          : "The PDF could not be split. Make sure the file is not damaged, or try with fewer pages.",
      ]);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const downloadZip = async () => {
    setZipBusy(true);
    try {
      const entries = await Promise.all(outputs.map(async (o) => ({ name: o.name, data: new Uint8Array(await o.blob.arrayBuffer()) })));
      const url = URL.createObjectURL(buildZip(entries));
      triggerDownload(url, `${baseName(selected?.file.name ?? "", "document")}_pages.zip`);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setZipBusy(false);
    }
  };

  const modeHint = MODES.find((item) => item.id === mode)?.hint;
  const showError = attempted && rangeError ? rangeMessage(rangeError) : null;
  const totalOut = outputs.reduce((sum, output) => sum + output.blob.size, 0);

  return (
    <div className="ic" lang="en">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Drag and drop your PDF file here"
        emptySub={`Select one PDF to split. Up to ${fmt(MAX_FILE_BYTES)} and ${MAX_PAGES} pages.`}
        filledSub={selected ? `${count(selected.pages)} · ${fmt(selected.file.size)} · you can choose another file` : ""}
        buttonLabel="Select PDF file"
        moreLabel="Change file"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Drop area for a PDF file"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Your file is processed on your device and is not uploaded to any server. The original file is not changed.</p>

      {selected && (
        <form
          className="ic-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <p className="sp-total">
            This document has <strong>{count(selected.pages)}</strong>.
          </p>
          <fieldset className="sp-modes" disabled={busy}>
            <legend>How to split</legend>
            {MODES.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="sp-mode"
                  checked={mode === item.id}
                  onChange={() => {
                    clearResult();
                    setMode(item.id);
                  }}
                />{" "}
                {item.label}
              </label>
            ))}
          </fieldset>

          {mode !== "all" && (
            <>
              <div className="ic-field">
                <label htmlFor="sp-ranges">Page ranges</label>
                <input
                  id="sp-ranges"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="1-3, 5, 8-10"
                  value={text}
                  disabled={busy}
                  aria-invalid={showError ? true : undefined}
                  aria-describedby="sp-ranges-hint"
                  onChange={(event) => {
                    clearResult();
                    setErrors([]);
                    setText(event.target.value);
                  }}
                />
              </div>
              <p className="ic-hint" id="sp-ranges-hint">
                Separate with commas and use a hyphen for ranges. Numbering starts at 1 (the first page); valid pages: 1 to {selected.pages}.
              </p>
              {selected.pages <= MAX_CHIP_PAGES && (
                <div className="sp-chips" role="group" aria-label="Choose pages">
                  {Array.from({ length: selected.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className="sp-chip"
                      aria-pressed={chosenPages.has(page)}
                      aria-label={`Page ${page}`}
                      disabled={busy}
                      onClick={() => togglePage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
              <div className="ic-field">
                <label htmlFor="sp-order">Page order</label>
                <select
                  id="sp-order"
                  value={keepOrder ? "given" : "document"}
                  disabled={busy}
                  onChange={(event) => {
                    clearResult();
                    setKeepOrder(event.target.value === "given");
                  }}
                >
                  <option value="given">Follow the order I typed</option>
                  <option value="document">Sort by the original document</option>
                </select>
              </div>
            </>
          )}
          <button type="submit" className="button button-primary ic-submit" disabled={busy}>
            {busy ? "Splitting..." : "Split PDF"}
          </button>
        </form>
      )}
      {selected && <p className="ic-hint">{modeHint}</p>}

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Splitting the PDF..." : status}
      </div>
      {busy && progress ? (
        <p className="ic-hint ic-progress" aria-hidden="true">
          {progress}
        </p>
      ) : null}
      {(errors.length > 0 || showError) && (
        <div className="ic-error" role="alert">
          {showError && !errors.length ? <p style={{ margin: 0 }}>{showError}</p> : null}
          {errors.map((message, index) => (
            <p key={index} style={{ margin: 0 }}>
              {message}
            </p>
          ))}
        </div>
      )}

      {outputs.length > 0 && selected && (
        <ResultPanel
          ariaLabel="Result"
          tone="success"
          title={outputs.length === 1 ? "Your PDF is ready" : "Your PDF has been split"}
          details={[
            { label: "Files", value: String(outputs.length) },
            { label: "Pages taken", value: String(outputs.reduce((sum, output) => sum + output.pages, 0)) },
            { label: "Total size", value: fmt(totalOut) },
            { label: "Original document", value: count(selected.pages) },
          ]}
          primary={
            outputs.length === 1 ? (
              <a className="button button-download" href={outputs[0].url} download={outputs[0].name}>
                Download PDF
              </a>
            ) : (
              <button type="button" className="button button-download" onClick={() => void downloadZip()} disabled={zipBusy}>
                {zipBusy ? "Preparing ZIP…" : `Download all as ZIP (${outputs.length} files)`}
              </button>
            )
          }
          resetLabel="Split another PDF"
          onReset={reset}
        >
          {outputs.length > 1 && (
            <ul className="sp-files" aria-label="Files created">
              {outputs.map((output) => (
                <li key={output.name}>
                  <span>
                    {output.name} <small>{count(output.pages)} · {fmt(output.blob.size)}</small>
                  </span>
                  <a href={output.url} download={output.name} aria-label={`Download ${output.name}`}>
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </ResultPanel>
      )}
    </div>
  );
}
