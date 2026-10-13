import { useEffect, useRef, useState } from "react";
import { buildPdf } from "../../lib/jpegPdf";
import type { PageSizeChoice, PdfImage } from "../../lib/jpegPdf";
import { checkJpeg } from "../../lib/jpgToPdfPt";
import { formatBytesPt } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILES = 50;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;
const MAX_PIXELS = 100_000_000;
const OUTPUT_NAME = "jpg-para-pdf.pdf";

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

async function reencode(file: File): Promise<PdfImage> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    canvas.width = canvas.height = 0;
    if (!blob) throw new Error("encode");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const check = checkJpeg(bytes);
    if (!check.ok || !check.info.embeddable) throw new Error("encode");
    return { bytes, width: check.info.width, height: check.info.height, components: check.info.components };
  } finally {
    bitmap.close();
  }
}

export default function JpgParaPdf() {
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
    setStatus("Lista de imagens limpa. Selecione novas imagens JPG para começar.");
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
          problems.push(`${file.name}: não foi adicionada. O limite é de ${MAX_FILES} imagens.`);
          continue;
        }
        if (file.size === 0) {
          problems.push(`${file.name}: o arquivo está vazio.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          problems.push(`${file.name}: tem ${formatBytesPt(file.size)}, acima do limite de ${formatBytesPt(MAX_FILE_BYTES)} por imagem.`);
          continue;
        }
        if (total + file.size > MAX_TOTAL_BYTES) {
          problems.push(`${file.name}: não foi adicionada porque o total passaria de ${formatBytesPt(MAX_TOTAL_BYTES)}.`);
          continue;
        }
        const check = checkJpeg(new Uint8Array(await file.arrayBuffer()));
        if (!check.ok) {
          problems.push(
            check.reason === "not-jpeg"
              ? `${file.name}: formato não suportado. Esta ferramenta aceita apenas imagens JPG/JPEG.`
              : check.reason === "empty"
                ? `${file.name}: o arquivo está vazio.`
                : `${file.name}: não foi possível ler esta imagem. O arquivo pode estar corrompido.`,
          );
          continue;
        }
        if (check.displayWidth * check.displayHeight > MAX_PIXELS) {
          problems.push(`${file.name}: a imagem (${check.displayWidth}×${check.displayHeight} px) é grande demais para ser processada com segurança.`);
          continue;
        }
        try {
          (await createImageBitmap(file)).close();
        } catch {
          problems.push(`${file.name}: não foi possível ler esta imagem. O arquivo pode estar corrompido.`);
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
      setStatus(`${plural(accepted.length, "imagem adicionada", "imagens adicionadas")}.`);
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
    setStatus(`${items[index].file.name} movida para a posição ${to + 1} de ${items.length}.`);
  };

  const remove = (id: number) => {
    if (busy) return;
    clearResult();
    const target = items.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setItems((current) => current.filter((item) => item.id !== id));
    setStatus(`${target?.file.name ?? "Imagem"} removida.`);
  };

  const run = async () => {
    if (runningRef.current) return;
    if (items.length === 0) return setErrors(["Adicione pelo menos uma imagem JPG para converter."]);
    runningRef.current = true;
    setErrors([]);
    clearResult();
    setBusy(true);
    setStatus("");
    try {
      const images: PdfImage[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgress(`Preparando a imagem ${i + 1} de ${items.length}…`);
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
          throw new Error(`${item.file.name}: não foi possível processar esta imagem. Remova-a da lista e tente novamente.`);
        }
      }
      setProgress("Criando o PDF…");
      const blob = buildPdf(images, pageSize);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({ url, size: blob.size, pages: images.length });
      setStatus("PDF criado com sucesso!");
    } catch (error) {
      setErrors([error instanceof Error && error.message.includes(": ") ? error.message : "Não foi possível criar o PDF. Tente novamente com menos imagens."]);
    } finally {
      runningRef.current = false;
      setBusy(false);
      setProgress("");
    }
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="ic" lang="pt-BR">
      <h2 className="jp-heading">Converter JPG para PDF</h2>
      <DropArea
        title={plural(items.length, "imagem selecionada", "imagens selecionadas")}
        hasFiles={items.length > 0}
        emptyTitle="Arraste e solte suas imagens aqui"
        emptySub="Selecione uma ou mais imagens JPG para começar."
        filledSub={`${formatBytesPt(totalSize)} no total · adicione mais quando quiser`}
        buttonLabel="Selecionar imagens JPG"
        moreLabel="Selecionar imagens JPG"
        accept="image/jpeg,.jpg,.jpeg"
        multiple
        busy={busy}
        ariaLabel="Área para soltar imagens JPG"
        onFiles={(files) => void addFiles(files)}
      />
      <p className="ic-hint">Suas imagens são processadas no seu dispositivo e não são enviadas para um servidor.</p>

      {items.length > 0 && (
        <>
          <h2 className="jp-heading">Imagens selecionadas ({items.length})</h2>
          <p className="ic-hint">Organize as imagens na ordem desejada.</p>
          <ol className="jp-list" aria-label="Imagens selecionadas, na ordem em que serão incluídas no PDF">
            {items.map((item, index) => (
              <li key={item.id} className="jp-item">
                <span className="jp-num" aria-hidden="true">
                  {index + 1}
                </span>
                <img className="jp-thumb" src={item.url} alt="" width={48} height={48} loading="lazy" />
                <span className="jp-name">
                  {item.file.name}
                  <small>
                    {item.width}×{item.height} px · {formatBytesPt(item.file.size)}
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
        </>
      )}

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <label className="ic-field">
          Tamanho da página
          <select
            value={pageSize}
            onChange={(event) => {
              clearResult();
              setPageSize(event.target.value as PageSizeChoice);
            }}
            disabled={busy}
          >
            <option value="a4">A4 (imagem ajustada à página, sem distorção)</option>
            <option value="image">Tamanho da imagem (sem margens)</option>
          </select>
        </label>
        <button type="submit" className="button button-primary ic-submit jp-convert" disabled={items.length === 0 || busy}>
          {busy ? "Convertendo imagens..." : "Converter para PDF"}
        </button>
      </form>
      <p className="ic-hint">
        Imagens na horizontal geram páginas na horizontal, e as na vertical geram páginas na vertical. A ordem do PDF é a da lista.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Convertendo imagens..." : status}
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
          ]}
          primary={
            <a className="button button-download" href={result.url} download={OUTPUT_NAME}>
              Baixar PDF
            </a>
          }
          resetLabel="Limpar imagens"
          onReset={reset}
        />
      )}
    </div>
  );
}
