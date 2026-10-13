import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

// Kept in sync with MAX_FILE_BYTES / MAX_PAGES in lib/docxToPdf. The converter is imported lazily,
// so these are repeated here to validate the file before any conversion code is downloaded.
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_PAGES = 300;
const fmt = (bytes: number) => formatBytes(bytes, "ru-RU");

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
      return `${fileName}: это не корректный документ .docx. Выберите корректный файл.`;
    case "legacy":
      return `${fileName}: это старый файл Word (.doc) или файл, защищённый паролем. Откройте его в Word, снимите пароль и сохраните как .docx.`;
    case "encrypted":
      return `${fileName}: файл защищён паролем. Снимите защиту и повторите попытку.`;
    case "corrupt":
      return `${fileName}: файл повреждён и не читается. Откройте его в Word и сохраните заново как .docx.`;
    case "too-large":
      return `${fileName}: документ слишком большой для обработки в браузере (лимит: ${MAX_PAGES} страниц и разумный объём содержимого). Разделите его на части.`;
    case "unsupported":
      return `${fileName}: документ использует сжатие или функции, которые браузер не поддерживает.`;
    case "empty":
      return `${fileName}: в документе не найдено текста или изображений для преобразования.`;
    default:
      return `${fileName}: не удалось обработать файл. Повторите попытку или выберите файл поменьше.`;
  }
};

const noticeText: Record<string, string> = {
  headerFooter: "Колонтитулы и номера страниц не сохраняются.",
  footnotes: "Сноски и концевые сноски не сохраняются.",
  textbox: "Текстовые надписи не сохраняются.",
  shape: "Фигуры, векторные рисунки и встроенные объекты не сохраняются.",
  chart: "Диаграммы не сохраняются.",
  equation: "Формулы не сохраняются.",
  anchoredImage: "Изображения со свободным положением вставляются в поток текста, поэтому их положение может измениться.",
  unsupportedImage: "Некоторые изображения в неподдерживаемом формате были пропущены.",
  replacedChars: "Часть символов отсутствует в шрифте PDF (эмодзи, нестандартные алфавиты…) и была заменена знаком «?».",
};

// Liberation Sans (Latin + Cyrillic) is fetched only when the document contains characters the standard PDF fonts cannot draw.
const loadUnicodeFonts = async (): Promise<[Uint8Array, Uint8Array, Uint8Array, Uint8Array]> => {
  const data = await Promise.all(
    ["Regular", "Bold", "Italic", "BoldItalic"].map(async (name) => {
      const response = await fetch(`/vendor/fonts/LiberationSans-${name}.ttf`);
      if (!response.ok) throw new Error("font");
      return new Uint8Array(await response.arrayBuffer());
    }),
  );
  return data as [Uint8Array, Uint8Array, Uint8Array, Uint8Array];
};

export default function WordVPdf() {
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
    setStatus("Файл удалён. Выберите другой документ, чтобы начать заново.");
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (/\.doc$/i.test(selected.name)) return setError(errorMessage("legacy", selected.name));
    if (!/\.docx$/i.test(selected.name))
      return setError(`${selected.name}: поддерживаются только файлы Word в формате .docx. Выберите корректный файл.`);
    if (selected.size === 0) return setError(`${selected.name}: файл пустой.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: ${fmt(selected.size)} — превышает лимит ${fmt(MAX_FILE_BYTES)}.`);

    setFile(selected);
    runningRef.current = true;
    setBusy(true);
    try {
      setProgress("Подготовка конвертера…");
      const { convertDocxToPdf } = await import("../../lib/docxToPdf");
      const bytes = new Uint8Array(await selected.arrayBuffer());
      const out = await convertDocxToPdf(
        bytes,
        selected.name,
        (p) => {
          if (p.stage === "reading") setProgress("Чтение документа…");
          else if (p.stage === "saving") setProgress("Создание PDF…");
          else setProgress(`Вёрстка документа… ${Math.round((p.done / Math.max(1, p.total)) * 100)}%`);
        },
        { loadUnicodeFonts },
      );
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
      setStatus("Преобразование завершено.");
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
        "В PDF используется шрифт Liberation Sans или стандартные шрифты вместо шрифтов документа, поэтому переносы строк и страниц могут отличаться от Word. Проверьте PDF, прежде чем делиться им.",
      ]
    : [];

  return (
    <div className="ic" lang="ru">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Перетащите сюда файл Word (.docx)"
        emptySub={`Выберите документ .docx для преобразования в PDF. Не более ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Выберите файл Word"
        moreLabel="Выбрать другой файл"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple={false}
        busy={busy}
        ariaLabel="Область для перетаскивания файла Word"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Файл обрабатывается на вашем устройстве и не отправляется на сервер. Преобразование приблизительное: текст, базовое
        форматирование, списки, таблицы и изображения в потоке текста сохраняются, но вёрстка может отличаться от Word.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Обработка…" : status}
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
          ariaLabel="Результат"
          tone={result.notices.length > 0 ? "warning" : "success"}
          title="Преобразование завершено"
          fileName={result.name}
          details={[
            { label: "Формат", value: "PDF" },
            { label: "Размер", value: fmt(result.size) },
            { label: "Страницы", value: String(result.pages) },
            { label: "Таблицы", value: String(result.tables) },
            { label: "Изображения", value: String(result.images) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Скачать PDF
            </a>
          }
          resetLabel="Преобразовать другой документ"
          onReset={reset}
        />
      )}
    </div>
  );
}
