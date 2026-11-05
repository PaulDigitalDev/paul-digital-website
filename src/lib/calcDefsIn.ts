import { loanSchedule } from "./finance.ts";
import { Bad, guard, num, plain, positive } from "./calcDefs.ts";
import type { CalcDef } from "./calcDefs.ts";

/* Indian-style savings and loan calculators, and the lakh/crore/million converter. Amounts use Indian digit grouping. */

export const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;

export function fdMaturity(principal: number, annualPercent: number, years: number, compoundsPerYear: number): number {
  const n = compoundsPerYear;
  return principal * Math.pow(1 + annualPercent / 100 / n, n * years);
}

/** Recurring deposit: a deposit at the start of every month, interest compounded quarterly (the usual bank method). */
export function rdMaturity(monthly: number, annualPercent: number, months: number): number {
  const i = annualPercent / 100 / 4;
  let total = 0;
  for (let k = 1; k <= months; k++) total += monthly * Math.pow(1 + i, (months - k + 1) / 3);
  return total;
}

/** Yearly deposit at the start of each year, interest added once a year. */
export function ppfSchedule(deposit: number, annualPercent: number, years: number) {
  const r = annualPercent / 100;
  let balance = 0;
  const rows: { year: number; deposited: number; interest: number; balance: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const start = balance + deposit;
    const interest = start * r;
    balance = start + interest;
    rows.push({ year: y, deposited: deposit * y, interest, balance });
  }
  return rows;
}

const rateField = (def: string) => ({ id: "rate", label: "Interest rate (% a year)", kind: "number" as const, default: def, step: "any" });
const checkRate = (rate: number) => {
  if (rate < 0 || rate > 50) throw new Bad("Enter an interest rate from 0 to 50%.");
};

export const emi: CalcDef = {
  id: "emi",
  fields: [
    { id: "amount", label: "Loan amount (₹)", kind: "number", default: "1000000", step: "any" },
    rateField("9"),
    { id: "tenure", label: "Tenure", kind: "number", default: "5", step: "any" },
    { id: "unit", label: "Tenure in", kind: "select", default: "years", options: [{ value: "years", label: "Years" }, { value: "months", label: "Months" }] },
  ],
  compute: (v) =>
    guard(() => {
      const amount = positive(num(v, "amount", "Loan amount"), "Loan amount");
      const rate = num(v, "rate", "Interest rate");
      checkRate(rate);
      const tenure = positive(num(v, "tenure", "Tenure"), "Tenure");
      const years = v.unit === "months" ? tenure / 12 : tenure;
      if (years > 40) throw new Bad("Use a tenure of 40 years or less.");
      const s = loanSchedule(amount, rate, years, 12);
      return {
        rows: [
          { label: "Monthly EMI", value: inr(s.payment), big: true },
          { label: "Number of EMIs", value: String(s.n) },
          { label: "Total interest", value: inr(s.totalInterest) },
          { label: "Total payment", value: inr(s.totalPaid) },
        ],
        table: { caption: "Paid and remaining at the end of each year", head: ["Year", "Principal paid", "Interest paid", "Balance left"], rows: s.rows.map((r) => [String(r.year), inr(r.principalPaid), inr(r.interestPaid), inr(r.balance)]) },
        notes: ["Interest is worked out monthly on the reducing balance. Processing fees, insurance and taxes are not included, and a lender's own figure may differ slightly."],
      };
    }),
};

export const fd: CalcDef = {
  id: "fd",
  fields: [
    { id: "amount", label: "Deposit amount (₹)", kind: "number", default: "100000", step: "any" },
    rateField("7"),
    { id: "years", label: "Period (years)", kind: "number", default: "5", step: "any" },
    { id: "n", label: "Interest added", kind: "select", default: "4", options: [{ value: "12", label: "Monthly" }, { value: "4", label: "Quarterly" }, { value: "2", label: "Half-yearly" }, { value: "1", label: "Yearly" }] },
  ],
  compute: (v) =>
    guard(() => {
      const amount = positive(num(v, "amount", "Deposit amount"), "Deposit amount");
      const rate = num(v, "rate", "Interest rate");
      checkRate(rate);
      const years = positive(num(v, "years", "Period"), "Period");
      if (years > 50) throw new Bad("Use a period of 50 years or less.");
      const maturity = fdMaturity(amount, rate, years, Number(v.n));
      const effective = (Math.pow(maturity / amount, 1 / years) - 1) * 100;
      return {
        rows: [
          { label: "Maturity amount", value: inr(maturity), big: true },
          { label: "Interest earned", value: inr(maturity - amount) },
          { label: "Amount deposited", value: inr(amount) },
          { label: "Effective yearly return", value: pct(effective) },
        ],
        notes: ["Tax on interest (TDS and income tax) is not deducted here, and banks may round or use slightly different day counts."],
      };
    }),
};

export const rd: CalcDef = {
  id: "rd",
  fields: [
    { id: "monthly", label: "Monthly deposit (₹)", kind: "number", default: "5000", step: "any" },
    rateField("6.5"),
    { id: "months", label: "Period (months)", kind: "number", default: "60", step: "1" },
  ],
  compute: (v) =>
    guard(() => {
      const monthly = positive(num(v, "monthly", "Monthly deposit"), "Monthly deposit");
      const rate = num(v, "rate", "Interest rate");
      checkRate(rate);
      const months = Math.round(positive(num(v, "months", "Period"), "Period"));
      if (months > 600) throw new Bad("Use a period of 600 months or less.");
      const maturity = rdMaturity(monthly, rate, months);
      const deposited = monthly * months;
      return {
        rows: [
          { label: "Maturity amount", value: inr(maturity), big: true },
          { label: "Total deposited", value: inr(deposited) },
          { label: "Interest earned", value: inr(maturity - deposited) },
        ],
        notes: ["Interest is added every quarter, which is how most Indian banks work out a recurring deposit. Your bank's figure can differ by a few rupees."],
      };
    }),
};

export const ppf: CalcDef = {
  id: "ppf",
  fields: [
    { id: "deposit", label: "Yearly deposit (₹)", kind: "number", default: "150000", step: "any", hint: "The allowed range is ₹500 to ₹1,50,000 a year." },
    rateField("7.1"),
    { id: "years", label: "Period (years)", kind: "number", default: "15", step: "1" },
  ],
  compute: (v) =>
    guard(() => {
      const deposit = positive(num(v, "deposit", "Yearly deposit"), "Yearly deposit");
      if (deposit < 500 || deposit > 150000) throw new Bad("A PPF account takes ₹500 to ₹1,50,000 a year.");
      const rate = num(v, "rate", "Interest rate");
      checkRate(rate);
      const years = Math.round(positive(num(v, "years", "Period"), "Period"));
      if (years > 50) throw new Bad("Use a period of 50 years or less.");
      const rows = ppfSchedule(deposit, rate, years);
      const last = rows[rows.length - 1];
      return {
        rows: [
          { label: "Maturity value", value: inr(last.balance), big: true },
          { label: "Total deposited", value: inr(last.deposited) },
          { label: "Interest earned", value: inr(last.balance - last.deposited) },
        ],
        table: { caption: "Balance at the end of each year", head: ["Year", "Total deposited", "Interest in the year", "Balance"], rows: rows.map((r) => [String(r.year), inr(r.deposited), inr(r.interest), inr(r.balance)]) },
        notes: ["Assumes the full deposit is made at the start of each year and the rate stays the same. The government sets the PPF rate every quarter, so type the current rate. Deposits before the 5th of each month earn that month's interest."],
      };
    }),
};

/* ---------- Million, billion, lakh and crore ---------- */

export const UNITS: { value: string; label: string; size: number }[] = [
  { value: "thousand", label: "Thousand", size: 1e3 },
  { value: "lakh", label: "Lakh", size: 1e5 },
  { value: "million", label: "Million", size: 1e6 },
  { value: "crore", label: "Crore", size: 1e7 },
  { value: "billion", label: "Billion", size: 1e9 },
  { value: "arab", label: "Arab (100 crore)", size: 1e9 },
];

export const mtc: CalcDef = {
  id: "million-to-crore",
  fields: [
    { id: "value", label: "Number", kind: "number", default: "25", step: "any" },
    { id: "unit", label: "Unit", kind: "select", default: "million", options: UNITS.filter((u) => u.value !== "arab").map((u) => ({ value: u.value, label: u.label })) },
  ],
  compute: (v) =>
    guard(() => {
      const value = num(v, "value", "Number");
      if (value < 0) throw new Bad("Enter a number that is not negative.");
      const unit = UNITS.find((u) => u.value === v.unit) ?? UNITS[2];
      const total = value * unit.size;
      if (!Number.isFinite(total) || total > 1e15) throw new Bad("That number is too large for this converter.");
      const fmt = (size: number) => plain(total / size, 6);
      return {
        rows: [
          { label: "In crore", value: fmt(1e7), big: true },
          { label: "In lakh", value: fmt(1e5) },
          { label: "In million", value: fmt(1e6) },
          { label: "In billion", value: fmt(1e9) },
          { label: "In thousand", value: fmt(1e3) },
          { label: "Whole number (Indian grouping)", value: Math.round(total).toLocaleString("en-IN") },
          { label: "Whole number (international grouping)", value: Math.round(total).toLocaleString("en-US") },
        ],
        notes: ["1 crore = 10 million = 100 lakh. 1 lakh = 100,000. 1 billion = 100 crore."],
      };
    }),
};

export const inDefs: Record<string, CalcDef> = { emi, fd, rd, ppf, "million-to-crore": mtc };
