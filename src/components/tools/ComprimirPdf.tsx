import { useEffect, useRef, useState } from "react";
import { CompressError, compressPdf, formatPercent, inspectForCompression, savedPercent } from "../../lib/pdfCompress";
import type { CompressLevel, CompressStage, CompressStats } from "../../lib/pdfCompress";
import { recodeJpegInBrowser } from "../../lib/jpegRecode";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const LOCALE = "es";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Below this gain the result is reported as "no meaningful change" rather than a success. */
const MEANINGFUL_PERCENT = 1;

const LEVELS: { id: CompressLevel; label: string; hint: string }[] = [
  { id: "lossless", label: "Sin pérdida de calidad", hint: "Solo reorganiza y comprime la estructura del archivo. No toca las imágenes." },
  {
    id: "balanced",
    label: "Equilibrada (recomendada)",
    hint: "Además, reduce las imágenes JPEG: calidad media-alta y un máximo de 2000 píxeles por lado.",
  },
  {
    id: "strong",
    label: "Máxima reducción",
    hint: "Reduce más las imágenes JPEG: calidad media y un máximo de 1400 píxeles por lado. Puede notarse en fotos y escaneos.",
  },
];

const STAGE_TEXT: Record<CompressStage, string> = {
  reading: "Leyendo el PDF…",
  images: "Optimizando imágenes",
  streams: "Comprimiendo contenido",
  saving: "Guardando el nuevo PDF…",
  verifying: "Comprobando que el resultado se abre correctamente…",
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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const fmt = (bytes: number) => formatBytes(bytes, LOCALE);

function outputName(name: string) {
  return `${name.replace(/\.pdf$/i, "") || "documento"}-comprimido.pdf`;
}

export default function ComprimirPdf() {
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
    setStatus("Archivo eliminado. Selecciona otro PDF para empezar.");
  };

  const pickFile = async (files: File[]) => {
    if (busy || files.length === 0) return;
    const file = files[0];
    clearResult();
    setStatus("");
    setErrors([]);
    setSelected(null);
    const problems: string[] = [];
    if (files.length > 1) problems.push("Solo se puede comprimir un PDF cada vez. Se usó el primer archivo.");
    if (file.size === 0) return setErrors([`${file.name}: el archivo está vacío.`]);
    if (file.size > MAX_FILE_BYTES)
      return setErrors([`${file.name}: pesa ${fmt(file.size)}, por encima del límite de ${fmt(MAX_FILE_BYTES)}.`]);
    setBusy(true);
    setProgress(`Leyendo ${file.name}…`);
    try {
      const info = await inspectForCompression(new Uint8Array(await file.arrayBuffer()));
      if (!info.ok) {
        problems.push(
          info.reason === "encrypted"
            ? `${file.name}: el PDF está protegido con contraseña. Esta herramienta no puede quitar la protección; hazlo con el programa con el que lo abres e inténtalo de nuevo.`
            : info.reason === "invalid"
              ? `${file.name}: este archivo no es un PDF.`
              : `${file.name}: no se pudo leer este PDF. Puede estar dañado.`,
        );
        return setErrors(problems);
      }
      setErrors(problems);
      setSelected({ file, pages: info.pages });
      setStatus("PDF listo. Elige el nivel de compresión y pulsa “Comprimir PDF”.");
    } catch {
      setErrors([`${file.name}: no se pudo leer este archivo.`]);
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
          setProgress(stage === "images" || stage === "streams" ? `${STAGE_TEXT[stage]} (${Math.min(done + 1, total)} de ${total})…` : STAGE_TEXT[stage]);
          setPercent(stage === "images" && total > 0 ? Math.round((done / total) * 100) : null);
        },
      });
      original = null; // release the input buffer
      const smaller = bytes.length < file.size;
      const compressedUrl = smaller ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })) : null;
      const originalUrl = URL.createObjectURL(file);
      urls.current = [originalUrl, ...(compressedUrl ? [compressedUrl] : [])];
      setOutcome({ stats, compressedUrl, originalUrl, level });
      setStatus(smaller ? "Compresión terminada." : "Compresión terminada: no se pudo reducir este PDF.");
    } catch (error) {
      const reason = error instanceof CompressError ? error.reason : "other";
      setErrors([
        reason === "encrypted"
          ? "El PDF está protegido con contraseña y no se puede comprimir."
          : reason === "invalid"
            ? "Este archivo no es un PDF."
            : reason === "corrupt"
              ? "No se pudo leer este PDF. Puede estar dañado."
              : reason === "verify"
                ? "El PDF resultante no superó la comprobación, así que no se ofrece. Tu archivo original no ha cambiado."
                : "No se pudo comprimir el PDF. Prueba con otro nivel o con un archivo más pequeño.",
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
      notes.push(`Imágenes optimizadas: ${stats.imagesRecompressed} de ${stats.imagesFound}.`);
    else if (outcome.level !== "lossless" && stats.imagesFound > 0)
      notes.push("No se encontraron imágenes JPEG que se pudieran reducir con seguridad; el resto de formatos de imagen se conserva sin cambios.");
    if (stats.streamsCompressed > 0) notes.push(`Bloques de contenido comprimidos: ${stats.streamsCompressed}.`);
    if (stats.unusedObjectsRemoved > 0) notes.push(`Datos sin uso eliminados: ${stats.unusedObjectsRemoved} objetos.`);
    if (stats.metadataRemoved) notes.push("Se quitaron los metadatos del documento.");
    notes.push("Si el PDF tiene firma digital, la firma deja de ser válida en el archivo comprimido.");

    const downloadOriginal = (primary: boolean) => (
      <a className={primary ? "button button-download" : "button"} href={originalUrl} download={selected.file.name}>
        Conservar el original
      </a>
    );

    if (smaller) {
      return (
        <ResultPanel
          ariaLabel="Resultado"
          tone="success"
          title="PDF comprimido"
          summary={`El archivo es ${formatPercent(change, LOCALE)} más pequeño.`}
          fileName={outputName(selected.file.name)}
          details={[
            { label: "Tamaño original", value: fmt(original) },
            { label: "Tamaño nuevo", value: fmt(stats.size) },
            { label: "Reducción", value: formatPercent(change, LOCALE) },
            { label: "Páginas", value: String(stats.pages) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={compressedUrl!} download={outputName(selected.file.name)}>
              Descargar PDF comprimido
            </a>
          }
          secondary={downloadOriginal(false)}
          resetLabel="Comprimir otro PDF"
          onReset={reset}
        />
      );
    }
    return (
      <ResultPanel
        ariaLabel="Resultado"
        tone="warning"
        title={larger ? "El resultado habría sido más grande" : "No se pudo reducir este PDF"}
        summary={
          larger
            ? `El PDF procesado pesaría ${fmt(stats.size)}, es decir ${formatPercent(-change, LOCALE)} más que el original (${fmt(original)}). No se ofrece para descargar: te recomendamos conservar el original.`
            : `El tamaño apenas cambia (${fmt(original)} → ${fmt(stats.size)}). Es probable que el archivo ya esté optimizado, así que te recomendamos conservar el original.`
        }
        details={[
          { label: "Tamaño original", value: fmt(original) },
          { label: "Tamaño procesado", value: fmt(stats.size) },
          { label: "Cambio", value: Math.abs(change) < 0.05 ? "Sin cambios" : `${change < 0 ? "+" : "−"}${formatPercent(change, LOCALE)}` },
          { label: "Páginas", value: String(stats.pages) },
        ]}
        notes={outcome.level === "strong" ? notes.slice(0, -1) : [...notes.slice(0, -1), "Prueba otro nivel de compresión: el resultado depende del contenido del PDF."]}
        primary={downloadOriginal(true)}
        resetLabel="Probar con otro PDF"
        onReset={reset}
      />
    );
  };

  return (
    <div className="ic" lang="es">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Arrastra y suelta tu archivo PDF aquí"
        emptySub={`Selecciona un PDF para comprimirlo. Hasta ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={selected ? `${plural(selected.pages, "página", "páginas")} · ${fmt(selected.file.size)} · puedes elegir otro archivo` : ""}
        buttonLabel="Seleccionar archivo PDF"
        moreLabel="Cambiar archivo"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Zona para soltar un archivo PDF"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Tu archivo se procesa en tu dispositivo y no se envía a ningún servidor.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="cp-level">Nivel de compresión</label>
          <select
            id="cp-level"
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
            Quitar metadatos del documento (título, autor, programa de creación)
          </label>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={!selected || busy}>
          {busy ? "Comprimiendo..." : "Comprimir PDF"}
        </button>
      </form>
      <p className="ic-hint">
        {LEVELS.find((item) => item.id === level)?.hint} El resultado depende del contenido del PDF y no se puede garantizar una reducción concreta.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Comprimiendo…" : status}
      </div>
      {busy && progress ? (
        <div className="ic-hint ic-progress">
          <span aria-hidden="true">{progress}</span>
          {percent !== null ? <progress value={percent} max={100} aria-label="Progreso de las imágenes" style={{ display: "block", width: "100%", marginTop: 6 }} /> : null}
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
