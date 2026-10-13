/**
 * Client-side PDF size reduction built on pdf-lib (already used by Unir PDF), with no backend.
 *
 * What it genuinely does:
 *  1. Drops objects nothing in the document points to any more (left behind by incremental saves).
 *  2. Applies Flate compression to streams that were stored uncompressed.
 *  3. Re-saves with object streams, which packs the many small objects far tighter.
 *  4. Optionally strips document metadata (Info dictionary and XMP).
 *  5. Optionally re-encodes embedded RGB JPEG images at lower quality / smaller pixel size
 *     (an injected recoder does the pixel work, so this module stays free of DOM APIs).
 *
 * What it does not do: it does not touch vector content, fonts, text, or images stored with
 * other filters (Flate bitmaps, JBIG2, JPEG 2000, CCITT, CMYK or grey JPEGs). A PDF that is
 * already optimised may not shrink at all, and the caller must compare sizes before offering it.
 */
import { hasPdfHeader } from "./pdfMerge.ts";

type PdfLib = typeof import("pdf-lib");
type LibPDFDocument = import("pdf-lib").PDFDocument;
type LibPDFRef = import("pdf-lib").PDFRef;
type LibPDFRawStream = import("pdf-lib").PDFRawStream;
type LibPDFDict = import("pdf-lib").PDFDict;
let library: Promise<PdfLib> | null = null;
const loadLibrary = () => (library ??= import("pdf-lib"));

export type CompressLevel = "lossless" | "balanced" | "strong";

export interface LevelSettings {
  /** JPEG quality 0–1, or null to leave images untouched. */
  quality: number | null;
  /** Longest image side in pixels; larger images are scaled down. */
  maxDimension: number;
}

export const LEVELS: Record<CompressLevel, LevelSettings> = {
  lossless: { quality: null, maxDimension: Infinity },
  balanced: { quality: 0.72, maxDimension: 2000 },
  strong: { quality: 0.55, maxDimension: 1400 },
};

/** Images smaller than this are not worth re-encoding. */
export const MIN_IMAGE_BYTES = 10 * 1024;
/** A re-encoded image must be at most this fraction of the original to be used. */
export const MIN_IMAGE_GAIN = 0.95;

export interface RecodeInput {
  bytes: Uint8Array;
  width: number;
  height: number;
  quality: number;
  maxDimension: number;
}
export interface RecodeOutput {
  bytes: Uint8Array;
  width: number;
  height: number;
}
/** Re-encodes one JPEG, or returns null when it cannot (decode failure, size mismatch…). */
export type JpegRecoder = (input: RecodeInput) => Promise<RecodeOutput | null>;

export interface CompressOptions {
  level: CompressLevel;
  stripMetadata: boolean;
  /** Required for the balanced and strong levels. Without it images are left alone. */
  recodeJpeg?: JpegRecoder;
  onProgress?: (stage: CompressStage, done: number, total: number) => void;
}

export type CompressStage = "reading" | "images" | "streams" | "saving" | "verifying";

export interface CompressStats {
  originalSize: number;
  size: number;
  pages: number;
  imagesFound: number;
  imagesRecompressed: number;
  streamsCompressed: number;
  unusedObjectsRemoved: number;
  metadataRemoved: boolean;
}

export type CompressFailure = "invalid" | "encrypted" | "corrupt" | "verify";

export class CompressError extends Error {
  reason: CompressFailure;
  constructor(reason: CompressFailure) {
    super(reason);
    this.reason = reason;
  }
}

/** Yields to the browser so progress can paint between heavy steps. */
const tick = () => new Promise<void>((resolve) => setTimeout(resolve));

/** zlib-wrapped deflate, which is exactly what /FlateDecode expects. */
export async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new CompressionStream("deflate");
  const writer = stream.writable.getWriter();
  void writer.write(data as BufferSource).catch(() => {});
  void writer.close().catch(() => {});
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

/** pdf-lib throws a plain Error (not EncryptedPDFError) for some encrypted files, so the message is checked too. */
function classifyLoadError(error: unknown, EncryptedPDFError: PdfLib["EncryptedPDFError"]): "encrypted" | "corrupt" {
  return error instanceof EncryptedPDFError || (error instanceof Error && /encrypted/i.test(error.message)) ? "encrypted" : "corrupt";
}

/** Cheap pre-check used when a file is chosen: confirms it is a readable, unencrypted PDF and counts its pages. */
export async function inspectForCompression(bytes: Uint8Array): Promise<{ ok: true; pages: number } | { ok: false; reason: CompressFailure }> {
  if (!hasPdfHeader(bytes)) return { ok: false, reason: "invalid" };
  const { PDFDocument, EncryptedPDFError } = await loadLibrary();
  try {
    return { ok: true, pages: (await PDFDocument.load(bytes, { updateMetadata: false })).getPageCount() };
  } catch (error) {
    return { ok: false, reason: classifyLoadError(error, EncryptedPDFError) };
  }
}

export async function compressPdf(input: Uint8Array, options: CompressOptions): Promise<{ bytes: Uint8Array; stats: CompressStats }> {
  if (!hasPdfHeader(input)) throw new CompressError("invalid");
  const pdf = await loadLibrary();
  const { PDFDocument, EncryptedPDFError, PDFName, PDFNumber, PDFRawStream, PDFDict, PDFArray, PDFRef, PDFBool, PDFStream } = pdf;

  options.onProgress?.("reading", 0, 1);
  let doc: LibPDFDocument;
  let pages: number;
  try {
    doc = await PDFDocument.load(input, { updateMetadata: false });
    pages = doc.getPageCount(); // throws when the catalog or page tree is missing
  } catch (error) {
    // pdf-lib throws a plain Error (not EncryptedPDFError) for some encrypted files, so check the message too.
    const encrypted = error instanceof EncryptedPDFError || (error instanceof Error && /encrypted/i.test(error.message));
    throw new CompressError(encrypted ? "encrypted" : "corrupt");
  }
  const context = doc.context;
  const stats: CompressStats = {
    originalSize: input.length,
    size: 0,
    pages,
    imagesFound: 0,
    imagesRecompressed: 0,
    streamsCompressed: 0,
    unusedObjectsRemoved: 0,
    metadataRemoved: false,
  };

  const name = (value: string) => PDFName.of(value);
  const resolve = (value: unknown) => (value instanceof PDFRef ? context.lookup(value) : value);
  const nameOf = (value: unknown) => {
    const v = resolve(value);
    return v instanceof PDFName ? v.decodeText() : undefined;
  };
  const numberOf = (value: unknown) => {
    const v = resolve(value);
    return v instanceof PDFNumber ? v.asNumber() : undefined;
  };
  /** The single filter of a stream, or null when it has none; "multi" for filter chains. */
  const filterOf = (dict: LibPDFDict): string | null => {
    const filter = resolve(dict.get(name("Filter")));
    if (filter === undefined) return null;
    if (filter instanceof PDFName) return filter.decodeText();
    if (filter instanceof PDFArray) {
      if (filter.size() === 0) return null;
      return filter.size() === 1 ? (nameOf(filter.get(0)) ?? "multi") : "multi";
    }
    return "multi";
  };

  // 1. Metadata.
  if (options.stripMetadata) {
    const catalog = doc.catalog;
    if (catalog.has(name("Metadata"))) {
      catalog.delete(name("Metadata"));
      stats.metadataRemoved = true;
    }
    if (context.trailerInfo.Info) {
      context.trailerInfo.Info = undefined;
      stats.metadataRemoved = true;
    }
  }

  // 2. Unreferenced objects.
  const reachable = new Set<LibPDFRef>();
  const stack: unknown[] = [context.trailerInfo.Root, context.trailerInfo.Info];
  while (stack.length) {
    const node = stack.pop();
    if (node instanceof PDFRef) {
      if (reachable.has(node)) continue;
      reachable.add(node);
      stack.push(context.lookup(node));
    } else if (node instanceof PDFDict) {
      for (const [, value] of node.entries()) stack.push(value);
    } else if (node instanceof PDFArray) {
      for (let i = 0; i < node.size(); i++) stack.push(node.get(i));
    } else if (node instanceof PDFStream) {
      stack.push(node.dict);
    }
  }
  const reachableTags = new Set([...reachable].map((ref) => ref.tag));
  for (const [ref] of context.enumerateIndirectObjects()) {
    if (!reachableTags.has(ref.tag)) {
      context.delete(ref);
      stats.unusedObjectsRemoved++;
    }
  }

  // 3. Images (lossy, opt-in by level).
  const settings = LEVELS[options.level];
  const objects = context.enumerateIndirectObjects();
  const imageRefs: [LibPDFRef, LibPDFRawStream][] = [];
  for (const [ref, object] of objects) {
    if (object instanceof PDFRawStream && nameOf(object.dict.get(name("Subtype"))) === "Image") imageRefs.push([ref, object]);
  }
  stats.imagesFound = imageRefs.length;

  const isRgb = (colorSpace: unknown): boolean => {
    const cs = resolve(colorSpace);
    if (cs instanceof PDFName) return cs.decodeText() === "DeviceRGB";
    if (cs instanceof PDFArray && cs.size() === 2 && nameOf(cs.get(0)) === "ICCBased") {
      const profile = resolve(cs.get(1));
      return profile instanceof PDFStream && numberOf(profile.dict.get(name("N"))) === 3;
    }
    return false;
  };

  if (settings.quality !== null && options.recodeJpeg) {
    let done = 0;
    for (const [ref, stream] of imageRefs) {
      options.onProgress?.("images", done++, imageRefs.length);
      const dict = stream.dict;
      const width = numberOf(dict.get(name("Width")));
      const height = numberOf(dict.get(name("Height")));
      const eligible =
        filterOf(dict) === "DCTDecode" &&
        !dict.has(name("DecodeParms")) &&
        !dict.has(name("Decode")) &&
        !dict.has(name("Mask")) &&
        numberOf(dict.get(name("BitsPerComponent"))) === 8 &&
        !(resolve(dict.get(name("ImageMask"))) === PDFBool.True) &&
        isRgb(dict.get(name("ColorSpace"))) &&
        width !== undefined &&
        height !== undefined &&
        stream.contents.length >= MIN_IMAGE_BYTES;
      if (!eligible) continue;
      await tick();
      let recoded: RecodeOutput | null = null;
      try {
        recoded = await options.recodeJpeg({
          bytes: stream.contents,
          width: width!,
          height: height!,
          quality: settings.quality,
          maxDimension: settings.maxDimension,
        });
      } catch {
        recoded = null;
      }
      if (!recoded || recoded.bytes.length > stream.contents.length * MIN_IMAGE_GAIN) continue;
      dict.set(name("Width"), PDFNumber.of(recoded.width));
      dict.set(name("Height"), PDFNumber.of(recoded.height));
      dict.set(name("Length"), PDFNumber.of(recoded.bytes.length));
      context.assign(ref, PDFRawStream.of(dict, recoded.bytes));
      stats.imagesRecompressed++;
    }
    options.onProgress?.("images", imageRefs.length, imageRefs.length);
  }

  // 4. Flate-compress streams stored raw.
  const streams: [LibPDFRef, LibPDFRawStream][] = [];
  for (const [ref, object] of context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    const dict = object.dict;
    const type = nameOf(dict.get(name("Type")));
    if (type === "XRef" || type === "ObjStm" || type === "Metadata") continue;
    if (dict.has(name("Filter")) || dict.has(name("DecodeParms")) || dict.has(name("F"))) continue;
    if (object.contents.length < 128) continue;
    streams.push([ref, object]);
  }
  let streamDone = 0;
  for (const [ref, stream] of streams) {
    options.onProgress?.("streams", streamDone++, streams.length);
    if (streamDone % 20 === 0) await tick();
    const packed = await deflate(stream.contents);
    if (packed.length >= stream.contents.length) continue;
    stream.dict.set(name("Filter"), name("FlateDecode"));
    stream.dict.set(name("Length"), PDFNumber.of(packed.length));
    context.assign(ref, PDFRawStream.of(stream.dict, packed));
    stats.streamsCompressed++;
  }

  // 5. Save and verify.
  options.onProgress?.("saving", 0, 1);
  await tick();
  const output = await doc.save({ useObjectStreams: true });

  options.onProgress?.("verifying", 0, 1);
  try {
    const check = await PDFDocument.load(output, { updateMetadata: false });
    if (check.getPageCount() !== pages) throw new Error("page count changed");
  } catch {
    throw new CompressError("verify");
  }
  stats.size = output.length;
  return { bytes: output, stats };
}

/**
 * Size change as a signed whole-number-friendly percentage: positive = smaller, negative = larger.
 * Computed from the real byte counts, never estimated.
 */
export function savedPercent(original: number, result: number): number {
  if (original <= 0) return 0;
  return ((original - result) / original) * 100;
}

/** Spanish-formatted percentage with one decimal below 10 %, e.g. "37 %" or "4,2 %". */
export function formatPercent(value: number, locale: string): string {
  const abs = Math.abs(value);
  const digits = abs < 10 ? 1 : 0;
  return `${abs.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })} %`;
}
