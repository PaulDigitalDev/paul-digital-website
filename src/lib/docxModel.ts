/**
 * Reads a DOCX package into a small document model (paragraphs, tables, sections) with styles and
 * list numbering already resolved. Rendering lives in docxToPdf.ts. All units are PDF points.
 */
import { openZip } from "./zipRead.ts";
import type { ZipArchive } from "./zipRead.ts";
import { child, kids, parseXml } from "./xmlLite.ts";
import type { XmlNode } from "./xmlLite.ts";

export interface RunProps {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  caps: boolean;
  size: number;
  color?: string;
  font?: string;
  vertAlign?: "super" | "sub";
}

export interface ParaProps {
  jc: "left" | "center" | "right" | "justify";
  before: number;
  after: number;
  line: number;
  lineRule: "auto" | "exact" | "atLeast";
  left: number;
  right: number;
  firstLine: number;
  hanging: number;
  keepNext: boolean;
  pageBreakBefore: boolean;
  shade?: string;
  tabs: number[];
  numId?: string;
  ilvl: number;
}

export type Inline =
  | { t: "text"; text: string; props: RunProps }
  | { t: "tab" }
  | { t: "br"; page: boolean }
  | { t: "img"; target: string; w: number; h: number };

export interface Para {
  t: "p";
  props: ParaProps;
  runProps: RunProps;
  inlines: Inline[];
  label?: string;
  section: number;
}

export interface Cell {
  span: number;
  merged: boolean;
  fill?: string;
  blocks: Block[];
}

export interface Table {
  t: "tbl";
  grid: number[];
  rows: Cell[][];
  bordered: boolean;
  align: "left" | "center" | "right";
  section: number;
}

export type Block = Para | Table;

export interface Section {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  continuous: boolean;
}

export type Feature = "headerFooter" | "textbox" | "footnotes" | "equation" | "chart" | "anchoredImage" | "shape";

export interface DocxModel {
  blocks: Block[];
  sections: Section[];
  features: Set<Feature>;
  readImage: (target: string) => Promise<Uint8Array | null>;
  paragraphs: number;
  tables: number;
}

export type DocxErrorCode = "invalid" | "legacy" | "encrypted" | "corrupt" | "too-large" | "unsupported" | "empty";

export class DocxError extends Error {
  code: DocxErrorCode;
  constructor(code: DocxErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export const MAX_UNCOMPRESSED_BYTES = 150 * 1024 * 1024;
const MAX_XML_BYTES = 40 * 1024 * 1024;
const A4: Section = { width: 595.3, height: 841.9, left: 72, right: 72, top: 72, bottom: 72, continuous: false };
const BASE_RUN: RunProps = { bold: false, italic: false, underline: false, strike: false, caps: false, size: 11 };
const BASE_PARA: ParaProps = {
  jc: "left", before: 0, after: 0, line: 1, lineRule: "auto", left: 0, right: 0, firstLine: 0, hanging: 0,
  keepNext: false, pageBreakBefore: false, tabs: [], ilvl: 0,
};
const HEADING_SIZES = [20, 16, 14, 12, 11, 11];

const num = (value: string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};
const twips = (value: string | undefined): number | undefined => {
  const n = num(value);
  return n === undefined ? undefined : n / 20;
};
const toggle = (node: XmlNode | undefined): boolean | undefined =>
  node ? !["0", "false", "off", "none"].includes((node.attrs.val ?? "true").toLowerCase()) : undefined;
const hex = (value: string | undefined) => (value && /^[0-9a-fA-F]{6}$/.test(value) ? value : undefined);

function runProps(rPr: XmlNode | undefined): Partial<RunProps> {
  if (!rPr) return {};
  const out: Partial<RunProps> = {};
  const set = <K extends keyof RunProps>(key: K, value: RunProps[K] | undefined) => {
    if (value !== undefined) out[key] = value;
  };
  set("bold", toggle(child(rPr, "b")));
  set("italic", toggle(child(rPr, "i")));
  set("strike", toggle(child(rPr, "strike")) ?? toggle(child(rPr, "dstrike")));
  set("caps", toggle(child(rPr, "caps")));
  const u = child(rPr, "u");
  if (u) set("underline", (u.attrs.val ?? "single") !== "none");
  const size = num(child(rPr, "sz")?.attrs.val);
  if (size) set("size", size / 2);
  set("color", hex(child(rPr, "color")?.attrs.val));
  const fonts = child(rPr, "rFonts");
  set("font", fonts?.attrs.ascii ?? fonts?.attrs.hAnsi);
  const va = child(rPr, "vertAlign")?.attrs.val;
  if (va === "superscript") out.vertAlign = "super";
  else if (va === "subscript") out.vertAlign = "sub";
  else if (va === "baseline") out.vertAlign = undefined;
  return out;
}

function paraProps(pPr: XmlNode | undefined): Partial<ParaProps> {
  if (!pPr) return {};
  const out: Partial<ParaProps> = {};
  const jc = child(pPr, "jc")?.attrs.val;
  if (jc) out.jc = jc === "center" ? "center" : jc === "right" || jc === "end" ? "right" : jc === "both" || jc === "distribute" ? "justify" : "left";
  const spacing = child(pPr, "spacing");
  if (spacing) {
    const before = twips(spacing.attrs.before);
    const after = twips(spacing.attrs.after);
    if (before !== undefined) out.before = before;
    if (after !== undefined) out.after = after;
    const line = num(spacing.attrs.line);
    if (line !== undefined && line > 0) {
      const rule = spacing.attrs.lineRule === "exact" ? "exact" : spacing.attrs.lineRule === "atLeast" ? "atLeast" : "auto";
      out.lineRule = rule;
      out.line = rule === "auto" ? line / 240 : line / 20;
    }
  }
  const ind = child(pPr, "ind");
  if (ind) {
    const left = twips(ind.attrs.left ?? ind.attrs.start);
    const right = twips(ind.attrs.right ?? ind.attrs.end);
    const firstLine = twips(ind.attrs.firstLine);
    const hanging = twips(ind.attrs.hanging);
    if (left !== undefined) out.left = left;
    if (right !== undefined) out.right = right;
    if (firstLine !== undefined) { out.firstLine = firstLine; out.hanging = 0; }
    if (hanging !== undefined) { out.hanging = hanging; out.firstLine = 0; }
  }
  if (child(pPr, "keepNext")) out.keepNext = toggle(child(pPr, "keepNext"));
  if (child(pPr, "pageBreakBefore")) out.pageBreakBefore = toggle(child(pPr, "pageBreakBefore"));
  const fill = child(pPr, "shd")?.attrs.fill;
  if (hex(fill)) out.shade = fill;
  const tabs = kids(child(pPr, "tabs"), "tab").filter((t) => t.attrs.val !== "clear").map((t) => twips(t.attrs.pos) ?? 0);
  if (tabs.length) out.tabs = tabs.sort((a, b) => a - b);
  const numPr = child(pPr, "numPr");
  if (numPr) {
    const numId = child(numPr, "numId")?.attrs.val;
    if (numId) out.numId = numId;
    const ilvl = num(child(numPr, "ilvl")?.attrs.val);
    if (ilvl !== undefined) out.ilvl = ilvl;
  }
  return out;
}

interface StyleDef {
  type: string;
  basedOn?: string;
  name: string;
  isDefault: boolean;
  p: Partial<ParaProps>;
  r: Partial<RunProps>;
  bordered: boolean;
}

const hasBorders = (borders: XmlNode | undefined) =>
  Boolean(borders?.children.some((b) => b.attrs.val && !["nil", "none"].includes(b.attrs.val)));

interface LevelDef { fmt: string; text: string; start: number; left?: number; hanging?: number }

function formatNumber(n: number, fmt: string): string {
  if (fmt === "lowerLetter" || fmt === "upperLetter") {
    let s = "";
    for (let v = n; v > 0; v = Math.floor((v - 1) / 26)) s = String.fromCharCode(97 + ((v - 1) % 26)) + s;
    return fmt === "upperLetter" ? s.toUpperCase() : s;
  }
  if (fmt === "lowerRoman" || fmt === "upperRoman") {
    const map: [number, string][] = [[1000, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"], [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]];
    let s = "";
    let v = n;
    for (const [value, sym] of map) while (v >= value) { s += sym; v -= value; }
    return fmt === "upperRoman" ? s.toUpperCase() : s;
  }
  if (fmt === "decimalZero") return String(n).padStart(2, "0");
  return String(n);
}

export async function readDocx(bytes: Uint8Array): Promise<DocxModel> {
  if (bytes.length > 4 && bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) throw new DocxError("legacy");
  let zip: ZipArchive;
  try {
    zip = openZip(bytes, MAX_UNCOMPRESSED_BYTES);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "encrypted") throw new DocxError("encrypted");
    if (code === "too-large") throw new DocxError("too-large");
    if (code === "unsupported") throw new DocxError("unsupported");
    throw new DocxError(code === "invalid" ? "invalid" : "corrupt");
  }
  if (!zip.has("word/document.xml")) {
    // A valid ZIP without a Word body (e.g. XLSX, PPTX, or a plain archive) is not a DOCX.
    throw new DocxError("invalid");
  }

  const readXml = async (name: string): Promise<XmlNode | null> => {
    let data: Uint8Array | null;
    try {
      data = await zip.read(name);
    } catch (error) {
      const code = (error as { code?: string }).code;
      throw new DocxError(code === "unsupported" ? "unsupported" : "corrupt", String(error));
    }
    if (!data) return null;
    if (data.length > MAX_XML_BYTES) throw new DocxError("too-large");
    try {
      return parseXml(new TextDecoder("utf-8").decode(data));
    } catch (error) {
      throw new DocxError("corrupt", String(error));
    }
  };

  const documentXml = await readXml("word/document.xml");
  const body = child(documentXml ?? undefined, "body");
  if (!documentXml || documentXml.name !== "document" || !body) throw new DocxError("corrupt", "missing body");

  const features = new Set<Feature>();
  for (const name of zip.names()) {
    if (/^word\/(header|footer)\d*\.xml$/.test(name)) {
      const part = await readXml(name);
      if (part && /\S/.test(collectText(part))) features.add("headerFooter");
    }
  }
  const footnotes = await readXml("word/footnotes.xml");
  if (footnotes && kids(footnotes, "footnote").some((f) => !["separator", "continuationSeparator", "continuationNotice"].includes(f.attrs.type ?? "") && /\S/.test(collectText(f)))) features.add("footnotes");

  // Relationships (images).
  const rels = new Map<string, string>();
  for (const rel of kids((await readXml("word/_rels/document.xml.rels")) ?? undefined, "Relationship")) {
    if (/\/image$/.test(rel.attrs.Type ?? "") && rel.attrs.Id && rel.attrs.Target && rel.attrs.TargetMode !== "External") {
      const target = rel.attrs.Target.startsWith("/") ? rel.attrs.Target.slice(1) : `word/${rel.attrs.Target}`;
      rels.set(rel.attrs.Id, target.replace(/(^|\/)(?!\.\.)[^/]+\/\.\.(?=\/|$)/g, "").replace(/^\.\.\//, ""));
    }
  }

  // Styles.
  const styles = new Map<string, StyleDef>();
  let docRun: Partial<RunProps> = {};
  let docPara: Partial<ParaProps> = {};
  const stylesXml = await readXml("word/styles.xml");
  if (stylesXml) {
    const defaults = child(stylesXml, "docDefaults");
    docRun = runProps(child(child(defaults, "rPrDefault"), "rPr"));
    docPara = paraProps(child(child(defaults, "pPrDefault"), "pPr"));
    for (const s of kids(stylesXml, "style")) {
      const id = s.attrs.styleId;
      if (!id) continue;
      styles.set(id, {
        type: s.attrs.type ?? "paragraph",
        basedOn: child(s, "basedOn")?.attrs.val,
        name: (child(s, "name")?.attrs.val ?? "").toLowerCase(),
        isDefault: s.attrs.default === "1" || s.attrs.default === "true",
        p: paraProps(child(s, "pPr")),
        r: runProps(child(s, "rPr")),
        bordered: hasBorders(child(child(s, "tblPr"), "tblBorders")),
      });
    }
  }
  const defaultParaStyle = [...styles.entries()].find(([, s]) => s.type === "paragraph" && s.isDefault)?.[0];

  const chain = (id: string | undefined): StyleDef[] => {
    const list: StyleDef[] = [];
    const seen = new Set<string>();
    for (let cur = id; cur && !seen.has(cur) && styles.has(cur); cur = styles.get(cur)!.basedOn) {
      seen.add(cur);
      list.unshift(styles.get(cur)!);
    }
    return list;
  };
  const headingFallback = (id: string | undefined): { p: Partial<ParaProps>; r: Partial<RunProps> } => {
    const st = id ? styles.get(id) : undefined;
    const label = `${id ?? ""} ${st?.name ?? ""}`.toLowerCase();
    const m = /(?:heading|ttulo|titulo|t[ií]tulo)\s*([1-6])/.exec(label.replace(/[^\w\sáéíóúñ]/g, ""));
    if (m) return { p: { keepNext: true, before: 10, after: 4 }, r: { bold: true, size: HEADING_SIZES[Number(m[1]) - 1] } };
    if (/\btitle\b|\bttulo\b/.test(label) && !/sub/.test(label)) return { p: { after: 6 }, r: { size: 26 } };
    return { p: {}, r: {} };
  };

  // Numbering.
  const levelsByAbstract = new Map<string, Map<number, LevelDef>>();
  const abstractOfNum = new Map<string, string>();
  const numberingXml = await readXml("word/numbering.xml");
  if (numberingXml) {
    for (const abs of kids(numberingXml, "abstractNum")) {
      const levels = new Map<number, LevelDef>();
      for (const lvl of kids(abs, "lvl")) {
        const ind = child(child(lvl, "pPr"), "ind");
        levels.set(num(lvl.attrs.ilvl) ?? 0, {
          fmt: child(lvl, "numFmt")?.attrs.val ?? "decimal",
          text: child(lvl, "lvlText")?.attrs.val ?? "",
          start: num(child(lvl, "start")?.attrs.val) ?? 1,
          left: twips(ind?.attrs.left ?? ind?.attrs.start),
          hanging: twips(ind?.attrs.hanging),
        });
      }
      levelsByAbstract.set(abs.attrs.abstractNumId, levels);
    }
    for (const n of kids(numberingXml, "num")) {
      const abs = child(n, "abstractNumId")?.attrs.val;
      if (n.attrs.numId && abs) abstractOfNum.set(n.attrs.numId, abs);
    }
  }
  const counters = new Map<string, number[]>();
  const nextLabel = (numId: string, ilvl: number): { label: string; level?: LevelDef } | null => {
    const levels = levelsByAbstract.get(abstractOfNum.get(numId) ?? "");
    const level = levels?.get(ilvl);
    if (!levels || !level) return null;
    const counts = counters.get(numId) ?? [];
    counts[ilvl] = (counts[ilvl] ?? level.start - 1) + 1;
    for (let k = ilvl + 1; k < counts.length; k++) counts[k] = 0;
    counters.set(numId, counts);
    if (level.fmt === "none") return { label: "", level };
    if (level.fmt === "bullet") return { label: ilvl % 2 === 0 ? "•" : "-", level };
    const text = level.text.replace(/%(\d)/g, (_, d: string) => {
      const idx = Number(d) - 1;
      const fmt = levels.get(idx)?.fmt ?? "decimal";
      return formatNumber(counts[idx] ?? levels.get(idx)?.start ?? 1, fmt);
    });
    return { label: text || `${counts[ilvl]}.`, level };
  };

  // Section properties: content belongs to the section whose sectPr closes it.
  const readSection = (sectPr: XmlNode | undefined): Section => {
    const size = child(sectPr, "pgSz");
    const margin = child(sectPr, "pgMar");
    const sec: Section = { ...A4 };
    const w = twips(size?.attrs.w);
    const h = twips(size?.attrs.h);
    if (w && h && w >= 100 && h >= 100 && w <= 5000 && h <= 5000) {
      sec.width = size!.attrs.orient === "landscape" && w < h ? h : w;
      sec.height = size!.attrs.orient === "landscape" && w < h ? w : h;
    }
    const m = (key: string, fallback: number) => {
      const v = twips(margin?.attrs[key]);
      return v !== undefined && v >= 0 ? v : fallback;
    };
    sec.left = m("left", sec.left);
    sec.right = m("right", sec.right);
    sec.top = Math.max(0, m("top", sec.top));
    sec.bottom = Math.max(0, m("bottom", sec.bottom));
    if (sec.left + sec.right > sec.width - 100) { sec.left = 36; sec.right = 36; }
    if (sec.top + sec.bottom > sec.height - 100) { sec.top = 36; sec.bottom = 36; }
    sec.continuous = child(sectPr, "type")?.attrs.val === "continuous";
    return sec;
  };
  const sections: Section[] = [];
  let sectionIndex = 0;
  const closeSection = (sectPr: XmlNode | undefined) => {
    sections[sectionIndex] = readSection(sectPr);
    sectionIndex++;
  };

  let paragraphs = 0;
  let tables = 0;

  const collectInlines = (node: XmlNode, props: RunProps, out: Inline[]) => {
    for (const el of node.children) {
      switch (el.name) {
        case "r": {
          const rp = { ...props, ...runProps(child(el, "rPr")) };
          const rStyle = child(child(el, "rPr"), "rStyle")?.attrs.val;
          const merged = rStyle ? { ...props, ...chain(rStyle).reduce<Partial<RunProps>>((a, s) => ({ ...a, ...s.r }), {}), ...runProps(child(el, "rPr")) } : rp;
          for (const part of el.children) {
            if (part.name === "t") out.push({ t: "text", text: part.text, props: merged });
            else if (part.name === "tab") out.push({ t: "tab" });
            else if (part.name === "br" || part.name === "cr") out.push({ t: "br", page: part.attrs.type === "page" });
            else if (part.name === "noBreakHyphen") out.push({ t: "text", text: "-", props: merged });
            else if (part.name === "sym") out.push({ t: "text", text: "•", props: merged });
            else if (part.name === "drawing") readDrawing(part, out);
            else if (part.name === "AlternateContent") {
              const choice = child(part, "Choice") ?? child(part, "Fallback");
              if (choice) collectInlines({ name: "r", attrs: {}, text: "", children: [{ name: "r", attrs: {}, text: "", children: choice.children }] }, merged, out);
            } else if (part.name === "pict" || part.name === "object") features.add("shape");
          }
          break;
        }
        case "hyperlink":
        case "fldSimple":
        case "smartTag":
        case "ins":
        case "sdtContent":
        case "customXml":
          collectInlines(el, props, out);
          break;
        case "sdt":
          collectInlines(child(el, "sdtContent") ?? el, props, out);
          break;
        case "oMath":
        case "oMathPara":
          features.add("equation");
          break;
        default:
          break;
      }
    }
  };

  const readDrawing = (drawing: XmlNode, out: Inline[]) => {
    const holder = drawing.children[0];
    if (!holder) return;
    const anchored = holder.name === "anchor";
    const extent = child(holder, "extent");
    const find = (n: XmlNode, name: string): XmlNode | undefined => {
      if (n.name === name) return n;
      for (const c of n.children) {
        const f = find(c, name);
        if (f) return f;
      }
      return undefined;
    };
    if (find(holder, "txbxContent")) features.add("textbox");
    if (find(holder, "chart")) features.add("chart");
    const blip = find(holder, "blip");
    const embed = blip?.attrs.embed;
    const target = embed ? rels.get(embed) : undefined;
    if (!target) {
      if (!find(holder, "txbxContent") && !find(holder, "chart")) features.add("shape");
      return;
    }
    const w = (num(extent?.attrs.cx) ?? 0) / 12700;
    const h = (num(extent?.attrs.cy) ?? 0) / 12700;
    if (anchored) features.add("anchoredImage");
    out.push({ t: "img", target, w: w > 0 ? w : 100, h: h > 0 ? h : 100 });
  };

  const readPara = (p: XmlNode): Para => {
    paragraphs++;
    const pPr = child(p, "pPr");
    const styleId = child(pPr, "pStyle")?.attrs.val ?? defaultParaStyle;
    const sChain = chain(styleId);
    const fb = headingFallback(child(pPr, "pStyle")?.attrs.val);
    let props: ParaProps = { ...BASE_PARA, ...docPara, ...fb.p };
    let run: RunProps = { ...BASE_RUN, ...docRun, ...fb.r };
    for (const s of sChain) {
      props = { ...props, ...s.p };
      run = { ...run, ...s.r };
    }
    const direct = paraProps(pPr);
    props = { ...props, ...direct };
    // Paragraph-mark formatting in direct rPr also seeds run formatting only for the label; text runs carry their own.
    let label: string | undefined;
    if (props.numId && props.numId !== "0") {
      const n = nextLabel(props.numId, props.ilvl);
      if (n) {
        label = n.label;
        // Numbering level indents apply unless the paragraph (or its style) set its own.
        if (direct.left === undefined && !sChain.some((s) => s.p.left !== undefined)) props.left = n.level?.left ?? props.left;
        if (direct.hanging === undefined && !sChain.some((s) => s.p.hanging !== undefined)) props.hanging = n.level?.hanging ?? props.hanging;
        if (props.left === 0 && props.hanging === 0) { props.left = 36 + props.ilvl * 18; props.hanging = 18; }
      }
    }
    const inlines: Inline[] = [];
    collectInlines(p, run, inlines);
    return { t: "p", props, runProps: run, inlines, label, section: sectionIndex };
  };

  const readTable = (tbl: XmlNode): Table => {
    tables++;
    const tblPr = child(tbl, "tblPr");
    const styleId = child(tblPr, "tblStyle")?.attrs.val;
    const bordered =
      hasBorders(child(tblPr, "tblBorders")) ||
      (!child(tblPr, "tblBorders") && (chain(styleId).some((s) => s.bordered) || /grid/i.test(styleId ?? "")));
    const jc = child(tblPr, "jc")?.attrs.val;
    const grid = kids(child(tbl, "tblGrid"), "gridCol").map((g) => twips(g.attrs.w) ?? 0);
    const rows: Cell[][] = [];
    for (const tr of kids(tbl, "tr")) {
      const cells: Cell[] = [];
      for (const tc of kids(tr, "tc")) {
        const tcPr = child(tc, "tcPr");
        const vMerge = child(tcPr, "vMerge");
        const fill = child(tcPr, "shd")?.attrs.fill;
        cells.push({
          span: Math.max(1, num(child(tcPr, "gridSpan")?.attrs.val) ?? 1),
          merged: Boolean(vMerge && vMerge.attrs.val !== "restart"),
          fill: hex(fill),
          blocks: readBlocks(tc),
        });
      }
      if (cells.length) rows.push(cells);
    }
    if (!grid.length && rows.length) {
      // No grid: derive columns from the first row's declared widths.
      const first = kids(kids(tbl, "tr")[0], "tc");
      first.forEach((tc) => grid.push(twips(child(child(tc, "tcPr"), "tcW")?.attrs.w) || 72));
    }
    return { t: "tbl", grid, rows, bordered, align: jc === "center" ? "center" : jc === "right" || jc === "end" ? "right" : "left", section: sectionIndex };
  };

  function readBlocks(container: XmlNode, top = false): Block[] {
    const out: Block[] = [];
    for (const el of container.children) {
      if (el.name === "p") {
        const para = readPara(el);
        out.push(para);
        const sectPr = child(child(el, "pPr"), "sectPr");
        if (top && sectPr) closeSection(sectPr);
      } else if (el.name === "tbl") {
        out.push(readTable(el));
      } else if (el.name === "sdt") {
        out.push(...readBlocks(child(el, "sdtContent") ?? el, top));
      } else if (el.name === "AlternateContent" || el.name === "ins") {
        out.push(...readBlocks(el, top));
      }
    }
    return out;
  }

  const blocks = readBlocks(body, true);
  closeSection(child(body, "sectPr"));
  // A trailing section-closing paragraph can leave one section index unused; keep indices valid.
  for (const b of blocks) if (b.section >= sections.length) b.section = sections.length - 1;

  const readImage = async (target: string): Promise<Uint8Array | null> => {
    try {
      return await zip.read(target);
    } catch {
      return null;
    }
  };

  return { blocks, sections, features, readImage, paragraphs, tables };
}

function collectText(node: XmlNode): string {
  if (node.name === "t") return node.text;
  return node.children.map(collectText).join("");
}
