import test from "node:test";
import assert from "node:assert/strict";
import { solveFv, solvePv, solvePmt, solveN, solveRate, tvmResidual, growth, loanPayment, loanSchedule, roi, salaryFromPercent, salaryFromNew, monthlyRate } from "../src/lib/finance.ts";

const close = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test("future value of 1000 at 5% for 10 years is 1628.89", () => {
  close(solveFv(10, 0.05, -1000, 0, 0), 1628.89);
});

test("TVM solvers are consistent with each other", () => {
  const n = 120, r = 0.06 / 12, pv = -5000, pmt = -200;
  for (const t of [0, 1]) {
    const fv = solveFv(n, r, pv, pmt, t);
    close(tvmResidual(n, r, pv, pmt, fv, t), 0, 1e-6);
    close(solvePv(n, r, pmt, fv, t), pv, 1e-6);
    close(solvePmt(n, r, pv, fv, t), pmt, 1e-6);
    close(solveN(r, pv, pmt, fv, t), n, 1e-6);
    close(solveRate(n, pv, pmt, fv, t), r, 1e-8);
  }
});

test("zero-rate cases", () => {
  close(solveFv(10, 0, -1000, -100, 0), 2000);
  close(solvePmt(10, 0, -1000, 2000, 0), -100);
  close(solveN(0, -1000, -100, 2000, 0), 10);
});

test("rate solve for a lump sum", () => {
  close(solveRate(10, -1000, 0, 1628.894627, 0), 0.05, 1e-6);
});

test("unreachable targets give NaN", () => {
  assert.ok(Number.isNaN(solveN(0.05, -1000, 0, -500, 0)));
  assert.ok(Number.isNaN(solveRate(10, 1000, 0, 500, 0)));
});

test("monthly deposits compounding monthly", () => {
  const g = growth(0, 100, 6, 10, 12);
  close(g.final, 16387.93);
  close(g.deposits, 12000);
  assert.equal(g.rows.length, 10);
  assert.equal(g.rows[9].year, 10);
});

test("annual compounding on a lump sum", () => {
  close(growth(1000, 0, 5, 10, 1).final, 1628.89);
  close(monthlyRate(12, 12), 0.01, 1e-12);
});

test("loan payment and schedule", () => {
  close(loanPayment(200000, 0.06 / 12, 360), 1199.10);
  const s = loanSchedule(200000, 6, 30, 12);
  close(s.payment, 1199.10);
  close(s.totalPaid, 431676.38, 1);
  close(s.rows[s.rows.length - 1].balance, 0, 0.01);
  close(s.totalInterest, s.totalPaid - 200000, 0.01);
  assert.equal(s.rows.length, 30);
  close(loanPayment(1200, 0, 12), 100);
});

test("ROI and annualised ROI", () => {
  const r = roi(1000, 1500, 3);
  close(r.gain, 500);
  close(r.roiPercent, 50);
  close(r.annualizedPercent, 14.47, 0.01);
  assert.equal(roi(1000, 1500, null).annualizedPercent, null);
  close(roi(1000, 800, 2).roiPercent, -20);
});

test("salary increase both ways", () => {
  const a = salaryFromPercent(50000, 4);
  close(a.newSalary, 52000);
  close(a.increase, 2000);
  const b = salaryFromNew(50000, 55000);
  close(b.percent, 10);
});

import { calcDefs, defaultsFor } from "../src/lib/calcDefs.ts";

test("every calculator works with its default values", () => {
  for (const def of Object.values(calcDefs)) {
    const out = def.compute(defaultsFor(def));
    assert.equal(out.error, undefined, def.id);
    assert.ok(out.rows && out.rows.length > 0, def.id);
  }
});

test("calculators report bad input instead of throwing", () => {
  const loan = calcDefs.loan;
  assert.ok(loan.compute({ ...defaultsFor(loan), amount: "" }).error);
  assert.ok(loan.compute({ ...defaultsFor(loan), years: "0" }).error);
  assert.ok(calcDefs.tvm.compute({ ...defaultsFor(calcDefs.tvm), solve: "n", pv: "-1000", fv: "-500" }).error);
});

test("TVM default answer and a solve-for-rate round trip", () => {
  const d = defaultsFor(calcDefs.tvm);
  assert.equal(calcDefs.tvm.compute({ ...d, pv: "-1000", n: "10", iy: "5", pmt: "0", fv: "0", solve: "fv" }).rows[0].value, "1,628.89");
  const r = calcDefs.tvm.compute({ ...d, solve: "iy", pv: "-1000", fv: "1628.894627", n: "10" });
  assert.equal(r.rows[0].value, "5%");
});

test("salary default: 4% raise on 50,000", () => {
  const out = calcDefs["salary-increase"].compute(defaultsFor(calcDefs["salary-increase"]));
  assert.equal(out.rows[0].value, "52,000.00");
  assert.equal(out.rows[1].value, "2,000.00");
});
