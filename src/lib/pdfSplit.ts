/**
 * Client-side PDF splitting built on the same pdf-lib instance used by the merge tool.
 * Page-range parsing is pure (no library needed); pdf-lib is only loaded when pages are extracted.
 */

import { hasPdfHeader } from "./pdfMerge.ts";

type PdfLib = typeof import("pdf-lib");
let library: Promise<PdfLib> | null = null;
const loadLibrary = () => (library ??= import("pdf-lib"));

export type InspectResult =
  | { ok: true; pages: number }
  | { ok: false; reason: "invalid" | "encrypted" | "corrupt" };

/**
 * Like inspectPdf in pdfMerge.ts, but also recognises encrypted files by the library's error message:
 * pdf-lib's EncryptedPDFError fails `instanceof` once bundled, so relying on the class misreports
 * password-protected PDFs as corrupt.
 */
export async function inspectSourcePdf(bytes: Uint8Array): Promise<InspectResult> {
  if (!hasPdfHeader(bytes)) return { ok: false, reason: "invalid" };
  const { PDFDocument } = await loadLibrary();
  try {
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    return { ok: true, pages: doc.getPageCount() };
  } catch (error) {
    const encrypted = error instanceof Error && (error.name === "EncryptedPDFError" || /encrypted/i.test(error.message));
    return { ok: false, reason: encrypted ? "encrypted" : "corrupt" };
  }
}

export type RangeErrorCode = "empty" | "syntax" | "zero" | "reversed" | "outOfRange" | "duplicate";

export interface RangeError {
  code: RangeErrorCode;
  /** The offending piece of the text (e.g. "5-3"), or the page number for duplicates. */
  token: string;
  /** The document's page count, for outOfRange errors. */
  total: number;
}

/** One requested selection: consecutive pages from a single token such as "8-10", or one page. */
export interface PageGroup {
  /** 1-based page numbers, ascending. */
  pages: number[];
  /** Label used in filenames, e.g. "8-10" or "5". */
  label: string;
}

export type ParseResult = { ok: true; groups: PageGroup[] } | { ok: false; error: RangeError };

/**
 * Parses text such as "1-3, 5, 8-10" against a document of `total` pages.
 * Separators are commas or semicolons; dashes may be hyphens or en/em dashes.
 * Reversed ranges ("5-3"), page 0, pages beyond the document, malformed pieces and pages that
 * appear twice are all rejected. With `keepOrder` false, groups are sorted into document order.
 */
export function parsePageRanges(input: string, total: number, keepOrder = true): ParseResult {
  const text = input.trim();
  if (!text) return { ok: false, error: { code: "empty", token: "", total } };
  const seen = new Set<number>();
  const groups: PageGroup[] = [];
  for (const raw of text.split(/[,;]/)) {
    const token = raw.trim();
    const match = /^(\d{1,7})(?:\s*[-–—]\s*(\d{1,7}))?$/.exec(token);
    if (!match) return { ok: false, error: { code: "syntax", token: token || raw, total } };
    const from = Number(match[1]);
    const to = match[2] === undefined ? from : Number(match[2]);
    if (from < 1 || to < 1) return { ok: false, error: { code: "zero", token, total } };
    if (to < from) return { ok: false, error: { code: "reversed", token, total } };
    if (to > total) return { ok: false, error: { code: "outOfRange", token, total } };
    const pages: number[] = [];
    for (let page = from; page <= to; page++) {
      if (seen.has(page)) return { ok: false, error: { code: "duplicate", token: String(page), total } };
      seen.add(page);
      pages.push(page);
    }
    groups.push({ pages, label: from === to ? String(from) : `${from}-${to}` });
  }
  if (!keepOrder) groups.sort((a, b) => a.pages[0] - b.pages[0]);
  return { ok: true, groups };
}

/** Collapses a set of pages into compact text, e.g. [1,2,3,5,8,9] -> "1-3, 5, 8-9". */
export function formatPageRanges(pages: Iterable<number>): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(j > i ? `${sorted[i]}-${sorted[j]}` : String(sorted[i]));
    i = j + 1;
  }
  return parts.join(", ");
}

/** One group per page: the "split everything into single pages" mode. */
export function singlePageGroups(total: number): PageGroup[] {
  return Array.from({ length: total }, (_, i) => ({ pages: [i + 1], label: String(i + 1) }));
}

/** Merges groups into one group (the "extract into a single PDF" mode). */
export function combineGroups(groups: PageGroup[]): PageGroup {
  const pages = groups.flatMap((group) => group.pages);
  return { pages, label: groups.map((group) => group.label).join("_") };
}

/** A safe base file name (no extension, no path or reserved characters) taken from the source file. */
export function baseName(fileName: string, fallback = "documento"): string {
  const stem = fileName.replace(/\.pdf$/i, "");
  const cleaned = stem
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ")
    .replace(/\s+/g, "_")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, 60);
  return cleaned || fallback;
}

/** `documento_pagina_5.pdf`, `documento_paginas_1-3.pdf`; very long labels fall back to a short form. */
export function outputFileName(
  base: string,
  group: PageGroup,
  words: { one: string; many: string } = { one: "pagina", many: "paginas" },
): string {
  const single = group.pages.length === 1;
  const label = group.label.length > 40 ? `${group.pages.length}-${words.many}` : group.label;
  return `${base}_${single ? words.one : words.many}_${label}.pdf`;
}

export interface SplitOutput {
  group: PageGroup;
  bytes: Uint8Array;
}

/**
 * Builds one new PDF per group, copying the pages from the source. The source bytes are never
 * modified. `maxOutputBytes` stops the run early (throwing "output-too-large") on low-memory devices.
 */
export async function splitPdf(
  source: Uint8Array,
  groups: PageGroup[],
  options: { maxOutputBytes?: number; producer?: string; onProgress?: (done: number, total: number) => void } = {},
): Promise<SplitOutput[]> {
  const { PDFDocument } = await loadLibrary();
  const doc = await PDFDocument.load(source, { updateMetadata: false });
  const outputs: SplitOutput[] = [];
  let bytesSoFar = 0;
  for (let i = 0; i < groups.length; i++) {
    options.onProgress?.(i, groups.length);
    // Let the browser paint progress between outputs.
    await new Promise((resolve) => setTimeout(resolve));
    const group = groups[i];
    const out = await PDFDocument.create();
    const copied = await out.copyPages(
      doc,
      group.pages.map((page) => page - 1),
    );
    copied.forEach((page) => out.addPage(page));
    out.setProducer(options.producer ?? "Paul Digital - Dividir PDF");
    out.setCreator(options.producer ?? "Paul Digital - Dividir PDF");
    const bytes = await out.save();
    bytesSoFar += bytes.length;
    if (options.maxOutputBytes !== undefined && bytesSoFar > options.maxOutputBytes) throw new Error("output-too-large");
    outputs.push({ group, bytes });
  }
  options.onProgress?.(groups.length, groups.length);
  return outputs;
}
