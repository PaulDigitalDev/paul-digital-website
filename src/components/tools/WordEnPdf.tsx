import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

// Kept in sync with MAX_FILE_BYTES / MAX_PAGES in lib/docxToPdf. The converter is imported lazily,
// so these are repeated here to validate the file before any conversion code is downloaded.
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_PAGES = 300;
const fmt = (bytes: number) => formatBytes(bytes, "fr-FR");

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
      return `${fileName} : ce fichier n'est pas un document .docx valide.`;
    case "legacy":
      return `${fileName} : il s'agit d'un ancien fichier Word (.doc) ou d'un fichier protégé par mot de passe. Ouvrez-le dans Word, retirez le mot de passe le cas échéant, puis enregistrez-le au format .docx.`;
    case "encrypted":
      return `${fileName} : le fichier est protégé par un mot de passe. Retirez la protection, puis réessayez.`;
    case "corrupt":
      return `${fileName} : le fichier semble corrompu et est illisible. Essayez de l'ouvrir dans Word, puis de le réenregistrer au format .docx.`;
    case "too-large":
      return `${fileName} : le document est trop volumineux pour être traité dans le navigateur (limite de ${MAX_PAGES} pages et de contenu interne raisonnable). Divisez-le en parties plus petites.`;
    case "unsupported":
      return `${fileName} : ce document utilise une compression non prise en charge par le navigateur ou des fonctionnalités incompatibles.`;
    case "empty":
      return `${fileName} : aucun texte ni aucune image convertible n'a été trouvé dans ce document.`;
    default:
      return `${fileName} : le document n'a pas pu être converti. Réessayez ou utilisez un fichier plus petit.`;
  }
};

const noticeText: Record<string, string> = {
  headerFooter: "Les en-têtes, pieds de page et numéros de page ne sont pas inclus.",
  footnotes: "Les notes de bas de page et notes de fin ne sont pas incluses.",
  textbox: "Les zones de texte ne sont pas incluses.",
  shape: "Les formes, dessins vectoriels et objets incorporés ne sont pas inclus.",
  chart: "Les graphiques ne sont pas inclus.",
  equation: "Les équations ne sont pas incluses.",
  anchoredImage: "Les images flottantes sont placées au fil du texte ; leur position peut donc changer.",
  unsupportedImage: "Certaines images dans un format non pris en charge ont été ignorées.",
  replacedChars: "Certains caractères absents des polices standard du PDF (emoji, écritures non latines…) ont été remplacés par « ? ».",
};

export default function WordEnPdf() {
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
    setStatus("Fichier retiré. Choisissez un autre document pour recommencer.");
  };

  const convert = async (selected: File) => {
    if (runningRef.current) return;
    clearResult();
    setError("");
    setStatus("");
    if (/\.doc$/i.test(selected.name)) return setError(errorMessage("legacy", selected.name));
    if (!/\.docx$/i.test(selected.name)) return setError(`${selected.name} : seuls les fichiers Word .docx sont pris en charge.`);
    if (selected.size === 0) return setError(`${selected.name} : le fichier est vide.`);
    if (selected.size > MAX_FILE_BYTES)
      return setError(`${selected.name} : ${fmt(selected.size)}, ce qui dépasse la limite de ${fmt(MAX_FILE_BYTES)}.`);

    setFile(selected);
    runningRef.current = true;
    setBusy(true);
    try {
      setProgress("Préparation du convertisseur…");
      const { convertDocxToPdf } = await import("../../lib/docxToPdf");
      const bytes = new Uint8Array(await selected.arrayBuffer());
      const out = await convertDocxToPdf(bytes, selected.name, (p) => {
        if (p.stage === "reading") setProgress("Lecture du document…");
        else if (p.stage === "saving") setProgress("Création du PDF…");
        else setProgress(`Mise en page du document… ${Math.round((p.done / Math.max(1, p.total)) * 100)}%`);
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
      setStatus("Le PDF a été créé !");
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
        "Le PDF utilise les polices standard et non celles du document ; les sauts de ligne et de page peuvent donc différer de Word. Vérifiez le PDF avant de l'envoyer.",
      ]
    : [];

  return (
    <div className="ic" lang="fr">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Glissez-déposez votre fichier Word (.docx) ici"
        emptySub={`Sélectionnez un document .docx à convertir en PDF. Maximum : ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={file ? fmt(file.size) : ""}
        buttonLabel="Sélectionner un fichier Word"
        moreLabel="Choisir un autre fichier"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple={false}
        busy={busy}
        ariaLabel="Zone de dépôt du fichier Word"
        onFiles={(files) => void convert(files[0])}
      />
      <p className="ic-hint">
        Votre fichier est traité sur votre appareil et n'est envoyé à aucun serveur. La conversion est approximative :
        le texte, la mise en forme de base, les listes, les tableaux et les images au fil du texte sont conservés, mais la mise en page peut différer de celle de Word.
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
          tone={result.notices.length > 0 ? "warning" : "success"}
          title="Le PDF a été créé !"
          fileName={result.name}
          details={[
            { label: "Format", value: "PDF" },
            { label: "Taille", value: fmt(result.size) },
            { label: "Pages", value: String(result.pages) },
            { label: "Tableaux", value: String(result.tables) },
            { label: "Images", value: String(result.images) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={result.url} download={result.name}>
              Télécharger le PDF
            </a>
          }
          resetLabel="Convertir un autre document"
          onReset={reset}
        />
      )}
    </div>
  );
}
