import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

// Kept in sync with MAX_FILE_BYTES / MAX_PAGES in lib/docxToPdf. The converter is imported lazily,
// so these are repeated here to validate the file before any conversion code is downloaded.
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_PAGES = 300;
const fmt = (bytes: number) => formatBytes(bytes, "id");

interface Result {
  url: string;
  name: string;
  size: number;
  pages: number;
  tables: number;
  images: number;
  notices: string[];
}

const errorMessage = (code: string, fileName: string): string => {
  switch (code) {
    case "invalid":
      return `${fileName}: berkas ini bukan dokumen .docx yang valid.`;
    case "legacy":
      return `${fileName}: ini berkas Word lama (.doc) atau dilindungi kata sandi. Buka di Word, hapus kata sandinya jika ada, lalu simpan sebagai .docx.`;
    case "encrypted":
      return `${fileName}: berkas dilindungi kata sandi. Hapus perlindungannya, lalu coba lagi.`;
    case "corrupt":
      return `${fileName}: berkas tampaknya rusak dan tidak dapat dibaca. Coba buka di Word lalu simpan ulang sebagai .docx.`;
    case "too-large":
      return `${fileName}: dokumen terlalu besar untuk diproses di browser (batasnya ${MAX_PAGES} halaman dan isi internal yang wajar). Pecah menjadi bagian yang lebih kecil.`;
    case "unsupported":
      return `${fileName}: dokumen ini memakai kompresi yang tidak didukung browser atau fitur yang tidak kompatibel.`;
    case "empty":
      return `${fileName}: tidak ditemukan teks atau gambar yang dapat dikonversi di dokumen ini.`;
    default:
      return `${fileName}: dokumen tidak dapat dikonversi. Coba lagi atau gunakan berkas yang lebih kecil.`;
  }
};

const noticeText: Record<string, string> = {
  headerFooter: "Header, footer, dan nomor halaman tidak disertakan.",
  footnotes: "Catatan kaki dan catatan akhir tidak disertakan.",
  textbox: "Kotak teks tidak disertakan.",
  shape: "Bentuk, gambar vektor, dan objek tersemat tidak disertakan.",
  chart: "Grafik tidak disertakan.",
  equation: "Persamaan tidak disertakan.",
  anchoredImage: "Gambar mengambang ditempatkan sejajar dengan teks, sehingga posisinya bisa berubah.",
  unsupportedImage: "Beberapa gambar berformat tidak didukung dan dilewati.",
  replacedChars: "Beberapa karakter yang tidak ada di font standar PDF (misalnya emoji atau aksara non-Latin) diganti dengan «?».",
};

export default function WordKePdf() {
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
    setStatus("Berkas dihapus. Pilih dokumen lain untuk memulai.");
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (/\.doc$/i.test(selected.name)) return setError(errorMessage("legacy", selected.name));
    if (!/\.docx$/i.test(selected.name)) return setError(`${selected.name}: hanya berkas Word .docx yang didukung.`);
    if (selected.size === 0) return setError(`${selected.name}: berkas kosong.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: ukurannya ${fmt(selected.size)}, melebihi batas ${fmt(MAX_FILE_BYTES)}.`);

    setFile(selected);
    runningRef.current = true;
    setBusy(true);
    try {
      setProgress("Menyiapkan konverter…");
      const { convertDocxToPdf } = await import("../../lib/docxToPdf");
      const bytes = new Uint8Array(await selected.arrayBuffer());
      const out = await convertDocxToPdf(bytes, selected.name, (p) => {
        if (p.stage === "reading") setProgress("Membaca dokumen…");
        else if (p.stage === "saving") setProgress("Membuat PDF…");
        else setProgress(`Menata dokumen… ${Math.round((p.done / Math.max(1, p.total)) * 100)}%`);
      });
      const blob = new Blob([out.bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setResult({
        url,
        name: selected.name.replace(/\.docx$/i, "") + ".pdf",
        size: blob.size,
        pages: out.pages,
        tables: out.tables,
        images: out.images,
        notices: out.notices,
      });
      setStatus("PDF berhasil dibuat!");
    } catch (caught) {
      const code = caught && typeof caught === "object" && "code" in caught ? String((caught as { code: unknown }).code) : "";
      setError(errorMessage(code, selected.name));
      setFile(null);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const notes = result
    ? [
        ...result.notices.map((n) => noticeText[n]).filter(Boolean),
        "PDF memakai font standar, bukan font dokumen, sehingga pemotongan baris dan halaman bisa berbeda dari Word. Periksa PDF sebelum dikirim.",
      ]
    : [];

  return (
    <div className="ic" lang="id">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Tarik dan lepas berkas Word (.docx) ke sini"
        emptySub={`Pilih dokumen .docx untuk dikonversi ke PDF. Maksimal ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Pilih File Word"
        moreLabel="Pilih dokumen lain"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple={false}
        busy={busy}
        ariaLabel="Area untuk melepas berkas Word"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Berkas Anda diproses di perangkat Anda dan tidak dikirim ke server mana pun. Ini konversi perkiraan: teks, format
        dasar, daftar, tabel, dan gambar sejajar teks dipertahankan, tetapi tata letak bisa berbeda dari Word.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Sedang mengonversi dokumen..." : status}
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
          tone={result.notices.length > 0 ? "warning" : "success"}
          title="PDF berhasil dibuat!"
          fileName={result.name}
          details={[
            { label: "Format", value: "PDF" },
            { label: "Ukuran", value: fmt(result.size) },
            { label: "Halaman", value: String(result.pages) },
            { label: "Tabel", value: String(result.tables) },
            { label: "Gambar", value: String(result.images) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Unduh PDF
            </a>
          }
          resetLabel="Konversi dokumen lain"
          onReset={reset}
        />
      )}
    </div>
  );
}
