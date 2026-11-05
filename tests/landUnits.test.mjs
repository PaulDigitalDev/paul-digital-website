import test from "node:test";
import assert from "node:assert/strict";
import { LAND_UNITS, convertArea, formatArea, parseNumber, unitById } from "../src/lib/landUnits.ts";

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} vs ${b}`);

test("Bangladesh and West Bengal units", () => {
  assert.equal(convertArea(1, "katha", "sqft"), 720);
  assert.equal(convertArea(1, "bigha", "katha"), 20);
  assert.equal(convertArea(1, "katha", "chhatak"), 16);
  close(convertArea(1, "katha", "decimal"), 1.6529, 1e-4);
  close(convertArea(1, "bigha", "decimal"), 33.0579, 1e-4);
  close(convertArea(1, "acre", "bigha"), 3.025);
  close(convertArea(1, "acre", "katha"), 60.5);
  close(convertArea(1, "decimal", "ojutangsho"), 100);
  close(convertArea(1, "katha", "sqm"), 66.8902, 1e-4);
});

test("Nepal units", () => {
  assert.equal(convertArea(1, "ropani", "aana"), 16);
  assert.equal(convertArea(1, "aana", "paisa"), 4);
  assert.equal(convertArea(1, "paisa", "dam"), 4);
  assert.equal(convertArea(1, "np-bigha", "np-kattha"), 20);
  assert.equal(convertArea(1, "np-kattha", "np-dhur"), 20);
  close(convertArea(1, "ropani", "sqm"), 508.7372, 1e-4);
  close(convertArea(1, "np-bigha", "sqm"), 6772.63, 1e-4);
  close(convertArea(1, "np-bigha", "ropani"), 13.3118, 1e-4);
});

test("India and general units", () => {
  assert.equal(convertArea(1, "acre", "sqft"), 43560);
  assert.equal(convertArea(1, "kanal", "marla"), 20);
  assert.equal(convertArea(1, "gunta", "sqft"), 1089);
  assert.equal(convertArea(40, "gunta", "acre"), 1);
  close(convertArea(1, "hectare", "acre"), 2.47105, 1e-5);
  close(convertArea(1, "sqm", "sqft"), 10.7639, 1e-5);
});

test("round trips for every pair of units", () => {
  for (const a of LAND_UNITS) for (const b of LAND_UNITS) close(convertArea(convertArea(7.5, a.id, b.id), b.id, a.id), 7.5, 1e-9);
  assert.equal(unitById.size, LAND_UNITS.length);
});

test("formatting and parsing", () => {
  assert.equal(formatArea(1234567.891), "12,34,567.891");
  assert.equal(formatArea(0.016528925), "0.01652893");
  assert.equal(formatArea(12.5, true), "১২.৫");
  assert.equal(parseNumber("১২,৫.৫"), 125.5);
  assert.equal(parseNumber("1,000"), 1000);
  assert.equal(parseNumber("abc"), null);
  assert.equal(parseNumber(""), null);
  assert.equal(parseNumber("."), null);
});
