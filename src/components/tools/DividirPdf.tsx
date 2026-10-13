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

const LOCALE = "es";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_PAGES = 1000;
const MAX_OUTPUT_FILES = 200;
const MAX_OUTPUT_BYTES = 500 * 1024 * 1024;
const MAX_CHIP_PAGES = 120;

type Mode = "ranges" | "single" | "all";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "ranges", label: "Un PDF por cada rango", hint: "Cada parte separada por comas (por ejemplo “1-3, 5, 8-10”) se guarda en su propio PDF." },
  { id: "single", label: "Un solo PDF con las páginas elegidas", hint: "Reúne todas las páginas indicadas en un único PDF nuevo." },
  { id: "all", label: "Cada página en un PDF distinto", hint: `Crea un PDF por página (hasta ${MAX_OUTPUT_FILES} páginas) y los ofrece también en un ZIP.` },
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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function rangeMessage(error: RangeError): string {
  switch (error.code) {
    case "empty":
      return "Escribe las páginas que quieres extraer, por ejemplo “1-3, 5, 8-10”.";
    case "syntax":
      return `“${error.token}” no es válido. Usa números separados por comas y guiones para los rangos, por ejemplo “1-3, 5, 8-10”.`;
    case "zero":
      return `“${error.token}”: la primera página del documento es la 1.`;
    case "reversed":
      return `“${error.token}”: el rango está al revés. Escribe primero la página menor, por ejemplo “${error.token.split(/\s*[-–—]\s*/).reverse().join("-")}”.`;
    case "outOfRange":
      return `“${error.token}” se sale del documento, que tiene ${plural(error.total, "página", "páginas")}.`;
    case "duplicate":
      return `La página ${error.token} aparece más de una vez. Cada página solo puede indicarse una vez.`;
  }
}

export default function DividirPdf() {
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
    setProgress(`Leyendo ${file.name}…`);
    try {
      let problem = "";
      let pages = 0;
      if (file.size === 0) problem = `${file.name}: el archivo está vacío.`;
      else if (file.size > MAX_FILE_BYTES) problem = `${file.name}: pesa ${fmt(file.size)}, por encima del límite de ${fmt(MAX_FILE_BYTES)}.`;
      else {
        const info = await inspectSourcePdf(new Uint8Array(await file.arrayBuffer()));
        if (!info.ok) {
          problem =
            info.reason === "encrypted"
              ? `${file.name}: el PDF está protegido con contraseña. Quita la protección e inténtalo de nuevo.`
              : info.reason === "invalid"
                ? `${file.name}: este archivo no es un PDF.`
                : `${file.name}: no se pudo leer este PDF. Puede estar dañado.`;
        } else if (info.pages === 0) problem = `${file.name}: el PDF no tiene páginas.`;
        else if (info.pages > MAX_PAGES) problem = `${file.name}: tiene ${info.pages} páginas, por encima del límite de ${MAX_PAGES}.`;
        else pages = info.pages;
      }
      if (problem) {
        setErrors([problem]);
        return;
      }
      setSelected({ file, pages });
      setText("");
      setStatus(`${file.name} cargado: ${plural(pages, "página", "páginas")}.`);
    } catch {
      setErrors([`${file.name}: no se pudo leer el archivo.`]);
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
    setStatus("Archivo quitado. Selecciona otro PDF para empezar.");
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
        return setErrors([`Para dividir en páginas sueltas el PDF puede tener hasta ${MAX_OUTPUT_FILES} páginas; este tiene ${selected.pages}. Elige un rango de páginas.`]);
      }
      groups = singlePageGroups(selected.pages);
    } else {
      const result = parsePageRanges(text, selected.pages, keepOrder);
      if (!result.ok) return setErrors([rangeMessage(result.error)]);
      groups = mode === "single" ? [combineGroups(result.groups)] : result.groups;
      if (groups.length > MAX_OUTPUT_FILES) return setErrors([`Se crearían ${groups.length} archivos; el máximo es ${MAX_OUTPUT_FILES}.`]);
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
        onProgress: (done, total) => setProgress(done < total ? `Creando el archivo ${done + 1} de ${total}…` : "Finalizando…"),
      });
      const base = baseName(selected.file.name);
      const taken = new Set<string>();
      const made: Output[] = parts.map((part) => {
        const blob = new Blob([part.bytes as BlobPart], { type: "application/pdf" });
        return {
          name: uniqueName(outputFileName(base, part.group), taken),
          pages: part.group.pages.length,
          blob,
          url: URL.createObjectURL(blob),
        };
      });
      outputsRef.current = made;
      setOutputs(made);
      setStatus(`Listo: ${plural(made.length, "archivo creado", "archivos creados")}.`);
    } catch (error) {
      setErrors([
        error instanceof Error && error.message === "output-too-large"
          ? `El resultado superaría ${fmt(MAX_OUTPUT_BYTES)} y podría agotar la memoria de tu dispositivo. Prueba con menos páginas.`
          : "No se pudo dividir el PDF. Comprueba que el archivo no esté dañado o prueba con menos páginas.",
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
      triggerDownload(url, `${baseName(selected?.file.name ?? "")}_paginas.zip`);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setZipBusy(false);
    }
  };

  const modeHint = MODES.find((item) => item.id === mode)?.hint;
  const showError = attempted && rangeError ? rangeMessage(rangeError) : null;
  const totalOut = outputs.reduce((sum, output) => sum + output.blob.size, 0);

  return (
    <div className="ic" lang="es">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Arrastra y suelta tu archivo PDF aquí"
        emptySub={`Selecciona un PDF para dividirlo. Hasta ${fmt(MAX_FILE_BYTES)} y ${MAX_PAGES} páginas.`}
        filledSub={selected ? `${plural(selected.pages, "página", "páginas")} · ${fmt(selected.file.size)} · puedes elegir otro archivo` : ""}
        buttonLabel="Seleccionar archivo PDF"
        moreLabel="Cambiar archivo"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Zona para soltar un archivo PDF"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Tu archivo se procesa en tu dispositivo y no se envía a ningún servidor. El original no se modifica.</p>

      {selected && (
        <form
          className="ic-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <p className="sp-total">
            Este documento tiene <strong>{plural(selected.pages, "página", "páginas")}</strong>.
          </p>
          <fieldset className="sp-modes" disabled={busy}>
            <legend>Cómo dividir</legend>
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
                <label htmlFor="sp-ranges">Páginas o rangos</label>
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
                Separa las páginas con comas y usa un guion para los rangos. Páginas válidas: de 1 a {selected.pages}.
              </p>
              {selected.pages <= MAX_CHIP_PAGES && (
                <div className="sp-chips" role="group" aria-label="Seleccionar páginas">
                  {Array.from({ length: selected.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className="sp-chip"
                      aria-pressed={chosenPages.has(page)}
                      aria-label={`Página ${page}`}
                      disabled={busy}
                      onClick={() => togglePage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
              <div className="ic-field">
                <label htmlFor="sp-order">Orden de las páginas</label>
                <select
                  id="sp-order"
                  value={keepOrder ? "given" : "document"}
                  disabled={busy}
                  onChange={(event) => {
                    clearResult();
                    setKeepOrder(event.target.value === "given");
                  }}
                >
                  <option value="given">Mantener el orden que escribí</option>
                  <option value="document">Ordenar según el documento original</option>
                </select>
              </div>
            </>
          )}
          <button type="submit" className="button button-primary ic-submit" disabled={busy}>
            {busy ? "Dividiendo..." : "Dividir PDF"}
          </button>
        </form>
      )}
      {selected && <p className="ic-hint">{modeHint}</p>}

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Dividiendo…" : status}
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
          ariaLabel="Resultado"
          tone="success"
          title={outputs.length === 1 ? "PDF creado correctamente" : "PDF divididos correctamente"}
          details={[
            { label: "Archivos", value: String(outputs.length) },
            { label: "Páginas extraídas", value: String(outputs.reduce((sum, output) => sum + output.pages, 0)) },
            { label: "Tamaño total", value: fmt(totalOut) },
            { label: "Documento original", value: plural(selected.pages, "página", "páginas") },
          ]}
          primary={
            outputs.length === 1 ? (
              <a className="button button-download" href={outputs[0].url} download={outputs[0].name}>
                Descargar PDF
              </a>
            ) : (
              <button type="button" className="button button-download" onClick={() => void downloadZip()} disabled={zipBusy}>
                {zipBusy ? "Preparando ZIP…" : `Descargar todo en ZIP (${outputs.length} archivos)`}
              </button>
            )
          }
          resetLabel="Dividir otro PDF"
          onReset={reset}
        >
          {outputs.length > 1 && (
            <ul className="sp-files" aria-label="Archivos creados">
              {outputs.map((output) => (
                <li key={output.name}>
                  <span>
                    {output.name} <small>{plural(output.pages, "página", "páginas")} · {fmt(output.blob.size)}</small>
                  </span>
                  <a href={output.url} download={output.name} aria-label={`Descargar ${output.name}`}>
                    Descargar
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
