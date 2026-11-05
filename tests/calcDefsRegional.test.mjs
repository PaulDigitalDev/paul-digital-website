import test from "node:test";
import assert from "node:assert/strict";
import { plotArea, pondVolume, plotAreaCalc, pondCalc, digitConvert, toScriptDigits, toEnglishDigits } from "../src/lib/calcDefsRegional.ts";
import { defaultsFor } from "../src/lib/calcDefs.ts";

const close = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) < e, `${a} vs ${b}`);

test("plot area in katha, decimal and bigha", () => {
  const a = plotArea(60, 40, "ft");
  close(a.sqft, 2400);
  close(a.katha, 2400 / 720);
  close(a.decimal, 2400 / 435.6);
  close(plotArea(24, 30, "hat").sqft, 36 * 45);
  close(plotArea(10, 10, "m").sqft, 1076.3910417, 1e-4);
  assert.ok(plotAreaCalc.compute({ ...defaultsFor(plotAreaCalc), length: "0" }).error);
});
test("pond volume with and without slope", () => {
  close(pondVolume(100, 60, 8, 0), 48000);
  // slope 1: bottom 84 x 44 at depth 8; prismatic check by numeric integration
  let sum = 0;
  const n = 100000;
  for (let i = 0; i < n; i++) { const z = (i + 0.5) / n * 8; sum += (100 - 2 * z) * (60 - 2 * z) * (8 / n); }
  close(pondVolume(100, 60, 8, 1), sum, 1e-3);
  const out = pondCalc.compute({ ...defaultsFor(pondCalc), rate: "5000" });
  assert.equal(out.rows[0].value, "48,000");
  assert.ok(out.rows.some((r) => r.label === "Estimated digging cost"));
  assert.ok(pondCalc.compute({ ...defaultsFor(pondCalc), slope: "6" }).error);
});
test("digit conversion both ways", () => {
  assert.equal(toScriptDigits("Year 2026", "bn"), "Year ২০২৬");
  assert.equal(toScriptDigits("123", "hi"), "१२३");
  assert.equal(toScriptDigits("45", "ar"), "٤٥");
  assert.equal(toEnglishDigits("১২৩ ४५ ٦٧"), "123 45 67");
  const out = digitConvert.compute({ text: "৫০০ taka", script: "hi" });
  assert.equal(out.rows[0].value, "५०० taka");
  assert.equal(out.rows[1].value, "500 taka");
  assert.ok(digitConvert.compute({ text: "  ", script: "bn" }).error);
});
