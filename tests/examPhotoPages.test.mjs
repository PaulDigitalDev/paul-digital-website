import test from "node:test";
import assert from "node:assert/strict";
import { examPhotoPages } from "../src/data/examPhotoPages.ts";

test("exam pages: unique slugs, titles and descriptions", () => {
  for (const key of ["slug", "title", "description"]) {
    assert.equal(new Set(examPhotoPages.map((p) => p[key])).size, examPhotoPages.length, key);
  }
});

test("exam pages: meta lengths", () => {
  for (const p of examPhotoPages) {
    assert.ok(p.description.length >= 110 && p.description.length <= 160, `${p.slug} description ${p.description.length}`);
    assert.ok(p.title.length <= 70, `${p.slug} title ${p.title.length}`);
  }
});

test("exam pages: every page cites an official source with a check date", () => {
  for (const p of examPhotoPages) {
    assert.ok(p.sources && p.sources.length > 0, p.slug);
    for (const s of p.sources) {
      assert.match(s.url, /^https:\/\/(ssc\.gov\.in|upsconline\.nic\.in|www\.upsc\.gov\.in)\//, s.url);
      assert.match(s.verified, /\d{4}$/);
      assert.ok(s.says.length > 0);
    }
  }
});

test("exam pages: SSC signature size is 6 x 2 cm at 300 dpi and 10-20 KB", () => {
  const px = (cm) => Math.round((cm * 10 / 25.4) * 300);
  for (const slug of ["ssc-photo-resizer", "ssc-cgl-signature-size", "ssc-chsl-signature-size"]) {
    const g = examPhotoPages.find((p) => p.slug === slug).gov;
    assert.deepEqual([g.w, g.h, g.minKb, g.maxKb], [px(6), px(2), 10, 20]);
  }
  assert.equal(px(6), 709);
  assert.equal(px(2), 236);
});

test("exam pages: UPSC ranges and signature sides inside 350-500 px", () => {
  const photo = examPhotoPages.find((p) => p.slug === "upsc-photo-resizer").gov;
  const sig = examPhotoPages.find((p) => p.slug === "upsc-signature-resizer").gov;
  assert.deepEqual([photo.minKb, photo.maxKb], [20, 200]);
  assert.deepEqual([sig.minKb, sig.maxKb], [20, 100]);
  for (const side of [sig.w, sig.h]) assert.ok(side >= 350 && side <= 500);
});

test("exam pages: no uncited exam claims about PAN or unverified exams", () => {
  const text = JSON.stringify(examPhotoPages);
  assert.doesNotMatch(text, /213\s*[×x]\s*213/);
});
