import test from "node:test";
import assert from "node:assert/strict";
import { sdlt, ukTakeHome, usFederalTax, usFica, stampDuty, ukTakeHomePay, federalIncomeTax, paycheck, mortgageUs, mortgageUk } from "../src/lib/calcDefsTax.ts";
import { defaultsFor } from "../src/lib/calcDefs.ts";

const close = (a, b, e = 0.01) => assert.ok(Math.abs(a - b) < e, `${a} vs ${b}`);

test("Stamp Duty: standard, first-time buyer, additional home, non-resident", () => {
  close(sdlt(300000, "standard", false).total, 2500 + 0.05 * 50000 - 0 + 0, 0.01 + 0); // 2% of 125k = 2,500; 5% of 50k = 2,500
  close(sdlt(300000, "standard", false).total, 5000);
  close(sdlt(250000, "standard", false).total, 2500);
  close(sdlt(1000000, "standard", false).total, 2500 + 33750 + 7500);
  close(sdlt(2000000, "standard", false).total, 2500 + 33750 + 57500 + 60000);
  close(sdlt(300000, "first", false).total, 0);
  close(sdlt(450000, "first", false).total, 7500);
  close(sdlt(600000, "first", false).total, sdlt(600000, "standard", false).total);
  close(sdlt(300000, "additional", false).total, 5000 + 15000);
  close(sdlt(300000, "standard", true).total, 5000 + 6000);
});
test("UK take-home pay 2026/27", () => {
  const a = ukTakeHome(30000);
  close(a.tax, (30000 - 12570) * 0.2);
  close(a.ni, (30000 - 12570) * 0.08);
  const b = ukTakeHome(60000);
  close(b.tax, 37700 * 0.2 + (60000 - 12570 - 37700) * 0.4);
  close(b.ni, (50270 - 12570) * 0.08 + (60000 - 50270) * 0.02);
  const c = ukTakeHome(125140);
  close(c.pa, 0);
  close(c.tax, 37700 * 0.2 + (125140 - 37700) * 0.4);
  close(ukTakeHome(12000).tax, 0);
  close(ukTakeHome(110000).pa, 12570 - 5000);
});
test("US federal tax and FICA 2026", () => {
  close(usFederalTax(50000, "single").total, 1240 + 0.12 * (50000 - 12400));
  close(usFederalTax(100000, "single").total, 5800 + 0.22 * (100000 - 50400) - 0 + 0 - 0, 0.01);
  close(usFederalTax(100000, "single").total, 1240 + 4560 + 0.22 * (100000 - 50400));
  close(usFederalTax(100000, "mfj").total, 2480 + 0.12 * (100000 - 24800));
  assert.equal(usFederalTax(100000, "single").marginal, 22);
  const f = usFica(200000, "single");
  close(f.ss, 184500 * 0.062);
  close(f.medicare, 200000 * 0.0145);
  close(usFica(250000, "single").medicare, 250000 * 0.0145 + 50000 * 0.009);
});
test("calculators run on defaults and reject bad input", () => {
  for (const d of [stampDuty, ukTakeHomePay, federalIncomeTax, paycheck, mortgageUs, mortgageUk]) {
    const out = d.compute(defaultsFor(d));
    assert.ok(!out.error, d.id);
    assert.ok(out.rows.length >= 2);
  }
  assert.ok(mortgageUk.compute({ ...defaultsFor(mortgageUk), deposit: "400000" }).error);
  assert.ok(mortgageUs.compute({ ...defaultsFor(mortgageUs), down: "100" }).error);
  assert.ok(paycheck.compute({ ...defaultsFor(paycheck), state: "50" }).error);
  assert.ok(stampDuty.compute({ ...defaultsFor(stampDuty), price: "0" }).error);
});
test("US mortgage default payment is sensible", () => {
  const out = mortgageUs.compute({ ...defaultsFor(mortgageUs), tax: "0", ins: "0" });
  // $320,000 at 6.5% for 30 years is about $2,022.62
  assert.equal(out.rows[0].value, "$2,022.62");
  const uk = mortgageUk.compute(defaultsFor(mortgageUk));
  // £270,000 at 4.5% for 25 years is about £1,500.75
  assert.equal(uk.rows[0].value, "£1,500.75");
});
