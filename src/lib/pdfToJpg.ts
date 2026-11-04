import { setDensity } from "./imageDensity.ts";

/* Renders PDF pages to JPG images in the browser with pdf.js. */

export const MAX_PAGES = 100;
/** Pixels per rendered page. Keeps one page well inside what browsers can allocate for a canvas. */
export const MAX_PAGE_PIXELS = 40_000_000;
export const DPI_CHOICES = [72, 150, 200, 300] as const;
const WORKER_URL = "/vendor/pdfjs/pdf.worker.min.mjs";

export type PdfToJpgErrorCode = "invalid" | "encrypted" | "corrupt" | "too-many-pages" | "render";

export class PdfToJpgError extends Error {
  code: PdfToJpgErrorCode;
  constructor(code: PdfToJpgErrorCode, message = code) {
    super(message);
    this.code = code;
  }
}

/** Page size in PDF points (1/72 inch) and a DPI give the render scale and pixel size, lowering the scale if the page would be too large. */
export function pageRender(widthPt: number, heightPt: number, dpi: number, maxPixels = MAX_PAGE_PIXELS) {
  let scale = dpi / 72;
  let w = Math.max(1, Math.ceil(widthPt * scale));
  let h = Math.max(1, Math.ceil(heightPt * scale));
  let reduced = false;
  if (w * h > maxPixels) {
    scale *= Math.sqrt(maxPixels / (w * h));
    w = Math.max(1, Math.floor(widthPt * scale));
    h = Math.max(1, Math.floor(heightPt * scale));
    reduced = true;
  }
  return { scale, w, h, reduced, effectiveDpi: Math.round(scale * 72) };
}

/** Output file name for a page, padded so the files sort in page order. */
export function pageFileName(base: string, page: number, total: number): string {
  const width = Math.max(2, String(total).length);
  return `${base}-page-${String(page).padStart(width, "0")}.jpg`;
}

export interface RenderedPage {
  page: number;
  name: string;
  blob: Blob;
  width: number;
  height: number;
  reduced: boolean;
}

export interface RenderProgress {
  page: number;
  pages: number;
}

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
let library: Promise<PdfJs> | null = null;
const loadLibrary = () =>
  (library ??= import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
    if (typeof window !== "undefined") lib.GlobalWorkerOptions.workerSrc = WORKER_URL;
    return lib;
  }));

const hasPdfHeader = (bytes: Uint8Array) => {
  let head = "";
  for (let i = 0; i < Math.min(bytes.length, 1024); i++) head += String.fromCharCode(bytes[i]);
  return head.includes("%PDF-");
};

const tick = () => new Promise<void>((resolve) => setTimeout(resolve));

export interface RenderOptions {
  dpi: number;
  quality: number;
  baseName: string;
  onProgress?: (progress: RenderProgress) => void;
  isCancelled?: () => boolean;
}

/** Renders every page of the PDF to a JPG. Pages are drawn on white, since JPG has no transparency. */
export async function renderPdfToJpg(bytes: Uint8Array, options: RenderOptions): Promise<{ pages: RenderedPage[]; total: number }> {
  if (!hasPdfHeader(bytes)) throw new PdfToJpgError("invalid");
  const pdfjs = await loadLibrary();
  const task = pdfjs.getDocument({ data: bytes.slice(), disableFontFace: true, useSystemFonts: false, verbosity: 0 });
  let doc;
  try {
    doc = await task.promise;
  } catch (error) {
    await task.destroy().catch(() => {});
    if ((error as { name?: string })?.name === "PasswordException") throw new PdfToJpgError("encrypted");
    throw new PdfToJpgError("corrupt");
  }
  const out: RenderedPage[] = [];
  try {
    const total = doc.numPages;
    if (total > MAX_PAGES) throw new PdfToJpgError("too-many-pages");
    for (let n = 1; n <= total; n++) {
      if (options.isCancelled?.()) break;
      options.onProgress?.({ page: n, pages: total });
      await tick();
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const size = pageRender(base.width, base.height, options.dpi);
      const viewport = page.getViewport({ scale: size.scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new PdfToJpgError("render", "Your browser could not create a drawing surface for this page.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      try {
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      } catch {
        canvas.width = canvas.height = 0;
        throw new PdfToJpgError("render", `Page ${n} could not be drawn.`);
      }
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", options.quality));
      const width = canvas.width;
      const height = canvas.height;
      canvas.width = canvas.height = 0;
      page.cleanup();
      if (!blob || blob.type !== "image/jpeg") throw new PdfToJpgError("render", "Your browser could not save JPG images.");
      // Label the file with the DPI it was rendered at; the pixels are not touched.
      const labelled = setDensity(new Uint8Array(await blob.arrayBuffer()), Math.max(1, size.effectiveDpi));
      out.push({
        page: n,
        name: pageFileName(options.baseName, n, total),
        blob: new Blob([labelled as BlobPart], { type: "image/jpeg" }),
        width,
        height,
        reduced: size.reduced,
      });
    }
    return { pages: out, total };
  } finally {
    await doc.destroy().catch(() => {});
  }
}
