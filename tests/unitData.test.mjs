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

test("area, speed, data, time, pressure, energy", () => {
  close(convertUnit(1, "acre", "sqft"), 43560, 1e-6);
  close(convertUnit(1, "ha", "acre"), 2.4710538147, 1e-8);
  close(convertUnit(60, "mph", "kmh"), 96.56064, 1e-6);
  close(convertUnit(10, "ms", "kmh"), 36);
  close(convertUnit(1, "gb", "mb"), 1000);
  close(convertUnit(2.5, "hr", "min"), 150);
  close(convertUnit(1, "bar", "psi"), 14.5037738, 1e-6);
  close(convertUnit(1, "kcal", "kj"), 4.184);
  close(convertUnit(1, "kwh", "btu"), 3412.14, 1e-2);
});

test("cooking and extra length and weight units", () => {
  close(convertUnit(1, "cup", "tbsp"), 16, 1e-9);
  close(convertUnit(1, "tbsp", "tsp"), 3, 1e-9);
  close(convertUnit(1, "tbsp", "ml"), 14.78676478125, 1e-9);
  close(convertUnit(1, "pint", "cup"), 2, 1e-6);
  close(convertUnit(1, "quart", "cup"), 4, 1e-6);
  close(convertUnit(1, "quart", "l"), 0.946352946, 1e-9);
  close(convertUnit(1, "lb", "oz"), 16, 1e-9);
  close(convertUnit(1, "st", "lb"), 14, 1e-6);
  close(convertUnit(1, "mi", "ft"), 5280, 1e-6);
  close(convertUnit(1, "km", "m"), 1000);
  close(convertUnit(1, "tonne", "kg"), 1000);
});
