import test from "node:test";
import assert from "node:assert/strict";
import { emi, fd, fdMaturity, mtc, ppf, ppfSchedule, rd, rdMaturity } from "../src/lib/calcDefsIn.ts";
import { defaultsFor } from "../src/lib/calcDefs.ts";

test("FD: quarterly and yearly compounding", () => {
  assert.equal(Math.round(fdMaturity(100000, 7, 5, 4)), 141478);
  assert.equal(Math.round(fdMaturity(100000, 7, 5, 1)), 140255);
});

test("RD: one deposit for one month, and growth over time", () => {
  assert.ok(Math.abs(rdMaturity(1000, 12, 1) - 1000 * Math.pow(1.03, 1 / 3)) < 1e-9);
  assert.ok(rdMaturity(5000, 6.5, 60) > 5000 * 60);
});

test("PPF: first year and total", () => {
  const rows = ppfSchedule(100000, 10, 2);
  assert.equal(Math.round(rows[0].balance), 110000);
  assert.equal(Math.round(rows[1].balance), 231000);
});

test("calculators run on their defaults and reject bad input", () => {
  for (const def of [emi, fd, rd, ppf, mtc]) {
    const out = def.compute(defaultsFor(def));
    assert.equal(out.error, undefined, def.id);
    assert.ok(out.rows.length >= 3, def.id);
  }
  assert.match(ppf.compute({ ...defaultsFor(ppf), deposit: "200000" }).error, /1,50,000/);
  assert.ok(emi.compute({ ...defaultsFor(emi), amount: "" }).error);
  const m = mtc.compute({ value: "25", unit: "million" });
  assert.equal(m.rows[0].value, "2.5");
  assert.equal(m.rows[1].value, "250");
});

test("EMI default: 10 lakh at 9% for 5 years", () => {
  const out = emi.compute(defaultsFor(emi));
  assert.match(out.rows[0].value, /^₹20,758\./);
});
