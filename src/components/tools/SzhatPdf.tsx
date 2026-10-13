import { useEffect, useRef, useState } from "react";
import { CompressError, compressPdf, inspectForCompression, savedPercent } from "../../lib/pdfCompress";
import type { CompressLevel, CompressStage, CompressStats } from "../../lib/pdfCompress";
import { recodeJpegInBrowser } from "../../lib/jpegRecode";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const LOCALE = "ru-RU";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Below this gain the result is reported as "no meaningful change" rather than a success. */
const MEANINGFUL_PERCENT = 1;

const LEVELS: { id: CompressLevel; label: string; hint: string }[] = [
  { id: "lossless", label: "Низкое сжатие", hint: "Перестраивает файл и сжимает его служебную структуру. Изображения не изменяются." },
  {
    id: "balanced",
    label: "Среднее сжатие (рекомендуется)",
    hint: "Дополнительно уменьшает JPEG-изображения: среднее или высокое качество, не более 2000 пикселей по большей стороне.",
  },
  {
    id: "strong",
    label: "Сильное сжатие",
    hint: "Уменьшает JPEG-изображения сильнее: среднее качество, не более 1400 пикселей по большей стороне. Потеря качества может быть заметна на фотографиях и сканах.",
  },
];

const STAGE_TEXT: Record<CompressStage, string> = {
  reading: "Чтение PDF…",
  images: "Оптимизация изображений",
  streams: "Сжатие содержимого",
  saving: "Сохранение нового PDF…",
  verifying: "Проверка читаемости результата…",
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

/** Russian-formatted percentage: one decimal below 10, e.g. "37 %" or "4,2 %". */
const formatPercent = (value: number) => {
  const abs = Math.abs(value);
  const digits = abs < 10 ? 1 : 0;
  return `${abs.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits })} %`;
};
const fmt = (bytes: number) => formatBytes(bytes, LOCALE);

const pagesWord = (n: number) => {
  const last = n % 10;
  const teen = n % 100 >= 11 && n % 100 <= 14;
  return last === 1 && !teen ? "страница" : last >= 2 && last <= 4 && !teen ? "страницы" : "страниц";
};

function outputName(name: string) {
  return `${name.replace(/\.pdf$/i, "") || "dokument"}-szhatyj.pdf`;
}

export default function SzhatPdf() {
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
    setStatus("Файл удалён. Выберите другой PDF-файл, чтобы начать заново.");
  };

  const pickFile = async (files: File[]) => {
    if (busy || files.length === 0) return;
    const file = files[0];
    clearResult();
    setStatus("");
    setErrors([]);
    setSelected(null);
    const problems: string[] = [];
    if (files.length > 1) problems.push("За один раз можно сжать только один PDF. Использован первый файл.");
    if (file.size === 0) return setErrors([`${file.name}: файл пустой.`]);
    if (file.size > MAX_FILE_BYTES)
      return setErrors([`${file.name}: ${fmt(file.size)} — превышает лимит ${fmt(MAX_FILE_BYTES)}.`]);
    setBusy(true);
    setProgress(`Чтение файла ${file.name}…`);
    try {
      const info = await inspectForCompression(new Uint8Array(await file.arrayBuffer()));
      if (!info.ok) {
        problems.push(
          info.reason === "encrypted"
            ? `${file.name}: этот PDF защищён паролем. Инструмент не может снять защиту: снимите её в программе, в которой вы открываете файл, и повторите попытку.`
            : info.reason === "invalid"
              ? `${file.name}: это не PDF-файл. Выберите корректный файл.`
              : `${file.name}: не удалось прочитать этот PDF. Возможно, файл повреждён.`,
        );
        return setErrors(problems);
      }
      setErrors(problems);
      setSelected({ file, pages: info.pages });
      setStatus("PDF готов. Выберите степень сжатия и нажмите «Сжать файл».");
    } catch {
      setErrors([`${file.name}: не удалось прочитать файл.`]);
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
          setProgress(stage === "images" || stage === "streams" ? `${STAGE_TEXT[stage]} (${Math.min(done + 1, total)} из ${total})…` : STAGE_TEXT[stage]);
          setPercent(stage === "images" && total > 0 ? Math.round((done / total) * 100) : null);
        },
      });
      original = null; // release the input buffer
      const smaller = bytes.length < file.size;
      const compressedUrl = smaller ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })) : null;
      const originalUrl = URL.createObjectURL(file);
      urls.current = [originalUrl, ...(compressedUrl ? [compressedUrl] : [])];
      setOutcome({ stats, compressedUrl, originalUrl, level });
      setStatus(smaller ? "Сжатие завершено." : "Сжатие завершено: уменьшить этот PDF не удалось.");
    } catch (error) {
      const reason = error instanceof CompressError ? error.reason : "other";
      setErrors([
        reason === "encrypted"
          ? "Этот PDF защищён паролем и не может быть сжат."
          : reason === "invalid"
            ? "Это не PDF-файл. Выберите корректный файл."
            : reason === "corrupt"
              ? "Не удалось прочитать этот PDF. Возможно, файл повреждён."
              : reason === "verify"
                ? "Созданный PDF не прошёл проверку, поэтому не предлагается для скачивания. Исходный файл не изменён."
                : "Не удалось обработать файл. Попробуйте другую степень сжатия или файл поменьше.",
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
      notes.push(`Оптимизировано изображений: ${stats.imagesRecompressed} из ${stats.imagesFound}.`);
    else if (outcome.level !== "lossless" && stats.imagesFound > 0)
      notes.push("Безопасно уменьшить JPEG-изображения не удалось; изображения в других форматах остаются без изменений.");
    if (stats.streamsCompressed > 0) notes.push(`Сжато блоков содержимого: ${stats.streamsCompressed}.`);
    if (stats.unusedObjectsRemoved > 0) notes.push(`Удалено неиспользуемых объектов: ${stats.unusedObjectsRemoved}.`);
    if (stats.metadataRemoved) notes.push("Метаданные документа удалены.");
    notes.push("Если PDF содержит цифровую подпись, в сжатом файле она перестанет быть действительной.");

    const downloadOriginal = (primary: boolean) => (
      <a className={primary ? "button button-download" : "button"} href={originalUrl} download={selected.file.name}>
        Скачать исходный файл
      </a>
    );

    if (smaller) {
      return (
        <ResultPanel
          ariaLabel="Результат"
          tone="success"
          title="Сжатие завершено"
          summary={`Размер файла уменьшился на ${formatPercent(change)}.`}
          fileName={outputName(selected.file.name)}
          details={[
            { label: "Исходный размер", value: fmt(original) },
            { label: "Размер после сжатия", value: fmt(stats.size) },
            { label: "Уменьшение", value: formatPercent(change) },
            { label: "Страницы", value: String(stats.pages) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={compressedUrl!} download={outputName(selected.file.name)}>
              Скачать PDF
            </a>
          }
          secondary={downloadOriginal(false)}
          resetLabel="Сжать другой PDF"
          onReset={reset}
        />
      );
    }
    return (
      <ResultPanel
        ariaLabel="Результат"
        tone="warning"
        title={larger ? "Результат получился бы больше" : "Уменьшить этот PDF не удалось"}
        summary={
          larger
            ? `Созданный PDF весил бы ${fmt(stats.size)} — на ${formatPercent(-change)} больше исходного (${fmt(original)}). Он не предлагается для скачивания: лучше оставить исходный файл.`
            : `Размер почти не изменился (${fmt(original)} → ${fmt(stats.size)}). Вероятно, файл уже оптимизирован: лучше оставить исходный файл.`
        }
        details={[
          { label: "Исходный размер", value: fmt(original) },
          { label: "Размер результата", value: fmt(stats.size) },
          { label: "Изменение", value: Math.abs(change) < 0.05 ? "Без изменений" : `${change < 0 ? "+" : "−"}${formatPercent(change)}` },
          { label: "Страницы", value: String(stats.pages) },
        ]}
        notes={outcome.level === "strong" ? notes.slice(0, -1) : [...notes.slice(0, -1), "Попробуйте другую степень сжатия: результат зависит от содержимого PDF."]}
        primary={downloadOriginal(true)}
        resetLabel="Попробовать другой PDF"
        onReset={reset}
      />
    );
  };

  return (
    <div className="ic" lang="ru">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Перетащите сюда PDF-файл"
        emptySub={`Выберите PDF для сжатия. Не более ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={selected ? `${selected.pages} ${pagesWord(selected.pages)} · ${fmt(selected.file.size)} · можно выбрать другой файл` : ""}
        buttonLabel="Выберите PDF-файл"
        moreLabel="Выбрать другой файл"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Область для перетаскивания PDF-файла"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Файл обрабатывается на вашем устройстве и не отправляется на сервер.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="sz-level">Степень сжатия</label>
          <select
            id="sz-level"
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
            Удалить метаданные документа (название, автор, программа, в которой создан файл)
          </label>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={!selected || busy}>
          {busy ? "Обработка…" : "Сжать файл"}
        </button>
      </form>
      <p className="ic-hint">
        {LEVELS.find((item) => item.id === level)?.hint} Результат зависит от содержимого PDF: конкретное уменьшение размера гарантировать нельзя.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Обработка…" : status}
      </div>
      {busy && progress ? (
        <div className="ic-hint ic-progress">
          <span aria-hidden="true">{progress}</span>
          {percent !== null ? <progress value={percent} max={100} aria-label="Ход обработки изображений" style={{ display: "block", width: "100%", marginTop: 6 }} /> : null}
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
