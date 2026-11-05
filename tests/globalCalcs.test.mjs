import test from "node:test";
import assert from "node:assert/strict";
import { discountResult, tipResult, taxResult, fuelUsed, discount, tip, salesTax, fuelCost } from "../src/lib/calcDefsGlobal.ts";
import { defaultsFor } from "../src/lib/calcDefs.ts";

const close = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) < e, `${a} vs ${b}`);

test("discount, including a second discount", () => {
  close(discountResult(100, 20, 0).final, 80);
  close(discountResult(100, 20, 10).effective, 28);
});
test("tip and split", () => {
  const r = tipResult(80, 15, 4);
  close(r.tip, 12);
  close(r.perPerson, 23);
});
test("tax add and remove", () => {
  close(taxResult(100, 20, "add").gross, 120);
  close(taxResult(120, 20, "remove").net, 100);
});
test("fuel use across units", () => {
  close(fuelUsed(300, "km", "l100", 7), 21);
  close(fuelUsed(100, "km", "kpl", 20), 5);
  close(fuelUsed(100, "mi", "mpgus", 30), (100 / 30) * 3.785411784);
});
test("defaults compute without error and bad input is caught", () => {
  for (const d of [discount, tip, salesTax, fuelCost]) assert.ok(!d.compute(defaultsFor(d)).error);
  assert.ok(discount.compute({ ...defaultsFor(discount), off: "150" }).error);
  assert.ok(tip.compute({ ...defaultsFor(tip), people: "0" }).error);
});
