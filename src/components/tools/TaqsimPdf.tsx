import { useEffect, useMemo, useRef, useState } from "react";
import { AR_LOCALE, filesText, isolate, normalizeRangeInput, pagesText } from "../../lib/arabic";
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
import { DocumentIcon, DropArea, ResultPanel, triggerDownload, uniqueName } from "./shared";

const LOCALE = AR_LOCALE;
const WORDS = { one: "safha", many: "safahat" };
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_PAGES = 1000;
const MAX_OUTPUT_FILES = 200;
const MAX_OUTPUT_BYTES = 500 * 1024 * 1024;
const MAX_CHIP_PAGES = 120;

type Mode = "ranges" | "single" | "all";

const MODES: { id: Mode; label: string; hint: string }[] = [
  {
    id: "single",
    label: "استخراج الصفحات المختارة في ملف PDF واحد",
    hint: "يجمع كل الصفحات المختارة في ملف PDF جديد واحد.",
  },
  {
    id: "ranges",
    label: "التقسيم بحسب النطاقات المحددة",
    hint: "يُحفظ كل جزء مفصول بفاصلة (مثل «1-3, 5, 8-10») في ملف PDF مستقل.",
  },
  {
    id: "all",
    label: "حفظ كل صفحة في ملف PDF مستقل",
    hint: `ينشئ ملف PDF لكل صفحة (حتى ${MAX_OUTPUT_FILES} صفحة) ويتيح تنزيلها في أرشيف ZIP.`,
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

const count = pagesText;
const filesWord = filesText;

function rangeMessage(error: RangeError): string {
  switch (error.code) {
    case "empty":
      return "أدخل الصفحات المراد استخراجها، مثل «1-3, 5, 8-10».";
    case "syntax":
      return `«${isolate(error.token)}» صيغة غير صحيحة. استخدم أرقامًا تفصل بينها فواصل وشرطة للنطاقات، مثل «1-3, 5, 8-10».`;
    case "zero":
      return `«${isolate(error.token)}»: رقم الصفحة الأولى في المستند هو 1.`;
    case "reversed":
      return `«${isolate(error.token)}»: النطاق مكتوب بترتيب معكوس. اكتب الرقم الأصغر أولًا، مثل «${isolate(error.token.split(/\s*[-–—]\s*/).reverse().join("-"))}».`;
    case "outOfRange":
      return `«${isolate(error.token)}» خارج حدود المستند: عدد صفحاته ${count(error.total)} فقط.`;
    case "duplicate":
      return `الصفحة ${isolate(error.token)} مذكورة أكثر من مرة. يمكن ذكر كل صفحة مرة واحدة فقط.`;
  }
}

export default function TaqsimPdf() {
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
    () => (selected && mode !== "all" ? parsePageRanges(normalizeRangeInput(text), selected.pages, keepOrder) : null),
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
    setProgress(`جارٍ قراءة ${isolate(file.name)}…`);
    try {
      let problem = "";
      let pages = 0;
      if (file.size === 0) problem = `${isolate(file.name)}: الملف فارغ.`;
      else if (file.size > MAX_FILE_BYTES) problem = `${isolate(file.name)}: حجمه ${fmt(file.size)} ويتجاوز الحد المسموح (${fmt(MAX_FILE_BYTES)}).`;
      else {
        const info = await inspectSourcePdf(new Uint8Array(await file.arrayBuffer()));
        if (!info.ok) {
          problem =
            info.reason === "encrypted"
              ? `${isolate(file.name)}: ملف PDF هذا محمي بكلمة مرور. أزل الحماية ثم حاول مرة أخرى.`
              : info.reason === "invalid"
                ? `${isolate(file.name)}: هذا ليس ملف PDF صالحًا. اختر ملفًا صحيحًا.`
                : `${isolate(file.name)}: تعذّرت قراءة ملف PDF هذا. ربما يكون الملف تالفًا.`;
        } else if (info.pages === 0) problem = `${isolate(file.name)}: لا يحتوي ملف PDF هذا على صفحات.`;
        else if (info.pages > MAX_PAGES) problem = `${isolate(file.name)}: ${count(info.pages)} وهو يتجاوز الحد المسموح (${MAX_PAGES} صفحة).`;
        else pages = info.pages;
      }
      if (problem) {
        setErrors([problem]);
        return;
      }
      setSelected({ file, pages });
      setText("");
      setStatus(`تم تحميل ${isolate(file.name)}: ${count(pages)}.`);
    } catch {
      setErrors([`${isolate(file.name)}: تعذّرت قراءة الملف.`]);
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
    setStatus("تمت إزالة الملف. اختر ملف PDF آخر للبدء من جديد.");
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
          `لحفظ كل صفحة على حدة يجب ألا يزيد عدد صفحات الملف على ${MAX_OUTPUT_FILES}؛ وهذا الملف يحتوي على ${selected.pages}. اختر نطاقًا من الصفحات.`,
        ]);
      }
      groups = singlePageGroups(selected.pages);
    } else {
      const result = parsePageRanges(normalizeRangeInput(text), selected.pages, keepOrder);
      if (!result.ok) return setErrors([rangeMessage(result.error)]);
      groups = mode === "single" ? [combineGroups(result.groups)] : result.groups;
      if (groups.length > MAX_OUTPUT_FILES) return setErrors([`ستنشئ هذه العملية ${groups.length} ملفًا، والحد الأقصى ${MAX_OUTPUT_FILES}.`]);
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
        producer: "Paul Digital - تقسيم PDF",
        onProgress: (done, total) => setProgress(done < total ? `جارٍ إنشاء الملف ${done + 1} من ${total}…` : "جارٍ الإنهاء…"),
      });
      const base = baseName(selected.file.name, "mustanad");
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
      setStatus(`تم: عدد الملفات التي أُنشئت ${made.length}.`);
    } catch (error) {
      setErrors([
        error instanceof Error && error.message === "output-too-large"
          ? `سيتجاوز الناتج ${fmt(MAX_OUTPUT_BYTES)} وقد يستنفد ذاكرة الجهاز. اختر عددًا أقل من الصفحات.`
          : "تعذّر تقسيم ملف PDF. تأكد من أن الملف غير تالف أو أعد المحاولة بعدد أقل من الصفحات.",
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
      triggerDownload(url, `${baseName(selected?.file.name ?? "", "mustanad")}_safahat.zip`);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setZipBusy(false);
    }
  };

  const modeHint = MODES.find((item) => item.id === mode)?.hint;
  const showError = attempted && rangeError ? rangeMessage(rangeError) : null;
  const totalOut = outputs.reduce((sum, output) => sum + output.blob.size, 0);

  return (
    <div className="ic" lang="ar" dir="rtl">
      <DropArea
        icon={<DocumentIcon />}
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="اسحب ملف PDF وأفلته هنا"
        emptySub={`اختر ملف PDF لتقسيمه. الحد الأقصى ${fmt(MAX_FILE_BYTES)} و${MAX_PAGES} صفحة.`}
        filledSub={selected ? `${count(selected.pages)} · ${fmt(selected.file.size)} · يمكنك اختيار ملف آخر` : ""}
        buttonLabel="اختيار ملف PDF"
        moreLabel="اختيار ملف آخر"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="منطقة سحب وإفلات ملف PDF"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">تتم معالجة الملف على جهازك ولا يتم إرساله إلى أي خادم. الملف الأصلي لا يتغير.</p>

      {selected && (
        <form
          className="ic-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <p className="sp-total">
            إجمالي عدد صفحات المستند: <strong>{selected.pages}</strong>.
          </p>
          <fieldset className="sp-modes" disabled={busy}>
            <legend>طريقة التقسيم</legend>
            {MODES.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="tq-mode"
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
                <label htmlFor="tq-ranges">الصفحات أو النطاقات</label>
                <input
                  id="tq-ranges"
                  type="text"
                  dir="ltr"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="1-3, 5, 8-10"
                  value={text}
                  disabled={busy}
                  aria-invalid={showError ? true : undefined}
                  aria-describedby="tq-ranges-hint"
                  onChange={(event) => {
                    clearResult();
                    setErrors([]);
                    setText(event.target.value);
                  }}
                />
              </div>
              <p className="ic-hint" id="tq-ranges-hint">
                افصل بين الأرقام بفواصل واستخدم الشرطة للنطاقات. يبدأ الترقيم من 1 (الصفحة الأولى)، والصفحات المسموح بها من 1 إلى {selected.pages}.
              </p>
              {selected.pages <= MAX_CHIP_PAGES && (
                <div className="sp-chips" role="group" aria-label="اختيار الصفحات">
                  {Array.from({ length: selected.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className="sp-chip"
                      aria-pressed={chosenPages.has(page)}
                      aria-label={`الصفحة ${page}`}
                      disabled={busy}
                      onClick={() => togglePage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
              <div className="ic-field">
                <label htmlFor="tq-order">ترتيب الصفحات</label>
                <select
                  id="tq-order"
                  value={keepOrder ? "given" : "document"}
                  disabled={busy}
                  onChange={(event) => {
                    clearResult();
                    setKeepOrder(event.target.value === "given");
                  }}
                >
                  <option value="given">الاحتفاظ بالترتيب الذي كتبته</option>
                  <option value="document">الترتيب بحسب المستند الأصلي</option>
                </select>
              </div>
            </>
          )}
          <button type="submit" className="button button-primary ic-submit" disabled={busy}>
            {busy ? "جارٍ المعالجة…" : "تقسيم PDF"}
          </button>
        </form>
      )}
      {selected && <p className="ic-hint">{modeHint}</p>}

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "جارٍ المعالجة…" : status}
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
          ariaLabel="النتيجة"
          tone="success"
          title={outputs.length === 1 ? "تم إنشاء ملف PDF" : "تم تقسيم ملف PDF بنجاح"}
          details={[
            { label: "الملفات", value: String(outputs.length) },
            { label: "الصفحات المستخرجة", value: String(outputs.reduce((sum, output) => sum + output.pages, 0)) },
            { label: "الحجم الإجمالي", value: fmt(totalOut) },
            { label: "المستند الأصلي", value: count(selected.pages) },
          ]}
          primary={
            outputs.length === 1 ? (
              <a className="button button-download" href={outputs[0].url} download={outputs[0].name}>
                تنزيل ملف PDF
              </a>
            ) : (
              <button type="button" className="button button-download" onClick={() => void downloadZip()} disabled={zipBusy}>
                {zipBusy ? "جارٍ تجهيز ZIP…" : `تنزيل الكل في أرشيف ZIP (${filesWord(outputs.length)})`}
              </button>
            )
          }
          resetLabel="اختيار ملف آخر"
          onReset={reset}
        >
          {outputs.length > 1 && (
            <ul className="sp-files" aria-label="الملفات المنشأة">
              {outputs.map((output) => (
                <li key={output.name}>
                  <span>
                    {output.name} <small>{count(output.pages)} · {fmt(output.blob.size)}</small>
                  </span>
                  <a href={output.url} download={output.name} aria-label={`تنزيل الملف ${output.name}`}>
                    تنزيل
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
