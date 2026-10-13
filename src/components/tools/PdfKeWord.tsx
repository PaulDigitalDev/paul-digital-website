import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fmt = (bytes: number) => formatBytes(bytes, "id");

interface Result {
  url: string;
  name: string;
  size: number;
  pages: number;
  pagesWithoutText: number;
  paragraphs: number;
  headings: number;
}

const errorMessage = (error: unknown, fileName: string): string => {
  if (error instanceof PdfToWordError) {
    switch (error.code) {
      case "invalid":
        return `${fileName}: berkas ini bukan PDF.`;
      case "encrypted":
        return `${fileName}: PDF ini dilindungi kata sandi. Hapus perlindungannya, lalu coba lagi.`;
      case "no-text":
        return `${fileName}: tidak ditemukan teks yang dapat dipilih di PDF ini. Sepertinya dokumen hasil pindai (berupa gambar halaman). Versi ini belum mendukung OCR dan hanya dapat mengonversi PDF berisi teks.`;
      case "too-many-pages":
        return `${fileName}: PDF ini memiliki lebih dari ${MAX_PAGES} halaman, melebihi batas alat ini.`;
      default:
        return `${fileName}: PDF ini tidak dapat dibaca. Berkas mungkin rusak atau memakai format yang tidak didukung.`;
    }
  }
  return "PDF tidak dapat dikonversi. Coba lagi atau gunakan berkas yang lebih kecil.";
};

export default function PdfKeWord() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const urlRef = useRef<string | null>(null);
  const runningRef = useRef(false);

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
    setFile(null);
    setError("");
    setStatus("Berkas dihapus. Pilih PDF lain untuk memulai.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "Membuka PDF…";
    if (p.stage === "building") return "Membuat dokumen Word…";
    return `Mengekstrak teks dari halaman ${p.page} dari ${p.pages}…`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (selected.size === 0) return setError(`${selected.name}: berkas kosong.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${selected.name}: berkas ini bukan PDF.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: berukuran ${fmt(selected.size)}, melebihi batas ${fmt(MAX_FILE_BYTES)}.`);

    setFile(selected);
    runningRef.current = true;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer());
      const out = await convertPdfToDocx(bytes, selected.name, (p) => setProgress(describe(p)));
      const url = URL.createObjectURL(out.blob);
      urlRef.current = url;
      setResult({
        url,
        name: selected.name.replace(/\.pdf$/i, "") + ".docx",
        size: out.blob.size,
        pages: out.pages,
        pagesWithoutText: out.pagesWithoutText,
        paragraphs: out.paragraphs,
        headings: out.headings,
      });
      setStatus("Dokumen Word berhasil dibuat!");
    } catch (caught) {
      setError(errorMessage(caught, selected.name));
      setFile(null);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const notes = result
    ? [
        ...(result.pagesWithoutText > 0
          ? [
              `${result.pagesWithoutText} halaman tidak memiliki teks yang dapat dipilih (kemungkinan hasil pindai) sehingga tidak dimasukkan ke dokumen. Versi ini belum mendukung OCR.`,
            ]
          : []),
        "Tabel, kolom, gambar, dan tata letak halaman yang persis mungkin tidak dipertahankan. Periksa dokumen di Word sebelum digunakan.",
      ]
    : [];

  return (
    <div className="ic" lang="id">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Tarik dan lepas berkas PDF Anda di sini"
        emptySub={`Pilih PDF berisi teks untuk dikonversi ke Word. Maksimal ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Pilih berkas PDF"
        moreLabel="Pilih PDF lain"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Area untuk melepas berkas PDF"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Berkas Anda diproses di perangkat Anda dan tidak dikirim ke server mana pun. Alat ini bekerja untuk PDF
        yang berisi teks yang dapat dipilih; PDF hasil pindai (gambar) belum didukung di versi ini.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Mengonversi PDF…" : status}
      </div>
      {busy && progress ? (
        <p className="ic-hint ic-progress" aria-hidden="true">
          {progress}
        </p>
      ) : null}
      {error && (
        <div className="ic-error" role="alert">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {result && (
        <ResultPanel
          ariaLabel="Hasil"
          tone={result.pagesWithoutText > 0 ? "warning" : "success"}
          title="Dokumen Word berhasil dibuat!"
          fileName={result.name}
          details={[
            { label: "Format", value: "DOCX (Word)" },
            { label: "Ukuran", value: fmt(result.size) },
            { label: "Halaman terbaca", value: String(result.pages - result.pagesWithoutText) },
            { label: "Judul", value: String(result.headings) },
            { label: "Paragraf", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Unduh DOCX
            </a>
          }
          resetLabel="Konversi PDF lain"
          onReset={reset}
        />
      )}
    </div>
  );
}
