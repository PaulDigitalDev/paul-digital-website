import { useEffect, useRef, useState } from "react";
import { CompressError, compressPdf, inspectForCompression, savedPercent } from "../../lib/pdfCompress";
import type { CompressLevel, CompressStage, CompressStats } from "../../lib/pdfCompress";
import { recodeJpegInBrowser } from "../../lib/jpegRecode";
import { formatBytes } from "../../lib/pdfMerge";
import { DropArea, ResultPanel } from "./shared";

const LOCALE = "fr-FR";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Below this gain the result is reported as "no meaningful change" rather than a success. */
const MEANINGFUL_PERCENT = 1;

const LEVELS: { id: CompressLevel; label: string; hint: string }[] = [
  { id: "lossless", label: "Compression légère", hint: "Réorganise le fichier et compresse sa structure. Les images ne sont pas modifiées." },
  {
    id: "balanced",
    label: "Compression équilibrée (recommandée)",
    hint: "Réduit aussi les images JPEG : qualité moyenne à élevée, 2 000 pixels maximum par côté.",
  },
  {
    id: "strong",
    label: "Compression maximale",
    hint: "Réduit davantage les images JPEG : qualité moyenne, 1 400 pixels maximum par côté. La perte peut être visible sur les photos et les documents numérisés.",
  },
];

const STAGE_TEXT: Record<CompressStage, string> = {
  reading: "Lecture du PDF…",
  images: "Optimisation des images",
  streams: "Compression du contenu",
  saving: "Enregistrement du nouveau PDF…",
  verifying: "Vérification de l'ouverture correcte du résultat…",
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

/** French-formatted percentage: one decimal below 10, e.g. "37 %" or "4,2 %". */
const formatPercent = (value: number, _locale: string) => {
  const abs = Math.abs(value);
  const digits = abs < 10 ? 1 : 0;
  return `${abs.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits })}\u202f%`;
};
const fmt = (bytes: number) => formatBytes(bytes, LOCALE);

function outputName(name: string) {
  return `${name.replace(/\.pdf$/i, "") || "document"}-compresse.pdf`;
}

export default function CompresserPdf() {
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
    setStatus("Fichier retiré. Choisissez un autre PDF pour recommencer.");
  };

  const pickFile = async (files: File[]) => {
    if (busy || files.length === 0) return;
    const file = files[0];
    clearResult();
    setStatus("");
    setErrors([]);
    setSelected(null);
    const problems: string[] = [];
    if (files.length > 1) problems.push("Un seul PDF peut être compressé à la fois. Le premier fichier a été utilisé.");
    if (file.size === 0) return setErrors([`${file.name} : le fichier est vide.`]);
    if (file.size > MAX_FILE_BYTES)
      return setErrors([`${file.name} : ${fmt(file.size)}, ce qui dépasse la limite de ${fmt(MAX_FILE_BYTES)}.`]);
    setBusy(true);
    setProgress(`Lecture de ${file.name}…`);
    try {
      const info = await inspectForCompression(new Uint8Array(await file.arrayBuffer()));
      if (!info.ok) {
        problems.push(
          info.reason === "encrypted"
            ? `${file.name} : ce PDF est protégé par un mot de passe. Cet outil ne peut pas retirer la protection ; retirez-la d'abord avec l'application qui vous sert à ouvrir le fichier, puis réessayez.`
            : info.reason === "invalid"
              ? `${file.name} : ce fichier n'est pas un PDF.`
              : `${file.name} : ce PDF est illisible. Le fichier est peut-être corrompu.`,
        );
        return setErrors(problems);
      }
      setErrors(problems);
      setSelected({ file, pages: info.pages });
      setStatus("PDF prêt. Choisissez un niveau de compression, puis cliquez sur « Compresser le PDF ».");
    } catch {
      setErrors([`${file.name} : ce fichier est illisible.`]);
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
          setProgress(stage === "images" || stage === "streams" ? `${STAGE_TEXT[stage]} (${Math.min(done + 1, total)} sur ${total})…` : STAGE_TEXT[stage]);
          setPercent(stage === "images" && total > 0 ? Math.round((done / total) * 100) : null);
        },
      });
      original = null; // release the input buffer
      const smaller = bytes.length < file.size;
      const compressedUrl = smaller ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })) : null;
      const originalUrl = URL.createObjectURL(file);
      urls.current = [originalUrl, ...(compressedUrl ? [compressedUrl] : [])];
      setOutcome({ stats, compressedUrl, originalUrl, level });
      setStatus(smaller ? "Compression terminée." : "Compression terminée : ce PDF n'a pas pu être réduit.");
    } catch (error) {
      const reason = error instanceof CompressError ? error.reason : "other";
      setErrors([
        reason === "encrypted"
          ? "Ce PDF est protégé par un mot de passe et ne peut pas être compressé."
          : reason === "invalid"
            ? "Ce fichier n'est pas un PDF."
            : reason === "corrupt"
              ? "Ce PDF est illisible. Le fichier est peut-être corrompu."
              : reason === "verify"
                ? "Le PDF obtenu n'a pas réussi la vérification et n'est donc pas proposé. Votre fichier d'origine n'a pas été modifié."
                : "Le PDF n'a pas pu être compressé. Essayez un autre niveau ou un fichier plus petit.",
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
      notes.push(`Images optimisées : ${stats.imagesRecompressed} sur ${stats.imagesFound}.`);
    else if (outcome.level !== "lossless" && stats.imagesFound > 0)
      notes.push("Aucune image JPEG n'a pu être réduite sans risque ; les images dans d'autres formats sont laissées telles quelles.");
    if (stats.streamsCompressed > 0) notes.push(`Blocs de contenu compressés : ${stats.streamsCompressed}.`);
    if (stats.unusedObjectsRemoved > 0) notes.push(`Données inutilisées supprimées : ${stats.unusedObjectsRemoved} objet(s).`);
    if (stats.metadataRemoved) notes.push("Métadonnées du document supprimées.");
    notes.push("Si le PDF comporte une signature numérique, celle-ci n'est plus valide dans le fichier compressé.");

    const downloadOriginal = (primary: boolean) => (
      <a className={primary ? "button button-download" : "button"} href={originalUrl} download={selected.file.name}>
        Télécharger le fichier d'origine
      </a>
    );

    if (smaller) {
      return (
        <ResultPanel
          ariaLabel="Résultat"
          tone="success"
          title="PDF compressé"
          summary={`La taille du fichier a diminué de ${formatPercent(change, LOCALE)}.`}
          fileName={outputName(selected.file.name)}
          details={[
            { label: "Taille d'origine", value: fmt(original) },
            { label: "Taille après compression", value: fmt(stats.size) },
            { label: "Réduction", value: formatPercent(change, LOCALE) },
            { label: "Pages", value: String(stats.pages) },
          ]}
          notes={notes}
          primary={
            <a className="button button-download" href={compressedUrl!} download={outputName(selected.file.name)}>
              Télécharger le PDF
            </a>
          }
          secondary={downloadOriginal(false)}
          resetLabel="Compresser un autre PDF"
          onReset={reset}
        />
      );
    }
    return (
      <ResultPanel
        ariaLabel="Résultat"
        tone="warning"
        title={larger ? "Le résultat serait plus volumineux" : "Ce PDF n'a pas pu être réduit"}
        summary={
          larger
            ? `Le PDF obtenu ferait ${fmt(stats.size)}, soit ${formatPercent(-change, LOCALE)} de plus que l'original (${fmt(original)}). Il n'est pas proposé au téléchargement ; il vaut mieux conserver le fichier d'origine.`
            : `La taille ne change presque pas (${fmt(original)} → ${fmt(stats.size)}). Le fichier est probablement déjà optimisé ; il vaut mieux conserver le fichier d'origine.`
        }
        details={[
          { label: "Taille d'origine", value: fmt(original) },
          { label: "Taille du résultat", value: fmt(stats.size) },
          { label: "Variation", value: Math.abs(change) < 0.05 ? "Inchangée" : `${change < 0 ? "+" : "−"}${formatPercent(change, LOCALE)}` },
          { label: "Pages", value: String(stats.pages) },
        ]}
        notes={outcome.level === "strong" ? notes.slice(0, -1) : [...notes.slice(0, -1), "Essayez un autre niveau de compression : le résultat dépend du contenu du PDF."]}
        primary={downloadOriginal(true)}
        resetLabel="Essayer un autre PDF"
        onReset={reset}
      />
    );
  };

  return (
    <div className="ic" lang="fr">
      <DropArea
        title={selected ? selected.file.name : ""}
        hasFiles={selected !== null}
        emptyTitle="Glissez-déposez votre fichier PDF ici"
        emptySub={`Sélectionnez un PDF à compresser. Maximum : ${fmt(MAX_FILE_BYTES)}.`}
        filledSub={selected ? `${selected.pages} page(s) · ${fmt(selected.file.size)} · vous pouvez choisir un autre fichier` : ""}
        buttonLabel="Sélectionner un fichier PDF"
        moreLabel="Choisir un autre fichier"
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        ariaLabel="Zone de dépôt du fichier PDF"
        onFiles={(files) => void pickFile(files)}
      />
      <p className="ic-hint">Votre fichier est traité sur votre appareil et n'est envoyé à aucun serveur.</p>

      <form
        className="ic-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="ic-field">
          <label htmlFor="cp-level">Niveau de compression</label>
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
            Supprimer les métadonnées du document (titre, auteur, application source)
          </label>
        </div>
        <button type="submit" className="button button-primary ic-submit" disabled={!selected || busy}>
          {busy ? "Compression en cours…" : "Compresser le PDF"}
        </button>
      </form>
      <p className="ic-hint">
        {LEVELS.find((item) => item.id === level)?.hint} Le résultat dépend du contenu du PDF et aucune réduction précise ne peut être garantie.
      </p>

      <div className="ic-status" role="status" aria-live="polite">
        {busy ? <span className="ic-spinner" aria-hidden="true" /> : null}
        {busy ? "Compression en cours…" : status}
      </div>
      {busy && progress ? (
        <div className="ic-hint ic-progress">
          <span aria-hidden="true">{progress}</span>
          {percent !== null ? <progress value={percent} max={100} aria-label="Progression du traitement des images" style={{ display: "block", width: "100%", marginTop: 6 }} /> : null}
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
