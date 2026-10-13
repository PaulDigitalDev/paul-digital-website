import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

// Kept in sync with MAX_FILE_BYTES / MAX_PAGES in lib/docxToPdf. The converter is imported lazily,
// so these are repeated here to validate the file before any conversion code is downloaded.
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_PAGES = 300;
const fmt = (bytes: number) => formatBytes(bytes, "es");

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
      return `${fileName}: este archivo no es un documento .docx válido.`;
    case "legacy":
      return `${fileName}: es un archivo de Word antiguo (.doc) o está protegido con contraseña. Ábrelo en Word, quita la contraseña si la tiene y guárdalo como .docx.`;
    case "encrypted":
      return `${fileName}: el archivo está protegido con contraseña. Quita la protección e inténtalo de nuevo.`;
    case "corrupt":
      return `${fileName}: el archivo parece dañado y no se pudo leer. Prueba a abrirlo en Word y guardarlo de nuevo como .docx.`;
    case "too-large":
      return `${fileName}: el documento es demasiado grande para procesarlo en el navegador (el límite es de ${MAX_PAGES} páginas y de contenido interno razonable). Divídelo en partes más pequeñas.`;
    case "unsupported":
      return `${fileName}: este documento usa una compresión que el navegador no admite o una función no compatible.`;
    case "empty":
      return `${fileName}: no encontramos texto ni imágenes que convertir en este documento.`;
    default:
      return `${fileName}: no se pudo convertir el documento. Inténtalo de nuevo o usa un archivo más pequeño.`;
  }
};

const noticeText: Record<string, string> = {
  headerFooter: "Los encabezados, pies de página y números de página no se incluyen.",
  footnotes: "Las notas al pie y notas finales no se incluyen.",
  textbox: "Los cuadros de texto no se incluyen.",
  shape: "Las formas, dibujos y objetos incrustados no se incluyen.",
  chart: "Los gráficos no se incluyen.",
  equation: "Las ecuaciones no se incluyen.",
  anchoredImage: "Las imágenes flotantes se colocaron en línea con el texto, por lo que su posición puede cambiar.",
  unsupportedImage: "Algunas imágenes tienen un formato no compatible y se omitieron.",
  replacedChars: "Algunos caracteres que no existen en las fuentes estándar del PDF (por ejemplo emojis o alfabetos no latinos) se sustituyeron por «?».",
};

export default function WordAPdf() {
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
    setStatus("Archivo quitado. Selecciona otro documento para empezar.");
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (/\.doc$/i.test(selected.name)) return setError(errorMessage("legacy", selected.name));
    if (!/\.docx$/i.test(selected.name)) return setError(`${selected.name}: solo se admiten archivos .docx de Word.`);
    if (selected.size === 0) return setError(`${selected.name}: el archivo está vacío.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: pesa ${fmt(selected.size)}, por encima del límite de ${fmt(MAX_FILE_BYTES)}.`);

    setFile(selected);
    runningRef.current = true;
    setBusy(true);
    try {
      setProgress("Preparando el convertidor…");
      const { convertDocxToPdf } = await import("../../lib/docxToPdf");
      const bytes = new Uint8Array(await selected.arrayBuffer());
      const out = await convertDocxToPdf(bytes, selected.name, (p) => {
        if (p.stage === "reading") setProgress("Leyendo el documento…");
        else if (p.stage === "saving") setProgress("Creando el PDF…");
        else setProgress(`Dando formato al documento… ${Math.round((p.done / Math.max(1, p.total)) * 100)} %`);
      });
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
      setStatus("¡PDF creado correctamente!");
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
        "Se usan las fuentes estándar del PDF en lugar de las del documento, así que los saltos de línea y de página pueden diferir de Word. Revisa el PDF antes de enviarlo.",
      ]
    : [];

  return (
    <div className="ic" lang="es">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Arrastra y suelta tu archivo Word (.docx) aquí"
        emptySub={`Selecciona un documento .docx para convertirlo a PDF. Hasta ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Seleccionar archivo Word"
        moreLabel="Elegir otro documento"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple={false}
        busy={busy}
        ariaLabel="Zona para soltar el archivo de Word"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Tu archivo se procesa en tu dispositivo y no se envía a ningún servidor. Es una conversión aproximada: se
        conservan texto, formato básico, listas, tablas e imágenes en línea, pero el diseño puede diferir de Word.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Convirtiendo el documento…" : status}
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
          tone={result.notices.length > 0 ? "warning" : "success"}
          title="¡PDF creado!"
          fileName={result.name}
          details={[
            { label: "Formato", value: "PDF" },
            { label: "Tamaño", value: fmt(result.size) },
            { label: "Páginas", value: String(result.pages) },
            { label: "Tablas", value: String(result.tables) },
            { label: "Imágenes", value: String(result.images) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Descargar PDF
            </a>
          }
          resetLabel="Convertir otro documento"
          onReset={reset}
        />
      )}
    </div>
  );
}
