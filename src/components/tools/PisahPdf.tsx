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

const LOCALE = "id";
const WORDS = { one: "halaman", many: "halaman" };
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_PAGES = 1000;
const MAX_OUTPUT_FILES = 200;
const MAX_OUTPUT_BYTES = 500 * 1024 * 1024;
const MAX_CHIP_PAGES = 120;

type Mode = "ranges" | "single" | "all";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "ranges", label: "Satu PDF untuk setiap rentang", hint: "Setiap bagian yang dipisahkan koma (misalnya “1-3, 5, 8-10”) disimpan sebagai PDF tersendiri." },
  { id: "single", label: "Satu PDF berisi halaman terpilih", hint: "Menggabungkan semua halaman yang Anda pilih ke dalam satu PDF baru." },
  { id: "all", label: "Setiap halaman jadi PDF terpisah", hint: `Membuat satu PDF per halaman (hingga ${MAX_OUTPUT_FILES} halaman) dan menyediakannya juga dalam ZIP.` },
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

const count = (n: number, word: string) => `${n} ${word}`;

function rangeMessage(error: RangeError): string {
  switch (error.code) {
    case "empty":
      return "Ketik halaman yang ingin diambil, misalnya “1-3, 5, 8-10”.";
    case "syntax":
      return `“${error.token}” tidak valid. Gunakan angka yang dipisahkan koma dan tanda hubung untuk rentang, misalnya “1-3, 5, 8-10”.`;
    case "zero":
      return `“${error.token}”: halaman pertama dokumen adalah halaman 1.`;
    case "reversed":
      return `“${error.token}”: rentang terbalik. Tulis halaman yang lebih kecil lebih dulu, misalnya “${error.token.split(/\s*[-–—]\s*/).reverse().join("-")}”.`;
    case "outOfRange":
      return `“${error.token}” melebihi isi dokumen, yang hanya memiliki ${count(error.total, "halaman")}.`;
    case "duplicate":
      return `Halaman ${error.token} muncul lebih dari satu kali. Setiap halaman hanya boleh disebutkan sekali.`;
  }
}

export default function PisahPdf() {
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
    setProgress(`Membaca ${file.name}…`);
    try {
      let problem = "";
      let pages = 0;
      if (file.size === 0) problem = `${file.name}: file kosong.`;
      else if (file.size > MAX_FILE_BYTES) problem = `${file.name}: berukuran ${fmt(file.size)}, melebihi batas ${fmt(MAX_FILE_BYTES)}.`;
      else {
        const info = await inspectSourcePdf(new Uint8Array(await file.arrayBuffer()));
        if (!info.ok) {
          problem =
            info.reason === "encrypted"
              ? `${file.name}: PDF ini dilindungi kata sandi. Hapus perlindungannya lalu coba lagi.`
              : info.reason === "invalid"
                ? `${file.name}: file ini bukan PDF.`
                : `${file.name}: PDF ini tidak dapat dibaca. Kemungkinan file rusak.`;
        } else if (info.pages === 0) problem = `${file.name}: PDF ini tidak memiliki halaman.`;
        else if (info.pages > MAX_PAGES) problem = `${file.name}: memiliki ${info.pages} halaman, melebihi batas ${MAX_PAGES}.`;
        else pages = info.pages;
      }
      if (problem) {
        setErrors([problem]);
        return;
      }
      setSelected({ file, pages });
      setText("");
      setStatus(`${file.name} dimuat: ${count(pages, "halaman")}.`);
    } catch {
      setErrors([`${file.name}: file tidak dapat dibaca.`]);
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
    setStatus("File dihapus. Pilih PDF lain untuk memulai.");
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
        return setErrors([`Untuk memisahkan per halaman, PDF maksimal ${MAX_OUTPUT_FILES} halaman; PDF ini memiliki ${selected.pages}. Pilih rentang halaman saja.`]);
      }
      groups = singlePageGroups(selected.pages);
    } else {
      const result = parsePageRanges(text, selected.pages, keepOrder);
      if (!result.ok) return setErrors([rangeMessage(result.error)]);
      groups = mode === "single" ? [combineGroups(result.groups)] : result.groups;
      if (groups.length > MAX_OUTPUT_FILES) return setErrors([`Ini akan membuat ${groups.length} file; batas maksimalnya ${MAX_OUTPUT_FILES}.`]);
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
        producer: "Paul Digital - Pisah PDF",
        onProgress: (done, total) => setProgress(done < total ? `Membuat file ${done + 1} dari ${total}…` : "Menyelesaikan…"),
      });
      const base = baseName(selected.file.name, "dokumen");
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
      setStatus(`Selesai: ${count(made.length, "file dibuat")}.`);
    } catch (error) {
      setErrors([
        error instanceof Error && error.message === "output-too-large"
          ? `Hasilnya akan melebihi ${fmt(MAX_OUTPUT_BYTES)} dan dapat menghabiskan memori perangkat Anda. Coba pilih lebih sedikit halaman.`
          : "PDF tidak dapat dipisahkan. Pastikan file tidak rusak atau coba dengan lebih sedikit halaman.",
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
      triggerDownload(url, `${baseName(selected?.file.name ?? "", "dokumen")}_halaman.zip`);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setZipBusy(false);
    }
  };

  const modeHint = MODES.find((item) => item.id === mode)?.hint;
  const showError = attempted && rangeError ? rangeMessage(rangeError) : null;
  const totalOut = outputs.reduce((sum, output) => sum + output.blob.size, 0);

  return (
    <div className="ic" lang="id">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Tarik dan lepas file PDF Anda di sini"
        emptySub={`Pilih satu PDF untuk dipisahkan. Maksimal ${fmt(MAX_FILE_BYTES)} dan ${MAX_PAGES} halaman.`}
        filledSub={selected ? `${count(selected.pages, "halaman")} · ${fmt(selected.file.size)} · Anda dapat memilih file lain` : ""}
        buttonLabel="Pilih File PDF"
        moreLabel="Ganti file"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Area untuk melepas file PDF"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">File Anda diproses di perangkat Anda dan tidak diunggah ke server mana pun. File asli tidak diubah.</p>

      {selected && (
        <form
          className="ic-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <p className="sp-total">
            Dokumen ini memiliki <strong>{count(selected.pages, "halaman")}</strong>.
          </p>
          <fieldset className="sp-modes" disabled={busy}>
            <legend>Cara memisahkan</legend>
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
                <label htmlFor="sp-ranges">Rentang Halaman</label>
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
                Pisahkan dengan koma dan gunakan tanda hubung untuk rentang. Penomoran dimulai dari 1 (halaman pertama); halaman yang valid: 1 sampai {selected.pages}.
              </p>
              {selected.pages <= MAX_CHIP_PAGES && (
                <div className="sp-chips" role="group" aria-label="Pilih Halaman">
                  {Array.from({ length: selected.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className="sp-chip"
                      aria-pressed={chosenPages.has(page)}
                      aria-label={`Halaman ${page}`}
                      disabled={busy}
                      onClick={() => togglePage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
              <div className="ic-field">
                <label htmlFor="sp-order">Urutan halaman</label>
                <select
                  id="sp-order"
                  value={keepOrder ? "given" : "document"}
                  disabled={busy}
                  onChange={(event) => {
                    clearResult();
                    setKeepOrder(event.target.value === "given");
                  }}
                >
                  <option value="given">Ikuti urutan yang saya ketik</option>
                  <option value="document">Urutkan sesuai dokumen asli</option>
                </select>
              </div>
            </>
          )}
          <button type="submit" className="button button-primary ic-submit" disabled={busy}>
            {busy ? "Memisahkan..." : "Pisahkan PDF"}
          </button>
        </form>
      )}
      {selected && <p className="ic-hint">{modeHint}</p>}

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Sedang memisahkan PDF..." : status}
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
          ariaLabel="Hasil"
          tone="success"
          title={outputs.length === 1 ? "PDF berhasil dibuat" : "PDF berhasil dipisahkan"}
          details={[
            { label: "File", value: String(outputs.length) },
            { label: "Halaman diambil", value: String(outputs.reduce((sum, output) => sum + output.pages, 0)) },
            { label: "Ukuran total", value: fmt(totalOut) },
            { label: "Dokumen asli", value: count(selected.pages, "halaman") },
          ]}
          primary={
            outputs.length === 1 ? (
              <a className="button button-download" href={outputs[0].url} download={outputs[0].name}>
                Unduh PDF
              </a>
            ) : (
              <button type="button" className="button button-download" onClick={() => void downloadZip()} disabled={zipBusy}>
                {zipBusy ? "Menyiapkan ZIP…" : `Unduh semua dalam ZIP (${outputs.length} file)`}
              </button>
            )
          }
          resetLabel="Pisahkan PDF lain"
          onReset={reset}
        >
          {outputs.length > 1 && (
            <ul className="sp-files" aria-label="File yang dibuat">
              {outputs.map((output) => (
                <li key={output.name}>
                  <span>
                    {output.name} <small>{count(output.pages, "halaman")} · {fmt(output.blob.size)}</small>
                  </span>
                  <a href={output.url} download={output.name} aria-label={`Unduh ${output.name}`}>
                    Unduh
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
