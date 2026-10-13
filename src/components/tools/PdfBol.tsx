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

const LOCALE = "tr";
const WORDS = { one: "sayfa", many: "sayfalar" };
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_PAGES = 1000;
const MAX_OUTPUT_FILES = 200;
const MAX_OUTPUT_BYTES = 500 * 1024 * 1024;
const MAX_CHIP_PAGES = 120;

type Mode = "ranges" | "single" | "all";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "ranges", label: "Her aralık için ayrı bir PDF", hint: "Virgülle ayrılmış her bölüm (örneğin “1-3, 5, 8-10”) ayrı bir PDF olarak kaydedilir." },
  { id: "single", label: "Seçilen sayfalar tek bir PDF'de", hint: "Seçtiğiniz tüm sayfaları yeni tek bir PDF'de toplar." },
  { id: "all", label: "Her sayfa ayrı bir PDF olsun", hint: `Sayfa başına bir PDF oluşturur (en fazla ${MAX_OUTPUT_FILES} sayfa) ve bunları ZIP olarak da sunar.` },
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

const count = (n: number, word: string) => `${n} ${word}`;

function rangeMessage(error: RangeError): string {
  switch (error.code) {
    case "empty":
      return "Almak istediğiniz sayfaları yazın, örneğin “1-3, 5, 8-10”.";
    case "syntax":
      return `“${error.token}” geçersiz. Virgülle ayrılmış sayılar ve aralıklar için tire kullanın, örneğin “1-3, 5, 8-10”.`;
    case "zero":
      return `“${error.token}”: belgenin ilk sayfası 1. sayfadır.`;
    case "reversed":
      return `“${error.token}”: aralık ters yazılmış. Küçük sayfa numarasını önce yazın, örneğin “${error.token.split(/\s*[-–—]\s*/).reverse().join("-")}”.`;
    case "outOfRange":
      return `“${error.token}” belgenin kapsamını aşıyor; belgede yalnızca ${count(error.total, "sayfa")} var.`;
    case "duplicate":
      return `${error.token}. sayfa birden fazla kez geçiyor. Her sayfa yalnızca bir kez belirtilebilir.`;
  }
}

export default function PdfBol() {
  const fmt = (bytes: number) => formatBytes(bytes, LOCALE);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [mode, setMode] = useState<Mode>("ranges");
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
    setProgress(`${file.name} okunuyor…`);
    try {
      let problem = "";
      let pages = 0;
      if (file.size === 0) problem = `${file.name}: dosya boş.`;
      else if (file.size > MAX_FILE_BYTES) problem = `${file.name}: boyutu ${fmt(file.size)}, ${fmt(MAX_FILE_BYTES)} sınırını aşıyor.`;
      else {
        const info = await inspectSourcePdf(new Uint8Array(await file.arrayBuffer()));
        if (!info.ok) {
          problem =
            info.reason === "encrypted"
              ? `${file.name}: bu PDF parola korumalı. Korumayı kaldırıp tekrar deneyin.`
              : info.reason === "invalid"
                ? `${file.name}: bu dosya bir PDF değil.`
                : `${file.name}: bu PDF okunamadı. Dosya bozuk olabilir.`;
        } else if (info.pages === 0) problem = `${file.name}: bu PDF hiç sayfa içermiyor.`;
        else if (info.pages > MAX_PAGES) problem = `${file.name}: ${info.pages} sayfa içeriyor; ${MAX_PAGES} sayfa sınırını aşıyor.`;
        else pages = info.pages;
      }
      if (problem) {
        setErrors([problem]);
        return;
      }
      setSelected({ file, pages });
      setText("");
      setStatus(`${file.name} yüklendi: ${count(pages, "sayfa")}.`);
    } catch {
      setErrors([`${file.name}: dosya okunamadı.`]);
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
    setStatus("Dosya kaldırıldı. Başlamak için başka bir PDF seçin.");
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
        return setErrors([`Sayfaları tek tek ayırmak için PDF en fazla ${MAX_OUTPUT_FILES} sayfa olmalıdır; bu PDF ${selected.pages} sayfa içeriyor. Bunun yerine bir sayfa aralığı seçin.`]);
      }
      groups = singlePageGroups(selected.pages);
    } else {
      const result = parsePageRanges(text, selected.pages, keepOrder);
      if (!result.ok) return setErrors([rangeMessage(result.error)]);
      groups = mode === "single" ? [combineGroups(result.groups)] : result.groups;
      if (groups.length > MAX_OUTPUT_FILES) return setErrors([`Bu işlem ${groups.length} dosya oluşturur; üst sınır ${MAX_OUTPUT_FILES}.`]);
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
        producer: "Paul Digital - PDF Böl",
        onProgress: (done, total) => setProgress(done < total ? `${total} dosyadan ${done + 1}. oluşturuluyor…` : "Tamamlanıyor…"),
      });
      const base = baseName(selected.file.name, "belge");
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
      setStatus(`Tamamlandı: ${made.length} dosya oluşturuldu.`);
    } catch (error) {
      setErrors([
        error instanceof Error && error.message === "output-too-large"
          ? `Sonuç ${fmt(MAX_OUTPUT_BYTES)} sınırını aşacak ve cihazınızın belleğini tüketebilir. Daha az sayfa seçmeyi deneyin.`
          : "PDF bölünemedi. Dosyanın bozuk olmadığından emin olun veya daha az sayfayla tekrar deneyin.",
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
      triggerDownload(url, `${baseName(selected?.file.name ?? "", "belge")}_sayfalar.zip`);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setZipBusy(false);
    }
  };

  const modeHint = MODES.find((item) => item.id === mode)?.hint;
  const showError = attempted && rangeError ? rangeMessage(rangeError) : null;
  const totalOut = outputs.reduce((sum, output) => sum + output.blob.size, 0);

  return (
    <div className="ic" lang="tr">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="PDF dosyanızı buraya sürükleyip bırakın"
        emptySub={`Bölmek için bir PDF seçin. En fazla ${fmt(MAX_FILE_BYTES)} ve ${MAX_PAGES} sayfa.`}
        filledSub={selected ? `${count(selected.pages, "sayfa")} · ${fmt(selected.file.size)} · başka bir dosya seçebilirsiniz` : ""}
        buttonLabel="PDF Dosyası Seç"
        moreLabel="Başka Bir Dosya Seç"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="PDF dosyasını bırakma alanı"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Dosyanız cihazınızda işlenir ve hiçbir sunucuya yüklenmez. Orijinal dosya değiştirilmez.</p>

      {selected && (
        <form
          className="ic-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <p className="sp-total">
            Bu belgede <strong>{count(selected.pages, "sayfa")}</strong> var.
          </p>
          <fieldset className="sp-modes" disabled={busy}>
            <legend>Bölme yöntemi</legend>
            {MODES.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="sp-mode"
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
                <label htmlFor="sp-ranges">Sayfa Aralığı</label>
                <input
                  id="sp-ranges"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="1-3, 5, 8-10"
                  value={text}
                  disabled={busy}
                  aria-invalid={showError ? true : undefined}
                  aria-describedby="sp-ranges-hint"
                  onChange={(event) => {
                    clearResult();
                    setErrors([]);
                    setText(event.target.value);
                  }}
                />
              </div>
              <p className="ic-hint" id="sp-ranges-hint">
                Virgülle ayırın ve aralıklar için tire kullanın. Numaralandırma 1'den (ilk sayfa) başlar; geçerli sayfalar: 1 ile {selected.pages} arası.
              </p>
              {selected.pages <= MAX_CHIP_PAGES && (
                <div className="sp-chips" role="group" aria-label="Sayfa Seç">
                  {Array.from({ length: selected.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className="sp-chip"
                      aria-pressed={chosenPages.has(page)}
                      aria-label={`Sayfa ${page}`}
                      disabled={busy}
                      onClick={() => togglePage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
              <div className="ic-field">
                <label htmlFor="sp-order">Sayfa sırası</label>
                <select
                  id="sp-order"
                  value={keepOrder ? "given" : "document"}
                  disabled={busy}
                  onChange={(event) => {
                    clearResult();
                    setKeepOrder(event.target.value === "given");
                  }}
                >
                  <option value="given">Yazdığım sırayı koru</option>
                  <option value="document">Orijinal belgedeki sıraya göre diz</option>
                </select>
              </div>
            </>
          )}
          <button type="submit" className="button button-primary ic-submit" disabled={busy}>
            {busy ? "Bölünüyor..." : "Böl"}
          </button>
        </form>
      )}
      {selected && <p className="ic-hint">{modeHint}</p>}

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "İşleniyor..." : status}
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
          ariaLabel="Sonuç"
          tone="success"
          title={outputs.length === 1 ? "PDF oluşturuldu" : "PDF başarıyla bölündü"}
          details={[
            { label: "Dosya", value: String(outputs.length) },
            { label: "Alınan sayfa", value: String(outputs.reduce((sum, output) => sum + output.pages, 0)) },
            { label: "Toplam boyut", value: fmt(totalOut) },
            { label: "Orijinal belge", value: count(selected.pages, "sayfa") },
          ]}
          primary={
            outputs.length === 1 ? (
              <a className="button button-download" href={outputs[0].url} download={outputs[0].name}>
                PDF'yi İndir
              </a>
            ) : (
              <button type="button" className="button button-download" onClick={() => void downloadZip()} disabled={zipBusy}>
                {zipBusy ? "ZIP hazırlanıyor…" : `Tümünü ZIP olarak indir (${outputs.length} dosya)`}
              </button>
            )
          }
          resetLabel="Başka Bir Dosya Seç"
          onReset={reset}
        >
          {outputs.length > 1 && (
            <ul className="sp-files" aria-label="Oluşturulan dosyalar">
              {outputs.map((output) => (
                <li key={output.name}>
                  <span>
                    {output.name} <small>{count(output.pages, "sayfa")} · {fmt(output.blob.size)}</small>
                  </span>
                  <a href={output.url} download={output.name} aria-label={`${output.name} dosyasını indir`}>
                    İndir
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
