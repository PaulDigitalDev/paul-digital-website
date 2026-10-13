import { useEffect, useRef, useState } from "react";
import { CompressError, compressPdf, inspectForCompression, savedPercent } from "../../lib/pdfCompress";
import type { CompressLevel, CompressStage, CompressStats } from "../../lib/pdfCompress";
import { recodeJpegInBrowser } from "../../lib/jpegRecode";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const LOCALE = "id-ID";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Below this gain the result is reported as "no meaningful change" rather than a success. */
const MEANINGFUL_PERCENT = 1;

const LEVELS: { id: CompressLevel; label: string; hint: string }[] = [
  { id: "lossless", label: "Tanpa penurunan kualitas", hint: "Hanya menata ulang dan memampatkan struktur berkas. Gambar tidak diubah." },
  {
    id: "balanced",
    label: "Seimbang (disarankan)",
    hint: "Selain itu, gambar JPEG diperkecil: kualitas menengah-tinggi dan maksimal 2000 piksel per sisi.",
  },
  {
    id: "strong",
    label: "Pengecilan maksimal",
    hint: "Gambar JPEG diperkecil lebih jauh: kualitas menengah dan maksimal 1400 piksel per sisi. Dapat terlihat pada foto dan hasil pindai.",
  },
];

const STAGE_TEXT: Record<CompressStage, string> = {
  reading: "Membaca PDF...",
  images: "Mengoptimalkan gambar",
  streams: "Memampatkan konten",
  saving: "Menyimpan PDF baru...",
  verifying: "Memeriksa apakah hasilnya dapat dibuka dengan benar...",
};

interface Selected {
  file: File;
  pages: number;
}

interface Outcome {
  stats: CompressStats;
  /** Object URL of the compressed file (only created when it is smaller). */
  compressedUrl: string | null;
  /** Object URL of the untouched original, for "keep the original". */
  originalUrl: string;
  level: CompressLevel;
}

/** Indonesian-formatted percentage: one decimal below 10, e.g. "37%" or "4,2%". */
const formatPercent = (value: number, _locale: string) => {
  const abs = Math.abs(value);
  const digits = abs < 10 ? 1 : 0;
  return `${abs.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
};
const fmt = (bytes: number) => formatBytes(bytes, LOCALE);

function outputName(name: string) {
  return `${name.replace(/\.pdf$/i, "") || "dokumen"}-terkompres.pdf`;
}

export default function KompresPdf() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [level, setLevel] = useState<CompressLevel>("balanced");
  const [stripMetadata, setStripMetadata] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [percent, setPercent] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const urls = useRef<string[]>([]);
  const running = useRef(false);

  const revokeUrls = () => {
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current = [];
  };
  useEffect(() => revokeUrls, []);

  const clearResult = () => {
    revokeUrls();
    setOutcome(null);
  };

  const reset = () => {
    clearResult();
    setSelected(null);
    setErrors([]);
    setStatus("Berkas dihapus. Pilih PDF lain untuk memulai.");
  };

  const pickFile = async (files: File[]) => {
    if (busy || files.length === 0) return;
    const file = files[0];
    clearResult();
    setStatus("");
    setErrors([]);
    setSelected(null);
    const problems: string[] = [];
    if (files.length > 1) problems.push("Hanya satu PDF yang dapat dikompres sekaligus. Berkas pertama yang digunakan.");
    if (file.size === 0) return setErrors([`${file.name}: berkas kosong.`]);
    if (file.size > MAX_FILE_BYTES)
      return setErrors([`${file.name}: berukuran ${fmt(file.size)}, melebihi batas ${fmt(MAX_FILE_BYTES)}.`]);
    setBusy(true);
    setProgress(`Membaca ${file.name}...`);
    try {
      const info = await inspectForCompression(new Uint8Array(await file.arrayBuffer()));
      if (!info.ok) {
        problems.push(
          info.reason === "encrypted"
            ? `${file.name}: PDF ini dilindungi kata sandi. Alat ini tidak dapat menghapus perlindungan; hapus dulu melalui aplikasi yang Anda gunakan untuk membukanya, lalu coba lagi.`
            : info.reason === "invalid"
              ? `${file.name}: berkas ini bukan PDF.`
              : `${file.name}: PDF ini tidak dapat dibaca. Berkas mungkin rusak.`,
        );
        return setErrors(problems);
      }
      setErrors(problems);
      setSelected({ file, pages: info.pages });
      setStatus("PDF siap. Pilih tingkat kompresi lalu klik “Kompres PDF”.");
    } catch {
      setErrors([`${file.name}: berkas ini tidak dapat dibaca.`]);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const run = async () => {
    if (running.current || !selected) return;
    running.current = true;
    clearResult();
    setErrors([]);
    setStatus("");
    setPercent(0);
    setBusy(true);
    const { file } = selected;
    try {
      let original: Uint8Array | null = new Uint8Array(await file.arrayBuffer());
      const { bytes, stats } = await compressPdf(original, {
        level,
        stripMetadata,
        recodeJpeg: recodeJpegInBrowser,
        onProgress: (stage, done, total) => {
          setProgress(stage === "images" || stage === "streams" ? `${STAGE_TEXT[stage]} (${Math.min(done + 1, total)} dari ${total})...` : STAGE_TEXT[stage]);
          setPercent(stage === "images" && total > 0 ? Math.round((done / total) * 100) : null);
        },
      });
      original = null; // release the input buffer
      const smaller = bytes.length < file.size;
      const compressedUrl = smaller ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })) : null;
      const originalUrl = URL.createObjectURL(file);
      urls.current = [originalUrl, ...(compressedUrl ? [compressedUrl] : [])];
      setOutcome({ stats, compressedUrl, originalUrl, level });
      setStatus(smaller ? "Kompresi selesai." : "Kompresi selesai: PDF ini tidak dapat diperkecil.");
    } catch (error) {
      const reason = error instanceof CompressError ? error.reason : "other";
      setErrors([
        reason === "encrypted"
          ? "PDF ini dilindungi kata sandi sehingga tidak dapat dikompres."
          : reason === "invalid"
            ? "Berkas ini bukan PDF."
            : reason === "corrupt"
              ? "PDF ini tidak dapat dibaca. Berkas mungkin rusak."
              : reason === "verify"
                ? "PDF hasil tidak lolos pemeriksaan sehingga tidak ditawarkan. Berkas asli Anda tidak berubah."
                : "PDF tidak dapat dikompres. Coba tingkat lain atau berkas yang lebih kecil.",
      ]);
    } finally {
      running.current = false;
      setBusy(false);
      setProgress("");
      setPercent(null);
    }
  };

  const renderResult = () => {
    if (!outcome || !selected) return null;
    const { stats, compressedUrl, originalUrl } = outcome;
    const original = selected.file.size;
    const change = savedPercent(original, stats.size);
    const smaller = compressedUrl !== null && change >= MEANINGFUL_PERCENT;
    const larger = stats.size > original;
    const notes: string[] = [];
    if (stats.imagesRecompressed > 0)
      notes.push(`Gambar dioptimalkan: ${stats.imagesRecompressed} dari ${stats.imagesFound}.`);
    else if (outcome.level !== "lossless" && stats.imagesFound > 0)
      notes.push("Tidak ada gambar JPEG yang dapat diperkecil dengan aman; gambar berformat lain dibiarkan apa adanya.");
    if (stats.streamsCompressed > 0) notes.push(`Blok konten yang dimampatkan: ${stats.streamsCompressed}.`);
    if (stats.unusedObjectsRemoved > 0) notes.push(`Data tak terpakai dihapus: ${stats.unusedObjectsRemoved} objek.`);
    if (stats.metadataRemoved) notes.push("Metadata dokumen dihapus.");
    notes.push("Jika PDF memiliki tanda tangan digital, tanda tangan tersebut tidak lagi valid pada berkas hasil kompresi.");

    const downloadOriginal = (primary: boolean) => (
      <a className={primary ? "button button-download" : "button"} href={originalUrl} download={selected.file.name}>
        Simpan berkas asli
      </a>
    );

    if (smaller) {
      return (
        <ResultPanel
          ariaLabel="Hasil"
          tone="success"
          title="PDF terkompres"
          summary={`Ukuran berkas berkurang ${formatPercent(change, LOCALE)}.`}
          fileName={outputName(selected.file.name)}
          details={[
            { label: "Ukuran file asli", value: fmt(original) },
            { label: "Ukuran setelah kompresi", value: fmt(stats.size) },
            { label: "Pengurangan", value: formatPercent(change, LOCALE) },
            { label: "Halaman", value: String(stats.pages) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={compressedUrl!} download={outputName(selected.file.name)}>
              Unduh PDF
            </a>
          }
          secondary={downloadOriginal(false)}
          resetLabel="Kompres PDF lain"
          onReset={reset}
        />
      );
    }
    return (
      <ResultPanel
        ariaLabel="Hasil"
        tone="warning"
        title={larger ? "Hasilnya akan lebih besar" : "PDF ini tidak dapat diperkecil"}
        summary={
          larger
            ? `PDF hasil proses akan berukuran ${fmt(stats.size)}, yaitu ${formatPercent(-change, LOCALE)} lebih besar daripada aslinya (${fmt(original)}). Berkas ini tidak ditawarkan untuk diunduh; sebaiknya gunakan berkas asli.`
            : `Ukuran nyaris tidak berubah (${fmt(original)} → ${fmt(stats.size)}). Berkas kemungkinan sudah dioptimalkan, jadi sebaiknya gunakan berkas asli.`
        }
        details={[
          { label: "Ukuran file asli", value: fmt(original) },
          { label: "Ukuran hasil proses", value: fmt(stats.size) },
          { label: "Perubahan", value: Math.abs(change) < 0.05 ? "Tidak berubah" : `${change < 0 ? "+" : "−"}${formatPercent(change, LOCALE)}` },
          { label: "Halaman", value: String(stats.pages) },
        ]}
        notes={outcome.level === "strong" ? notes.slice(0, -1) : [...notes.slice(0, -1), "Coba tingkat kompresi lain: hasil bergantung pada isi PDF."]}
        primary={downloadOriginal(true)}
        resetLabel="Coba PDF lain"
        onReset={reset}
      />
    );
  };

  return (
    <div className="ic" lang="id">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Tarik dan lepas berkas PDF Anda di sini"
        emptySub={`Pilih PDF untuk dikompres. Maksimal ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={selected ? `${selected.pages} halaman · ${fmt(selected.file.size)} · Anda dapat memilih berkas lain` : ""}
        buttonLabel="Pilih File PDF"
        moreLabel="Ganti berkas"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Area untuk melepas berkas PDF"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Berkas Anda diproses di perangkat Anda dan tidak dikirim ke server mana pun.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="cp-level">Tingkat kompresi</label>
          <select
            id="cp-level"
            value={level}
            onChange={(event) => {
              clearResult();
              setLevel(event.target.value as CompressLevel);
            }}
            disabled={busy}
          >
            {LEVELS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="st-checks">
          <label>
            <input
              type="checkbox"
              checked={stripMetadata}
              disabled={busy}
              onChange={(event) => {
                clearResult();
                setStripMetadata(event.target.checked);
              }}
            />{" "}
            Hapus metadata dokumen (judul, penulis, aplikasi pembuat)
          </label>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={!selected || busy}>
          {busy ? "Sedang mengompres PDF..." : "Kompres PDF"}
        </button>
      </form>
      <p className="ic-hint">
        {LEVELS.find((item) => item.id === level)?.hint} Hasil bergantung pada isi PDF dan pengurangan ukuran tertentu tidak dapat dijamin.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Sedang mengompres PDF..." : status}
      </div>
      {busy && progress ? (
        <div className="ic-hint ic-progress">
          <span aria-hidden="true">{progress}</span>
          {percent !== null ? <progress value={percent} max={100} aria-label="Kemajuan pemrosesan gambar" style={{ display: "block", width: "100%", marginTop: 6 }} /> : null}
        </div>
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
      {renderResult()}
    </div>
  );
}
