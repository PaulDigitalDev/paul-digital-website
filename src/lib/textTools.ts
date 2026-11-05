/* Text tools: counts, case, line breaks, repeats, SMS length and duplicate lines. Pure functions, no browser-only APIs required. */

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  /** User-perceived characters (a Bangla conjunct or an emoji counts once). */
  graphemes: number;
  words: number;
  uniqueWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytes: number;
  readingMinutes: number;
  speakingMinutes: number;
}

export const READING_WPM = 238;
export const SPEAKING_WPM = 150;

const hasSegmenter = typeof Intl !== "undefined" && "Segmenter" in Intl;

export function graphemeCount(text: string): number {
  if (!text) return 0;
  if (hasSegmenter) {
    let n = 0;
    const seg = new (Intl as unknown as { Segmenter: new (l?: string, o?: { granularity: string }) => { segment: (s: string) => Iterable<unknown> } }).Segmenter(undefined, { granularity: "grapheme" });
    for (const _ of seg.segment(text)) n++;
    return n;
  }
  return Array.from(text).length;
}

export function wordList(text: string): string[] {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
}

function utf8Length(text: string): number {
  let n = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  return n;
}

export function countStats(text: string): TextStats {
  const words = wordList(text);
  const lower = words.map((w) => w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""));
  const sentences = text.split(/[.!?।॥]+(?:\s+|$)/).filter((s) => /[\p{L}\p{N}]/u.test(s)).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
  return {
    characters: Array.from(text).length,
    charactersNoSpaces: Array.from(text.replace(/\s/g, "")).length,
    graphemes: graphemeCount(text),
    words: words.length,
    uniqueWords: new Set(lower.filter(Boolean)).size,
    sentences,
    paragraphs,
    lines: text === "" ? 0 : text.split(/\r?\n/).length,
    bytes: utf8Length(text),
    readingMinutes: words.length / READING_WPM,
    speakingMinutes: words.length / SPEAKING_WPM,
  };
}

/** "2 min 15 sec", "45 sec", "less than a second". */
export function formatDuration(minutes: number): string {
  const total = Math.round(minutes * 60);
  if (total <= 0) return "0 sec";
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m ? `${m} min${s ? ` ${s} sec` : ""}` : `${s} sec`;
}

const STOP = new Set("a an and are as at be but by for from has have he her his i in is it its of on or she that the their they this to was we were will with you your".split(" "));

export function keywordDensity(text: string, top = 8): { word: string; count: number; percent: number }[] {
  const words = wordList(text).map((w) => w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")).filter(Boolean);
  if (!words.length) return [];
  const counts = new Map<string, number>();
  for (const w of words) if (!STOP.has(w) && w.length > 1) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, top)
    .map(([word, count]) => ({ word, count, percent: (count / words.length) * 100 }));
}

/* ---------- case ---------- */

export type CaseMode = "upper" | "lower" | "sentence" | "title" | "capitalize" | "alternate" | "toggle" | "camel" | "pascal" | "snake" | "kebab" | "constant";

const SMALL = new Set("a an and as at but by for in nor of on or per so the to up via yet".split(" "));

const splitWords = (t: string) => t.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

export function convertCase(text: string, mode: CaseMode): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "sentence":
      return text.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, (_, pre: string, ch: string) => pre + ch.toUpperCase());
    case "capitalize":
      return text.toLowerCase().replace(/(^|[\s\-_/("])(\p{L})/gu, (_, pre: string, ch: string) => pre + ch.toUpperCase());
    case "title": {
      const lower = text.toLowerCase();
      const parts = lower.split(/(\s+)/);
      const wordIdx = parts.map((p, i) => (/\S/.test(p) ? i : -1)).filter((i) => i >= 0);
      const first = wordIdx[0];
      const last = wordIdx[wordIdx.length - 1];
      return parts.map((p, i) => (/\S/.test(p) && (i === first || i === last || !SMALL.has(p.replace(/[^\p{L}]/gu, ""))) ? p.replace(/\p{L}/u, (c) => c.toUpperCase()) : p)).join("");
    }
    case "alternate": {
      let i = 0;
      return Array.from(text.toLowerCase()).map((c) => (/\p{L}/u.test(c) ? (i++ % 2 ? c.toUpperCase() : c) : c)).join("");
    }
    case "toggle":
      return Array.from(text).map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");
    case "camel":
    case "pascal": {
      const w = splitWords(text.toLowerCase());
      return w.map((x, i) => (i === 0 && mode === "camel" ? x : x.charAt(0).toUpperCase() + x.slice(1))).join("");
    }
    case "snake":
      return splitWords(text.toLowerCase()).join("_");
    case "kebab":
      return splitWords(text.toLowerCase()).join("-");
    case "constant":
      return splitWords(text).join("_").toUpperCase();
  }
}

/* ---------- line breaks, spaces, repeats, duplicates ---------- */

export type BreakMode = "space" | "none" | "paragraphs";

export function removeLineBreaks(text: string, mode: BreakMode): string {
  const t = text.replace(/\r\n?/g, "\n");
  if (mode === "paragraphs") {
    return t
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean)
      .join("\n\n");
  }
  return t.replace(/\s*\n\s*/g, mode === "space" ? " " : "").trim();
}

export function removeExtraSpaces(text: string, opts: { trimLines: boolean; collapse: boolean; blankLines: boolean }): string {
  let t = text.replace(/\r\n?/g, "\n");
  if (opts.collapse) t = t.replace(/[^\S\n]{2,}/g, " ");
  if (opts.trimLines) t = t.split("\n").map((l) => l.trim()).join("\n");
  if (opts.blankLines) t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

export const REPEAT_LIMIT = 1_000_000;

export function repeatText(text: string, times: number, separator: string): { text: string; truncated: boolean } {
  const n = Math.max(0, Math.floor(times));
  if (!text || n === 0) return { text: "", truncated: false };
  const unit = text.length + separator.length;
  const max = Math.max(1, Math.floor(REPEAT_LIMIT / unit));
  const count = Math.min(n, max);
  return { text: Array(count).fill(text).join(separator), truncated: n > count };
}

export function removeDuplicateLines(text: string, opts: { caseSensitive: boolean; trim: boolean; dropEmpty: boolean }): { text: string; removed: number } {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const shown = opts.trim ? line.trim() : line;
    if (opts.dropEmpty && shown.trim() === "") continue;
    const key = opts.caseSensitive ? shown : shown.toLowerCase();
    if (seen.has(key) && shown.trim() !== "") continue;
    seen.add(key);
    out.push(shown);
  }
  return { text: out.join("\n"), removed: lines.length - out.length };
}

/* ---------- SMS ---------- */

const GSM_BASIC = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\u001bÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXT = "\f^{}\\[~]|€";

export interface SmsInfo {
  encoding: "GSM-7" | "Unicode (UCS-2)";
  units: number;
  segments: number;
  perSegment: number;
  remaining: number;
}

export function smsInfo(text: string): SmsInfo {
  let gsm = true;
  let units = 0;
  for (const ch of text) {
    if (GSM_BASIC.includes(ch)) units += 1;
    else if (GSM_EXT.includes(ch)) units += 2;
    else {
      gsm = false;
      break;
    }
  }
  if (!gsm) units = text.length; // UTF-16 code units
  const single = gsm ? 160 : 70;
  const multi = gsm ? 153 : 67;
  const segments = units === 0 ? 0 : units <= single ? 1 : Math.ceil(units / multi);
  const perSegment = segments <= 1 ? single : multi;
  const remaining = segments === 0 ? single : segments * perSegment - units;
  return { encoding: gsm ? "GSM-7" : "Unicode (UCS-2)", units, segments, perSegment, remaining };
}

export const SOCIAL_LIMITS: { name: string; limit: number }[] = [
  { name: "X (Twitter) post", limit: 280 },
  { name: "Instagram caption", limit: 2200 },
  { name: "Facebook post", limit: 63206 },
  { name: "LinkedIn post", limit: 3000 },
  { name: "YouTube title", limit: 100 },
  { name: "YouTube description", limit: 5000 },
  { name: "Meta title (suggested)", limit: 60 },
  { name: "Meta description (suggested)", limit: 160 },
];
