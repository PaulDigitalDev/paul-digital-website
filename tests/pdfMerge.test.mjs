import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, StandardFonts, PDFName, degrees, decodePDFRawStream } from "pdf-lib";
import { hasPdfHeader, inspectPdf, mergePdfs, formatBytesPt } from "../src/lib/pdfMerge.ts";

/** Builds a PDF whose pages have the given [width, height, rotation?] sizes, each with some text. */
async function makePdf(sizes, label = "doc") {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  sizes.forEach(([w, h, rot], i) => {
    const page = doc.addPage([w, h]);
    page.drawText(`${label}-page-${i + 1}`, { x: 20, y: h - 40, size: 14, font });
    if (rot) page.setRotation(degrees(rot));
  });
  return new Uint8Array(await doc.save());
}

const pageInfo = async (bytes) => {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((p) => [Math.round(p.getWidth()), Math.round(p.getHeight()), p.getRotation().angle]);
};

test("merges two one-page PDFs", async () => {
  const a = await makePdf([[200, 300]], "a");
  const b = await makePdf([[400, 500]], "b");
  const { bytes, pages } = await mergePdfs([a, b]);
  assert.equal(pages, 2);
  assert.deepEqual(await pageInfo(bytes), [[200, 300, 0], [400, 500, 0]]);
  assert.ok(hasPdfHeader(bytes));
});

test("merges multi-page PDFs and keeps page order exactly", async () => {
  const a = await makePdf([[101, 100], [102, 100], [103, 100]], "a");
  const b = await makePdf([[201, 100], [202, 100]], "b");
  const c = await makePdf([[301, 100]], "c");
  const { bytes, pages } = await mergePdfs([b, a, c]); // deliberate non-alphabetical order
  assert.equal(pages, 6);
  assert.deepEqual((await pageInfo(bytes)).map((p) => p[0]), [201, 202, 101, 102, 103, 301]);
});

test("reordering the inputs reorders the output", async () => {
  const a = await makePdf([[111, 100]]);
  const b = await makePdf([[222, 100]]);
  assert.deepEqual((await pageInfo((await mergePdfs([a, b])).bytes)).map((p) => p[0]), [111, 222]);
  assert.deepEqual((await pageInfo((await mergePdfs([b, a])).bytes)).map((p) => p[0]), [222, 111]);
});

test("preserves mixed page sizes, orientations and rotation", async () => {
  const a = await makePdf([[595, 842], [842, 595]], "a"); // A4 portrait + landscape
  const b = await makePdf([[612, 792, 90], [300, 300]], "b"); // Letter rotated, square
  const { bytes } = await mergePdfs([a, b]);
  assert.deepEqual(await pageInfo(bytes), [[595, 842, 0], [842, 595, 0], [612, 792, 90], [300, 300, 0]]);
});

test("keeps vector text (no rasterising): text operators and fonts survive", async () => {
  const a = await makePdf([[200, 200]], "marker-alpha");
  const b = await makePdf([[200, 200]], "marker-beta");
  const { bytes } = await mergePdfs([a, b]);
  const doc = await PDFDocument.load(bytes);
  for (const page of doc.getPages()) {
    assert.ok(page.node.Resources().lookup(PDFName.of("Font")), "page keeps its font resources");
    const xobjects = page.node.Resources().lookup(PDFName.of("XObject"));
    assert.equal(xobjects ? xobjects.keys().length : 0, 0, "no image XObjects were introduced");
  }
  // Decode each page's content stream: the original text-showing operators must still be there, per page, in order.
  const texts = doc.getPages().map((page) => {
    const contents = page.node.Contents();
    const streams = contents.constructor.name === "PDFArray" ? contents.asArray().map((r) => doc.context.lookup(r)) : [contents];
    return streams.map((st) => Buffer.from(decodePDFRawStream(st).decode()).toString("latin1")).join("\n");
  });
  const hex = (t) => Buffer.from(t, "latin1").toString("hex").toUpperCase();
  assert.ok(texts[0].includes(hex("marker-alpha-page-1")) && texts[0].includes("Tj"));
  assert.ok(texts[1].includes(hex("marker-beta-page-1")) && texts[1].includes("Tj"));
});

test("output reloads as a valid PDF and can be inspected", async () => {
  const a = await makePdf([[200, 200], [200, 200]]);
  const { bytes } = await mergePdfs([a, a]);
  assert.deepEqual(await inspectPdf(bytes), { ok: true, pages: 4 });
  assert.ok(Buffer.from(bytes).toString("latin1").trimEnd().endsWith("%%EOF"));
});

test("merging the same selection again works", async () => {
  const a = await makePdf([[200, 200]]);
  const b = await makePdf([[300, 300]]);
  const first = await mergePdfs([a, b]);
  const second = await mergePdfs([a, b]);
  assert.equal(first.pages, second.pages);
});

test("reports progress for every file", async () => {
  const a = await makePdf([[200, 200]]);
  const calls = [];
  await mergePdfs([a, a, a], (done, total) => calls.push([done, total]));
  assert.deepEqual(calls, [[0, 3], [1, 3], [2, 3]]);
});

test("rejects invalid, empty and corrupt input", async () => {
  assert.deepEqual(await inspectPdf(new Uint8Array(0)), { ok: false, reason: "invalid" });
  assert.deepEqual(await inspectPdf(new TextEncoder().encode("hello world, not a pdf")), { ok: false, reason: "invalid" });
  assert.deepEqual(await inspectPdf(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a])), { ok: false, reason: "invalid" });
  const good = await makePdf([[200, 200]]);
  const truncated = good.slice(0, Math.floor(good.length / 3));
  const r = await inspectPdf(truncated);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "corrupt");
  const garbage = new TextEncoder().encode("%PDF-1.7\nthis is garbage with a header only\n%%EOF");
  assert.equal((await inspectPdf(garbage)).ok, false);
});

test("detects password-protected PDFs", async () => {
  // Minimal encrypted-looking trailer: pdf-lib refuses documents with /Encrypt unless told to ignore it.
  const doc = await PDFDocument.create();
  doc.addPage([100, 100]);
  const bytes = new Uint8Array(await doc.save({ useObjectStreams: false }));
  const text = Buffer.from(bytes).toString("latin1").replace("/Root", "/Encrypt << /Filter /Standard >> /Root");
  const r = await inspectPdf(new Uint8Array(Buffer.from(text, "latin1")));
  assert.equal(r.ok, false);
  assert.ok(["encrypted", "corrupt"].includes(r.reason));
});

test("mergePdfs rejects (does not return output) when a source is corrupt", async () => {
  const good = await makePdf([[200, 200]]);
  await assert.rejects(() => mergePdfs([good, new TextEncoder().encode("%PDF-1.4 broken")]));
});

test("formats sizes in pt-BR", () => {
  assert.equal(formatBytesPt(0), "0 bytes");
  assert.equal(formatBytesPt(1536), "1,5 KB");
  assert.equal(formatBytesPt(100 * 1024 * 1024), "100 MB");
});
