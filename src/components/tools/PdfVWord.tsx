import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fmt = (bytes: number) => formatBytes(bytes, "ru-RU");

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
        return `${fileName}: это не PDF-файл. Выберите корректный файл.`;
      case "encrypted":
        return `${fileName}: этот PDF защищён паролем. Снимите защиту и повторите попытку.`;
      case "no-text":
        return `${fileName}: в этом PDF не найден выделяемый текст. Вероятно, это скан (страницы в виде изображений). Распознавание текста (OCR) не поддерживается: можно преобразовать только PDF с настоящим текстовым слоем.`;
      case "too-many-pages":
        return `${fileName}: в этом PDF больше ${MAX_PAGES} страниц — это превышает лимит инструмента.`;
      default:
        return `${fileName}: не удалось прочитать этот PDF. Возможно, файл повреждён или не поддерживается.`;
    }
  }
  return "Не удалось обработать файл. Повторите попытку или выберите файл поменьше.";
};

export default function PdfVWord() {
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
    setStatus("Файл удалён. Выберите другой PDF-файл, чтобы начать заново.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "Открытие PDF…";
    if (p.stage === "building") return "Создание документа Word…";
    return `Извлечение текста: страница ${p.page} из ${p.pages}…`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (selected.size === 0) return setError(`${selected.name}: файл пустой.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${selected.name}: это не PDF-файл. Выберите корректный файл.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: ${fmt(selected.size)} — превышает лимит ${fmt(MAX_FILE_BYTES)}.`);

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
      setStatus("Преобразование завершено.");
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
          ? [`Страниц без выделяемого текста (вероятно, сканов): ${result.pagesWithoutText}. Они не вошли в документ, так как OCR не поддерживается.`]
          : []),
        "Таблицы, колонки, изображения и исходная вёрстка не обязательно сохраняются. Проверьте документ в Word перед использованием.",
      ]
    : [];

  return (
    <div className="ic" lang="ru">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Перетащите сюда PDF-файл"
        emptySub={`Выберите PDF с текстом для преобразования в Word. Не более ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Выберите PDF-файл"
        moreLabel="Выбрать другой файл"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Область для перетаскивания PDF-файла"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Файл обрабатывается на вашем устройстве и не отправляется на сервер. Инструмент работает с PDF, содержащими
        выделяемый текст; сканы (изображения) не поддерживаются.
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
          tone={result.pagesWithoutText > 0 ? "warning" : "success"}
          title="Преобразование завершено"
          fileName={result.name}
          details={[
            { label: "Формат", value: "DOCX (Word)" },
            { label: "Размер", value: fmt(result.size) },
            { label: "Прочитано страниц", value: String(result.pages - result.pagesWithoutText) },
            { label: "Заголовки", value: String(result.headings) },
            { label: "Абзацы", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Скачать файл Word
            </a>
          }
          resetLabel="Преобразовать другой PDF"
          onReset={reset}
        />
      )}
    </div>
  );
}
