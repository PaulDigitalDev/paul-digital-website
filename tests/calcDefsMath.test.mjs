import test from "node:test";
import assert from "node:assert/strict";
import { fraction, average, ratio, percentChange, sciNotation, gcfLcm, stdDev, simplify, fracOp, mixed, gcd, lcm } from "../src/lib/calcDefsMath.ts";
import { defaultsFor } from "../src/lib/calcDefs.ts";

const row = (out, label) => out.rows.find((r) => r.label.startsWith(label))?.value;

test("fractions", () => {
  assert.deepEqual(fracOp({ n: 1, d: 2 }, { n: 1, d: 3 }, "+"), { n: 5, d: 6 });
  assert.deepEqual(fracOp({ n: 3, d: 4 }, { n: 1, d: 4 }, "-"), { n: 1, d: 2 });
  assert.deepEqual(fracOp({ n: 2, d: 3 }, { n: 3, d: 4 }, "*"), { n: 1, d: 2 });
  assert.deepEqual(fracOp({ n: 1, d: 2 }, { n: 1, d: 4 }, "/"), { n: 2, d: 1 });
  assert.equal(mixed({ n: 7, d: 3 }), "2 1/3");
  assert.deepEqual(simplify({ n: 2, d: -4 }), { n: -1, d: 2 });
  assert.ok(fraction.compute({ ...defaultsFor(fraction), bn: "0", op: "/" }).error);
  assert.ok(fraction.compute({ ...defaultsFor(fraction), ad: "0" }).error);
  assert.equal(row(fraction.compute(defaultsFor(fraction)), "Result"), "5/6");
});
test("average, median, mode", () => {
  const out = average.compute({ items: "12, 15, 18, 15, 20" });
  assert.equal(row(out, "Average"), "16");
  assert.equal(row(out, "Median"), "15");
  assert.equal(row(out, "Mode"), "15");
  assert.equal(row(average.compute({ items: "1 2 3 4" }), "Median"), "2.5");
  assert.ok(average.compute({ items: "a, b" }).error);
});
test("ratio and percent change", () => {
  const out = ratio.compute(defaultsFor(ratio));
  assert.equal(out.rows[0].value, "12");
  assert.equal(row(out, "A : B"), "3 : 4");
  const pc = percentChange.compute(defaultsFor(percentChange));
  assert.equal(pc.rows[0].value, "25%");
  assert.equal(percentChange.compute({ from: "100", to: "75" }).rows[0].label, "Percentage decrease");
  assert.ok(percentChange.compute({ from: "0", to: "5" }).error);
});
test("scientific notation", () => {
  assert.equal(sciNotation.compute({ value: "123456" }).rows[0].value, "1.23456 × 10⁵");
  assert.equal(sciNotation.compute({ value: "0.00042" }).rows[0].value, "4.2 × 10⁻⁴");
  assert.equal(row(sciNotation.compute({ value: "123456" }), "Engineering"), "123.456 × 10³");
});
test("gcf and lcm", () => {
  assert.equal(gcd(12, 18), 6);
  assert.equal(lcm(4, 6), 12);
  const out = gcfLcm.compute({ items: "12, 18, 30" });
  assert.equal(row(out, "Greatest"), "6");
  assert.equal(row(out, "Least"), "180");
  assert.ok(gcfLcm.compute({ items: "12" }).error);
  assert.ok(gcfLcm.compute({ items: "1.5, 3" }).error);
});
test("standard deviation", () => {
  const pop = stdDev.compute({ items: "2, 4, 4, 4, 5, 5, 7, 9", kind: "population" });
  assert.equal(pop.rows[0].value, "2");
  const s = stdDev.compute({ items: "4, 8, 6, 5, 3, 7", kind: "sample" });
  assert.equal(s.rows[0].value, "1.870829");
  assert.ok(stdDev.compute({ items: "5", kind: "sample" }).error);
});
