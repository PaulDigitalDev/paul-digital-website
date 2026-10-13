/**
 * Turns positioned PDF text fragments into headings and paragraphs. Pure functions with no
 * dependencies, so the heuristics can be unit-tested without a PDF engine.
 *
 * The approach: group fragments into lines by baseline, merge lines into paragraphs by vertical gap,
 * indentation and line length, then promote larger or fully bold short paragraphs to headings.
 * It handles single-column running text. Tables, multi-column pages and floating elements are not modeled.
 */

/** One text fragment as reported by the PDF engine (PDF user space: y grows upward). */
export interface TextFragment {
  text: string;
  x: number;
  y: number;
  width: number;
  size: number;
  bold: boolean;
  italic: boolean;
}

export interface PageText {
  width: number;
  height: number;
  fragments: TextFragment[];
}

export interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
}

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; runs: Run[] }
  | { kind: "paragraph"; runs: Run[]; align: "left" | "center" };

interface Line {
  runs: Run[];
  x: number;
  right: number;
  y: number;
  size: number;
  allBold: boolean;
}

const GAP_SPACE_EM = 0.12; // horizontal gap that counts as a space between fragments
const PARAGRAPH_GAP_EM = 1.65; // baseline distance (in font sizes) beyond which a new paragraph starts
const SHORT_LINE_RATIO = 0.6; // a line shorter than this share of the page text width ends its paragraph
const BULLET = /^(?:[•◦▪■●○‣·\-–—*]|\d{1,3}[.)]|[a-zA-Z][.)])\s/;

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Removes characters that are not allowed in XML 1.0 (control codes, lone surrogates, noncharacters). */
export function cleanText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
    .replace(/­/g, "")
    .replace(/[   ]/g, " ");
}

/** Number of non-whitespace characters in a page; zero means there is no extractable text. */
export function countChars(page: PageText): number {
  let n = 0;
  for (const f of page.fragments) n += f.text.replace(/\s/g, "").length;
  return n;
}

function mergeRuns(runs: Run[]): Run[] {
  const out: Run[] = [];
  for (const run of runs) {
    if (!run.text) continue;
    const last = out[out.length - 1];
    if (last && last.bold === run.bold && last.italic === run.italic) last.text += run.text;
    else out.push({ ...run });
  }
  return out;
}

function buildLines(page: PageText): Line[] {
  const frags = page.fragments
    .map((f) => ({ ...f, text: cleanText(f.text) }))
    .filter((f) => f.text.trim() !== "" && f.size > 0 && Number.isFinite(f.x) && Number.isFinite(f.y))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const groups: { y: number; size: number; items: TextFragment[] }[] = [];
  for (const f of frags) {
    const group = groups.find((g) => Math.abs(g.y - f.y) <= 0.45 * Math.max(f.size, g.size));
    if (group) {
      group.items.push(f);
      group.size = Math.max(group.size, f.size);
    } else groups.push({ y: f.y, size: f.size, items: [f] });
  }

  const lines: Line[] = [];
  for (const group of groups) {
    const items = group.items.sort((a, b) => a.x - b.x);
    // Dominant size/baseline: weighted by character count, so superscripts do not shift the line.
    const weight = new Map<number, { chars: number; y: number }>();
    for (const item of items) {
      const key = round1(item.size);
      const entry = weight.get(key) ?? { chars: 0, y: item.y };
      entry.chars += item.text.trim().length;
      weight.set(key, entry);
    }
    let size = items[0].size;
    let y = items[0].y;
    let best = -1;
    for (const [key, entry] of weight) {
      if (entry.chars > best) {
        best = entry.chars;
        size = key;
        y = entry.y;
      }
    }

    const runs: Run[] = [];
    let prevEnd: number | null = null;
    let prevText = "";
    for (const item of items) {
      let text = item.text;
      if (prevEnd !== null) {
        const gap = item.x - prevEnd;
        const spaced = prevText.endsWith(" ") || text.startsWith(" ");
        if (gap > GAP_SPACE_EM * Math.min(item.size, size) && !spaced) text = ` ${text}`;
      }
      runs.push({ text, bold: item.bold, italic: item.italic });
      prevEnd = item.x + item.width;
      prevText = item.text;
    }
    const merged = mergeRuns(runs);
    if (merged.length === 0) continue;
    merged[0].text = merged[0].text.trimStart();
    merged[merged.length - 1].text = merged[merged.length - 1].text.trimEnd();
    const last = items[items.length - 1];
    lines.push({
      runs: merged,
      x: items[0].x,
      right: last.x + last.width,
      y,
      size,
      allBold: merged.every((r) => r.bold || !r.text.trim()),
    });
  }
  return lines.sort((a, b) => b.y - a.y);
}

const lineText = (line: Line) => line.runs.map((r) => r.text).join("");

interface Para {
  lines: Line[];
}

function groupParagraphs(lines: Line[]): Para[] {
  if (lines.length === 0) return [];
  const textLeft = Math.min(...lines.map((l) => l.x));
  const textRight = Math.max(...lines.map((l) => l.right));
  const textWidth = Math.max(1, textRight - textLeft);
  const paras: Para[] = [];
  let current: Para | null = null;
  let prev: Line | null = null;
  for (const line of lines) {
    let split = current === null || prev === null;
    if (!split && prev && current) {
      const gap = prev.y - line.y;
      const sizeChange = Math.abs(line.size - prev.size) > 0.1 * Math.max(line.size, prev.size);
      const prevShort = prev.right - prev.x < SHORT_LINE_RATIO * textWidth;
      const indented = line.x - current.lines[0].x > 0.8 * line.size && line.x - prev.x > 0.8 * line.size;
      const outdented = prev.x - line.x > 0.8 * line.size && current.lines.length > 1;
      split =
        gap > PARAGRAPH_GAP_EM * Math.max(prev.size, line.size) ||
        sizeChange ||
        prevShort ||
        indented ||
        outdented ||
        BULLET.test(lineText(line)) ||
        prev.allBold !== line.allBold;
    }
    if (split || !current) {
      current = { lines: [line] };
      paras.push(current);
    } else current.lines.push(line);
    prev = line;
  }
  return paras;
}

function joinLines(lines: Line[]): Run[] {
  const runs: Run[] = [];
  lines.forEach((line, i) => {
    const copy = line.runs.map((r) => ({ ...r }));
    if (i > 0) {
      const tail = runs[runs.length - 1];
      const head = copy[0];
      // "exam-" + "ple" at a line break: drop the hyphen only when the next word continues in lower case.
      if (tail && /[a-zà-ÿ]-$/i.test(tail.text) && /^[a-zà-ÿ]/.test(head.text)) tail.text = tail.text.slice(0, -1);
      else runs.push({ text: " ", bold: tail ? tail.bold : head.bold, italic: tail ? tail.italic : head.italic });
    }
    runs.push(...copy);
  });
  return mergeRuns(runs);
}

/** Most common font size by character count across the document: the "body" size. */
function bodySize(pages: Line[][]): number {
  const counts = new Map<number, number>();
  for (const lines of pages)
    for (const line of lines) {
      const chars = lineText(line).replace(/\s/g, "").length;
      counts.set(round1(line.size), (counts.get(round1(line.size)) ?? 0) + chars);
    }
  let size = 12;
  let best = -1;
  for (const [key, chars] of counts)
    if (chars > best) {
      best = chars;
      size = key;
    }
  return size;
}

export function layoutPages(pages: PageText[]): Block[] {
  const perPage = pages.map((page) => buildLines(page));
  const body = bodySize(perPage);
  const blocks: Block[] = [];

  pages.forEach((page, pageIndex) => {
    const lines = perPage[pageIndex];
    for (const para of groupParagraphs(lines)) {
      const runs = joinLines(para.lines);
      if (runs.every((r) => !r.text.trim())) continue;
      const text = runs.map((r) => r.text).join("");
      const size = Math.max(...para.lines.map((l) => l.size));
      const allBold = para.lines.every((l) => l.allBold);
      const short = para.lines.length <= 3 && text.length <= 200;

      const ratio = size / body;
      if (short && (ratio >= 1.15 || (allBold && ratio >= 0.95 && para.lines.length === 1 && text.length <= 100))) {
        const level = ratio >= 1.7 ? 1 : ratio >= 1.35 ? 2 : 3;
        // Heading style already supplies bold; keep only italic (and bold from partial emphasis is dropped).
        blocks.push({ kind: "heading", level, runs: runs.map((r) => ({ ...r, bold: false })) });
        continue;
      }

      // Single short line centered on the page reads as centered text.
      const first = para.lines[0];
      const center = (first.x + first.right) / 2;
      const centered =
        para.lines.length === 1 && Math.abs(center - page.width / 2) < 0.03 * page.width && first.x > 0.12 * page.width;
      blocks.push({ kind: "paragraph", runs, align: centered ? "center" : "left" });
    }
  });
  return blocks;
}
