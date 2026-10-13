import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { MAX_PAGES, PdfToWordError, convertPdfToDocx } from "../../lib/pdfToWord";
import type { ConvertProgress } from "../../lib/pdfToWord";
import { DropArea, ResultPanel } from "./shared";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fmt = (bytes: number) => formatBytes(bytes, "fr-FR");

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
        return `${fileName} : ce fichier n'est pas un PDF.`;
      case "encrypted":
        return `${fileName} : ce PDF est protégé par un mot de passe. Retirez la protection, puis réessayez.`;
      case "no-text":
        return `${fileName} : aucun texte sélectionnable n'a été trouvé dans ce PDF. Il s'agit probablement d'un document numérisé (pages sous forme d'images). L'OCR n'est pas pris en charge : seuls les PDF contenant du texte peuvent être convertis.`;
      case "too-many-pages":
        return `${fileName} : ce PDF compte plus de ${MAX_PAGES} pages, ce qui dépasse la limite de cet outil.`;
      default:
        return `${fileName} : ce PDF est illisible. Le fichier est peut-être corrompu ou dans un format non pris en charge.`;
    }
  }
  return "Le PDF n'a pas pu être converti. Réessayez ou utilisez un fichier plus petit.";
};

export default function PdfEnWord() {
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
    setStatus("Fichier retiré. Choisissez un autre PDF pour recommencer.");
  };

  const describe = (p: ConvertProgress) => {
    if (p.stage === "reading") return "Ouverture du PDF…";
    if (p.stage === "building") return "Création du document Word…";
    return `Extraction du texte : page ${p.page} sur ${p.pages}…`;
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (selected.size === 0) return setError(`${selected.name} : le fichier est vide.`);
    if (!/\.pdf$/i.test(selected.name) && selected.type !== "application/pdf")
      return setError(`${selected.name} : ce fichier n'est pas un PDF.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name} : ${fmt(selected.size)}, ce qui dépasse la limite de ${fmt(MAX_FILE_BYTES)}.`);

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
      setStatus("Le document Word a été créé !");
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
              `${result.pagesWithoutText} page(s) sans texte sélectionnable (probablement numérisées) n'ont pas été incluses dans le document. L'OCR n'est pas pris en charge.`,
            ]
          : []),
        "Les tableaux, colonnes, images et la mise en page exacte ne sont pas forcément conservés. Vérifiez le document dans Word avant de l'utiliser.",
      ]
    : [];

  return (
    <div className="ic" lang="fr">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Glissez-déposez votre fichier PDF ici"
        emptySub={`Sélectionnez un PDF contenant du texte à convertir en Word. Maximum : ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Sélectionner un fichier PDF"
        moreLabel="Choisir un autre fichier"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Zone de dépôt du fichier PDF"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Votre fichier est traité sur votre appareil et n'est envoyé à aucun serveur. L'outil fonctionne avec les PDF
        contenant du texte sélectionnable ; les PDF numérisés (images) ne sont pas pris en charge.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Conversion en cours…" : status}
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
          ariaLabel="Résultat"
          tone={result.pagesWithoutText > 0 ? "warning" : "success"}
          title="Le document Word a été créé !"
          fileName={result.name}
          details={[
            { label: "Format", value: "DOCX (Word)" },
            { label: "Taille", value: fmt(result.size) },
            { label: "Pages lues", value: String(result.pages - result.pagesWithoutText) },
            { label: "Titres", value: String(result.headings) },
            { label: "Paragraphes", value: String(result.paragraphs) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Télécharger le fichier Word
            </a>
          }
          resetLabel="Convertir un autre PDF"
          onReset={reset}
        />
      )}
    </div>
  );
}
