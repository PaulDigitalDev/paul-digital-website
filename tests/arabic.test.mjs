import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { arabicPlural, FILE_FORMS, isolate, normalizeRangeInput, pagesText, percentText, PAGE_FORMS } from "../src/lib/arabic.ts";
import { layoutPages, isRtlText } from "../src/lib/pdfTextLayout.ts";
import { buildTextDocx } from "../src/lib/textDocx.ts";
import { parsePageRanges, splitPdf } from "../src/lib/pdfSplit.ts";
import { mergePdfs, formatBytes } from "../src/lib/pdfMerge.ts";

const frag = (text, x, y, size = 12) => ({ text, x, y, width: text.length * size * 0.5, size, bold: false, italic: false });
const page = (fragments) => ({ width: 595, height: 842, fragments });

test("Arabic plural forms follow CLDR categories", () => {
  assert.equal(pagesText(0), "لا صفحات");
  assert.equal(pagesText(1), "صفحة واحدة");
  assert.equal(pagesText(2), "صفحتان");
  assert.equal(pagesText(5), "5 صفحات");
  assert.equal(pagesText(11), "11 صفحة");
  assert.equal(pagesText(100), "100 صفحة");
  assert.equal(arabicPlural(3, FILE_FORMS), "3 ملفات");
  assert.equal(PAGE_FORMS.length, 6);
});

test("isolate wraps text in first-strong isolates; percent and bytes use Latin digits", () => {
  assert.equal(isolate("a.pdf"), "⁨a.pdf⁩");
  assert.equal(percentText(37.4), "37٪");
  assert.equal(percentText(-4.25), "4.3٪");
  assert.match(formatBytes(1536, "ar-u-nu-latn"), /^1\.5 ك\.ب$/);
});

test("page-range input from an Arabic keyboard is normalized and validated", () => {
  assert.equal(normalizeRangeInput("١-٣،٥؛٨–١٠"), "1-3,5,8-10");
  const ok = parsePageRanges(normalizeRangeInput("١-٣، ٥"), 10);
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.groups.flatMap((g) => g.pages), [1, 2, 3, 5]);
  assert.equal(parsePageRanges(normalizeRangeInput("٣-١"), 10).error.code, "reversed");
  assert.equal(parsePageRanges(normalizeRangeInput("١٥"), 10).error.code, "outOfRange");
  assert.equal(parsePageRanges("", 10).error.code, "empty");
});

test("detects right-to-left text by letter share", () => {
  assert.equal(isRtlText("مرحبا بالعالم"), true);
  assert.equal(isRtlText("Hello world"), false);
  assert.equal(isRtlText("12345"), false);
  assert.equal(isRtlText("تقرير report 2024 سنوي"), true);
});

test("right-to-left lines are read right to left and marked bidi in the DOCX", async () => {
  // Three Arabic fragments laid out right to left on one baseline: first word is the rightmost.
  const blocks = layoutPages([
    page([
      frag("كلمة", 400, 700),
      frag("ثانية", 340, 700),
      frag("ثالثة", 280, 700),
    ]),
  ]);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].rtl, true);
  assert.equal(blocks[0].runs.map((r) => r.text).join(""), "كلمة ثانية ثالثة");

  const blob = buildTextDocx(blocks, "a4", "doc");
  const xml = readStoredZip(new Uint8Array(await blob.arrayBuffer()))["word/document.xml"];
  assert.match(xml, /<w:pPr><w:bidi\/><\/w:pPr>/);
  assert.match(xml, /<w:rPr><w:rtl\/><\/w:rPr><w:t xml:space="preserve">كلمة ثانية ثالثة/);
});

test("left-to-right text is unchanged by the RTL support", async () => {
  const blocks = layoutPages([page([frag("Hello", 72, 700), frag("world", 120, 700)])]);
  assert.equal(blocks[0].rtl, undefined);
  const xml = readStoredZip(new Uint8Array(await buildTextDocx(blocks).arrayBuffer()))["word/document.xml"];
  assert.doesNotMatch(xml, /w:bidi|w:rtl/);
});

async function numberedPdf(pages) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([200 + i, 300]); // page width encodes its number
  return new Uint8Array(await doc.save());
}

test("split returns exactly the requested pages in the requested order", async () => {
  const source = await numberedPdf(6);
  const parsed = parsePageRanges("5, 1-2", 6);
  assert.equal(parsed.ok, true);
  const [out] = await splitPdf(source, [{ pages: parsed.groups.flatMap((g) => g.pages), label: "x" }], {});
  const doc = await PDFDocument.load(out.bytes);
  assert.deepEqual(doc.getPages().map((p) => p.getWidth() - 200 + 1), [5, 1, 2]);
});

test("merge keeps the selected file order", async () => {
  const a = await numberedPdf(2);
  const b = await numberedPdf(3);
  const merged = await mergePdfs([b, a]);
  assert.equal(merged.pages, 5);
  const doc = await PDFDocument.load(merged.bytes);
  assert.deepEqual(doc.getPages().map((p) => p.getWidth() - 200), [0, 1, 2, 0, 1]);
});

function readStoredZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = {};
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
    const start = offset + 30 + nameLength;
    out[name] = new TextDecoder().decode(bytes.subarray(start, start + size));
    offset = start + size;
  }
  return out;
}
