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

const LOCALE = "ru-RU";
const WORDS = { one: "stranitsa", many: "stranitsy" };
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_PAGES = 1000;
const MAX_OUTPUT_FILES = 200;
const MAX_OUTPUT_BYTES = 500 * 1024 * 1024;
const MAX_CHIP_PAGES = 120;

type Mode = "ranges" | "single" | "all";

const MODES: { id: Mode; label: string; hint: string }[] = [
  {
    id: "single",
    label: "Извлечь выбранные страницы в один PDF",
    hint: "Собирает все выбранные страницы в один новый PDF.",
  },
  {
    id: "ranges",
    label: "Разделить по указанным диапазонам",
    hint: "Каждая часть, разделённая запятой (например, «1-3, 5, 8-10»), сохраняется как отдельный PDF.",
  },
  {
    id: "all",
    label: "Сохранить каждую страницу в отдельный PDF",
    hint: `Создаёт по одному PDF на каждую страницу (не более ${MAX_OUTPUT_FILES} страниц) и предлагает скачать их ZIP-архивом.`,
  },
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

const pagesWord = (n: number) => {
  const last = n % 10;
  const teen = n % 100 >= 11 && n % 100 <= 14;
  return last === 1 && !teen ? "страница" : last >= 2 && last <= 4 && !teen ? "страницы" : "страниц";
};
const count = (n: number) => `${n} ${pagesWord(n)}`;
const filesWord = (n: number) => {
  const last = n % 10;
  const teen = n % 100 >= 11 && n % 100 <= 14;
  return last === 1 && !teen ? "файл" : last >= 2 && last <= 4 && !teen ? "файла" : "файлов";
};

function rangeMessage(error: RangeError): string {
  switch (error.code) {
    case "empty":
      return "Укажите страницы, которые нужно извлечь, например «1-3, 5, 8-10».";
    case "syntax":
      return `«${error.token}» — неверная запись. Используйте числа через запятую и дефис для диапазонов, например «1-3, 5, 8-10».`;
    case "zero":
      return `«${error.token}»: первая страница документа имеет номер 1.`;
    case "reversed":
      return `«${error.token}»: диапазон записан в обратном порядке. Сначала укажите меньший номер, например «${error.token.split(/\s*[-–—]\s*/).reverse().join("-")}».`;
    case "outOfRange":
      return `«${error.token}» выходит за пределы документа: в нём всего ${count(error.total)}.`;
    case "duplicate":
      return `Страница ${error.token} указана несколько раз. Каждую страницу можно указать только один раз.`;
  }
}

export default function RazdelitPdf() {
  const fmt = (bytes: number) => formatBytes(bytes, LOCALE);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [mode, setMode] = useState<Mode>("single");
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
    setProgress(`Чтение файла ${file.name}…`);
    try {
      let problem = "";
      let pages = 0;
      if (file.size === 0) problem = `${file.name}: файл пустой.`;
      else if (file.size > MAX_FILE_BYTES) problem = `${file.name}: ${fmt(file.size)} — превышает лимит ${fmt(MAX_FILE_BYTES)}.`;
      else {
        const info = await inspectSourcePdf(new Uint8Array(await file.arrayBuffer()));
        if (!info.ok) {
          problem =
            info.reason === "encrypted"
              ? `${file.name}: этот PDF защищён паролем. Снимите защиту и повторите попытку.`
              : info.reason === "invalid"
                ? `${file.name}: это не PDF-файл. Выберите корректный файл.`
                : `${file.name}: не удалось прочитать этот PDF. Возможно, файл повреждён.`;
        } else if (info.pages === 0) problem = `${file.name}: в этом PDF нет страниц.`;
        else if (info.pages > MAX_PAGES) problem = `${file.name}: ${count(info.pages)} — превышает лимит ${MAX_PAGES} страниц.`;
        else pages = info.pages;
      }
      if (problem) {
        setErrors([problem]);
        return;
      }
      setSelected({ file, pages });
      setText("");
      setStatus(`Файл ${file.name} загружен: ${count(pages)}.`);
    } catch {
      setErrors([`${file.name}: не удалось прочитать файл.`]);
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
    setStatus("Файл удалён. Выберите другой PDF-файл, чтобы начать заново.");
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
        return setErrors([
          `Чтобы сохранить каждую страницу отдельно, в PDF должно быть не более ${MAX_OUTPUT_FILES} страниц; в этом файле их ${selected.pages}. Выберите диапазон страниц.`,
        ]);
      }
      groups = singlePageGroups(selected.pages);
    } else {
      const result = parsePageRanges(text, selected.pages, keepOrder);
      if (!result.ok) return setErrors([rangeMessage(result.error)]);
      groups = mode === "single" ? [combineGroups(result.groups)] : result.groups;
      if (groups.length > MAX_OUTPUT_FILES) return setErrors([`Эта операция создаст ${groups.length} файлов; максимум — ${MAX_OUTPUT_FILES}.`]);
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
        producer: "Paul Digital - Разделить PDF",
        onProgress: (done, total) => setProgress(done < total ? `Создание файла ${done + 1} из ${total}…` : "Завершение…"),
      });
      const base = baseName(selected.file.name, "dokument");
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
      setStatus(`Готово: создано файлов — ${made.length}.`);
    } catch (error) {
      setErrors([
        error instanceof Error && error.message === "output-too-large"
          ? `Результат превысит ${fmt(MAX_OUTPUT_BYTES)} и может исчерпать память устройства. Выберите меньше страниц.`
          : "Не удалось разделить PDF. Убедитесь, что файл не повреждён, или повторите попытку с меньшим числом страниц.",
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
      triggerDownload(url, `${baseName(selected?.file.name ?? "", "dokument")}_stranitsy.zip`);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setZipBusy(false);
    }
  };

  const modeHint = MODES.find((item) => item.id === mode)?.hint;
  const showError = attempted && rangeError ? rangeMessage(rangeError) : null;
  const totalOut = outputs.reduce((sum, output) => sum + output.blob.size, 0);

  return (
    <div className="ic" lang="ru">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Перетащите сюда PDF-файл"
        emptySub={`Выберите PDF для разделения. Не более ${fmt(MAX_FILE_BYTES)} и ${MAX_PAGES} страниц.`}
        filledSub={selected ? `${count(selected.pages)} · ${fmt(selected.file.size)} · можно выбрать другой файл` : ""}
        buttonLabel="Выберите PDF-файл"
        moreLabel="Выбрать другой файл"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Область для перетаскивания PDF-файла"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Файл обрабатывается на вашем устройстве и не отправляется на сервер. Исходный файл не изменяется.</p>

      {selected && (
        <form
          className="ic-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <p className="sp-total">
            Всего страниц в документе: <strong>{selected.pages}</strong>.
          </p>
          <fieldset className="sp-modes" disabled={busy}>
            <legend>Способ разделения</legend>
            {MODES.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="rz-mode"
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
                <label htmlFor="rz-ranges">Страницы или диапазоны</label>
                <input
                  id="rz-ranges"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="1-3, 5, 8-10"
                  value={text}
                  disabled={busy}
                  aria-invalid={showError ? true : undefined}
                  aria-describedby="rz-ranges-hint"
                  onChange={(event) => {
                    clearResult();
                    setErrors([]);
                    setText(event.target.value);
                  }}
                />
              </div>
              <p className="ic-hint" id="rz-ranges-hint">
                Разделяйте запятыми и используйте дефис для диапазонов. Нумерация начинается с 1 (первая страница); допустимые страницы: от 1 до {selected.pages}.
              </p>
              {selected.pages <= MAX_CHIP_PAGES && (
                <div className="sp-chips" role="group" aria-label="Выбор страниц">
                  {Array.from({ length: selected.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className="sp-chip"
                      aria-pressed={chosenPages.has(page)}
                      aria-label={`Страница ${page}`}
                      disabled={busy}
                      onClick={() => togglePage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
              <div className="ic-field">
                <label htmlFor="rz-order">Порядок страниц</label>
                <select
                  id="rz-order"
                  value={keepOrder ? "given" : "document"}
                  disabled={busy}
                  onChange={(event) => {
                    clearResult();
                    setKeepOrder(event.target.value === "given");
                  }}
                >
                  <option value="given">Сохранить порядок, указанный мной</option>
                  <option value="document">Расположить по порядку исходного документа</option>
                </select>
              </div>
            </>
          )}
          <button type="submit" className="button button-primary ic-submit" disabled={busy}>
            {busy ? "Обработка…" : "Разделить PDF"}
          </button>
        </form>
      )}
      {selected && <p className="ic-hint">{modeHint}</p>}

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Обработка…" : status}
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
          ariaLabel="Результат"
          tone="success"
          title={outputs.length === 1 ? "PDF создан" : "PDF успешно разделён"}
          details={[
            { label: "Файлов", value: String(outputs.length) },
            { label: "Извлечено страниц", value: String(outputs.reduce((sum, output) => sum + output.pages, 0)) },
            { label: "Общий размер", value: fmt(totalOut) },
            { label: "Исходный документ", value: count(selected.pages) },
          ]}
          primary={
            outputs.length === 1 ? (
              <a className="button button-download" href={outputs[0].url} download={outputs[0].name}>
                Скачать PDF
              </a>
            ) : (
              <button type="button" className="button button-download" onClick={() => void downloadZip()} disabled={zipBusy}>
                {zipBusy ? "Подготовка ZIP…" : `Скачать всё ZIP-архивом (${outputs.length} ${filesWord(outputs.length)})`}
              </button>
            )
          }
          resetLabel="Выбрать другой файл"
          onReset={reset}
        >
          {outputs.length > 1 && (
            <ul className="sp-files" aria-label="Созданные файлы">
              {outputs.map((output) => (
                <li key={output.name}>
                  <span>
                    {output.name} <small>{count(output.pages)} · {fmt(output.blob.size)}</small>
                  </span>
                  <a href={output.url} download={output.name} aria-label={`Скачать файл ${output.name}`}>
                    Скачать
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
