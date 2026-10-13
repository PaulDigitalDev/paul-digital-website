import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import { compressPdf, inspectForCompression, CompressError, savedPercent, formatPercent, LEVELS } from "../src/lib/pdfCompress.ts";

const text = (bytes) => Buffer.from(bytes).toString("latin1");

/** A minimal JPEG-looking blob: SOI + SOF0 (RGB, 8-bit) header + filler. pdf-lib only reads the header. */
function fakeJpeg(width, height, filler) {
  const sof = [0xff, 0xc0, 0, 17, 8, height >> 8, height & 255, width >> 8, width & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1];
  const body = Buffer.alloc(filler, 0x5a);
  return new Uint8Array(Buffer.concat([Buffer.from([0xff, 0xd8]), Buffer.from(sof), body, Buffer.from([0xff, 0xd9])]));
}

/** A PDF with an uncompressed (repetitive) content stream, an orphan object, metadata and optional images. */
async function makeSample({ images = [], withMetadata = true } = {}) {
  const doc = await PDFDocument.create();
  if (withMetadata) {
    doc.setTitle("Secret title");
    doc.setAuthor("Someone");
  }
  const page = doc.addPage([300, 300]);
  const ctx = doc.context;
  const ops = Array.from({ length: 400 }, (_, i) => `BT /F1 12 Tf 10 ${280 - (i % 20) * 12} Td (Line ${i % 7} of sample text) Tj ET`).join("\n");
  const content = ctx.stream(Buffer.from(ops, "latin1")); // raw, no Filter
  page.node.set(PDFName.of("Contents"), ctx.register(content));
  const font = ctx.register(ctx.obj({ Type: "Font", Subtype: "Type1", BaseFont: "Helvetica" }));
  page.node.set(PDFName.of("Resources"), ctx.obj({ Font: { F1: font } }));
  ctx.register(ctx.stream(Buffer.alloc(5000, 7))); // orphan: nothing references it
  const embedded = [];
  for (const [w, h, size] of images) {
    const img = await doc.embedJpg(fakeJpeg(w, h, size));
    page.drawImage(img, { x: 0, y: 0, width: 50, height: 50 });
    embedded.push(img);
  }
  return new Uint8Array(await doc.save({ useObjectStreams: false }));
}

const pageText = async (bytes) => {
  const doc = await PDFDocument.load(bytes);
  const contents = doc.getPage(0).node.Contents();
  return text(decodePDFRawStream(doc.context.lookup(contents)).decode());
};

const halve = (calls) => async (input) => {
  calls.push(input);
  return { bytes: new Uint8Array(Math.floor(input.bytes.length / 2)), width: Math.min(input.width, input.maxDimension), height: input.height };
};

test("lossless level shrinks a bloated PDF without touching content", async () => {
  const sample = await makeSample();
  const original = await pageText(sample);
  const { bytes, stats } = await compressPdf(sample, { level: "lossless", stripMetadata: false });
  assert.ok(bytes.length < sample.length, `${bytes.length} < ${sample.length}`);
  assert.equal(stats.size, bytes.length);
  assert.equal(stats.originalSize, sample.length);
  assert.equal(stats.pages, 1);
  assert.ok(stats.streamsCompressed >= 1);
  assert.ok(stats.unusedObjectsRemoved >= 1);
  assert.equal(await pageText(bytes), original);
  assert.equal((await PDFDocument.load(bytes)).getTitle(), "Secret title"); // metadata kept by default
});

test("a second pass over already-optimised output barely changes size and never breaks", async () => {
  const first = await compressPdf(await makeSample(), { level: "lossless", stripMetadata: false });
  const second = await compressPdf(first.bytes, { level: "lossless", stripMetadata: false });
  assert.equal(second.stats.streamsCompressed, 0);
  assert.equal(second.stats.unusedObjectsRemoved, 0);
  assert.equal((await PDFDocument.load(second.bytes)).getPageCount(), 1);
  // The caller decides what to offer: here the result is not meaningfully smaller.
  assert.ok(savedPercent(first.bytes.length, second.bytes.length) < 5);
});

test("stripMetadata removes the document info", async () => {
  const sample = await makeSample();
  const { bytes, stats } = await compressPdf(sample, { level: "lossless", stripMetadata: true });
  assert.equal(stats.metadataRemoved, true);
  const out = await PDFDocument.load(bytes, { updateMetadata: false });
  assert.equal(out.getTitle(), undefined);
  assert.equal(out.getAuthor(), undefined);
  assert.ok(!text(bytes).includes("Secret title"));
});

test("lossless never calls the image recoder", async () => {
  const calls = [];
  const sample = await makeSample({ images: [[800, 600, 40000]] });
  const { stats } = await compressPdf(sample, { level: "lossless", stripMetadata: false, recodeJpeg: halve(calls) });
  assert.equal(calls.length, 0);
  assert.equal(stats.imagesRecompressed, 0);
});

test("balanced recodes large JPEGs, passes level settings, and updates the image dictionary", async () => {
  const calls = [];
  const sample = await makeSample({ images: [[3000, 2000, 60000], [100, 100, 500]] });
  const { bytes, stats } = await compressPdf(sample, { level: "balanced", stripMetadata: false, recodeJpeg: halve(calls) });
  assert.equal(stats.imagesFound, 2);
  assert.equal(stats.imagesRecompressed, 1); // the 500-byte image is below the minimum size
  assert.equal(calls.length, 1);
  assert.equal(calls[0].quality, LEVELS.balanced.quality);
  assert.equal(calls[0].maxDimension, 2000);
  assert.ok(bytes.length < sample.length - 25000);
  const doc = await PDFDocument.load(bytes);
  const big = [...doc.context.enumerateIndirectObjects()]
    .map(([, o]) => o)
    .find((o) => o instanceof PDFRawStream && o.dict.get(PDFName.of("Subtype")) === PDFName.of("Image") && o.dict.get(PDFName.of("Width")).asNumber() === 2000);
  assert.ok(big, "image width was updated to the scaled size");
});

test("images are kept when the recoded version is not meaningfully smaller", async () => {
  const sample = await makeSample({ images: [[800, 600, 40000]] });
  const keepSize = async (input) => ({ bytes: new Uint8Array(input.bytes.length - 10), width: input.width, height: input.height });
  const { stats } = await compressPdf(sample, { level: "strong", stripMetadata: false, recodeJpeg: keepSize });
  assert.equal(stats.imagesRecompressed, 0);
});

test("a recoder that returns null or throws leaves the image untouched", async () => {
  const sample = await makeSample({ images: [[800, 600, 40000]] });
  for (const recodeJpeg of [async () => null, async () => { throw new Error("decode failed"); }]) {
    const { bytes, stats } = await compressPdf(sample, { level: "strong", stripMetadata: false, recodeJpeg });
    assert.equal(stats.imagesRecompressed, 0);
    assert.equal((await PDFDocument.load(bytes)).getPageCount(), 1);
  }
});

test("reports progress stages", async () => {
  const stages = new Set();
  await compressPdf(await makeSample(), { level: "lossless", stripMetadata: false, onProgress: (s) => stages.add(s) });
  for (const s of ["reading", "streams", "saving", "verifying"]) assert.ok(stages.has(s), s);
});

test("rejects non-PDF, corrupt and encrypted input with a specific reason", async () => {
  const reason = async (bytes) => {
    try {
      await compressPdf(bytes, { level: "lossless", stripMetadata: false });
    } catch (e) {
      assert.ok(e instanceof CompressError, String(e?.stack));
      return e.reason;
    }
    return "no error";
  };
  assert.equal(await reason(new TextEncoder().encode("hello, not a pdf")), "invalid");
  assert.equal(await reason(new TextEncoder().encode("%PDF-1.4\nthis is truncated garbage")), "corrupt");
  const doc = await PDFDocument.create();
  doc.addPage([100, 100]);
  const plain = Buffer.from(await doc.save({ useObjectStreams: false })).toString("latin1");
  const encrypted = Buffer.from(plain.replace("/Root", "/Encrypt << /Filter /Standard >> /Root"), "latin1");
  assert.equal(await reason(new Uint8Array(encrypted)), "encrypted");
  assert.deepEqual(await inspectForCompression(new Uint8Array(encrypted)), { ok: false, reason: "encrypted" });
  assert.deepEqual(await inspectForCompression(new TextEncoder().encode("nope")), { ok: false, reason: "invalid" });
  assert.deepEqual(await inspectForCompression(plain.length ? new Uint8Array(Buffer.from(plain, "latin1")) : new Uint8Array()), { ok: true, pages: 1 });
});

test("percentage maths uses real byte counts", () => {
  assert.equal(savedPercent(1000, 250), 75);
  assert.equal(savedPercent(1000, 1000), 0);
  assert.equal(savedPercent(1000, 1100), -10);
  assert.equal(savedPercent(0, 10), 0);
  assert.equal(formatPercent(4.24, "es"), "4,2 %");
  assert.equal(formatPercent(-37.4, "es"), "37 %");
});
