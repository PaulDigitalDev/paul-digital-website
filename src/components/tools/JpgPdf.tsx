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

/** Turkish file size, e.g. "1,4 MB". */
function formatBytesTr(bytes: number): string {
  const units = ["bayt", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toLocaleString("tr", { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${units[unit]}`;
}

export default function JpgPdf({ outputName = "jpg-pdf.pdf" }: { outputName?: string }) {
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
    setStatus("Görsel listesi temizlendi. Başlamak için yeni JPG görselleri seçin.");
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
        setProgress(`${file.name} okunuyor…`);
        if (items.length + accepted.length >= MAX_FILES) {
          problems.push(`${file.name}: eklenmedi. Sınır ${MAX_FILES} görseldir.`);
          continue;
        }
        if (file.size === 0) {
          problems.push(`${file.name}: dosya boş.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          problems.push(`${file.name}: boyutu ${formatBytesTr(file.size)}, görsel başına ${formatBytesTr(MAX_FILE_BYTES)} sınırını aşıyor.`);
          continue;
        }
        if (total + file.size > MAX_TOTAL_BYTES) {
          problems.push(`${file.name}: toplam boyut ${formatBytesTr(MAX_TOTAL_BYTES)} sınırını aşacağı için eklenmedi.`);
          continue;
        }
        const check = checkJpeg(new Uint8Array(await file.arrayBuffer()));
        if (!check.ok) {
          problems.push(
            check.reason === "not-jpeg"
              ? `${file.name}: desteklenmeyen biçim. Bu araç yalnızca JPG/JPEG görsellerini kabul eder.`
              : check.reason === "empty"
                ? `${file.name}: dosya boş.`
                : `${file.name}: görsel okunamadı. Dosya bozuk olabilir.`,
          );
          continue;
        }
        if (check.displayWidth * check.displayHeight > MAX_PIXELS) {
          problems.push(`${file.name}: görsel (${check.displayWidth}×${check.displayHeight} px) güvenle işlenemeyecek kadar büyük.`);
          continue;
        }
        try {
          (await createImageBitmap(file)).close();
        } catch {
          problems.push(`${file.name}: görsel okunamadı. Dosya bozuk olabilir.`);
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
      setStatus(`${accepted.length} görsel eklendi.`);
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
    setStatus(`${items[index].file.name}, ${items.length} görsel arasında ${to + 1}. sıraya taşındı.`);
  };

  const remove = (id: number) => {
    if (busy) return;
    clearResult();
    const target = items.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setItems((current) => current.filter((item) => item.id !== id));
    setStatus(`${target?.file.name ?? "Görsel"} kaldırıldı.`);
  };

  const run = async () => {
    if (runningRef.current) return;
    if (items.length === 0) return setErrors(["Dönüştürmek için en az bir JPG görseli ekleyin."]);
    runningRef.current = true;
    setErrors([]);
    clearResult();
    setBusy(true);
    setStatus("");
    try {
      const images: PdfImage[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgress(`${items.length} görselden ${i + 1}. hazırlanıyor…`);
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
          throw new Error(`${item.file.name}: bu görsel işlenemedi. Listeden kaldırıp tekrar deneyin.`);
        }
      }
      setProgress("PDF oluşturuluyor…");
      const blob = buildPdf(images, pageSize);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({ url, size: blob.size, pages: images.length });
      setStatus("Dönüştürme tamamlandı");
    } catch (error) {
      setErrors([error instanceof Error && error.message.includes(": ") ? error.message : "PDF oluşturulamadı. Daha az görselle tekrar deneyin."]);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="ic ic-minimal" lang="tr">
      <DropArea
        title={`${items.length} görsel seçildi`}
        hasFiles={items.length > 0}
        emptyTitle="JPG görsellerinizi buraya sürükleyip bırakın"
        emptySub="veya cihazınızdan JPG görselleri seçin"
        filledSub={`Toplam ${formatBytesTr(totalSize)} · istediğiniz zaman daha fazla ekleyin`}
        buttonLabel="JPG Görsellerini Seç"
        moreLabel="JPG Görsellerini Seç"
        accept="image/jpeg,.jpg,.jpeg"
        multiple
        busy={busy}
        ariaLabel="JPG görsellerini bırakma alanı"
        onFiles={(files) => void addFiles(files)}
      />

      {items.length > 0 && (
        <>
          <h2 className="jp-heading">Seçilen görseller ({items.length})</h2>
          <p className="ic-hint">Görselleri istediğiniz sıraya göre düzenleyin.</p>
          <ol className="jp-list" aria-label="Seçilen görseller, PDF'deki sıraya göre">
            {items.map((item, index) => (
              <li key={item.id} className="jp-item">
                <span className="jp-num" aria-hidden="true">
                  {index + 1}
                </span>
                <img className="jp-thumb" src={item.url} alt="" width={48} height={48} loading="lazy" />
                <span className="jp-name">
                  {item.file.name}
                  <small>
                    {item.width}×{item.height} px · {formatBytesTr(item.file.size)}
                  </small>
                </span>
                <span className="jp-actions">
                  <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={`${item.file.name} görselini yukarı taşı`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={busy || index === items.length - 1}
                    aria-label={`${item.file.name} görselini aşağı taşı`}
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => remove(item.id)} disabled={busy} aria-label={`${item.file.name} görselini kaldır`}>
                    Kaldır
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
            Sayfa boyutu
            <select
              value={pageSize}
              onChange={(event) => {
                clearResult();
                setPageSize(event.target.value as PageSizeChoice);
              }}
              disabled={busy}
            >
              <option value="a4">A4 (görsel sayfaya sığdırılır, bozulma olmaz)</option>
              <option value="image">Görsel boyutu (kenar boşluksuz)</option>
            </select>
          </label>
          <button type="submit" className="button button-primary ic-submit jp-convert" disabled={busy}>
            {busy ? "İşleniyor..." : "Dönüştür"}
          </button>
        </form>
      )}
      {items.length > 0 && (
        <p className="ic-hint">
          Yatay görseller yatay sayfa, dikey görseller dikey sayfa oluşturur. PDF'deki sıra listedeki sıra ile aynıdır.
        </p>
      )}

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "İşleniyor..." : status}
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
          ariaLabel="Sonuç"
          tone="success"
          title="Dönüştürme tamamlandı"
          fileName={outputName}
          details={[
            { label: "Biçim", value: "PDF" },
            { label: "Dosya boyutu", value: formatBytesTr(result.size) },
            { label: "Sayfa", value: String(result.pages) },
          ]}
          primary={
            <a className="button button-download" href={result.url} download={outputName}>
              PDF'yi İndir
            </a>
          }
          resetLabel="Başka Bir Dosya Seç"
          onReset={reset}
        />
      )}
    </div>
  );
}
