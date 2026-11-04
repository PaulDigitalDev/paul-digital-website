import test from "node:test";
import assert from "node:assert/strict";
import { pageRender, pageFileName } from "../src/lib/pdfToJpg.ts";

test("A4 at 150 DPI is about 1240x1754 pixels", () => {
  const r = pageRender(595.28, 841.89, 150);
  assert.equal(r.w, 1241);
  assert.equal(r.h, 1754);
  assert.equal(r.reduced, false);
  assert.equal(r.effectiveDpi, 150);
});

test("72 DPI keeps the page size in points", () => {
  const r = pageRender(612, 792, 72);
  assert.deepEqual([r.w, r.h, r.scale], [612, 792, 1]);
});

test("very large pages are scaled down under the pixel limit", () => {
  const r = pageRender(5000, 5000, 300, 40_000_000);
  assert.equal(r.reduced, true);
  assert.ok(r.w * r.h <= 40_000_000);
  assert.ok(r.effectiveDpi < 300);
});

test("page file names are padded to sort in order", () => {
  assert.equal(pageFileName("doc", 3, 9), "doc-page-03.jpg");
  assert.equal(pageFileName("doc", 3, 120), "doc-page-003.jpg");
});
