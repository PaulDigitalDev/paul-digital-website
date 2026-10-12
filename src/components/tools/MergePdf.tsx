import { useEffect, useRef, useState } from "react";
import { formatBytesPt, inspectPdf, mergePdfs } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILES = 30;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;
const OUTPUT_NAME = "juntar-pdf.pdf";

interface Item {
  id: number;
  file: File;
  pages: number;
}

interface Result {
  url: string;
  size: number;
  pages: number;
  files: number;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function MergePdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const idRef = useRef(0);
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
    setItems([]);
    setErrors([]);
    setStatus("Lista de arquivos limpa. Selecione novos PDFs para começar.");
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
        setProgress(`Lendo ${file.name}…`);
        if (items.length + accepted.length >= MAX_FILES) {
          problems.push(`${file.name}: não foi adicionado. O limite é de ${MAX_FILES} arquivos.`);
          continue;
        }
        if (file.size === 0) {
          problems.push(`${file.name}: o arquivo está vazio.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          problems.push(`${file.name}: tem ${formatBytesPt(file.size)}, acima do limite de ${formatBytesPt(MAX_FILE_BYTES)} por arquivo.`);
          continue;
        }
        if (total + file.size > MAX_TOTAL_BYTES) {
          problems.push(`${file.name}: não foi adicionado porque o total passaria de ${formatBytesPt(MAX_TOTAL_BYTES)}.`);
          continue;
        }
        const info = await inspectPdf(new Uint8Array(await file.arrayBuffer()));
        if (!info.ok) {
          problems.push(
            info.reason === "encrypted"
              ? `${file.name}: o PDF é protegido por senha. Remova a proteção e tente novamente.`
              : info.reason === "invalid"
                ? `${file.name}: este arquivo não é um PDF.`
                : `${file.name}: não foi possível ler este PDF. Ele pode estar corrompido.`,
          );
          continue;
        }
        total += file.size;
        accepted.push({ id: ++idRef.current, file, pages: info.pages });
      }
    } finally {
      setBusy(false);
      setProgress("");
    }
    setErrors(problems);
    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      setStatus(`${plural(accepted.length, "PDF adicionado", "PDFs adicionados")}.`);
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
    setStatus(`${items[index].file.name} movido para a posição ${to + 1} de ${items.length}.`);
  };

  const remove = (id: number) => {
    if (busy) return;
    clearResult();
    const name = items.find((item) => item.id === id)?.file.name ?? "Arquivo";
    setItems((current) => current.filter((item) => item.id !== id));
    setStatus(`${name} removido.`);
  };

  const run = async () => {
    if (runningRef.current) return;
    if (items.length < 2) return setErrors(["Adicione pelo menos dois PDFs para juntar."]);
    runningRef.current = true;
    setErrors([]);
    clearResult();
    setBusy(true);
    setStatus("");
    try {
      const sources: Uint8Array[] = [];
      for (const item of items) sources.push(new Uint8Array(await item.file.arrayBuffer()));
      const merged = await mergePdfs(sources, (done, total) => setProgress(`Juntando o arquivo ${done + 1} de ${total}…`));
      setProgress("Finalizando o PDF…");
      const blob = new Blob([merged.bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setResult({ url, size: blob.size, pages: merged.pages, files: items.length });
      setStatus("PDF criado com sucesso!");
    } catch {
      setErrors(["Não foi possível juntar os PDFs. Verifique os arquivos ou tente novamente com menos arquivos."]);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);
  const totalPages = items.reduce((sum, item) => sum + item.pages, 0);

  return (
    <div className="ic" lang="pt-BR">
      <DropArea
        title={plural(items.length, "PDF selecionado", "PDFs selecionados")}
        hasFiles={items.length > 0}
        emptyTitle="Arraste e solte seus arquivos PDF aqui"
        emptySub={`Selecione dois ou mais arquivos PDF para começar. Até ${formatBytesPt(MAX_FILE_BYTES)} cada.`}
        filledSub={`${plural(totalPages, "página", "páginas")} · ${formatBytesPt(totalSize)} no total · adicione mais quando quiser`}
        buttonLabel="Selecionar arquivos PDF"
        moreLabel="Selecionar arquivos PDF"
        accept="application/pdf,.pdf"
        multiple
        busy={busy}
        ariaLabel="Área para soltar arquivos PDF"
        onFiles={(files) => void addFiles(files)}
      />
      <p className="ic-hint">Seus arquivos são processados no seu dispositivo e não são enviados para um servidor.</p>

      {items.length > 0 && (
        <h2 className="jp-heading">Arquivos selecionados ({items.length})</h2>
      )}
      {items.length > 0 && <p className="ic-hint">Organize os arquivos na ordem desejada.</p>}
      {items.length > 0 && (
        <ol className="jp-list" aria-label="Arquivos selecionados, na ordem em que serão juntados">
          {items.map((item, index) => (
            <li key={item.id} className="jp-item">
              <span className="jp-num" aria-hidden="true">
                {index + 1}
              </span>
              <span className="jp-name">
                {item.file.name}
                <small>
                  {plural(item.pages, "página", "páginas")} · {formatBytesPt(item.file.size)}
                </small>
              </span>
              <span className="jp-actions">
                <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={`Mover ${item.file.name} para cima`}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={busy || index === items.length - 1}
                  aria-label={`Mover ${item.file.name} para baixo`}
                >
                  ↓
                </button>
                <button type="button" onClick={() => remove(item.id)} disabled={busy} aria-label={`Remover ${item.file.name}`}>
                  Remover
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <button type="submit" className="button button-primary ic-submit" disabled={items.length < 2 || busy}>
          {busy ? "Juntando arquivos..." : "Juntar PDFs"}
        </button>
      </form>
      <p className="ic-hint">
        {items.length === 1 ? "Adicione mais um PDF para poder juntá-los. " : ""}
        As páginas são unidas na ordem da lista. Use as setas para reorganizar e Remover para tirar um arquivo.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Juntando arquivos..." : status}
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
          title="PDF criado com sucesso!"
          fileName={OUTPUT_NAME}
          details={[
            { label: "Formato", value: "PDF" },
            { label: "Tamanho", value: formatBytesPt(result.size) },
            { label: "Páginas", value: String(result.pages) },
            { label: "Arquivos unidos", value: String(result.files) },
          ]}
          primary={
            <a className="button button-download" href={result.url} download={OUTPUT_NAME}>
              Baixar PDF
            </a>
          }
          resetLabel="Limpar arquivos"
          onReset={reset}
        />
      )}
    </div>
  );
}
