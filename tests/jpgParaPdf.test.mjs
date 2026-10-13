import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { checkJpeg } from "../src/lib/jpgToPdfPt.ts";
import { buildPdf } from "../src/lib/jpegPdf.ts";

// Builds a JPEG header-only stream with the given frame size (enough for parsing/embedding in the writer).
function fakeJpeg(width, height) {
  const sof = [0xff, 0xc0, 0, 17, 8, height >> 8, height & 255, width >> 8, width & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1];
  return Uint8Array.from([0xff, 0xd8, ...sof, 0xff, 0xda, 0, 12, 3, 1, 0, 2, 0x11, 3, 0x11, 0, 63, 0, 0xff, 0xd9]);
}

test("accepts a real JPEG and reports its size", () => {
  const r = checkJpeg(fakeJpeg(3, 2));
  assert.equal(r.ok, true);
  assert.deepEqual([r.displayWidth, r.displayHeight], [3, 2]);
});

test("rejects empty, non-JPEG and truncated data by content", () => {
  assert.deepEqual(checkJpeg(new Uint8Array(0)), { ok: false, reason: "empty" });
  assert.equal(checkJpeg(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a])).reason, "not-jpeg"); // PNG
  assert.equal(checkJpeg(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 4])).ok, false); // truncated header
  assert.equal(checkJpeg(fakeJpeg(3, 2).slice(0, -6)).reason, "corrupt"); // cut off before EOI
});

test("builds a valid multi-page PDF in list order, landscape and portrait", async () => {
  const imgs = [fakeJpeg(400, 800), fakeJpeg(900, 300), fakeJpeg(500, 500)].map((bytes) => {
    const c = checkJpeg(bytes);
    assert.ok(c.ok);
    return { bytes, width: c.info.width, height: c.info.height, components: c.info.components };
  });
  const pdf = new Uint8Array(await buildPdf(imgs, "a4").arrayBuffer());
  const doc = await PDFDocument.load(pdf);
  assert.equal(doc.getPageCount(), 3);
  const sizes = doc.getPages().map((p) => [Math.round(p.getWidth()), Math.round(p.getHeight())]);
  assert.deepEqual(sizes, [[595, 842], [842, 595], [595, 842]]);
  const matched = await PDFDocument.load(new Uint8Array(await buildPdf(imgs.slice(0, 2), "image").arrayBuffer()));
  const [a, b] = matched.getPages();
  assert.ok(Math.abs(a.getWidth() / a.getHeight() - 0.5) < 0.01);
  assert.ok(Math.abs(b.getWidth() / b.getHeight() - 3) < 0.01);
});
