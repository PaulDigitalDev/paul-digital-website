/**
 * Browser-only DOCX -> PDF conversion. docxModel.ts reads the package; this file lays the content out
 * on pages (word wrap, alignment, lists, tables, images, page breaks) and draws it with pdf-lib using
 * the standard PDF fonts. It never touches the network. It is a text-flow renderer, not Word's engine:
 * fonts are substituted and complex features (headers, text boxes, floating layout) are not reproduced.
 */
import type { PDFDocument, PDFFont, PDFImage, PDFPage } from "pdf-lib";
import { DocxError, readDocx } from "./docxModel.ts";
import type { Block, Cell, Feature, Inline, Para, RunProps, Section, Table } from "./docxModel.ts";

export { DocxError };

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_PAGES = 300;

export type DocxProgress = { stage: "reading" } | { stage: "rendering"; done: number; total: number } | { stage: "saving" };

export type DocxNotice = Feature | "unsupportedImage" | "replacedChars";

export interface DocxToPdfResult {
  bytes: Uint8Array;
  pages: number;
  paragraphs: number;
  tables: number;
  images: number;
  notices: DocxNotice[];
  replacedChars: number;
  skippedImages: number;
}

type PdfLib = typeof import("pdf-lib");
let library: Promise<PdfLib> | null = null;
const loadLibrary = () => (library ??= import("pdf-lib"));
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

interface Item {
  height: number;
  before: number;
  after: number;
  draw: (page: PDFPage, x: number, top: number) => void;
  breakBefore?: boolean;
  breakAfter?: boolean;
  keepNext?: boolean;
}

interface Env {
  lib: PdfLib;
  font: (props: RunProps) => PDFFont;
  clean: (text: string) => string;
  images: Map<string, PDFImage | null>;
  stats: { images: number; skippedImages: number; replacedChars: number };
}

const NATURAL = 1.15;
const PAD_X = 5.4;
const PAD_Y = 2;

// ---- fonts and text ------------------------------------------------------------------------------

type Family = "sans" | "serif" | "mono";
const familyOf = (name?: string): Family => {
  const n = (name ?? "").toLowerCase();
  if (/courier|consolas|mono|menlo|lucida console/.test(n)) return "mono";
  if (/sans/.test(n)) return "sans";
  if (/times|georgia|cambria|garamond|palatino|serif|book antiqua|century|constantia|minion|baskerville/.test(n)) return "serif";
  return "sans";
};
const fontKey = (p: RunProps) => `${familyOf(p.font)}|${p.bold ? 1 : 0}|${p.italic ? 1 : 0}`;
const STANDARD: Record<Family, [string, string, string, string]> = {
  sans: ["Helvetica", "HelveticaBold", "HelveticaOblique", "HelveticaBoldOblique"],
  serif: ["TimesRoman", "TimesRomanBold", "TimesRomanItalic", "TimesRomanBoldItalic"],
  mono: ["Courier", "CourierBold", "CourierOblique", "CourierBoldOblique"],
};
const REPLACEMENTS: Record<number, string> = {
  0x00a0: " ", 0x2007: " ", 0x202f: " ", 0x2002: " ", 0x2003: " ", 0x2009: " ", 0x2028: " ",
  0x2010: "-", 0x2011: "-", 0x2012: "-", 0x2212: "-", 0x2192: "->", 0x2190: "<-", 0x00ad: "",
  0x200b: "", 0x200c: "", 0x200d: "", 0x200e: "", 0x200f: "", 0xfeff: "", 0x2713: "v", 0x2714: "v",
};

function rgbOf(lib: PdfLib, color?: string) {
  if (!color) return lib.rgb(0, 0, 0);
  return lib.rgb(parseInt(color.slice(0, 2), 16) / 255, parseInt(color.slice(2, 4), 16) / 255, parseInt(color.slice(4, 6), 16) / 255);
}

// ---- paragraph layout ----------------------------------------------------------------------------

interface Piece {
  text: string;
  font: PDFFont;
  size: number;
  color?: string;
  ul: boolean;
  st: boolean;
  rise: number;
  width: number;
  space?: boolean;
  image?: PDFImage;
  h?: number;
}
type Unit = { k: "w"; pieces: Piece[]; width: number } | { k: "s"; piece: Piece } | { k: "t" } | { k: "b"; page: boolean };
interface Placed { piece: Piece; x: number; width: number }

function textPiece(env: Env, props: RunProps, raw: string, space = false): Piece | null {
  const size = props.vertAlign ? props.size * 0.65 : props.size;
  const text = space ? raw : env.clean(props.caps ? raw.toUpperCase() : raw);
  if (text === "") return null;
  const font = env.font(props);
  const rise = props.vertAlign === "super" ? props.size * 0.35 : props.vertAlign === "sub" ? -props.size * 0.12 : 0;
  return { text, font, size, color: props.color, ul: props.underline, st: props.strike, rise, width: font.widthOfTextAtSize(text, size), space };
}

function layoutPara(p: Para, width: number, env: Env, maxH: number): Item[] {
  const pr = p.props;
  const restX = Math.min(Math.max(0, pr.left), Math.max(0, width - 60));
  const firstX = Math.min(Math.max(0, pr.left + pr.firstLine - pr.hanging), restX + width);
  const limit = Math.max(restX + 30, width - Math.max(0, pr.right));
  const fullWidth = limit - restX;

  let labelPiece: Piece | null = null;
  let textFirst = firstX;
  if (p.label) {
    labelPiece = textPiece(env, { ...p.runProps, underline: false, strike: false }, p.label);
    if (labelPiece) textFirst = Math.max(restX, firstX + labelPiece.width + 4);
  }
  if (textFirst > limit - 30) textFirst = restX;

  // Tokenise inlines into words (unbreakable), spaces, tabs and breaks.
  const units: Unit[] = [];
  let word: Piece[] = [];
  const flush = () => {
    if (word.length) units.push({ k: "w", pieces: word, width: word.reduce((s, x) => s + x.width, 0) });
    word = [];
  };
  for (const inline of p.inlines as Inline[]) {
    if (inline.t === "text") {
      for (const part of inline.text.split(/([ \t\r\n]+)/)) {
        if (part === "") continue;
        if (/^[ \t\r\n]+$/.test(part)) {
          flush();
          const sp = textPiece(env, inline.props, " ".repeat(part.length), true);
          if (sp) units.push({ k: "s", piece: sp });
        } else {
          const piece = textPiece(env, inline.props, part);
          if (piece) word.push(piece);
        }
      }
    } else if (inline.t === "tab") {
      flush();
      units.push({ k: "t" });
    } else if (inline.t === "br") {
      flush();
      units.push({ k: "b", page: inline.page });
    } else {
      const image = env.images.get(inline.target);
      if (!image) {
        env.stats.skippedImages++;
        continue;
      }
      const scale = Math.min(1, fullWidth / inline.w, maxH / inline.h);
      env.stats.images++;
      word.push({ text: "", font: env.font(p.runProps), size: 0, ul: false, st: false, rise: 0, width: inline.w * scale, image, h: inline.h * scale });
    }
  }
  flush();

  const lines: { placed: Placed[]; height: number; baseline: number; start: number }[] = [];
  const breaks: boolean[] = [];
  const defaultSize = p.runProps.size;

  const finish = (cur: { pieces: Piece[]; x: number; start: number }, end: "wrap" | "br" | "last", page = false) => {
    while (cur.pieces.length && cur.pieces[cur.pieces.length - 1].space) {
      const last = cur.pieces.pop()!;
      cur.x -= last.width;
    }
    let natural = 0;
    let maxSize = 0;
    for (const piece of cur.pieces) {
      if (piece.image) natural = Math.max(natural, piece.h ?? 0);
      else if (piece.size) {
        natural = Math.max(natural, piece.size * NATURAL);
        maxSize = Math.max(maxSize, piece.size);
      }
    }
    if (!maxSize) maxSize = defaultSize;
    if (!natural) natural = defaultSize * NATURAL;
    const height = pr.lineRule === "auto" ? natural * pr.line : pr.lineRule === "exact" ? pr.line : Math.max(natural, pr.line);
    let offset = 0;
    let extra = 0;
    const slack = limit - cur.x;
    if (pr.jc === "center") offset = Math.max(0, slack / 2);
    else if (pr.jc === "right") offset = Math.max(0, slack);
    else if (pr.jc === "justify" && end === "wrap") {
      const gaps = cur.pieces.filter((x) => x.space).length;
      if (gaps > 0 && slack > 0) extra = slack / gaps;
    }
    const placed: Placed[] = [];
    let cursor = cur.start + offset;
    for (const piece of cur.pieces) {
      const w = piece.width + (piece.space ? extra : 0);
      placed.push({ piece, x: cursor, width: w });
      cursor += w;
    }
    lines.push({ placed, height, baseline: height - maxSize * 0.22, start: cur.start });
    breaks.push(page);
  };

  const fresh = (first: boolean) => ({ pieces: [] as Piece[], x: first ? textFirst : restX, start: first ? textFirst : restX });
  let cur = fresh(true);
  const place = (piece: Piece) => {
    cur.pieces.push(piece);
    cur.x += piece.width;
  };

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (u.k === "w") {
      if (u.width > fullWidth + 0.01 && u.pieces.every((x) => !x.image)) {
        // A single word wider than the line: let it break between characters.
        const chars: Unit[] = [];
        for (const piece of u.pieces)
          for (const ch of piece.text) chars.push({ k: "w", pieces: [{ ...piece, text: ch, width: piece.font.widthOfTextAtSize(ch, piece.size) }], width: piece.font.widthOfTextAtSize(ch, piece.size) });
        units.splice(i, 1, ...chars);
        i--;
        continue;
      }
      if (cur.pieces.length && cur.x + u.width > limit + 0.01) {
        finish(cur, "wrap");
        cur = fresh(false);
      }
      u.pieces.forEach(place);
    } else if (u.k === "s") {
      if (cur.x + u.piece.width <= limit + 0.01) place(u.piece);
    } else if (u.k === "t") {
      const stop = [...pr.tabs, ...Array.from({ length: Math.ceil(limit / 36) + 1 }, (_, n) => n * 36)].filter((s) => s > cur.x + 1).sort((a, b) => a - b)[0] ?? limit;
      const target = Math.min(stop, limit);
      place({ text: "", font: env.font(p.runProps), size: 0, ul: false, st: false, rise: 0, width: Math.max(0, target - cur.x) });
    } else {
      finish(cur, "br", u.page);
      cur = fresh(false);
    }
  }
  const lastUnit = units[units.length - 1];
  if (!(lastUnit && lastUnit.k === "b" && lastUnit.page)) finish(cur, "last");

  const color = (c?: string) => rgbOf(env.lib, c);
  return lines.map((line, index) => {
    const first = index === 0;
    const lastLine = index === lines.length - 1;
    return {
      height: line.height,
      before: first ? pr.before : 0,
      after: lastLine ? pr.after : 0,
      breakBefore: first ? pr.pageBreakBefore : false,
      breakAfter: breaks[index],
      keepNext: first ? pr.keepNext : false,
      draw: (page: PDFPage, x0: number, top: number) => {
        const baseY = page.getHeight() - top - line.baseline;
        if (pr.shade) {
          const sx = Math.min(firstX, restX);
          page.drawRectangle({ x: x0 + sx, y: page.getHeight() - top - line.height, width: Math.max(0, limit - sx), height: line.height, color: color(pr.shade) });
        }
        if (first && labelPiece)
          page.drawText(labelPiece.text, { x: x0 + firstX, y: baseY, size: labelPiece.size, font: labelPiece.font, color: color(labelPiece.color) });
        for (const { piece, x, width } of line.placed) {
          if (piece.image) {
            page.drawImage(piece.image, { x: x0 + x, y: baseY, width: piece.width, height: piece.h ?? 0 });
            continue;
          }
          if (!piece.size) continue;
          const y = baseY + piece.rise;
          if (piece.text.trim() !== "") page.drawText(piece.text, { x: x0 + x, y, size: piece.size, font: piece.font, color: color(piece.color) });
          const thickness = Math.max(0.5, piece.size / 18);
          if (piece.ul) page.drawLine({ start: { x: x0 + x, y: y - piece.size * 0.12 }, end: { x: x0 + x + width, y: y - piece.size * 0.12 }, thickness, color: color(piece.color) });
          if (piece.st) page.drawLine({ start: { x: x0 + x, y: y + piece.size * 0.28 }, end: { x: x0 + x + width, y: y + piece.size * 0.28 }, thickness, color: color(piece.color) });
        }
      },
    };
  });
}

// ---- tables --------------------------------------------------------------------------------------

interface RowFragment { height: number; draw: (page: PDFPage, x0: number, top: number) => void }
interface RowState { done: () => boolean; take: (avail: number, atTop: boolean) => RowFragment | null }

function layoutBlocks(blocks: Block[], width: number, env: Env, maxH: number): Item[] {
  const items: Item[] = [];
  for (const block of blocks) {
    if (block.t === "p") items.push(...layoutPara(block, width, env, maxH));
    else
      for (const row of layoutTable(block, width, env, maxH).rows) {
        const frag = row.take(Infinity, true)!;
        items.push({ height: frag.height, before: 0, after: 0, draw: (page, x, top) => frag.draw(page, x, top) });
      }
  }
  if (!items.length) items.push({ height: 0, before: 0, after: 0, draw: () => {} });
  return items;
}

function layoutTable(t: Table, width: number, env: Env, maxH: number): { rows: RowState[]; width: number } {
  const columns = Math.max(t.grid.length, ...t.rows.map((r) => r.reduce((s, c) => s + c.span, 0)), 1);
  const grid = Array.from({ length: columns }, (_, i) => t.grid[i] || t.grid[t.grid.length - 1] || 72);
  const total = grid.reduce((s, w) => s + w, 0);
  const scale = total > width ? width / total : 1;
  const cols = grid.map((w) => w * scale);
  const tableWidth = cols.reduce((s, w) => s + w, 0);

  const rows = t.rows.map((cells): RowState => {
    let c = 0;
    const laid = cells.map((cell: Cell) => {
      const start = c;
      c += cell.span;
      const x = cols.slice(0, start).reduce((s, w) => s + w, 0);
      const w = cols.slice(start, Math.min(c, columns)).reduce((s, v) => s + v, 0);
      const items = cell.merged ? [] : layoutBlocks(cell.blocks, Math.max(10, w - 2 * PAD_X), env, maxH);
      return { x, w, items, index: 0, fill: cell.fill, empty: items.length === 0 };
    });
    return {
      done: () => laid.every((cell) => cell.index >= cell.items.length),
      take(avail, atTop) {
        const inner = avail - 2 * PAD_Y;
        const taken = laid.map((cell) => {
          const list: { item: Item; y: number }[] = [];
          let y = 0;
          let i = cell.index;
          while (i < cell.items.length) {
            const item = cell.items[i];
            const before = list.length ? item.before : 0;
            if (y + before + item.height > inner + 0.01) break;
            list.push({ item, y: y + before });
            y += before + item.height + item.after;
            i++;
          }
          return { list, y, next: i };
        });
        const anyTaken = taken.some((x) => x.list.length > 0);
        const anyLeft = laid.some((cell) => cell.index < cell.items.length);
        if (anyLeft && !anyTaken) {
          if (!atTop) return null;
          // Nothing fits even on an empty page: force one item per cell so progress is always made.
          laid.forEach((cell, n) => {
            if (cell.index < cell.items.length) {
              const item = cell.items[cell.index];
              taken[n] = { list: [{ item, y: 0 }], y: item.height + item.after, next: cell.index + 1 };
            }
          });
        }
        const contentHeight = Math.max(0, ...taken.map((x) => x.y));
        const height = contentHeight + 2 * PAD_Y;
        laid.forEach((cell, n) => (cell.index = taken[n].next));
        return {
          height,
          draw: (page, x0, top) => {
            const ph = page.getHeight();
            laid.forEach((cell, n) => {
              if (cell.fill) page.drawRectangle({ x: x0 + cell.x, y: ph - top - height, width: cell.w, height, color: rgbOf(env.lib, cell.fill) });
              if (t.bordered)
                page.drawRectangle({ x: x0 + cell.x, y: ph - top - height, width: cell.w, height, borderWidth: 0.5, borderColor: env.lib.rgb(0.15, 0.15, 0.15) });
              for (const { item, y } of taken[n].list) item.draw(page, x0 + cell.x + PAD_X, top + PAD_Y + y);
            });
          },
        };
      },
    };
  });
  return { rows, width: tableWidth };
}

// ---- document ------------------------------------------------------------------------------------

function* walkParas(blocks: Block[]): Generator<Para> {
  for (const block of blocks) {
    if (block.t === "p") yield block;
    else for (const row of block.rows) for (const cell of row) yield* walkParas(cell.blocks);
  }
}

async function rasterize(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof createImageBitmap === "undefined" || typeof OffscreenCanvas === "undefined") return null;
  try {
    const bitmap = await createImageBitmap(new Blob([bytes as BlobPart]));
    if (bitmap.width * bitmap.height > 40_000_000) return null;
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    const blob = await canvas.convertToBlob({ type: "image/png" });
    return new Uint8Array(await blob.arrayBuffer());
  } catch {
    return null;
  }
}

async function embedImage(doc: PDFDocument, bytes: Uint8Array): Promise<PDFImage | null> {
  try {
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return await doc.embedPng(bytes);
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return await doc.embedJpg(bytes);
    const png = await rasterize(bytes);
    return png ? await doc.embedPng(png) : null;
  } catch {
    return null;
  }
}

/** Optional Unicode (Latin + Cyrillic) fonts: regular, bold, italic, bold italic. Used only when the text needs them. */
export interface DocxToPdfOptions {
  loadUnicodeFonts?: () => Promise<[Uint8Array, Uint8Array, Uint8Array, Uint8Array]>;
}

export async function convertDocxToPdf(
  bytes: Uint8Array,
  fileName: string,
  onProgress?: (progress: DocxProgress) => void,
  options: DocxToPdfOptions = {},
): Promise<DocxToPdfResult> {
  if (bytes.length === 0) throw new DocxError("invalid");
  onProgress?.({ stage: "reading" });
  const model = await readDocx(bytes);
  const hasContent =
    [...walkParas(model.blocks)].some((p) => p.inlines.some((i) => (i.t === "text" && i.text.trim() !== "") || i.t === "img"));
  if (!hasContent) throw new DocxError("empty");

  const lib = await loadLibrary();
  const doc = await lib.PDFDocument.create();
  doc.setProducer("Paul Digital - Word a PDF");
  doc.setCreator("Paul Digital - Word a PDF");
  doc.setTitle(fileName.replace(/\.docx$/i, ""));

  // Fonts actually used.
  const wanted = new Map<string, RunProps>();
  const addFont = (p: RunProps) => wanted.set(fontKey(p), p);
  const targets = new Set<string>();
  for (const para of walkParas(model.blocks)) {
    addFont(para.runProps);
    for (const inline of para.inlines) {
      if (inline.t === "text") addFont(inline.props);
      else if (inline.t === "img") targets.add(inline.target);
    }
  }
  const fonts = new Map<string, PDFFont>();
  const fallbackFont = await doc.embedFont(lib.StandardFonts.Helvetica);
  let charset = new Set(fallbackFont.getCharacterSet());

  // Standard PDF fonts cannot draw Cyrillic. When the text needs more than they offer and the caller
  // supplied Unicode fonts, draw everything with those instead of replacing characters with "?".
  let unicodeFonts: PDFFont[] | null = null;
  if (options.loadUnicodeFonts) {
    let needsUnicode = false;
    for (const para of walkParas(model.blocks)) {
      for (const inline of para.inlines) {
        if (inline.t !== "text") continue;
        for (const ch of inline.text) {
          const cp = ch.codePointAt(0)!;
          if (cp > 127 && !charset.has(cp) && REPLACEMENTS[cp] === undefined) needsUnicode = true;
        }
      }
    }
    if (needsUnicode) {
      const [{ default: fontkit }, data] = await Promise.all([import("@pdf-lib/fontkit"), options.loadUnicodeFonts()]);
      doc.registerFontkit(fontkit);
      unicodeFonts = await Promise.all(data.map((font) => doc.embedFont(font, { subset: true })));
      charset = new Set(unicodeFonts[0].getCharacterSet());
    }
  }
  for (const [key, props] of wanted) {
    if (unicodeFonts) {
      fonts.set(key, unicodeFonts[(props.bold ? 1 : 0) + (props.italic ? 2 : 0)]);
      continue;
    }
    // STANDARD order is regular, bold, italic, bold-italic.
    const name = STANDARD[familyOf(props.font)][(props.bold ? 1 : 0) + (props.italic ? 2 : 0)] as keyof typeof lib.StandardFonts;
    fonts.set(key, await doc.embedFont(lib.StandardFonts[name]));
  }

  const stats = { images: 0, skippedImages: 0, replacedChars: 0 };
  const images = new Map<string, PDFImage | null>();
  for (const target of targets) {
    const data = await model.readImage(target);
    images.set(target, data ? await embedImage(doc, data) : null);
  }

  const env: Env = {
    lib,
    font: (props) => fonts.get(fontKey(props)) ?? fallbackFont,
    images,
    stats,
    clean: (raw) => {
      let out = "";
      for (const ch of raw.normalize("NFC")) {
        const cp = ch.codePointAt(0)!;
        const mapped = REPLACEMENTS[cp];
        if (mapped !== undefined) out += mapped;
        else if (cp < 32 || cp === 127) continue;
        else if (charset.has(cp)) out += ch;
        else {
          out += "?";
          stats.replacedChars++;
        }
      }
      return out;
    },
  };

  // Page flow.
  let page: PDFPage | null = null;
  let pageCount = 0;
  let top = 0;
  let sec: Section = model.sections[0];
  let sectionIndex = 0;
  let pendingBreak = false;
  const bottom = () => sec.height - sec.bottom;
  const atTop = () => top <= sec.top + 0.01;
  const newPage = () => {
    if (pageCount >= MAX_PAGES) throw new DocxError("too-large", "too many pages");
    page = doc.addPage([sec.width, sec.height]);
    pageCount++;
    top = sec.top;
    pendingBreak = false;
  };

  const total = model.blocks.length;
  for (let b = 0; b < total; b++) {
    if (b % 20 === 0) {
      onProgress?.({ stage: "rendering", done: b, total });
      await tick();
    }
    const block = model.blocks[b];
    if (block.section !== sectionIndex) {
      const next = model.sections[block.section];
      const sameSize = next.width === sec.width && next.height === sec.height;
      sectionIndex = block.section;
      sec = next;
      if (!next.continuous || !sameSize) pendingBreak = true;
    }
    const width = sec.width - sec.left - sec.right;
    const maxH = sec.height - sec.top - sec.bottom;
    if (!page) newPage();

    if (block.t === "p") {
      const items = layoutPara(block, width, env, maxH);
      if (items[0].breakBefore && !atTop()) pendingBreak = true;
      if (items[0].keepNext && !atTop() && top + items[0].before + items[0].height + 40 > bottom()) pendingBreak = true;
      for (const item of items) {
        if (pendingBreak) newPage();
        let before = atTop() ? 0 : item.before;
        if (!atTop() && top + before + item.height > bottom()) {
          newPage();
          before = 0;
        }
        item.draw(page!, sec.left, top + before);
        top += before + item.height + item.after;
        if (item.breakAfter) pendingBreak = true;
      }
    } else {
      const { rows, width: tableWidth } = layoutTable(block, width, env, maxH);
      const x0 = sec.left + (block.align === "center" ? (width - tableWidth) / 2 : block.align === "right" ? width - tableWidth : 0);
      if (pendingBreak) newPage();
      for (const row of rows) {
        while (!row.done()) {
          const frag = row.take(Math.max(0, bottom() - top), atTop());
          if (!frag) {
            newPage();
            continue;
          }
          frag.draw(page!, x0, top);
          top += frag.height;
          if (!row.done()) newPage();
        }
      }
    }
  }

  onProgress?.({ stage: "saving" });
  await tick();
  const out = await doc.save();
  const notices: DocxNotice[] = [...model.features];
  if (stats.skippedImages) notices.push("unsupportedImage");
  if (stats.replacedChars) notices.push("replacedChars");
  return {
    bytes: out,
    pages: pageCount,
    paragraphs: model.paragraphs,
    tables: model.tables,
    images: stats.images,
    notices,
    replacedChars: stats.replacedChars,
    skippedImages: stats.skippedImages,
  };
}
