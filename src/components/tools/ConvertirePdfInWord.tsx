import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fmt = (bytes: number) => formatBytes(bytes, "it-IT");

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
        return `${fileName}: questo file non è un PDF. Seleziona un file valido.`;
      case "encrypted":
        return `${fileName}: questo PDF è protetto da password. Rimuovi la protezione e riprova.`;
      case "no-text":
        return `${fileName}: in questo PDF non è stato trovato testo selezionabile. Probabilmente è un documento scansionato (pagine come immagini). Il riconoscimento ottico dei caratteri (OCR) non è supportato: si possono convertire solo PDF con testo reale.`;
      case "too-many-pages":
        return `${fileName}: questo PDF ha più di ${MAX_PAGES} pagine e supera il limite dello strumento.`;
      default:
        return `${fileName}: impossibile leggere questo PDF. Il file potrebbe essere danneggiato o non supportato.`;
    }
  }
  return "Si è verificato un errore. Riprova oppure usa un file più piccolo.";
};

export default function ConvertirePdfInWord() {
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
    setStatus("File rimosso. Seleziona un altro file PDF per ricominciare.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "Apertura del PDF…";
    if (p.stage === "building") return "Creazione del documento Word…";
    return `Estrazione del testo: pagina ${p.page} di ${p.pages}…`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (selected.size === 0) return setError(`${selected.name}: il file è vuoto.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${selected.name}: questo file non è un PDF. Seleziona un file valido.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: ${fmt(selected.size)} – supera il limite di ${fmt(MAX_FILE_BYTES)}.`);

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
      setStatus("Conversione completata. Il file è stato elaborato correttamente.");
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
              `${result.pagesWithoutText} pagina/e senza testo selezionabile (probabilmente scansionate) non sono state incluse nel documento. L'OCR non è supportato.`,
            ]
          : []),
        "Tabelle, colonne, immagini e impaginazione originale non vengono necessariamente mantenute. Controlla il documento in Word prima di usarlo.",
      ]
    : [];

  return (
    <div className="ic" lang="it">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Trascina qui un file PDF"
        emptySub={`Seleziona un PDF con testo da convertire in Word. Massimo ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Seleziona un file PDF"
        moreLabel="Seleziona un altro file"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Area di rilascio per il file PDF"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Il file viene elaborato sul tuo dispositivo e non viene inviato a nessun server. Lo strumento funziona con PDF che
        contengono testo selezionabile; i PDF scansionati (immagini) non sono supportati.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Elaborazione in corso…" : status}
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
          ariaLabel="Risultato"
          tone={result.pagesWithoutText > 0 ? "warning" : "success"}
          title="Conversione completata. Il file è stato elaborato correttamente."
          fileName={result.name}
          details={[
            { label: "Formato", value: "DOCX (Word)" },
            { label: "Dimensione", value: fmt(result.size) },
            { label: "Pagine lette", value: String(result.pages - result.pagesWithoutText) },
            { label: "Titoli", value: String(result.headings) },
            { label: "Paragrafi", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Scarica il file Word
            </a>
          }
          resetLabel="Converti un altro PDF"
          onReset={reset}
        />
      )}
    </div>
  );
}
