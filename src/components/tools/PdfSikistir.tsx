import { useEffect, useRef, useState } from "react";
import { CompressError, compressPdf, inspectForCompression, savedPercent } from "../../lib/pdfCompress";
import type { CompressLevel, CompressStage, CompressStats } from "../../lib/pdfCompress";
import { recodeJpegInBrowser } from "../../lib/jpegRecode";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const LOCALE = "tr-TR";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Below this gain the result is reported as "no meaningful change" rather than a success. */
const MEANINGFUL_PERCENT = 1;

const LEVELS: { id: CompressLevel; label: string; hint: string }[] = [
  { id: "lossless", label: "Kalite kaybı olmadan", hint: "Yalnızca dosya yapısını yeniden düzenler ve sıkıştırır. Görsellere dokunulmaz." },
  {
    id: "balanced",
    label: "Dengeli (önerilen)",
    hint: "Ayrıca JPEG görseller küçültülür: orta-yüksek kalite ve kenar başına en fazla 2000 piksel.",
  },
  {
    id: "strong",
    label: "Maksimum küçültme",
    hint: "JPEG görseller daha fazla küçültülür: orta kalite ve kenar başına en fazla 1400 piksel. Fotoğraflarda ve taranmış belgelerde fark edilebilir.",
  },
];

const STAGE_TEXT: Record<CompressStage, string> = {
  reading: "PDF okunuyor...",
  images: "Görseller optimize ediliyor",
  streams: "İçerik sıkıştırılıyor",
  saving: "Yeni PDF kaydediliyor...",
  verifying: "Sonucun doğru açılıp açılmadığı kontrol ediliyor...",
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

/** Turkish-formatted percentage: one decimal below 10, e.g. "%37" or "%4,2". */
const formatPercent = (value: number, _locale: string) => {
  const abs = Math.abs(value);
  const digits = abs < 10 ? 1 : 0;
  return `%${abs.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};
const fmt = (bytes: number) => formatBytes(bytes, LOCALE);

function outputName(name: string) {
  return `${name.replace(/\.pdf$/i, "") || "belge"}-sikistirilmis.pdf`;
}

export default function PdfSikistir() {
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
    setStatus("Dosya kaldırıldı. Başlamak için başka bir PDF seçin.");
  };

  const pickFile = async (files: File[]) => {
    if (busy || files.length === 0) return;
    const file = files[0];
    clearResult();
    setStatus("");
    setErrors([]);
    setSelected(null);
    const problems: string[] = [];
    if (files.length > 1) problems.push("Aynı anda yalnızca bir PDF sıkıştırılabilir. İlk dosya kullanıldı.");
    if (file.size === 0) return setErrors([`${file.name}: dosya boş.`]);
    if (file.size > MAX_FILE_BYTES)
      return setErrors([`${file.name}: boyutu ${fmt(file.size)}, ${fmt(MAX_FILE_BYTES)} sınırını aşıyor.`]);
    setBusy(true);
    setProgress(`${file.name} okunuyor...`);
    try {
      const info = await inspectForCompression(new Uint8Array(await file.arrayBuffer()));
      if (!info.ok) {
        problems.push(
          info.reason === "encrypted"
            ? `${file.name}: bu PDF parola korumalı. Bu araç korumayı kaldıramaz; önce PDF'yi açtığınız uygulamadan korumayı kaldırın, sonra tekrar deneyin.`
            : info.reason === "invalid"
              ? `${file.name}: bu dosya bir PDF değil.`
              : `${file.name}: bu PDF okunamadı. Dosya bozuk olabilir.`,
        );
        return setErrors(problems);
      }
      setErrors(problems);
      setSelected({ file, pages: info.pages });
      setStatus("PDF hazır. Sıkıştırma düzeyini seçin ve “Sıkıştır” düğmesine tıklayın.");
    } catch {
      setErrors([`${file.name}: bu dosya okunamadı.`]);
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
          setProgress(stage === "images" || stage === "streams" ? `${STAGE_TEXT[stage]} (${Math.min(done + 1, total)} / ${total})...` : STAGE_TEXT[stage]);
          setPercent(stage === "images" && total > 0 ? Math.round((done / total) * 100) : null);
        },
      });
      original = null; // release the input buffer
      const smaller = bytes.length < file.size;
      const compressedUrl = smaller ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })) : null;
      const originalUrl = URL.createObjectURL(file);
      urls.current = [originalUrl, ...(compressedUrl ? [compressedUrl] : [])];
      setOutcome({ stats, compressedUrl, originalUrl, level });
      setStatus(smaller ? "Sıkıştırma tamamlandı." : "Sıkıştırma tamamlandı: bu PDF küçültülemedi.");
    } catch (error) {
      const reason = error instanceof CompressError ? error.reason : "other";
      setErrors([
        reason === "encrypted"
          ? "Bu PDF parola korumalı olduğu için sıkıştırılamaz."
          : reason === "invalid"
            ? "Bu dosya bir PDF değil."
            : reason === "corrupt"
              ? "Bu PDF okunamadı. Dosya bozuk olabilir."
              : reason === "verify"
                ? "Oluşan PDF doğrulamayı geçemediği için sunulmadı. Orijinal dosyanız değişmedi."
                : "PDF sıkıştırılamadı. Başka bir düzey veya daha küçük bir dosya deneyin.",
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
      notes.push(`Optimize edilen görseller: ${stats.imagesFound} içinden ${stats.imagesRecompressed}.`);
    else if (outcome.level !== "lossless" && stats.imagesFound > 0)
      notes.push("Güvenle küçültülebilecek JPEG görsel bulunamadı; diğer biçimlerdeki görsellere dokunulmadı.");
    if (stats.streamsCompressed > 0) notes.push(`Sıkıştırılan içerik blokları: ${stats.streamsCompressed}.`);
    if (stats.unusedObjectsRemoved > 0) notes.push(`Kullanılmayan veriler kaldırıldı: ${stats.unusedObjectsRemoved} nesne.`);
    if (stats.metadataRemoved) notes.push("Belge meta verileri kaldırıldı.");
    notes.push("PDF'nin dijital imzası varsa, sıkıştırılmış dosyada bu imza artık geçerli olmaz.");

    const downloadOriginal = (primary: boolean) => (
      <a className={primary ? "button button-download" : "button"} href={originalUrl} download={selected.file.name}>
        Orijinal Dosyayı Kaydet
      </a>
    );

    if (smaller) {
      return (
        <ResultPanel
          ariaLabel="Sonuç"
          tone="success"
          title="PDF sıkıştırıldı"
          summary={`Dosya boyutu ${formatPercent(change, LOCALE)} azaldı.`}
          fileName={outputName(selected.file.name)}
          details={[
            { label: "Orijinal boyut", value: fmt(original) },
            { label: "Sıkıştırılmış boyut", value: fmt(stats.size) },
            { label: "Azalma", value: formatPercent(change, LOCALE) },
            { label: "Sayfa", value: String(stats.pages) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={compressedUrl!} download={outputName(selected.file.name)}>
              PDF'yi İndir
            </a>
          }
          secondary={downloadOriginal(false)}
          resetLabel="Başka Bir Dosya Seç"
          onReset={reset}
        />
      );
    }
    return (
      <ResultPanel
        ariaLabel="Sonuç"
        tone="warning"
        title={larger ? "Sonuç daha büyük olacak" : "Bu PDF küçültülemedi"}
        summary={
          larger
            ? `İşlenen PDF ${fmt(stats.size)} olurdu; bu, orijinalinden (${fmt(original)}) ${formatPercent(-change, LOCALE)} daha büyük. Bu dosya indirmeye sunulmadı; orijinal dosyayı kullanmanız önerilir.`
            : `Boyut neredeyse hiç değişmedi (${fmt(original)} → ${fmt(stats.size)}). Dosya büyük olasılıkla zaten optimize edilmiş; orijinal dosyayı kullanmanız önerilir.`
        }
        details={[
          { label: "Orijinal boyut", value: fmt(original) },
          { label: "İşlenen dosya boyutu", value: fmt(stats.size) },
          { label: "Değişim", value: Math.abs(change) < 0.05 ? "Değişmedi" : `${change < 0 ? "+" : "−"}${formatPercent(change, LOCALE)}` },
          { label: "Sayfa", value: String(stats.pages) },
        ]}
        notes={outcome.level === "strong" ? notes.slice(0, -1) : [...notes.slice(0, -1), "Başka bir sıkıştırma düzeyi deneyin: sonuç PDF içeriğine bağlıdır."]}
        primary={downloadOriginal(true)}
        resetLabel="Başka Bir Dosya Seç"
        onReset={reset}
      />
    );
  };

  return (
    <div className="ic" lang="tr">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="PDF dosyanızı buraya sürükleyip bırakın"
        emptySub={`Sıkıştırmak için bir PDF seçin. En fazla ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={selected ? `${selected.pages} sayfa · ${fmt(selected.file.size)} · başka bir dosya seçebilirsiniz` : ""}
        buttonLabel="PDF Dosyası Seç"
        moreLabel="Başka Bir Dosya Seç"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="PDF dosyasını bırakma alanı"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Dosyanız cihazınızda işlenir ve hiçbir sunucuya gönderilmez.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="cp-level">Sıkıştırma düzeyi</label>
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
            Belge meta verilerini kaldır (başlık, yazar, oluşturan uygulama)
          </label>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={!selected || busy}>
          {busy ? "İşleniyor..." : "Sıkıştır"}
        </button>
      </form>
      <p className="ic-hint">
        {LEVELS.find((item) => item.id === level)?.hint} Sonuç PDF içeriğine bağlıdır ve belirli bir boyut azalması garanti edilmez.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "İşleniyor..." : status}
      </div>
      {busy && progress ? (
        <div className="ic-hint ic-progress">
          <span aria-hidden="true">{progress}</span>
          {percent !== null ? <progress value={percent} max={100} aria-label="Görsel işleme ilerlemesi" style={{ display: "block", width: "100%", marginTop: 6 }} /> : null}
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
