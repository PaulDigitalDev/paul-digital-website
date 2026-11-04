import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

/*
 * Premium tool kit, shared by every tool page:
 *  - UploadHero: the big centred "Select files" button, with drop-anywhere support.
 *  - Workspace:  file previews on the left, an options sidebar on the right (stacked on phones,
 *                with a sticky action button).
 *  - DoneView:   the "your file is ready" screen with a large download button and before/after stats.
 * The tool root is <div className="pt" data-stage="upload | work | done">; the page heading is
 * hidden by CSS once work starts, like the big PDF tool sites do. Accent colour comes from the
 * surrounding .tool-top[data-accent].
 */

export type Stage = "upload" | "work" | "done";

export const UploadIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 16V4" />
    <path d="m6.5 9.5 5.5-5.5 5.5 5.5" />
    <path d="M4 16.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-2.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/** Listens for files dragged anywhere onto the window while `enabled`, and shows a full-screen drop overlay. */
export function useWindowDrop(enabled: boolean, onFiles: (files: File[]) => void) {
  const [active, setActive] = useState(false);
  const handler = useRef(onFiles);
  handler.current = onFiles;

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }
    let depth = 0;
    const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files");
    const enter = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      depth += 1;
      setActive(true);
    };
    const over = (event: DragEvent) => {
      if (hasFiles(event)) event.preventDefault();
    };
    const leave = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setActive(false);
    };
    const drop = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setActive(false);
      const files = Array.from(event.dataTransfer?.files ?? []);
      if (files.length) handler.current(files);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [enabled]);

  return active;
}

export function DropOverlay({ active, label }: { active: boolean; label: string }) {
  if (!active) return null;
  return (
    <div className="pt-overlay" aria-hidden="true">
      <div>
        <UploadIcon />
        <p>{label}</p>
      </div>
    </div>
  );
}

/** Hidden file input plus a ref-driven opener, so any button can open the picker. */
export function useFilePicker(accept: string, multiple: boolean, onFiles: (files: File[]) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length) onFiles(files);
  };
  const input = (
    <input
      ref={inputRef}
      className="ic-file"
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={onChange}
      tabIndex={-1}
      aria-hidden="true"
    />
  );
  return { open: () => inputRef.current?.click(), input };
}

export function UploadHero(props: {
  buttonLabel: string;
  dropLabel: string;
  sub: string;
  busy?: boolean;
  onOpen: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="pt-upload">
      <button type="button" className="pt-select" onClick={props.onOpen} disabled={props.busy}>
        <UploadIcon />
        <span>{props.buttonLabel}</span>
      </button>
      <p className="pt-drop-text">{props.dropLabel}</p>
      <p className="pt-sub">{props.sub}</p>
      <ul className="pt-trust" aria-label="Why use this tool">
        <li>
          <ShieldIcon /> Files never leave your device
        </li>
        <li>Free, no sign-up</li>
        <li>No watermark</li>
      </ul>
      {props.children}
    </div>
  );
}

export function Workspace({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="pt-work">
      <div className="pt-main">{main}</div>
      <aside className="pt-side">{side}</aside>
    </div>
  );
}

export function SidePanel(props: { title: string; children: ReactNode; action: ReactNode; footer?: ReactNode }) {
  return (
    <div className="pt-panel">
      <h2 className="pt-panel-title">{props.title}</h2>
      <div className="pt-panel-body">{props.children}</div>
      <div className="pt-panel-action">{props.action}</div>
      {props.footer}
    </div>
  );
}

/** Quick preset buttons (e.g. 20 KB, 50 KB) next to a numeric target field. */
export function PresetChips(props: {
  label: string;
  options: { label: string; active: boolean; onSelect: () => void }[];
  disabled?: boolean;
}) {
  return (
    <div className="pt-chips" role="group" aria-label={props.label}>
      {props.options.map((option) => (
        <button
          key={option.label}
          type="button"
          className="pt-chip"
          aria-pressed={option.active}
          onClick={option.onSelect}
          disabled={props.disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ActionButton(props: { label: string; busyLabel?: string; busy: boolean; disabled?: boolean; type?: "submit" | "button"; onClick?: () => void }) {
  return (
    <button type={props.type ?? "submit"} className="pt-action" disabled={props.disabled || props.busy} onClick={props.onClick}>
      {props.busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
      <span>{props.busy ? props.busyLabel ?? "Working…" : props.label}</span>
      {!props.busy && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}

export function ErrorBox({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="ic-error pt-error" role="alert">
      {errors.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}

export interface DoneStat {
  label: string;
  value: string;
}

export function DoneView(props: {
  ok: boolean;
  title: string;
  summary: string;
  downloadHref: string;
  downloadName: string;
  downloadLabel: string;
  saving?: { percent: number; before: string; after: string };
  stats?: DoneStat[];
  preview?: ReactNode;
  notes?: string[];
  onBack: () => void;
  backLabel: string;
  onReset: () => void;
  resetLabel: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    ref.current?.querySelector<HTMLElement>(".pt-download")?.focus({ preventScroll: true });
  }, []);
  const notes = props.notes ?? [];
  return (
    <section ref={ref} className={`pt-done${props.ok ? "" : " is-warning"}`} aria-labelledby="pt-done-title">
      <h2 id="pt-done-title" className="pt-done-title">
        {props.title}
      </h2>
      <p className="pt-done-summary">{props.summary}</p>

      <div className="pt-done-actions">
        <button type="button" className="pt-back" onClick={props.onBack} aria-label={props.backLabel} title={props.backLabel}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
        </button>
        <a className="pt-download" href={props.downloadHref} download={props.downloadName}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4v12M6.5 10.5 12 16l5.5-5.5M4 20h16" />
          </svg>
          <span>{props.downloadLabel}</span>
        </a>
      </div>
      <p className="pt-done-file">{props.downloadName}</p>

      {props.saving && (
        <div className="pt-saving">
          <div
            className="pt-ring"
            style={{ ["--pct" as string]: `${Math.max(0, Math.min(100, props.saving.percent))}` }}
            role="img"
            aria-label={`${props.saving.percent}% smaller`}
          >
            <span>{props.saving.percent}%</span>
          </div>
          <div>
            <p className="pt-saving-head">Your file is {props.saving.percent}% smaller</p>
            <p className="pt-saving-sizes">
              {props.saving.before} <span aria-hidden="true">→</span>
              <span className="sr-only"> to </span> <strong>{props.saving.after}</strong>
            </p>
          </div>
        </div>
      )}

      {props.stats && props.stats.length > 0 && (
        <dl className="pt-stats">
          {props.stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {props.preview && <div className="pt-done-preview">{props.preview}</div>}

      {notes.length > 0 && (
        <ul className="pt-notes">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      <p className="pt-done-more">
        <button type="button" className="pt-link" onClick={props.onReset}>
          {props.resetLabel}
        </button>
      </p>
    </section>
  );
}
