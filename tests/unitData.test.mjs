import test from "node:test";
import assert from "node:assert/strict";
import { convertUnit, formatNumber, parseSigned } from "../src/lib/unitData.ts";

const close = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) < e, `${a} vs ${b}`);

test("length", () => {
  close(convertUnit(1, "in", "cm"), 2.54);
  close(convertUnit(1, "mi", "km"), 1.609344);
  close(convertUnit(6, "ft", "cm"), 182.88);
});
test("mass and volume", () => {
  close(convertUnit(1, "kg", "lb"), 2.2046226218, 1e-9);
  close(convertUnit(1, "st", "kg"), 6.35029318);
  close(convertUnit(1, "gal", "l"), 3.785411784);
});
test("temperature", () => {
  close(convertUnit(100, "c", "f"), 212);
  close(convertUnit(32, "f", "c"), 0);
  close(convertUnit(-40, "c", "f"), -40);
  close(convertUnit(0, "c", "k"), 273.15);
});
test("format and parse", () => {
  assert.equal(formatNumber(1234.5678), "1,234.568");
  assert.equal(parseSigned("-40"), -40);
  assert.equal(parseSigned("1,000.5"), 1000.5);
  assert.equal(parseSigned("abc"), null);
});
