/**
 * Client-side PDF merging built on pdf-lib. The library is loaded on demand so it is only
 * downloaded when someone actually adds or merges a PDF.
 */

export const PDF_MAGIC = "%PDF-";

export type InspectResult =
  | { ok: true; pages: number }
  | { ok: false; reason: "invalid" | "encrypted" | "corrupt" };

type PdfLib = typeof import("pdf-lib");
let library: Promise<PdfLib> | null = null;
const loadLibrary = () => (library ??= import("pdf-lib"));

/** True when the first bytes (allowing a little leading junk, as the spec does) contain a PDF header. */
export function hasPdfHeader(bytes: Uint8Array): boolean {
  let head = "";
  const end = Math.min(bytes.length, 1024);
  for (let i = 0; i < end; i++) head += String.fromCharCode(bytes[i]);
  return head.includes(PDF_MAGIC);
}

/** Checks that the bytes are a readable, unencrypted PDF and returns its page count. */
export async function inspectPdf(bytes: Uint8Array): Promise<InspectResult> {
  if (!hasPdfHeader(bytes)) return { ok: false, reason: "invalid" };
  const { PDFDocument, EncryptedPDFError } = await loadLibrary();
  try {
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    return { ok: true, pages: doc.getPageCount() };
  } catch (error) {
    if (error instanceof EncryptedPDFError) return { ok: false, reason: "encrypted" };
    return { ok: false, reason: "corrupt" };
  }
}

/** Concatenates the pages of every PDF, in order, into one new PDF. */
export async function mergePdfs(
  sources: Uint8Array[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ bytes: Uint8Array; pages: number }> {
  const { PDFDocument } = await loadLibrary();
  const output = await PDFDocument.create();
  for (let i = 0; i < sources.length; i++) {
    onProgress?.(i, sources.length);
    // Let the browser paint progress between large files.
    await new Promise((resolve) => setTimeout(resolve));
    const doc = await PDFDocument.load(sources[i], { updateMetadata: false });
    const copied = await output.copyPages(doc, doc.getPageIndices());
    copied.forEach((page) => output.addPage(page));
  }
  output.setProducer("Paul Digital - Juntar PDF");
  output.setCreator("Paul Digital - Juntar PDF");
  const bytes = await output.save();
  return { bytes, pages: output.getPageCount() };
}

/** Brazilian Portuguese file size, e.g. "1,4 MB". */
export function formatBytesPt(bytes: number): string {
  return formatBytes(bytes, "pt-BR");
}

/** File size with locale-specific decimals, e.g. "1,4 MB". */
export function formatBytes(bytes: number, locale: string): string {
  const units = locale.startsWith("ru") ? ["байт", "КБ", "МБ", "ГБ"] : ["bytes", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${units[unit]}`;
}
