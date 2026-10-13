import { useEffect, useRef, useState } from "react";
import { AR_LOCALE, isolate, pagesText } from "../../lib/arabic";
import { formatBytes } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DocumentIcon, DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fmt = (bytes: number) => formatBytes(bytes, AR_LOCALE);

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
  const name = isolate(fileName);
  if (error instanceof PdfToWordError) {
    switch (error.code) {
      case "invalid":
        return `${name}: هذا ليس ملف PDF صالحًا. اختر ملفًا صحيحًا.`;
      case "encrypted":
        return `${name}: ملف PDF هذا محمي بكلمة مرور. أزل الحماية ثم حاول مرة أخرى.`;
      case "no-text":
        return `${name}: لم يتم العثور على نص قابل للتحديد في هذا الملف. غالبًا هو مستند ممسوح ضوئيًا (صفحات على شكل صور). التعرّف الضوئي على الحروف (OCR) غير مدعوم، ولا يمكن تحويل إلا ملفات PDF التي تحتوي على طبقة نصية حقيقية.`;
      case "too-many-pages":
        return `${name}: يحتوي هذا الملف على أكثر من ${MAX_PAGES} صفحة، وهو ما يتجاوز حد الأداة.`;
      default:
        return `${name}: تعذّرت قراءة ملف PDF هذا. ربما يكون الملف تالفًا أو غير مدعوم.`;
    }
  }
  return "تعذّرت معالجة الملف. حاول مرة أخرى أو اختر ملفًا أصغر.";
};

export default function PdfIlaWord() {
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
    setStatus("تمت إزالة الملف. اختر ملف PDF آخر للبدء من جديد.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "جارٍ فتح ملف PDF…";
    if (p.stage === "building") return "جارٍ إنشاء مستند Word…";
    return `جارٍ استخراج النص: الصفحة ${p.page} من ${p.pages}…`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    const name = isolate(selected.name);
    if (selected.size === 0) return setError(`${name}: الملف فارغ.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${name}: هذا ليس ملف PDF صالحًا. اختر ملفًا صحيحًا.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${name}: حجمه ${fmt(selected.size)} ويتجاوز الحد المسموح (${fmt(MAX_FILE_BYTES)}).`);

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
      setStatus("اكتمل التحويل.");
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
          ? [`عدد الصفحات التي لا تحتوي على نص قابل للتحديد (غالبًا ممسوحة ضوئيًا): ${result.pagesWithoutText}. لم تُضف إلى المستند لأن OCR غير مدعوم.`]
          : []),
        "قد لا تُحفظ الجداول والأعمدة والصور والتنسيق الأصلي. راجع المستند في Word قبل استخدامه، وتحقق خصوصًا من ترتيب الكلمات العربية والأرقام.",
      ]
    : [];

  return (
    <div className="ic" lang="ar" dir="rtl">
      <DropArea
        icon={<DocumentIcon />}
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="اسحب ملف PDF وأفلته هنا"
        emptySub={`اختر ملف PDF يحتوي على نص لتحويله إلى Word. الحد الأقصى ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="اختيار ملف PDF"
        moreLabel="اختيار ملف آخر"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="منطقة سحب وإفلات ملف PDF"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        تتم معالجة الملف على جهازك ولا يتم إرساله إلى أي خادم. تعمل الأداة مع ملفات PDF التي تحتوي على نص قابل للتحديد؛ أما
        المستندات الممسوحة ضوئيًا (الصور) فتحتاج إلى OCR وهو غير مدعوم هنا.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "جارٍ المعالجة…" : status}
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
          ariaLabel="النتيجة"
          tone={result.pagesWithoutText > 0 ? "warning" : "success"}
          title="اكتمل التحويل"
          fileName={result.name}
          details={[
            { label: "الصيغة", value: "DOCX (Word)" },
            { label: "الحجم", value: fmt(result.size) },
            { label: "الصفحات المقروءة", value: pagesText(result.pages - result.pagesWithoutText) },
            { label: "العناوين", value: String(result.headings) },
            { label: "الفقرات", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              تنزيل ملف Word
            </a>
          }
          resetLabel="تحويل ملف PDF آخر"
          onReset={reset}
        />
      )}
    </div>
  );
}
