import test from "node:test";
import assert from "node:assert/strict";
import { WEIGHT_UNITS, convertWeight, toVoriAnaRoti, weightById } from "../src/lib/weightUnits.ts";

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} vs ${b}`);

test("vori, tola, ana, roti, masha", () => {
  assert.equal(convertWeight(1, "vori", "gram"), 11.664);
  assert.equal(convertWeight(1, "vori", "tola"), 1);
  close(convertWeight(1, "vori", "ana"), 16);
  close(convertWeight(1, "vori", "roti"), 96);
  close(convertWeight(1, "vori", "masha"), 12);
  close(convertWeight(1, "ana", "gram"), 0.729);
  close(convertWeight(100, "gram", "vori"), 8.573388, 1e-6);
  close(convertWeight(10, "gram", "vori"), 0.857339, 1e-6);
});

test("metric and imperial", () => {
  assert.equal(convertWeight(1, "kg", "gram"), 1000);
  close(convertWeight(1, "troy-oz", "gram"), 31.1034768);
  close(convertWeight(1, "lb", "kg"), 0.45359237);
  close(convertWeight(1, "oz", "gram"), 28.349523125);
});

test("round trips", () => {
  for (const a of WEIGHT_UNITS) for (const b of WEIGHT_UNITS) close(convertWeight(convertWeight(3.7, a.id, b.id), b.id, a.id), 3.7);
  assert.equal(weightById.size, WEIGHT_UNITS.length);
});

test("grams to vori, ana and roti", () => {
  assert.deepEqual(toVoriAnaRoti(11.664), { vori: 1, ana: 0, roti: 0 });
  assert.deepEqual(toVoriAnaRoti(2 * 11.664 + 5 * 0.729 + 3 * 0.1215), { vori: 2, ana: 5, roti: 3 });
  assert.deepEqual(toVoriAnaRoti(0), { vori: 0, ana: 0, roti: 0 });
});

import { goldValue, goldPrice } from "../src/lib/calcDefsIn.ts";
import { defaultsFor } from "../src/lib/calcDefs.ts";

test("gold value: vori, ana, roti and making charge", () => {
  const r = goldValue(2, 8, 0, 150000, "vori", 6, 0);
  assert.ok(Math.abs(r.grams - 2.5 * 11.664) < 1e-9);
  assert.ok(Math.abs(r.metal - 375000) < 1e-6);
  assert.ok(Math.abs(r.total - 397500) < 1e-6);
  const g = goldValue(1, 0, 0, 100, "gram", 0, 50);
  assert.ok(Math.abs(g.total - (1166.4 + 50)) < 1e-9);
});

test("gold price calculator defaults and errors", () => {
  const out = goldPrice.compute(defaultsFor(goldPrice));
  assert.ok(!out.error);
  const bad = goldPrice.compute({ ...defaultsFor(goldPrice), vori: "0" });
  assert.ok(bad.error);
});
