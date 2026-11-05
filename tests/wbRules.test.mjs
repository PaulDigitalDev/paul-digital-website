import test from "node:test";
import assert from "node:assert/strict";
import * as w from "../src/lib/wbRules.ts";

test("superannuation: last day of the month at 60, or of the month before if born on the 1st", () => {
  assert.deepEqual(w.superannuationDate({ y: 1966, m: 5, d: 15 }, 60), { y: 2026, m: 5, d: 31 });
  assert.deepEqual(w.superannuationDate({ y: 1966, m: 5, d: 1 }, 60), { y: 2026, m: 4, d: 30 });
  assert.deepEqual(w.superannuationDate({ y: 1966, m: 1, d: 1 }, 60), { y: 2025, m: 12, d: 31 });
  assert.deepEqual(w.superannuationDate({ y: 1964, m: 2, d: 10 }, 62), { y: 2026, m: 2, d: 28 });
});
test("qualifying service rounding follows the notification examples", () => {
  assert.equal(w.qualifyingHalfYears(23 * 12 + 7), 47); // 23y7m11d -> 23y6m
  assert.equal(w.qualifyingHalfYears(23 * 12 + 9), 48); // 23y9m -> 24y
  assert.equal(w.qualifyingHalfYears(23 * 12 + 2), 46); // under 3 months ignored
});
test("service length counts both dates and takes off deducted days", () => {
  const s = w.serviceLength({ y: 2000, m: 1, d: 1 }, { y: 2020, m: 1, d: 1 }, 0, false);
  assert.equal(s.years, 20);
  assert.equal(s.months, 0);
  assert.equal(w.serviceLength({ y: 2020, m: 1, d: 1 }, { y: 2019, m: 1, d: 1 }, 0, true), null);
});
test("gratuity matches the worked example (20 years, pay 15000 + DA 3000)", () => {
  assert.equal(w.retiringGratuity(18000, 40), 180000);
  assert.equal(w.deathGratuity(18000, 40), 360000);
  assert.equal(w.retiringGratuity(100000, 80), 1200000); // ceiling
  assert.equal(w.deathGratuityMultiple(4), 6);
  assert.equal(w.deathGratuityMultiple(70), 33);
});
test("pension examples from the notification", () => {
  assert.equal(w.basicPension(30000, 66).pension, 15000);
  assert.equal(w.basicPension(30000, 40).pension, 15000);
  assert.equal(w.basicPension(30000, 30).pension, 11250);
  assert.equal(w.basicPension(30000, 16).pension, 0);
  assert.equal(w.basicPension(500000, 60).pension, 100500);
});
test("commuted value example: age 61, pension 15000, 40%", () => {
  const c = w.commutation(15000, 40, 61);
  assert.equal(Math.round(c.lumpSum), 589968);
  assert.equal(c.reducedPension, 9000);
  assert.equal(w.commutation(15000, 40, 19), null);
});
test("increments and leave salary", () => {
  const r = w.incrementSchedule(50000, 3, 2, 100);
  assert.equal(r[0].increment, 1500);
  assert.equal(r[0].basic, 51500);
  assert.equal(w.leaveSalary(30000, 6000, 30), 36000);
});
