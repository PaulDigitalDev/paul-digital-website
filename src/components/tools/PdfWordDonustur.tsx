import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fmt = (bytes: number) => formatBytes(bytes, "tr");

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
        return `${fileName}: bu dosya bir PDF değil.`;
      case "encrypted":
        return `${fileName}: bu PDF parola korumalı. Korumayı kaldırıp tekrar deneyin.`;
      case "no-text":
        return `${fileName}: bu PDF içinde seçilebilir metin bulunamadı. Taranmış bir belge (sayfa görüntüsü) gibi görünüyor. Bu sürüm OCR desteklemez ve yalnızca metin içeren PDF dosyalarını dönüştürebilir.`;
      case "too-many-pages":
        return `${fileName}: bu PDF ${MAX_PAGES} sayfadan fazla; bu aracın sınırını aşıyor.`;
      default:
        return `${fileName}: bu PDF okunamadı. Dosya bozuk olabilir veya desteklenmeyen bir biçim kullanıyor olabilir.`;
    }
  }
  return "PDF dönüştürülemedi. Tekrar deneyin veya daha küçük bir dosya kullanın.";
};

export default function PdfWordDonustur() {
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
    setStatus("Dosya kaldırıldı. Başlamak için başka bir PDF seçin.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "PDF açılıyor…";
    if (p.stage === "building") return "Word belgesi oluşturuluyor…";
    return `Metin çıkarılıyor: sayfa ${p.page} / ${p.pages}…`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (selected.size === 0) return setError(`${selected.name}: dosya boş.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${selected.name}: bu dosya bir PDF değil.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: boyutu ${fmt(selected.size)}, ${fmt(MAX_FILE_BYTES)} sınırını aşıyor.`);

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
      setStatus("Dönüştürme tamamlandı");
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
          ? [
              `${result.pagesWithoutText} sayfada seçilebilir metin yok (muhtemelen taranmış) ve belgeye eklenmedi. Bu sürüm OCR desteklemez.`,
            ]
          : []),
        "Tablolar, sütunlar, görseller, yazı tipleri ve birebir sayfa düzeni korunmayabilir. Kullanmadan önce belgeyi Word'de kontrol edin.",
      ]
    : [];

  return (
    <div className="ic" lang="tr">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="PDF dosyanızı buraya sürükleyip bırakın"
        emptySub={`Word'e dönüştürmek için metin içeren bir PDF seçin. En fazla ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="PDF Dosyası Seç"
        moreLabel="Başka Bir Dosya Seç"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="PDF dosyasını bırakma alanı"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Dosyanız cihazınızda işlenir ve hiçbir sunucuya gönderilmez. Bu araç, seçilebilir metin içeren PDF
        dosyalarıyla çalışır; taranmış (görüntü) PDF dosyaları bu sürümde desteklenmez.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "PDF dönüştürülüyor…" : status}
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
          ariaLabel="Sonuç"
          tone={result.pagesWithoutText > 0 ? "warning" : "success"}
          title="Dönüştürme tamamlandı"
          fileName={result.name}
          details={[
            { label: "Biçim", value: "DOCX (Word)" },
            { label: "Dosya boyutu", value: fmt(result.size) },
            { label: "Okunan sayfa", value: String(result.pages - result.pagesWithoutText) },
            { label: "Başlık", value: String(result.headings) },
            { label: "Paragraf", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Word Dosyasını İndir
            </a>
          }
          resetLabel="Başka Bir Dosya Seç"
          onReset={reset}
        />
      )}
    </div>
  );
}
