import { growth, loanSchedule, roi, salaryFromNew, salaryFromPercent, solveFv, solveN, solvePmt, solvePv, solveRate } from "./finance.ts";

/* Definitions of the calculators: the fields to show and a pure function that turns the typed values into results. */

export type Values = Record<string, string>;

export interface Field {
  id: string;
  label: string;
  kind: "number" | "select";
  default: string;
  options?: { value: string; label: string }[];
  step?: string;
  hint?: string;
  /** Hide the field for some choices (for example the value being solved for). */
  show?: (v: Values) => boolean;
}

export interface CalcOutput {
  error?: string;
  rows?: { label: string; value: string; big?: boolean }[];
  table?: { caption: string; head: string[]; rows: string[][] };
  notes?: string[];
}

export interface CalcDef {
  id: string;
  fields: Field[];
  compute: (v: Values) => CalcOutput;
}

export const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (n: number, digits = 2) => `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits })}%`;
const plain = (n: number, digits = 4) => n.toLocaleString("en-US", { maximumFractionDigits: digits });

class Bad extends Error {}
const num = (v: Values, id: string, label: string): number => {
  const raw = (v[id] ?? "").trim();
  const n = Number(raw);
  if (raw === "" || !Number.isFinite(n)) throw new Bad(`Enter a number for “${label}”.`);
  return n;
};
const positive = (n: number, label: string) => {
  if (!(n > 0)) throw new Bad(`“${label}” must be greater than zero.`);
  return n;
};
const guard = (fn: () => CalcOutput): CalcOutput => {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Bad) return { error: error.message };
    throw error;
  }
};

const COMPOUNDING = [
  { value: "1", label: "Annually" },
  { value: "2", label: "Semi-annually" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
  { value: "365", label: "Daily" },
  { value: "0", label: "Continuously" },
];

/* ---------- TVM ---------- */

const TVM_LABEL: Record<string, string> = { n: "Number of periods (N)", iy: "Annual interest rate (%)", pv: "Present value (PV)", pmt: "Payment per period (PMT)", fv: "Future value (FV)" };

export const tvm: CalcDef = {
  id: "tvm",
  fields: [
    { id: "solve", label: "Solve for", kind: "select", default: "fv", options: Object.entries(TVM_LABEL).map(([value, label]) => ({ value, label })) },
    { id: "n", label: TVM_LABEL.n, kind: "number", default: "10", step: "any", show: (v) => v.solve !== "n" },
    { id: "iy", label: TVM_LABEL.iy, kind: "number", default: "5", step: "any", show: (v) => v.solve !== "iy" },
    { id: "pv", label: TVM_LABEL.pv, kind: "number", default: "-1000", step: "any", hint: "Money you put in or pay out is negative; money you receive is positive.", show: (v) => v.solve !== "pv" },
    { id: "pmt", label: TVM_LABEL.pmt, kind: "number", default: "0", step: "any", show: (v) => v.solve !== "pmt" },
    { id: "fv", label: TVM_LABEL.fv, kind: "number", default: "0", step: "any", show: (v) => v.solve !== "fv" },
    { id: "py", label: "Periods per year", kind: "number", default: "1", step: "1", hint: "Use 12 if N counts months and payments are monthly." },
    { id: "timing", label: "Payments are made", kind: "select", default: "0", options: [{ value: "0", label: "At the end of each period" }, { value: "1", label: "At the start of each period" }] },
  ],
  compute: (v) =>
    guard(() => {
      const solve = v.solve;
      const py = positive(num(v, "py", "Periods per year"), "Periods per year");
      const t = v.timing === "1" ? 1 : 0;
      const get = (id: string) => num(v, id, TVM_LABEL[id]);
      const n = solve === "n" ? 0 : get("n");
      const iy = solve === "iy" ? 0 : get("iy");
      const pv = solve === "pv" ? 0 : get("pv");
      const pmt = solve === "pmt" ? 0 : get("pmt");
      const fv = solve === "fv" ? 0 : get("fv");
      const r = iy / 100 / py;
      if (solve !== "n" && !(n > 0)) throw new Bad("“Number of periods (N)” must be greater than zero.");
      if (solve !== "iy" && r <= -1) throw new Bad("The interest rate is too low (it must be above −100% per period).");
      let value: number;
      let label = TVM_LABEL[solve];
      let shown: string;
      if (solve === "fv") {
        value = solveFv(n, r, pv, pmt, t);
        shown = money(value);
      } else if (solve === "pv") {
        value = solvePv(n, r, pmt, fv, t);
        shown = money(value);
      } else if (solve === "pmt") {
        value = solvePmt(n, r, pv, fv, t);
        if (!Number.isFinite(value)) throw new Bad("These values do not give a single payment amount. Check the interest rate and N.");
        shown = money(value);
      } else if (solve === "n") {
        value = solveN(r, pv, pmt, fv, t);
        if (!Number.isFinite(value)) return { error: "No number of periods reaches this target with these values. Check the signs: money paid in is negative and money received is positive." };
        shown = plain(value, 2);
      } else {
        value = solveRate(n, pv, pmt, fv, t) * py * 100;
        if (!Number.isFinite(value)) return { error: "No interest rate fits these values. Check the signs: money paid in is negative and money received is positive." };
        shown = pct(value, 4);
        label = "Annual interest rate";
      }
      const rows = [{ label, value: shown, big: true }];
      if (solve === "n" && py !== 1) rows.push({ label: "That many years", value: plain(value / py, 2) });
      const notes = [`Using ${plain(r * 100, 6)}% per period, ${t ? "payments at the start" : "payments at the end"} of each period.`];
      return { rows, notes };
    }),
};

/* ---------- Future value ---------- */

export const futureValue: CalcDef = {
  id: "future-value",
  fields: [
    { id: "pv", label: "Starting amount", kind: "number", default: "10000", step: "any" },
    { id: "monthly", label: "Monthly deposit", kind: "number", default: "200", step: "any", hint: "Added at the end of every month. Use 0 for none." },
    { id: "rate", label: "Annual interest rate (%)", kind: "number", default: "6", step: "any" },
    { id: "years", label: "Years", kind: "number", default: "10", step: "any" },
    { id: "comp", label: "Compounding", kind: "select", default: "12", options: COMPOUNDING },
  ],
  compute: (v) =>
    guard(() => {
      const pv = num(v, "pv", "Starting amount");
      const monthly = num(v, "monthly", "Monthly deposit");
      const rate = num(v, "rate", "Annual interest rate (%)");
      const years = positive(num(v, "years", "Years"), "Years");
      if (years > 100) throw new Bad("Use 100 years or fewer.");
      if (pv < 0 || monthly < 0) throw new Bad("Starting amount and monthly deposit cannot be negative here.");
      if (rate <= -100) throw new Bad("The interest rate must be above −100%.");
      const g = growth(pv, monthly, rate, years, Number(v.comp));
      return {
        rows: [
          { label: "Future value", value: money(g.final), big: true },
          { label: "Total you put in", value: money(g.deposits) },
          { label: "Interest earned", value: money(g.interest) },
        ],
        table: { caption: "Balance at the end of each year", head: ["Year", "Total put in", "Interest", "Balance"], rows: g.rows.map((r) => [String(r.year), money(r.deposits), money(r.interest), money(r.balance)]) },
      };
    }),
};

/* ---------- Compound interest ---------- */

export const compoundInterest: CalcDef = {
  id: "compound-interest",
  fields: [
    { id: "pv", label: "Initial investment", kind: "number", default: "5000", step: "any" },
    { id: "monthly", label: "Monthly contribution", kind: "number", default: "100", step: "any", hint: "Added at the end of every month. Use 0 for none." },
    { id: "rate", label: "Annual interest rate (%)", kind: "number", default: "7", step: "any" },
    { id: "years", label: "Years to grow", kind: "number", default: "20", step: "any" },
    { id: "comp", label: "Compounded", kind: "select", default: "12", options: COMPOUNDING },
  ],
  compute: (v) =>
    guard(() => {
      const pv = num(v, "pv", "Initial investment");
      const monthly = num(v, "monthly", "Monthly contribution");
      const rate = num(v, "rate", "Annual interest rate (%)");
      const years = positive(num(v, "years", "Years to grow"), "Years to grow");
      if (years > 100) throw new Bad("Use 100 years or fewer.");
      if (pv < 0 || monthly < 0) throw new Bad("Amounts cannot be negative here.");
      if (rate <= -100) throw new Bad("The interest rate must be above −100%.");
      const g = growth(pv, monthly, rate, years, Number(v.comp));
      const share = g.final > 0 ? (g.interest / g.final) * 100 : 0;
      return {
        rows: [
          { label: "Final balance", value: money(g.final), big: true },
          { label: "Total contributions", value: money(g.deposits) },
          { label: "Total interest", value: money(g.interest) },
          { label: "Share of the balance that is interest", value: pct(share, 1) },
        ],
        table: { caption: "Growth year by year", head: ["Year", "Contributions", "Interest", "Balance"], rows: g.rows.map((r) => [String(r.year), money(r.deposits), money(r.interest), money(r.balance)]) },
        notes: ["Rates are not guaranteed. Real returns change from year to year, and fees and tax are not included."],
      };
    }),
};

/* ---------- Salary increase ---------- */

export const salaryIncrease: CalcDef = {
  id: "salary-increase",
  fields: [
    { id: "current", label: "Current pay (per year)", kind: "number", default: "50000", step: "any" },
    { id: "by", label: "I know the", kind: "select", default: "percent", options: [{ value: "percent", label: "Raise percentage" }, { value: "new", label: "New pay amount" }] },
    { id: "percent", label: "Raise (%)", kind: "number", default: "4", step: "any", show: (v) => v.by === "percent" },
    { id: "new", label: "New pay (per year)", kind: "number", default: "52000", step: "any", show: (v) => v.by === "new" },
    { id: "hours", label: "Hours worked per week", kind: "number", default: "40", step: "any", hint: "Used only for the hourly figures." },
  ],
  compute: (v) =>
    guard(() => {
      const current = positive(num(v, "current", "Current pay (per year)"), "Current pay (per year)");
      const hours = positive(num(v, "hours", "Hours worked per week"), "Hours worked per week");
      const result = v.by === "new" ? salaryFromNew(current, num(v, "new", "New pay (per year)")) : salaryFromPercent(current, num(v, "percent", "Raise (%)"));
      const perHour = (annual: number) => annual / (hours * 52);
      return {
        rows: [
          { label: v.by === "new" ? "Raise percentage" : "New pay (per year)", value: v.by === "new" ? pct(result.percent, 2) : money(result.newSalary), big: true },
          { label: "Increase per year", value: money(result.increase) },
          { label: "Increase per month", value: money(result.increase / 12) },
          { label: "Increase per week", value: money(result.increase / 52) },
          { label: "Hourly pay before", value: money(perHour(current)) },
          { label: "Hourly pay after", value: money(perHour(result.newSalary)) },
        ],
        notes: ["These figures are before tax and other deductions."],
      };
    }),
};

/* ---------- Loan ---------- */

export const loan: CalcDef = {
  id: "loan",
  fields: [
    { id: "amount", label: "Loan amount", kind: "number", default: "200000", step: "any" },
    { id: "rate", label: "Annual interest rate (%)", kind: "number", default: "6", step: "any" },
    { id: "years", label: "Loan term (years)", kind: "number", default: "30", step: "any" },
    { id: "ppy", label: "Payments", kind: "select", default: "12", options: [{ value: "12", label: "Monthly" }, { value: "26", label: "Every 2 weeks" }, { value: "52", label: "Weekly" }, { value: "4", label: "Quarterly" }, { value: "1", label: "Yearly" }] },
  ],
  compute: (v) =>
    guard(() => {
      const amount = positive(num(v, "amount", "Loan amount"), "Loan amount");
      const rate = num(v, "rate", "Annual interest rate (%)");
      const years = positive(num(v, "years", "Loan term (years)"), "Loan term (years)");
      const ppy = Number(v.ppy);
      if (rate < 0 || rate > 100) throw new Bad("Enter an interest rate from 0 to 100%.");
      if (years > 60) throw new Bad("Use a term of 60 years or fewer.");
      const s = loanSchedule(amount, rate, years, ppy);
      const unit = ppy === 12 ? "Monthly" : ppy === 26 ? "Every 2 weeks" : ppy === 52 ? "Weekly" : ppy === 4 ? "Quarterly" : "Yearly";
      return {
        rows: [
          { label: `${unit} payment`, value: money(s.payment), big: true },
          { label: "Number of payments", value: String(s.n) },
          { label: "Total paid", value: money(s.totalPaid) },
          { label: "Total interest", value: money(s.totalInterest) },
        ],
        table: { caption: "Paid and remaining at the end of each year", head: ["Year", "Principal paid", "Interest paid", "Balance left"], rows: s.rows.map((r) => [String(r.year), money(r.principalPaid), money(r.interestPaid), money(r.balance)]) },
        notes: ["Interest is worked out on the remaining balance each period. Fees, insurance and taxes are not included, and a lender's own figure may differ slightly."],
      };
    }),
};

/* ---------- ROI ---------- */

export const roiCalc: CalcDef = {
  id: "roi",
  fields: [
    { id: "invested", label: "Amount invested", kind: "number", default: "10000", step: "any" },
    { id: "returned", label: "Final value", kind: "number", default: "15000", step: "any", hint: "What the investment is worth, or what you received, at the end." },
    { id: "years", label: "Years held (optional)", kind: "number", default: "3", step: "any", hint: "Leave empty to skip the yearly figure." },
  ],
  compute: (v) =>
    guard(() => {
      const invested = positive(num(v, "invested", "Amount invested"), "Amount invested");
      const returned = num(v, "returned", "Final value");
      if (returned < 0) throw new Bad("Final value cannot be negative.");
      const yearsRaw = (v.years ?? "").trim();
      const years = yearsRaw === "" ? null : num(v, "years", "Years held");
      if (years !== null && years <= 0) throw new Bad("Years held must be greater than zero, or leave it empty.");
      const r = roi(invested, returned, years);
      const rows = [
        { label: "Return on investment (ROI)", value: pct(r.roiPercent, 2), big: true },
        { label: r.gain >= 0 ? "Gain" : "Loss", value: money(Math.abs(r.gain)) },
      ];
      if (r.annualizedPercent !== null) rows.push({ label: "Average yearly return (annualised)", value: pct(r.annualizedPercent, 2) });
      return { rows, notes: ["ROI ignores fees, tax and what else the money could have earned. Past results do not predict future ones."] };
    }),
};

export const calcDefs: Record<string, CalcDef> = {
  tvm,
  "future-value": futureValue,
  "compound-interest": compoundInterest,
  "salary-increase": salaryIncrease,
  loan,
  roi: roiCalc,
};

export const defaultsFor = (def: CalcDef): Values => Object.fromEntries(def.fields.map((f) => [f.id, f.default]));
