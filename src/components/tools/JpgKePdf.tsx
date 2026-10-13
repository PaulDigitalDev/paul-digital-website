import { useEffect, useRef, useState } from "react";
import { buildPdf } from "../../lib/jpegPdf";
import type { PageSizeChoice, PdfImage } from "../../lib/jpegPdf";
import { checkJpeg } from "../../lib/jpgToPdfPt";
import { DropArea, ResultPanel } from "./shared";
import { reencode } from "./JpgParaPdf";

const MAX_FILES = 50;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;
const MAX_PIXELS = 100_000_000;

interface Item {
  id: number;
  file: File;
  url: string;
  width: number;
  height: number;
  /** True when the JPEG must be re-encoded for PDF (EXIF rotation or an unsupported colour mode). */
  normalise: boolean;
}

interface Result {
  url: string;
  size: number;
  pages: number;
}

/** Indonesian file size, e.g. "1,4 MB". */
function formatBytesId(bytes: number): string {
  const units = ["byte", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toLocaleString("id", { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${units[unit]}`;
}

export default function JpgKePdf({ outputName = "jpg-ke-pdf.pdf" }: { outputName?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeChoice>("a4");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const idRef = useRef(0);
  const resultUrlRef = useRef<string | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const runningRef = useRef(false);
  itemsRef.current = items;

  useEffect(
    () => () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [],
  );

  const clearResult = () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setResult(null);
  };

  const reset = () => {
    clearResult();
    items.forEach((item) => URL.revokeObjectURL(item.url));
    setItems([]);
    setErrors([]);
    setStatus("Daftar gambar dikosongkan. Pilih gambar JPG baru untuk memulai.");
  };

  const addFiles = async (incoming: File[]) => {
    if (busy || incoming.length === 0) return;
    clearResult();
    setStatus("");
    setBusy(true);
    const problems: string[] = [];
    const accepted: Item[] = [];
    let total = items.reduce((sum, item) => sum + item.file.size, 0);
    try {
      for (const file of incoming) {
        setProgress(`Membaca ${file.name}…`);
        if (items.length + accepted.length >= MAX_FILES) {
          problems.push(`${file.name}: tidak ditambahkan. Batasnya ${MAX_FILES} gambar.`);
          continue;
        }
        if (file.size === 0) {
          problems.push(`${file.name}: file kosong.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          problems.push(`${file.name}: berukuran ${formatBytesId(file.size)}, melebihi batas ${formatBytesId(MAX_FILE_BYTES)} per gambar.`);
          continue;
        }
        if (total + file.size > MAX_TOTAL_BYTES) {
          problems.push(`${file.name}: tidak ditambahkan karena total ukuran akan melebihi ${formatBytesId(MAX_TOTAL_BYTES)}.`);
          continue;
        }
        const check = checkJpeg(new Uint8Array(await file.arrayBuffer()));
        if (!check.ok) {
          problems.push(
            check.reason === "not-jpeg"
              ? `${file.name}: format tidak didukung. Alat ini hanya menerima gambar JPG/JPEG.`
              : check.reason === "empty"
                ? `${file.name}: file kosong.`
                : `${file.name}: gambar tidak dapat dibaca. File mungkin rusak.`,
          );
          continue;
        }
        if (check.displayWidth * check.displayHeight > MAX_PIXELS) {
          problems.push(`${file.name}: gambar (${check.displayWidth}×${check.displayHeight} px) terlalu besar untuk diproses dengan aman.`);
          continue;
        }
        try {
          (await createImageBitmap(file)).close();
        } catch {
          problems.push(`${file.name}: gambar tidak dapat dibaca. File mungkin rusak.`);
          continue;
        }
        total += file.size;
        accepted.push({
          id: ++idRef.current,
          file,
          url: URL.createObjectURL(file),
          width: check.displayWidth,
          height: check.displayHeight,
          normalise: !check.info.embeddable || check.info.orientation !== 1,
        });
      }
    } finally {
      setBusy(false);
      setProgress("");
    }
    setErrors(problems);
    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      setStatus(`${accepted.length} gambar ditambahkan.`);
    }
  };

  const move = (index: number, delta: number) => {
    if (busy) return;
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    clearResult();
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    setItems(next);
    setStatus(`${items[index].file.name} dipindahkan ke posisi ${to + 1} dari ${items.length}.`);
  };

  const remove = (id: number) => {
    if (busy) return;
    clearResult();
    const target = items.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setItems((current) => current.filter((item) => item.id !== id));
    setStatus(`${target?.file.name ?? "Gambar"} dihapus.`);
  };

  const run = async () => {
    if (runningRef.current) return;
    if (items.length === 0) return setErrors(["Tambahkan setidaknya satu gambar JPG untuk dikonversi."]);
    runningRef.current = true;
    setErrors([]);
    clearResult();
    setBusy(true);
    setStatus("");
    try {
      const images: PdfImage[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgress(`Menyiapkan gambar ${i + 1} dari ${items.length}…`);
        await new Promise((resolve) => setTimeout(resolve));
        try {
          if (item.normalise) {
            images.push(await reencode(item.file));
          } else {
            const bytes = new Uint8Array(await item.file.arrayBuffer());
            const check = checkJpeg(bytes);
            if (!check.ok) throw new Error("invalid");
            images.push({ bytes, width: check.info.width, height: check.info.height, components: check.info.components });
          }
        } catch {
          throw new Error(`${item.file.name}: gambar ini tidak dapat diproses. Hapus dari daftar lalu coba lagi.`);
        }
      }
      setProgress("Membuat PDF…");
      const blob = buildPdf(images, pageSize);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({ url, size: blob.size, pages: images.length });
      setStatus("PDF berhasil dibuat!");
    } catch (error) {
      setErrors([error instanceof Error && error.message.includes(": ") ? error.message : "PDF gagal dibuat. Coba lagi dengan lebih sedikit gambar."]);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="ic ic-minimal" lang="id">
      <DropArea
        title={`${items.length} gambar dipilih`}
        hasFiles={items.length > 0}
        emptyTitle="Seret dan lepas gambar Anda di sini"
        emptySub="atau pilih gambar JPG dari perangkat Anda"
        filledSub={`Total ${formatBytesId(totalSize)} · tambahkan gambar lain kapan saja`}
        buttonLabel="Pilih Gambar JPG"
        moreLabel="Pilih Gambar JPG"
        accept="image/jpeg,.jpg,.jpeg"
        multiple
        busy={busy}
        ariaLabel="Area untuk melepas gambar JPG"
        onFiles={(files) => void addFiles(files)}
      />

      {items.length > 0 && (
        <>
          <h2 className="jp-heading">Gambar yang dipilih ({items.length})</h2>
          <p className="ic-hint">Atur urutan gambar sesuai keinginan Anda.</p>
          <ol className="jp-list" aria-label="Gambar yang dipilih, sesuai urutan di dalam PDF">
            {items.map((item, index) => (
              <li key={item.id} className="jp-item">
                <span className="jp-num" aria-hidden="true">
                  {index + 1}
                </span>
                <img className="jp-thumb" src={item.url} alt="" width={48} height={48} loading="lazy" />
                <span className="jp-name">
                  {item.file.name}
                  <small>
                    {item.width}×{item.height} px · {formatBytesId(item.file.size)}
                  </small>
                </span>
                <span className="jp-actions">
                  <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={`Naikkan ${item.file.name}`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={busy || index === items.length - 1}
                    aria-label={`Turunkan ${item.file.name}`}
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => remove(item.id)} disabled={busy} aria-label={`Hapus ${item.file.name}`}>
                    Hapus
                  </button>
                </span>
              </li>
            ))}
          </ol>
        </>
      )}

      {items.length > 0 && (
        <form
          className="ic-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <label className="ic-field">
            Ukuran halaman
            <select
              value={pageSize}
              onChange={(event) => {
                clearResult();
                setPageSize(event.target.value as PageSizeChoice);
              }}
              disabled={busy}
            >
              <option value="a4">A4 (gambar menyesuaikan halaman, tanpa distorsi)</option>
              <option value="image">Ukuran gambar (tanpa margin)</option>
            </select>
          </label>
          <button type="submit" className="button button-primary ic-submit jp-convert" disabled={busy}>
            {busy ? "Sedang mengonversi gambar..." : "Konversi ke PDF"}
          </button>
        </form>
      )}
      {items.length > 0 && (
        <p className="ic-hint">
          Gambar lanskap menghasilkan halaman lanskap dan gambar potret menghasilkan halaman potret. Urutan di PDF sama dengan urutan daftar.
        </p>
      )}

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Sedang mengonversi gambar..." : status}
      </div>
      {busy && progress ? (
        <p className="ic-hint ic-progress" aria-hidden="true">
          {progress}
        </p>
      ) : null}
      {errors.length > 0 && (
        <div className="ic-error" role="alert">
          {errors.map((message, index) => (
            <p key={index} style={{ margin: 0 }}>
              {message}
            </p>
          ))}
        </div>
      )}

      {result && (
        <ResultPanel
          ariaLabel="Hasil"
          tone="success"
          title="PDF berhasil dibuat!"
          fileName={outputName}
          details={[
            { label: "Format", value: "PDF" },
            { label: "Ukuran", value: formatBytesId(result.size) },
            { label: "Halaman", value: String(result.pages) },
          ]}
          primary={
            <a className="button button-download" href={result.url} download={outputName}>
              Unduh PDF
            </a>
          }
          resetLabel="Kosongkan gambar"
          onReset={reset}
        />
      )}
    </div>
  );
}
