import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import { buildZip } from "../../lib/zip";

/* Pieces shared by the Format Conversions tools. Everything runs locally in the browser. */

export interface DropAreaProps {
  title: string;
  hasFiles: boolean;
  emptyTitle: string;
  emptySub: string;
  filledSub: string;
  buttonLabel: string;
  moreLabel: string;
  accept: string;
  multiple: boolean;
  busy: boolean;
  ariaLabel: string;
  onFiles: (files: File[]) => void;
}

export function DropArea(props: DropAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length) props.onFiles(files);
  };
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (props.busy) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length) props.onFiles(props.multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      className={`ic-drop${dragging ? " is-dragging" : ""}${props.hasFiles ? " has-file" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!props.busy) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      tabIndex={0}
      role="group"
      aria-label={props.ariaLabel}
    >
      <p className="ic-drop-title">{props.hasFiles ? props.title : props.emptyTitle}</p>
      <p className="ic-drop-sub">{props.hasFiles ? props.filledSub : props.emptySub}</p>
      <button type="button" className="button" onClick={() => inputRef.current?.click()} disabled={props.busy}>
        {props.hasFiles ? props.moreLabel : props.buttonLabel}
      </button>
      <input
        ref={inputRef}
        className="ic-file"
        type="file"
        accept={props.accept}
        multiple={props.multiple}
        onChange={onInputChange}
        aria-label={props.ariaLabel}
        tabIndex={-1}
      />
    </div>
  );
}

export function StatusArea({
  busy,
  progress,
  status,
  errors,
}: {
  busy: boolean;
  progress: string;
  status: string;
  errors: string[];
}): ReactNode {
  return (
    <>
      {/* The live region only changes between coarse states, so screen readers are not told about every internal attempt. */}
      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Working…" : status}
      </div>
      {busy && progress ? (
        <p className="ic-hint ic-progress" aria-hidden="true">
          {progress}
        </p>
      ) : null}
      {errors.length > 0 && (
        <div className="ic-error" role="alert">
          {errors.map((message) => (
            <p key={message} style={{ margin: 0 }}>
              {message}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

export interface ResultDetail {
  label: string;
  value: string;
  hint?: string;
}

export interface ResultPanelProps {
  /** "success" = output generated (and target met where one exists); "warning" = output generated but a requested limit was not met. */
  tone: "success" | "warning";
  title: string;
  summary?: string;
  /** Output file name; omit for tools whose output is not a file. */
  fileName?: string;
  details?: ResultDetail[];
  /** Optional preview / extra content shown between the details and the notes. */
  children?: ReactNode;
  notes?: string[];
  /** The one prominent action (download, copy…). */
  primary?: ReactNode;
  /** Quieter extra actions shown beside the primary one. */
  secondary?: ReactNode;
  resetLabel: string;
  onReset: () => void;
  ariaLabel: string;
}

function ResultIcon({ tone }: { tone: "success" | "warning" }) {
  return (
    <span className={`rp-icon rp-icon-${tone}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {tone === "success" ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 6v7M12 17.5v.01" />}
      </svg>
    </span>
  );
}

/** One consistent post-processing panel. Each tool supplies only the details it really produces. */
export function ResultPanel(props: ResultPanelProps) {
  const ref = useRef<HTMLElement>(null);
  const { tone, details = [], notes = [] } = props;

  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest" });
  }, []);

  const reset = () => {
    const root = ref.current?.closest(".ic");
    props.onReset();
    // Return keyboard focus to the start of the tool once the old result is gone.
    requestAnimationFrame(() => root?.querySelector<HTMLElement>(".ic-drop")?.focus());
  };

  return (
    <section ref={ref} className={`rp rp-${tone}`} aria-label={props.ariaLabel}>
      <div className="rp-head">
        <ResultIcon tone={tone} />
        <div>
          <h2 className="rp-title">{props.title}</h2>
          {props.summary && <p className="rp-summary">{props.summary}</p>}
        </div>
      </div>
      {props.fileName && <p className="rp-file">{props.fileName}</p>}
      {details.length > 0 && (
        <dl className="rp-details">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt>{detail.label}</dt>
              <dd>
                {detail.value}
                {detail.hint && <small>{detail.hint}</small>}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {props.children}
      {notes.length > 0 && (
        <ul className="rp-notes">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <div className="rp-actions">
        {props.primary}
        {props.secondary}
        <button type="button" className="rp-reset" onClick={reset}>
          {props.resetLabel}
        </button>
      </div>
    </section>
  );
}

export interface OutputFile {
  name: string;
  blob: Blob;
  url: string;
}

export function makeOutput(name: string, blob: Blob): OutputFile {
  return { name, blob, url: URL.createObjectURL(blob) };
}

/** Appends " (2)", " (3)"… to names that are already taken. */
export function uniqueName(name: string, taken: Set<string>): string {
  let candidate = name;
  let n = 2;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  while (taken.has(candidate.toLowerCase())) candidate = `${stem} (${n++})${ext}`;
  taken.add(candidate.toLowerCase());
  return candidate;
}

export function triggerDownload(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function ZipButton({ files, zipName, primary = false }: { files: OutputFile[]; zipName: string; primary?: boolean }) {
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    setBusy(true);
    try {
      const entries = await Promise.all(
        files.map(async (file) => ({ name: file.name, data: new Uint8Array(await file.blob.arrayBuffer()) })),
      );
      const zip = buildZip(entries);
      const url = URL.createObjectURL(zip);
      triggerDownload(url, zipName);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className="button button-download" onClick={() => void onClick()} disabled={busy}>
      {busy ? "Preparing ZIP…" : `Download all as ZIP (${files.length} files)`}
    </button>
  );
}
