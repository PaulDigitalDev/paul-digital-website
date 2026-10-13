import { useEffect, useRef, useState } from "react";
import { buildPdf } from "../../lib/jpegPdf";
import type { PageSizeChoice, PdfImage } from "../../lib/jpegPdf";
import { checkJpeg } from "../../lib/jpgToPdfPt";
import { DropArea, ResultPanel } from "./shared";
import { reencode } from "./JpgParaPdf";

const MAX_FILES = 50;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;
const MAX_PIXELS = 100_000_000;
const OUTPUT_NAME = "jpg-a-pdf.pdf";

interface Item {
  id: number;
  file: File;
  url: string;
  width: number;
  height: number;
  /** True when the JPEG must be re-encoded for PDF (EXIF rotation or an unsupported colour mode). */
  normalise: boolean;
}

interface Result {
  url: string;
  size: number;
  pages: number;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Spanish file size, e.g. "1,4 MB". */
function formatBytesEs(bytes: number): string {
  const units = ["bytes", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toLocaleString("es", { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${units[unit]}`;
}

export default function JpgAPdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeChoice>("a4");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const idRef = useRef(0);
  const resultUrlRef = useRef<string | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const runningRef = useRef(false);
  itemsRef.current = items;

  useEffect(
    () => () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [],
  );

  const clearResult = () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setResult(null);
  };

  const reset = () => {
    clearResult();
    items.forEach((item) => URL.revokeObjectURL(item.url));
    setItems([]);
    setErrors([]);
    setStatus("Lista de imágenes vaciada. Selecciona nuevas imágenes JPG para empezar.");
  };

  const addFiles = async (incoming: File[]) => {
    if (busy || incoming.length === 0) return;
    clearResult();
    setStatus("");
    setBusy(true);
    const problems: string[] = [];
    const accepted: Item[] = [];
    let total = items.reduce((sum, item) => sum + item.file.size, 0);
    try {
      for (const file of incoming) {
        setProgress(`Leyendo ${file.name}…`);
        if (items.length + accepted.length >= MAX_FILES) {
          problems.push(`${file.name}: no se añadió. El límite es de ${MAX_FILES} imágenes.`);
          continue;
        }
        if (file.size === 0) {
          problems.push(`${file.name}: el archivo está vacío.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          problems.push(`${file.name}: pesa ${formatBytesEs(file.size)}, por encima del límite de ${formatBytesEs(MAX_FILE_BYTES)} por imagen.`);
          continue;
        }
        if (total + file.size > MAX_TOTAL_BYTES) {
          problems.push(`${file.name}: no se añadió porque el total superaría ${formatBytesEs(MAX_TOTAL_BYTES)}.`);
          continue;
        }
        const check = checkJpeg(new Uint8Array(await file.arrayBuffer()));
        if (!check.ok) {
          problems.push(
            check.reason === "not-jpeg"
              ? `${file.name}: formato no compatible. Esta herramienta solo acepta imágenes JPG/JPEG.`
              : check.reason === "empty"
                ? `${file.name}: el archivo está vacío.`
                : `${file.name}: no se pudo leer esta imagen. Es posible que el archivo esté dañado.`,
          );
          continue;
        }
        if (check.displayWidth * check.displayHeight > MAX_PIXELS) {
          problems.push(`${file.name}: la imagen (${check.displayWidth}×${check.displayHeight} px) es demasiado grande para procesarla con seguridad.`);
          continue;
        }
        try {
          (await createImageBitmap(file)).close();
        } catch {
          problems.push(`${file.name}: no se pudo leer esta imagen. Es posible que el archivo esté dañado.`);
          continue;
        }
        total += file.size;
        accepted.push({
          id: ++idRef.current,
          file,
          url: URL.createObjectURL(file),
          width: check.displayWidth,
          height: check.displayHeight,
          normalise: !check.info.embeddable || check.info.orientation !== 1,
        });
      }
    } finally {
      setBusy(false);
      setProgress("");
    }
    setErrors(problems);
    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      setStatus(`${plural(accepted.length, "imagen añadida", "imágenes añadidas")}.`);
    }
  };

  const move = (index: number, delta: number) => {
    if (busy) return;
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    clearResult();
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    setItems(next);
    setStatus(`${items[index].file.name} movida a la posición ${to + 1} de ${items.length}.`);
  };

  const remove = (id: number) => {
    if (busy) return;
    clearResult();
    const target = items.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setItems((current) => current.filter((item) => item.id !== id));
    setStatus(`${target?.file.name ?? "Imagen"} eliminada.`);
  };

  const run = async () => {
    if (runningRef.current) return;
    if (items.length === 0) return setErrors(["Añade al menos una imagen JPG para convertir."]);
    runningRef.current = true;
    setErrors([]);
    clearResult();
    setBusy(true);
    setStatus("");
    try {
      const images: PdfImage[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgress(`Preparando la imagen ${i + 1} de ${items.length}…`);
        await new Promise((resolve) => setTimeout(resolve));
        try {
          if (item.normalise) {
            images.push(await reencode(item.file));
          } else {
            const bytes = new Uint8Array(await item.file.arrayBuffer());
            const check = checkJpeg(bytes);
            if (!check.ok) throw new Error("invalid");
            images.push({ bytes, width: check.info.width, height: check.info.height, components: check.info.components });
          }
        } catch {
          throw new Error(`${item.file.name}: no se pudo procesar esta imagen. Elimínala de la lista e inténtalo de nuevo.`);
        }
      }
      setProgress("Creando el PDF…");
      const blob = buildPdf(images, pageSize);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({ url, size: blob.size, pages: images.length });
      setStatus("¡PDF creado correctamente!");
    } catch (error) {
      setErrors([error instanceof Error && error.message.includes(": ") ? error.message : "No se pudo crear el PDF. Inténtalo de nuevo con menos imágenes."]);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="ic ic-minimal" lang="es">
      <DropArea
        title={plural(items.length, "imagen seleccionada", "imágenes seleccionadas")}
        hasFiles={items.length > 0}
        emptyTitle="Arrastra y suelta tus imágenes aquí"
        emptySub="o arrastra las imágenes JPG aquí"
        filledSub={`${formatBytesEs(totalSize)} en total · añade más cuando quieras`}
        buttonLabel="Seleccionar imágenes"
        moreLabel="Seleccionar imágenes"
        accept="image/jpeg,.jpg,.jpeg"
        multiple
        busy={busy}
        ariaLabel="Zona para soltar imágenes JPG"
        onFiles={(files) => void addFiles(files)}
      />

      {items.length > 0 && (
        <>
          <h2 className="jp-heading">Imágenes seleccionadas ({items.length})</h2>
          <p className="ic-hint">Ordena las imágenes como prefieras.</p>
          <ol className="jp-list" aria-label="Imágenes seleccionadas, en el orden en que se incluirán en el PDF">
            {items.map((item, index) => (
              <li key={item.id} className="jp-item">
                <span className="jp-num" aria-hidden="true">
                  {index + 1}
                </span>
                <img className="jp-thumb" src={item.url} alt="" width={48} height={48} loading="lazy" />
                <span className="jp-name">
                  {item.file.name}
                  <small>
                    {item.width}×{item.height} px · {formatBytesEs(item.file.size)}
                  </small>
                </span>
                <span className="jp-actions">
                  <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={`Subir ${item.file.name}`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={busy || index === items.length - 1}
                    aria-label={`Bajar ${item.file.name}`}
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => remove(item.id)} disabled={busy} aria-label={`Eliminar ${item.file.name}`}>
                    Eliminar
                  </button>
                </span>
              </li>
            ))}
          </ol>
        </>
      )}

      {items.length > 0 && (
        <form
          className="ic-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <label className="ic-field">
            Tamaño de página
            <select
              value={pageSize}
              onChange={(event) => {
                clearResult();
                setPageSize(event.target.value as PageSizeChoice);
              }}
              disabled={busy}
            >
              <option value="a4">A4 (imagen ajustada a la página, sin deformar)</option>
              <option value="image">Tamaño de la imagen (sin márgenes)</option>
            </select>
          </label>
          <button type="submit" className="button button-primary ic-submit jp-convert" disabled={busy}>
            {busy ? "Convirtiendo imágenes..." : "Convertir a PDF"}
          </button>
        </form>
      )}
      {items.length > 0 && (
        <p className="ic-hint">
          Las imágenes horizontales generan páginas horizontales y las verticales, páginas verticales. El orden del PDF es el de la lista.
        </p>
      )}

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Convirtiendo imágenes..." : status}
      </div>
      {busy && progress ? (
        <p className="ic-hint ic-progress" aria-hidden="true">
          {progress}
        </p>
      ) : null}
      {errors.length > 0 && (
        <div className="ic-error" role="alert">
          {errors.map((message, index) => (
            <p key={index} style={{ margin: 0 }}>
              {message}
            </p>
          ))}
        </div>
      )}

      {result && (
        <ResultPanel
          ariaLabel="Resultado"
          tone="success"
          title="¡PDF creado correctamente!"
          fileName={OUTPUT_NAME}
          details={[
            { label: "Formato", value: "PDF" },
            { label: "Tamaño", value: formatBytesEs(result.size) },
            { label: "Páginas", value: String(result.pages) },
          ]}
          primary={
            <a className="button button-download" href={result.url} download={OUTPUT_NAME}>
              Descargar PDF
            </a>
          }
          resetLabel="Vaciar imágenes"
          onReset={reset}
        />
      )}
    </div>
  );
}
