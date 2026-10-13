import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  parsePageRanges,
  formatPageRanges,
  singlePageGroups,
  combineGroups,
  baseName,
  outputFileName,
  splitPdf,
  inspectSourcePdf as inspectPdf,
} from "../src/lib/pdfSplit.ts";

/** A PDF whose page n has width 100 + n, so page identity can be read back. */
async function makePdf(count) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let n = 1; n <= count; n++) {
    const page = doc.addPage([100 + n, 200]);
    page.drawText(`page-${n}`, { x: 10, y: 100, size: 12, font });
  }
  return new Uint8Array(await doc.save());
}
const widths = async (bytes) => (await PDFDocument.load(bytes)).getPages().map((p) => Math.round(p.getWidth()) - 100);
const err = (r) => (r.ok ? null : r.error.code);

test("parses single pages and ranges", () => {
  const r = parsePageRanges("1-3, 5, 8-10", 12);
  assert.ok(r.ok);
  assert.deepEqual(r.groups.map((g) => g.pages), [[1, 2, 3], [5], [8, 9, 10]]);
  assert.deepEqual(r.groups.map((g) => g.label), ["1-3", "5", "8-10"]);
});

test("accepts semicolons, en dashes and extra spaces", () => {
  const r = parsePageRanges(" 2 ;4 – 5 ,7", 9);
  assert.ok(r.ok);
  assert.deepEqual(r.groups.map((g) => g.label), ["2", "4-5", "7"]);
});

test("keeps the given order, or sorts into document order", () => {
  const kept = parsePageRanges("8, 2-3, 5", 10, true);
  assert.deepEqual(kept.groups.map((g) => g.label), ["8", "2-3", "5"]);
  const sorted = parsePageRanges("8, 2-3, 5", 10, false);
  assert.deepEqual(sorted.groups.map((g) => g.label), ["2-3", "5", "8"]);
});

test("rejects empty, malformed, zero, reversed, out-of-range and duplicate input", () => {
  assert.equal(err(parsePageRanges("   ", 5)), "empty");
  for (const bad of ["a", "1-", "-3", "1--3", "1,,2", "1 2", "1.5", "1-2-3", "2,"]) {
    assert.equal(err(parsePageRanges(bad, 5)), "syntax", bad);
  }
  assert.equal(err(parsePageRanges("0", 5)), "zero");
  assert.equal(err(parsePageRanges("0-2", 5)), "zero");
  assert.equal(err(parsePageRanges("5-3", 9)), "reversed");
  assert.equal(err(parsePageRanges("6", 5)), "outOfRange");
  assert.equal(err(parsePageRanges("3-9", 5)), "outOfRange");
  assert.equal(err(parsePageRanges("1-3, 3", 5)), "duplicate");
  assert.equal(err(parsePageRanges("2, 1-3", 5)), "duplicate");
  assert.equal(err(parsePageRanges("2, 2", 5)), "duplicate");
  assert.equal(parsePageRanges("5-3", 9).error.token, "5-3");
});

test("formats page sets as compact ranges", () => {
  assert.equal(formatPageRanges([1, 2, 3, 5, 8, 9]), "1-3, 5, 8-9");
  assert.equal(formatPageRanges(new Set([4])), "4");
  assert.equal(formatPageRanges([]), "");
  assert.equal(formatPageRanges([9, 1, 2, 2]), "1-2, 9");
});

test("builds safe file names", () => {
  assert.equal(baseName("Mi contrato final.PDF"), "Mi_contrato_final");
  assert.equal(baseName('a/b:c*d?"e.pdf'), "a_b_c_d_e");
  assert.equal(baseName(".pdf"), "documento");
  assert.equal(baseName("..hidden.pdf"), "hidden");
  const ranges = parsePageRanges("1-3, 5", 9).groups;
  assert.equal(outputFileName("documento", ranges[0]), "documento_paginas_1-3.pdf");
  assert.equal(outputFileName("documento", ranges[1]), "documento_pagina_5.pdf");
  assert.equal(outputFileName("documento", combineGroups(ranges)), "documento_paginas_1-3_5.pdf");
  const long = combineGroups(Array.from({ length: 30 }, (_, i) => ({ pages: [i * 2 + 1], label: String(i * 2 + 1) })));
  assert.equal(outputFileName("d", long), "d_paginas_30-paginas.pdf");
});

test("extracts a single page, with the right page and output PDF opens", async () => {
  const src = await makePdf(6);
  const [out] = await splitPdf(src, parsePageRanges("4", 6).groups);
  assert.deepEqual(await widths(out.bytes), [4]);
  const info = await inspectPdf(out.bytes);
  assert.deepEqual(info, { ok: true, pages: 1 });
});

test("separate ranges produce one PDF each with correct pages and counts", async () => {
  const src = await makePdf(12);
  const outs = await splitPdf(src, parsePageRanges("1-3, 5, 8-10", 12).groups);
  assert.equal(outs.length, 3);
  assert.deepEqual(await Promise.all(outs.map((o) => widths(o.bytes))), [[1, 2, 3], [5], [8, 9, 10]]);
});

test("one combined PDF follows the chosen order", async () => {
  const src = await makePdf(10);
  const kept = combineGroups(parsePageRanges("8, 2-3, 5", 10, true).groups);
  const sorted = combineGroups(parsePageRanges("8, 2-3, 5", 10, false).groups);
  const [a] = await splitPdf(src, [kept]);
  const [b] = await splitPdf(src, [sorted]);
  assert.deepEqual(await widths(a.bytes), [8, 2, 3, 5]);
  assert.deepEqual(await widths(b.bytes), [2, 3, 5, 8]);
});

test("every page becomes its own valid one-page PDF", async () => {
  const src = await makePdf(7);
  const outs = await splitPdf(src, singlePageGroups(7));
  assert.equal(outs.length, 7);
  for (let i = 0; i < 7; i++) {
    assert.deepEqual(await widths(outs[i].bytes), [i + 1]);
    assert.deepEqual(await inspectPdf(outs[i].bytes), { ok: true, pages: 1 });
  }
});

test("the source bytes are left unchanged and progress is reported", async () => {
  const src = await makePdf(5);
  const copy = src.slice();
  const calls = [];
  await splitPdf(src, singlePageGroups(5), { onProgress: (d, t) => calls.push([d, t]) });
  assert.deepEqual(src, copy);
  assert.deepEqual(calls[0], [0, 5]);
  assert.deepEqual(calls.at(-1), [5, 5]);
});

test("stops when the output would exceed the memory budget", async () => {
  const src = await makePdf(5);
  await assert.rejects(() => splitPdf(src, singlePageGroups(5), { maxOutputBytes: 10 }), /output-too-large/);
});

test("inspectPdf classifies encrypted, corrupt, empty and non-PDF input", async () => {
  const doc = await PDFDocument.create();
  doc.addPage([100, 100]);
  const plain = new Uint8Array(await doc.save({ useObjectStreams: false }));
  const text = Buffer.from(plain).toString("latin1").replace("/Root", "/Encrypt << /Filter /Standard >> /Root");
  const encrypted = new Uint8Array(Buffer.from(text, "latin1"));
  assert.deepEqual(await inspectPdf(encrypted), { ok: false, reason: "encrypted" });
  assert.equal((await inspectPdf(new TextEncoder().encode("%PDF-1.4 broken"))).ok, false);
  assert.deepEqual(await inspectPdf(new TextEncoder().encode("hola")), { ok: false, reason: "invalid" });
  assert.deepEqual(await inspectPdf(new Uint8Array(0)), { ok: false, reason: "invalid" });
  await assert.rejects(() => splitPdf(encrypted, singlePageGroups(1)));
  await assert.rejects(() => splitPdf(plain.slice(0, 200), singlePageGroups(1)));
});

test("output names can use Indonesian words and metadata", async () => {
  const id = { one: "halaman", many: "halaman" };
  const ranges = parsePageRanges("1-3, 5", 9).groups;
  assert.equal(outputFileName("dokumen", ranges[0], id), "dokumen_halaman_1-3.pdf");
  assert.equal(outputFileName("dokumen", ranges[1], id), "dokumen_halaman_5.pdf");
  const long = combineGroups(Array.from({ length: 30 }, (_, i) => ({ pages: [i * 2 + 1], label: String(i * 2 + 1) })));
  assert.equal(outputFileName("d", long, id), "d_halaman_30-halaman.pdf");
  const src = await makePdf(2);
  const [out] = await splitPdf(src, singlePageGroups(1), { producer: "Paul Digital - Pisah PDF" });
  assert.equal((await PDFDocument.load(out.bytes, { updateMetadata: false })).getProducer(), "Paul Digital - Pisah PDF");
});
