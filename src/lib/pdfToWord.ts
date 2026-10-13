/**
 * PDF → Word, entirely in the browser. pdf.js (loaded on demand, worker self-hosted) extracts positioned text;
 * pdfTextLayout rebuilds headings and paragraphs; textDocx writes the .docx. Text-based PDFs only (no OCR).
 */
import { countChars, layoutPages } from "./pdfTextLayout.ts";
import type { Block, PageText, TextFragment } from "./pdfTextLayout.ts";
import { buildTextDocx } from "./textDocx.ts";

export const MAX_PAGES = 500;
const WORKER_URL = "/vendor/pdfjs/pdf.worker.min.mjs";

export type PdfToWordErrorCode = "invalid" | "encrypted" | "corrupt" | "no-text" | "too-many-pages";

export class PdfToWordError extends Error {
  code: PdfToWordErrorCode;
  constructor(code: PdfToWordErrorCode, message = code) {
    super(message);
    this.code = code;
  }
}

export interface ConvertProgress {
  stage: "reading" | "extracting" | "building";
  page?: number;
  pages?: number;
}

export interface ConvertResult {
  blob: Blob;
  pages: number;
  pagesWithoutText: number;
  paragraphs: number;
  headings: number;
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

/** Extracts positioned text per page. Throws PdfToWordError for unusable files. */
export async function extractPages(
  bytes: Uint8Array,
  onProgress?: (progress: ConvertProgress) => void,
): Promise<PageText[]> {
  if (!hasPdfHeader(bytes)) throw new PdfToWordError("invalid");
  const pdfjs = await loadLibrary();
  // pdf.js transfers the buffer to its worker, so hand it a copy and keep the caller's bytes usable.
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    disableFontFace: true,
    useSystemFonts: false,
    verbosity: 0,
  });
  let doc;
  try {
    doc = await task.promise;
  } catch (error) {
    await task.destroy().catch(() => {});
    const name = (error as { name?: string })?.name;
    if (name === "PasswordException") throw new PdfToWordError("encrypted");
    if (name === "InvalidPDFException") throw new PdfToWordError("corrupt");
    throw new PdfToWordError("corrupt");
  }

  try {
    if (doc.numPages > MAX_PAGES) throw new PdfToWordError("too-many-pages");
    const pages: PageText[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      onProgress?.({ stage: "extracting", page: n, pages: doc.numPages });
      await tick();
      const page = await doc.getPage(n);
      const [x0, y0, x1, y1] = page.view;
      const content = await page.getTextContent();

      // Font names are only resolved to bold/italic flags once the page's fonts are loaded.
      const names = new Set<string>();
      for (const item of content.items) if ("fontName" in item) names.add(item.fontName);
      if ([...names].some((name) => !page.commonObjs.has(name))) {
        try {
          await page.getOperatorList();
        } catch {
          /* styling is best-effort; text is still extracted */
        }
      }
      const style = new Map<string, { bold: boolean; italic: boolean }>();
      for (const name of names) {
        let bold = false;
        let italic = false;
        try {
          if (page.commonObjs.has(name)) {
            const font = page.commonObjs.get(name);
            bold = Boolean(font?.bold || font?.black);
            italic = Boolean(font?.italic);
          }
        } catch {
          /* unresolved font: plain text */
        }
        style.set(name, { bold, italic });
      }

      const fragments: TextFragment[] = [];
      for (const item of content.items) {
        if (!("str" in item) || !item.str) continue;
        const [a, b, , d, e, f] = item.transform;
        if (Math.abs(b) > 0.1 * Math.abs(a)) continue; // rotated or vertical text is not reconstructed
        const flags = style.get(item.fontName) ?? { bold: false, italic: false };
        fragments.push({
          text: item.str,
          x: e - x0,
          y: f - y0,
          width: item.width,
          size: Math.abs(d) || Math.abs(a),
          ...flags,
        });
      }
      pages.push({ width: x1 - x0, height: y1 - y0, fragments });
      page.cleanup();
    }
    return pages;
  } finally {
    await task.destroy().catch(() => {});
  }
}

export function summarizeBlocks(blocks: Block[]) {
  return {
    headings: blocks.filter((b) => b.kind === "heading").length,
    paragraphs: blocks.filter((b) => b.kind === "paragraph").length,
  };
}

/** Full pipeline: PDF bytes → .docx Blob. */
export async function convertPdfToDocx(
  bytes: Uint8Array,
  title: string,
  onProgress?: (progress: ConvertProgress) => void,
): Promise<ConvertResult> {
  onProgress?.({ stage: "reading" });
  const pages = await extractPages(bytes, onProgress);
  const pagesWithoutText = pages.filter((page) => countChars(page) === 0).length;
  if (pagesWithoutText === pages.length) throw new PdfToWordError("no-text");
  onProgress?.({ stage: "building" });
  await tick();
  const blocks = layoutPages(pages);
  if (blocks.length === 0) throw new PdfToWordError("no-text");
  const letter = Math.abs(pages[0].width - 612) < 3 && Math.abs(pages[0].height - 792) < 3;
  const blob = buildTextDocx(blocks, letter ? "letter" : "a4", title);
  return { blob, pages: pages.length, pagesWithoutText, ...summarizeBlocks(blocks) };
}
