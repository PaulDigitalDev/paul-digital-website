import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fmt = (bytes: number) => formatBytes(bytes, "es");

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
        return `${fileName}: este archivo no es un PDF.`;
      case "encrypted":
        return `${fileName}: el PDF está protegido con contraseña. Quita la protección e inténtalo de nuevo.`;
      case "no-text":
        return `${fileName}: no encontramos texto seleccionable en este PDF. Parece un documento escaneado (imágenes de páginas). Esta versión no incluye OCR y solo convierte PDF con texto.`;
      case "too-many-pages":
        return `${fileName}: el PDF tiene más de ${MAX_PAGES} páginas, por encima del límite de esta herramienta.`;
      default:
        return `${fileName}: no se pudo leer este PDF. Puede estar dañado o usar un formato no compatible.`;
    }
  }
  return "No se pudo convertir el PDF. Inténtalo de nuevo o usa un archivo más pequeño.";
};

export default function PdfAWord() {
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
    setStatus("Archivo quitado. Selecciona otro PDF para empezar.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "Abriendo el PDF…";
    if (p.stage === "building") return "Creando el documento de Word…";
    return `Extrayendo el texto de la página ${p.page} de ${p.pages}…`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (selected.size === 0) return setError(`${selected.name}: el archivo está vacío.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${selected.name}: este archivo no es un PDF.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: pesa ${fmt(selected.size)}, por encima del límite de ${fmt(MAX_FILE_BYTES)}.`);

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
      setStatus("¡Documento de Word creado correctamente!");
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
              `${result.pagesWithoutText === 1 ? "1 página no tiene" : `${result.pagesWithoutText} páginas no tienen`} texto seleccionable (posiblemente escaneada${result.pagesWithoutText === 1 ? "" : "s"}) y quedó fuera del documento. Esta versión no incluye OCR.`,
            ]
          : []),
        "Las tablas, columnas, imágenes y el diseño exacto de las páginas pueden no conservarse. Revisa el documento en Word antes de usarlo.",
      ]
    : [];

  return (
    <div className="ic" lang="es">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Arrastra y suelta tu archivo PDF aquí"
        emptySub={`Selecciona un PDF con texto para convertirlo a Word. Hasta ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Seleccionar archivo PDF"
        moreLabel="Elegir otro PDF"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Zona para soltar el archivo PDF"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Tu archivo se procesa en tu dispositivo y no se envía a ningún servidor. Funciona con PDF que tienen texto
        seleccionable; los PDF escaneados (imágenes) no son compatibles en esta versión.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Convirtiendo el PDF…" : status}
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
          ariaLabel="Resultado"
          tone={result.pagesWithoutText > 0 ? "warning" : "success"}
          title="¡Documento de Word creado!"
          fileName={result.name}
          details={[
            { label: "Formato", value: "DOCX (Word)" },
            { label: "Tamaño", value: fmt(result.size) },
            { label: "Páginas leídas", value: String(result.pages - result.pagesWithoutText) },
            { label: "Títulos", value: String(result.headings) },
            { label: "Párrafos", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Descargar DOCX
            </a>
          }
          resetLabel="Convertir otro PDF"
          onReset={reset}
        />
      )}
    </div>
  );
}
