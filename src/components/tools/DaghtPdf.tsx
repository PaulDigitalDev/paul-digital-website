import { useEffect, useRef, useState } from "react";
import { CompressError, compressPdf, inspectForCompression, savedPercent } from "../../lib/pdfCompress";
import type { CompressLevel, CompressStage, CompressStats } from "../../lib/pdfCompress";
import { recodeJpegInBrowser } from "../../lib/jpegRecode";
import { AR_LOCALE, isolate, pagesText, percentText } from "../../lib/arabic";
import { formatBytes } from "../../lib/pdfMerge";
import { DocumentIcon, DropArea, ResultPanel } from "./shared";

const LOCALE = AR_LOCALE;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Below this gain the result is reported as "no meaningful change" rather than a success. */
const MEANINGFUL_PERCENT = 1;

const LEVELS: { id: CompressLevel; label: string; hint: string }[] = [
  { id: "lossless", label: "ضغط منخفض", hint: "يعيد بناء الملف ويضغط بنيته الداخلية. لا يتم تغيير الصور." },
  {
    id: "balanced",
    label: "ضغط متوسط (موصى به)",
    hint: "يقلّل أيضًا حجم صور JPEG بجودة متوسطة إلى عالية وبحد أقصى 2000 بكسل للبعد الأكبر.",
  },
  {
    id: "strong",
    label: "ضغط قوي",
    hint: "يقلّل صور JPEG بقوة أكبر: جودة متوسطة وبحد أقصى 1400 بكسل للبعد الأكبر. قد يظهر فقدان الجودة في الصور الفوتوغرافية والمستندات الممسوحة ضوئيًا.",
  },
];

const STAGE_TEXT: Record<CompressStage, string> = {
  reading: "جارٍ قراءة ملف PDF…",
  images: "تحسين الصور",
  streams: "ضغط المحتوى",
  saving: "جارٍ حفظ ملف PDF الجديد…",
  verifying: "جارٍ التحقق من إمكانية قراءة الناتج…",
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

const formatPercent = percentText;
const fmt = (bytes: number) => formatBytes(bytes, LOCALE);

function outputName(name: string) {
  return `${name.replace(/\.pdf$/i, "") || "dokument"}-daght.pdf`;
}

export default function DaghtPdf() {
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
    setStatus("تمت إزالة الملف. اختر ملف PDF آخر للبدء من جديد.");
  };

  const pickFile = async (files: File[]) => {
    if (busy || files.length === 0) return;
    const file = files[0];
    clearResult();
    setStatus("");
    setErrors([]);
    setSelected(null);
    const problems: string[] = [];
    if (files.length > 1) problems.push("يمكن ضغط ملف PDF واحد فقط في كل مرة. تم استخدام الملف الأول.");
    if (file.size === 0) return setErrors([`${isolate(file.name)}: الملف فارغ.`]);
    if (file.size > MAX_FILE_BYTES)
      return setErrors([`${isolate(file.name)}: حجمه ${fmt(file.size)} ويتجاوز الحد المسموح (${fmt(MAX_FILE_BYTES)}).`]);
    setBusy(true);
    setProgress(`جارٍ قراءة ${isolate(file.name)}…`);
    try {
      const info = await inspectForCompression(new Uint8Array(await file.arrayBuffer()));
      if (!info.ok) {
        problems.push(
          info.reason === "encrypted"
            ? `${isolate(file.name)}: ملف PDF هذا محمي بكلمة مرور. لا تستطيع الأداة إزالة الحماية؛ أزلها في البرنامج الذي تفتح به الملف ثم حاول مرة أخرى.`
            : info.reason === "invalid"
              ? `${isolate(file.name)}: هذا ليس ملف PDF صالحًا. اختر ملفًا صحيحًا.`
              : `${isolate(file.name)}: تعذّرت قراءة ملف PDF هذا. ربما يكون الملف تالفًا.`,
        );
        return setErrors(problems);
      }
      setErrors(problems);
      setSelected({ file, pages: info.pages });
      setStatus("الملف جاهز. اختر درجة الضغط ثم اضغط «ضغط الملف».");
    } catch {
      setErrors([`${isolate(file.name)}: تعذّرت قراءة الملف.`]);
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
          setProgress(stage === "images" || stage === "streams" ? `${STAGE_TEXT[stage]} (${Math.min(done + 1, total)} من ${total})…` : STAGE_TEXT[stage]);
          setPercent(stage === "images" && total > 0 ? Math.round((done / total) * 100) : null);
        },
      });
      original = null; // release the input buffer
      const smaller = bytes.length < file.size;
      const compressedUrl = smaller ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })) : null;
      const originalUrl = URL.createObjectURL(file);
      urls.current = [originalUrl, ...(compressedUrl ? [compressedUrl] : [])];
      setOutcome({ stats, compressedUrl, originalUrl, level });
      setStatus(smaller ? "اكتمل الضغط." : "اكتملت المعالجة: تعذّر تقليل حجم هذا الملف.");
    } catch (error) {
      const reason = error instanceof CompressError ? error.reason : "other";
      setErrors([
        reason === "encrypted"
          ? "ملف PDF هذا محمي بكلمة مرور ولا يمكن ضغطه."
          : reason === "invalid"
            ? "هذا ليس ملف PDF صالحًا. اختر ملفًا صحيحًا."
            : reason === "corrupt"
              ? "تعذّرت قراءة ملف PDF هذا. ربما يكون الملف تالفًا."
              : reason === "verify"
                ? "لم ينجح التحقق من ملف PDF الناتج، لذلك لا يُعرض للتنزيل. الملف الأصلي لم يتغير."
                : "تعذّرت معالجة الملف. جرّب درجة ضغط أخرى أو ملفًا أصغر.",
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
      notes.push(`الصور التي تم تحسينها: ${stats.imagesRecompressed} من ${stats.imagesFound}.`);
    else if (outcome.level !== "lossless" && stats.imagesFound > 0)
      notes.push("تعذّر تصغير صور JPEG بأمان؛ وتبقى الصور بالصيغ الأخرى دون تغيير.");
    if (stats.streamsCompressed > 0) notes.push(`كتل المحتوى المضغوطة: ${stats.streamsCompressed}.`);
    if (stats.unusedObjectsRemoved > 0) notes.push(`الكائنات غير المستخدمة التي أُزيلت: ${stats.unusedObjectsRemoved}.`);
    if (stats.metadataRemoved) notes.push("تمت إزالة بيانات المستند الوصفية.");
    notes.push("إذا كان ملف PDF يحتوي على توقيع رقمي، فلن يكون التوقيع صالحًا في الملف المضغوط.");

    const downloadOriginal = (primary: boolean) => (
      <a className={primary ? "button button-download" : "button"} href={originalUrl} download={selected.file.name}>
        تنزيل الملف الأصلي
      </a>
    );

    if (smaller) {
      return (
        <ResultPanel
          ariaLabel="النتيجة"
          tone="success"
          title="اكتمل الضغط"
          summary={`انخفض حجم الملف بنسبة ${formatPercent(change)}.`}
          fileName={outputName(selected.file.name)}
          details={[
            { label: "الحجم الأصلي", value: fmt(original) },
            { label: "الحجم بعد الضغط", value: fmt(stats.size) },
            { label: "نسبة التخفيض", value: formatPercent(change) },
            { label: "الصفحات", value: pagesText(stats.pages) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={compressedUrl!} download={outputName(selected.file.name)}>
              تنزيل ملف PDF
            </a>
          }
          secondary={downloadOriginal(false)}
          resetLabel="ضغط ملف PDF آخر"
          onReset={reset}
        />
      );
    }
    return (
      <ResultPanel
        ariaLabel="النتيجة"
        tone="warning"
        title={larger ? "سيكون الناتج أكبر حجمًا" : "تعذّر تقليل حجم هذا الملف"}
        summary={
          larger
            ? `كان حجم ملف PDF الناتج سيبلغ ${fmt(stats.size)}، أي أكبر من الأصلي (${fmt(original)}) بنسبة ${formatPercent(-change)}. لذلك لا يُعرض للتنزيل؛ الأفضل الاحتفاظ بالملف الأصلي.`
            : `لم يتغير الحجم تقريبًا (${fmt(original)} ← ${fmt(stats.size)}). غالبًا الملف محسَّن مسبقًا؛ الأفضل الاحتفاظ بالملف الأصلي.`
        }
        details={[
          { label: "الحجم الأصلي", value: fmt(original) },
          { label: "حجم الناتج", value: fmt(stats.size) },
          { label: "التغيّر", value: Math.abs(change) < 0.05 ? "بلا تغيير" : `${change < 0 ? "+" : "−"}${formatPercent(change)}` },
          { label: "الصفحات", value: pagesText(stats.pages) },
        ]}
        notes={outcome.level === "strong" ? notes.slice(0, -1) : [...notes.slice(0, -1), "جرّب درجة ضغط أخرى؛ فالنتيجة تعتمد على محتوى الملف."]}
        primary={downloadOriginal(true)}
        resetLabel="تجربة ملف PDF آخر"
        onReset={reset}
      />
    );
  };

  return (
    <div className="ic" lang="ar" dir="rtl">
      <DropArea
        icon={<DocumentIcon />}
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="اسحب ملف PDF وأفلته هنا"
        emptySub={`اختر ملف PDF لضغطه. الحد الأقصى ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={selected ? `${pagesText(selected.pages)} · ${fmt(selected.file.size)} · يمكنك اختيار ملف آخر` : ""}
        buttonLabel="اختيار ملف PDF"
        moreLabel="اختيار ملف آخر"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="منطقة سحب وإفلات ملف PDF"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">تتم معالجة الملف على جهازك ولا يتم إرساله إلى أي خادم.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="sz-level">درجة الضغط</label>
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
            إزالة البيانات الوصفية للمستند (العنوان والمؤلف والبرنامج الذي أُنشئ به الملف)
          </label>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={!selected || busy}>
          {busy ? "جارٍ المعالجة…" : "ضغط الملف"}
        </button>
      </form>
      <p className="ic-hint">
        {LEVELS.find((item) => item.id === level)?.hint} تعتمد النتيجة على محتوى الملف، ولا يمكن ضمان نسبة تخفيض محددة.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "جارٍ المعالجة…" : status}
      </div>
      {busy && progress ? (
        <div className="ic-hint ic-progress">
          <span aria-hidden="true">{progress}</span>
          {percent !== null ? <progress value={percent} max={100} aria-label="تقدّم معالجة الصور" style={{ display: "block", width: "100%", marginTop: 6 }} /> : null}
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
