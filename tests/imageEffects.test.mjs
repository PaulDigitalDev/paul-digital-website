import test from "node:test";
import assert from "node:assert/strict";
import { luma, grayscaleInPlace, maxCornerRadius, radiusFromPercent, borderedSize, circleSquare, parseHex } from "../src/lib/imageEffects.ts";

test("luma keeps black, white and mid greys", () => {
  assert.equal(luma(0, 0, 0), 0);
  assert.equal(luma(255, 255, 255), 255);
  assert.equal(luma(100, 100, 100), 100);
  assert.ok(luma(0, 255, 0) > luma(255, 0, 0));
  assert.ok(luma(255, 0, 0) > luma(0, 0, 255));
});

test("grayscale makes channels equal and keeps alpha", () => {
  const px = new Uint8ClampedArray([200, 50, 10, 77, 0, 0, 255, 255]);
  grayscaleInPlace(px);
  assert.equal(px[0], px[1]);
  assert.equal(px[1], px[2]);
  assert.equal(px[3], 77);
  assert.equal(px[4], px[5]);
  assert.equal(px[7], 255);
});

test("corner radius is capped at half the short side", () => {
  assert.equal(maxCornerRadius(400, 200), 100);
  assert.equal(radiusFromPercent(100, 400, 200), 100);
  assert.equal(radiusFromPercent(50, 400, 200), 50);
  assert.equal(radiusFromPercent(0, 400, 200), 0);
  assert.equal(radiusFromPercent(250, 400, 200), 100);
  assert.equal(radiusFromPercent(-5, 400, 200), 0);
});

test("border adds twice the thickness to each side", () => {
  assert.deepEqual(borderedSize(300, 200, 10), { w: 320, h: 220 });
  assert.deepEqual(borderedSize(300, 200, 0), { w: 300, h: 200 });
});

test("circle square is centred on the longer side", () => {
  assert.deepEqual(circleSquare(1000, 600), { x: 200, y: 0, side: 600 });
  assert.deepEqual(circleSquare(500, 500), { x: 0, y: 0, side: 500 });
  assert.deepEqual(circleSquare(300, 901), { x: 0, y: 300, side: 300 });
});

test("hex colours parse in both forms", () => {
  assert.deepEqual(parseHex("#ff8000"), { r: 255, g: 128, b: 0 });
  assert.deepEqual(parseHex("fff"), { r: 255, g: 255, b: 255 });
  assert.equal(parseHex("#12"), null);
  assert.equal(parseHex("red"), null);
});
