import test from "node:test";
import assert from "node:assert/strict";
import { parseHex, rgbToHex, rgbToHsl, hslToRgb, hslCss, parseRgb, parseHsl } from "../src/lib/colorConvert.ts";

test("hex parsing", () => {
  assert.deepEqual(parseHex("#FF8800"), { r: 255, g: 136, b: 0 });
  assert.deepEqual(parseHex("f80"), { r: 255, g: 136, b: 0 });
  assert.equal(parseHex("#GG0000"), null);
  assert.equal(parseHex("#12345"), null);
});
test("rgb to hex", () => {
  assert.equal(rgbToHex({ r: 255, g: 136, b: 0 }), "#FF8800");
  assert.equal(rgbToHex({ r: 0, g: 0, b: 0 }), "#000000");
});
test("rgb to hsl and back", () => {
  assert.equal(hslCss(rgbToHsl({ r: 255, g: 0, b: 0 })), "hsl(0, 100%, 50%)");
  assert.equal(hslCss(rgbToHsl({ r: 255, g: 255, b: 255 })), "hsl(0, 0%, 100%)");
  assert.equal(hslCss(rgbToHsl({ r: 0, g: 128, b: 0 })), "hsl(120, 100%, 25%)");
  for (const c of [{ r: 12, g: 200, b: 99 }, { r: 255, g: 136, b: 0 }, { r: 70, g: 70, b: 70 }]) {
    assert.deepEqual(hslToRgb(rgbToHsl(c)), c);
  }
});
test("string parsing", () => {
  assert.deepEqual(parseRgb("rgb(255, 136, 0)"), { r: 255, g: 136, b: 0 });
  assert.equal(parseRgb("300, 0, 0"), null);
  assert.deepEqual(parseHsl("hsl(120, 100%, 25%)"), { h: 120, s: 100, l: 25 });
  assert.equal(parseHsl("120, 150%, 25%"), null);
});
