import { useEffect, useRef, useState } from "react";
import { formatBytesPt } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

interface Result {
  url: string;
  name: string;
  size: number;
  pages: number;
  pagesWithoutText: number;
  paragraphs: number;
  headings: number;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const errorMessage = (error: unknown, fileName: string): string => {
  if (error instanceof PdfToWordError) {
    switch (error.code) {
      case "invalid":
        return `${fileName}: este arquivo não é um PDF.`;
      case "encrypted":
        return `${fileName}: o PDF é protegido por senha. Remova a proteção e tente novamente.`;
      case "no-text":
        return `${fileName}: não encontramos texto selecionável neste PDF. Ele parece ser um documento digitalizado (imagens de páginas). Esta primeira versão não faz OCR e só converte PDFs com texto.`;
      case "too-many-pages":
        return `${fileName}: o PDF tem mais de ${MAX_PAGES} páginas, acima do limite desta ferramenta.`;
      default:
        return `${fileName}: não foi possível ler este PDF. Ele pode estar corrompido ou usar um formato sem suporte.`;
    }
  }
  return "Não foi possível converter o PDF. Tente novamente ou use um arquivo menor.";
};

export default function PdfParaWord() {
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
    setStatus("Arquivo removido. Selecione outro PDF para começar.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "Abrindo o PDF…";
    if (p.stage === "building") return "Montando o documento Word…";
    return `Extraindo o texto da página ${p.page} de ${p.pages}…`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (selected.size === 0) return setError(`${selected.name}: o arquivo está vazio.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${selected.name}: este arquivo não é um PDF.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name}: tem ${formatBytesPt(selected.size)}, acima do limite de ${formatBytesPt(MAX_FILE_BYTES)}.`);

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
      setStatus("Documento Word criado com sucesso!");
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
              `${plural(result.pagesWithoutText, "página não tem", "páginas não têm")} texto selecionável (possivelmente digitalizada${result.pagesWithoutText === 1 ? "" : "s"}) e ficou fora do documento. Esta versão não faz OCR.`,
            ]
          : []),
        "Tabelas, colunas, imagens e a formatação exata das páginas podem não ser mantidas. Revise o documento no Word antes de usar.",
      ]
    : [];

  return (
    <div className="ic" lang="pt-BR">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Arraste e solte seu arquivo PDF aqui"
        emptySub={`Selecione um PDF com texto para converter em Word. Até ${formatBytesPt(MAX_FILE_BYTES)}.`}
        filledSub={file ? formatBytesPt(file.size) : ""}
        buttonLabel="Selecionar arquivo PDF"
        moreLabel="Escolher outro PDF"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Área para soltar o arquivo PDF"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Seu arquivo é processado no seu dispositivo e não é enviado para um servidor. Funciona com PDFs que têm texto
        selecionável; PDFs digitalizados (imagens) não são suportados nesta versão.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Convertendo o PDF…" : status}
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
          title="Documento Word criado!"
          fileName={result.name}
          details={[
            { label: "Formato", value: "DOCX (Word)" },
            { label: "Tamanho", value: formatBytesPt(result.size) },
            { label: "Páginas lidas", value: String(result.pages - result.pagesWithoutText) },
            { label: "Títulos", value: String(result.headings) },
            { label: "Parágrafos", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Baixar DOCX
            </a>
          }
          resetLabel="Converter outro PDF"
          onReset={reset}
        />
      )}
    </div>
  );
}
