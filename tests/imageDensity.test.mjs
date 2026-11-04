import test from "node:test";
import assert from "node:assert/strict";
import { readDensity, setDensity, padToSize, detectDensityKind } from "../src/lib/imageDensity.ts";

// 1x1 transparent PNG
const PNG = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"));
const jpegWithJfif = (units, x, y) =>
  Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, units, x >> 8, x & 255, y >> 8, y & 255, 0, 0, 0xff, 0xda, 0, 2, 0xff, 0xd9]);
const jpegNoJfif = () => Uint8Array.from([0xff, 0xd8, 0xff, 0xdb, 0, 3, 0, 0xff, 0xda, 0, 2, 0xff, 0xd9]);

test("detects JPEG and PNG, rejects others", () => {
  assert.equal(detectDensityKind(PNG), "png");
  assert.equal(detectDensityKind(jpegNoJfif()), "jpeg");
  assert.equal(detectDensityKind(Uint8Array.from([1, 2, 3, 4])), null);
});

test("reads JFIF dots per inch and per centimetre", () => {
  assert.deepEqual(readDensity(jpegWithJfif(1, 300, 300)), { kind: "jpeg", dpiX: 300, dpiY: 300, source: "JFIF" });
  assert.equal(readDensity(jpegWithJfif(2, 100, 100)).dpiX, 254);
  assert.equal(readDensity(jpegWithJfif(0, 1, 1)).dpiX, null);
  assert.equal(readDensity(jpegNoJfif()).source, "none");
});

test("setting DPI on a JPEG with JFIF changes only the density bytes", () => {
  const src = jpegWithJfif(0, 1, 1);
  const out = setDensity(src, 300);
  assert.equal(out.length, src.length);
  assert.equal(readDensity(out).dpiX, 300);
  assert.equal(readDensity(out).dpiY, 300);
});

test("setting DPI on a JPEG without JFIF inserts a JFIF header after SOI", () => {
  const src = jpegNoJfif();
  const out = setDensity(src, 150);
  assert.equal(out.length, src.length + 18);
  assert.equal(readDensity(out).dpiX, 150);
  assert.deepEqual([...out.subarray(0, 2)], [0xff, 0xd8]);
  assert.deepEqual([...out.subarray(20)], [...src.subarray(2)]);
});

test("PNG without pHYs gets one; setting again replaces it", () => {
  assert.equal(readDensity(PNG).dpiX, null);
  const a = setDensity(PNG, 300);
  assert.equal(a.length, PNG.length + 21);
  assert.equal(Math.round(readDensity(a).dpiX), 300);
  const b = setDensity(a, 72);
  assert.equal(b.length, a.length);
  assert.equal(Math.round(readDensity(b).dpiX), 72);
  // pixels (IDAT) are untouched
  assert.ok(Buffer.from(b).includes(Buffer.from(PNG.subarray(41, 53))));
});

test("rejects bad DPI values", () => {
  assert.throws(() => setDensity(PNG, 0));
  assert.throws(() => setDensity(PNG, 1.5));
  assert.throws(() => setDensity(PNG, 70000));
});

test("padToSize reaches the exact size for JPEG over several segments", () => {
  const src = jpegNoJfif();
  for (const target of [src.length, src.length + 1, src.length + 3, src.length + 4, 1000, 20 * 1024, 150_000]) {
    const out = padToSize(src, target);
    if (target <= src.length) assert.equal(out.length, src.length);
    else if (target - src.length < 4) assert.equal(out.length, src.length + 4);
    else assert.equal(out.length, target);
    // still starts with SOI and ends with the original tail
    assert.deepEqual([...out.subarray(0, 2)], [0xff, 0xd8]);
    assert.deepEqual([...out.subarray(out.length - (src.length - 2))], [...src.subarray(2)]);
  }
});

test("padToSize reaches the exact size for PNG and keeps IEND last", () => {
  for (const target of [PNG.length + 21, 5000, 100_000]) {
    const out = padToSize(PNG, target);
    assert.equal(out.length, target);
    assert.deepEqual([...out.subarray(out.length - 12)], [...PNG.subarray(PNG.length - 12)]);
  }
});
