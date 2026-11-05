import { loanSchedule } from "./finance.ts";
import { Bad, guard, num, plain, positive } from "./calcDefs.ts";
import type { CalcDef } from "./calcDefs.ts";

/* UK and US tax and mortgage calculators.
   UK figures: 2026/27 tax year for England, Wales and Northern Ireland; Stamp Duty Land Tax rates in force since 1 April 2025 (England and Northern Ireland).
   US figures: 2026 federal tax year (IRS Rev. Proc. 2025-32) and the 2026 Social Security wage base. Amounts are estimates. */

export const gbp = (n: number, digits = 2) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
export const usd = (n: number, digits = 2) => `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

interface Band {
  upTo: number;
  rate: number;
}

function slice(amount: number, bands: Band[]) {
  const rows: { from: number; to: number; amount: number; rate: number; tax: number }[] = [];
  let prev = 0;
  let total = 0;
  for (const b of bands) {
    const inBand = Math.max(0, Math.min(amount, b.upTo) - prev);
    if (inBand > 0) {
      const tax = (inBand * b.rate) / 100;
      rows.push({ from: prev, to: Math.min(amount, b.upTo), amount: inBand, rate: b.rate, tax });
      total += tax;
    }
    prev = b.upTo;
    if (amount <= b.upTo) break;
  }
  return { rows, total };
}

/* ---------- UK: Stamp Duty Land Tax (England and Northern Ireland, residential, from 1 April 2025) ---------- */

const SDLT_STANDARD: Band[] = [
  { upTo: 125000, rate: 0 },
  { upTo: 250000, rate: 2 },
  { upTo: 925000, rate: 5 },
  { upTo: 1500000, rate: 10 },
  { upTo: Infinity, rate: 12 },
];
const SDLT_FIRST: Band[] = [
  { upTo: 300000, rate: 0 },
  { upTo: 500000, rate: 5 },
];

export function sdlt(price: number, buyer: string, nonResident: boolean) {
  const useFirst = buyer === "first" && price <= 500000;
  const base = slice(price, useFirst ? SDLT_FIRST : SDLT_STANDARD);
  const surcharge = buyer === "additional" ? price * 0.05 : 0;
  const nonRes = nonResident ? price * 0.02 : 0;
  const total = base.total + surcharge + nonRes;
  return { bands: base.rows, base: base.total, surcharge, nonRes, total, effective: price > 0 ? (total / price) * 100 : 0, firstTimeApplied: useFirst };
}

export const stampDuty: CalcDef = {
  id: "stamp-duty",
  fields: [
    { id: "price", label: "Purchase price (£)", kind: "number", default: "400000", step: "any" },
    { id: "buyer", label: "Buyer", kind: "select", default: "standard", options: [{ value: "standard", label: "Home mover (main home)" }, { value: "first", label: "First-time buyer" }, { value: "additional", label: "Buying an additional home (second home or buy-to-let)" }] },
    { id: "nonres", label: "Non-UK resident?", kind: "select", default: "no", options: [{ value: "no", label: "No (UK resident)" }, { value: "yes", label: "Yes (adds 2%)" }] },
  ],
  compute: (v) =>
    guard(() => {
      const price = positive(num(v, "price", "Purchase price"), "Purchase price");
      if (price > 1e9) throw new Bad("Enter a price below £1,000,000,000.");
      const r = sdlt(price, v.buyer, v.nonres === "yes");
      const note = v.buyer === "first" && !r.firstTimeApplied ? ["First-time buyer relief does not apply above £500,000, so the standard rates are used."] : [];
      return {
        rows: [
          { label: "Stamp Duty to pay", value: gbp(r.total, 0), big: true },
          { label: "Effective rate", value: `${plain(r.effective, 2)}%` },
          ...(r.surcharge ? [{ label: "Includes 5% additional-home surcharge", value: gbp(r.surcharge, 0) }] : []),
          ...(r.nonRes ? [{ label: "Includes 2% non-resident surcharge", value: gbp(r.nonRes, 0) }] : []),
        ],
        table: { caption: "Stamp Duty by band", head: ["Part of the price", "Amount in band", "Rate", "Tax"], rows: r.bands.map((b) => [`${gbp(b.from, 0)} to ${gbp(b.to, 0)}`, gbp(b.amount, 0), `${b.rate}%`, gbp(b.tax, 0)]) },
        notes: [...note, "For England and Northern Ireland only. Scotland uses LBTT and Wales uses LTT. Rates are those in force from 1 April 2025. Confirm the amount with a solicitor or the HMRC calculator before you buy."],
      };
    }),
};

/* ---------- UK: income tax and National Insurance, 2026/27, England, Wales and Northern Ireland ---------- */

const UK_PA = 12570;
const UK_BANDS: Band[] = [
  { upTo: 37700, rate: 20 },
  { upTo: 125140, rate: 40 },
  { upTo: Infinity, rate: 45 },
];

export function ukTakeHome(annual: number) {
  const pa = annual <= 100000 ? UK_PA : Math.max(0, UK_PA - (annual - 100000) / 2);
  const taxable = Math.max(0, annual - pa);
  const tax = slice(taxable, UK_BANDS).total;
  const ni = Math.max(0, Math.min(annual, 50270) - 12570) * 0.08 + Math.max(0, annual - 50270) * 0.02;
  const net = annual - tax - ni;
  return { annual, pa, taxable, tax, ni, net };
}

const PERIODS: Record<string, number> = { year: 1, month: 12, week: 52 };

export const ukTakeHomePay: CalcDef = {
  id: "uk-take-home",
  fields: [
    { id: "gross", label: "Gross salary (£, before tax)", kind: "number", default: "35000", step: "any" },
    { id: "per", label: "Salary is per", kind: "select", default: "year", options: [{ value: "year", label: "Year" }, { value: "month", label: "Month" }, { value: "week", label: "Week" }] },
  ],
  compute: (v) =>
    guard(() => {
      const gross = positive(num(v, "gross", "Gross salary"), "Gross salary");
      const annual = gross * (PERIODS[v.per] ?? 1);
      if (annual > 1e8) throw new Bad("Enter a salary below £100,000,000 a year.");
      const r = ukTakeHome(annual);
      return {
        rows: [
          { label: "Take-home pay per year", value: gbp(r.net, 0), big: true },
          { label: "Per month", value: gbp(r.net / 12) },
          { label: "Per week", value: gbp(r.net / 52) },
          { label: "Income Tax per year", value: gbp(r.tax, 0) },
          { label: "National Insurance per year", value: gbp(r.ni, 0) },
          { label: "Total deducted", value: `${plain(((r.tax + r.ni) / annual) * 100, 1)}%` },
          { label: "Personal Allowance used", value: gbp(r.pa, 0) },
        ],
        notes: ["Tax year 2026/27 for England, Wales and Northern Ireland, standard tax code (1257L), employee National Insurance. Scottish tax bands differ. Pension, student loan, benefits and other deductions are not included."],
      };
    }),
};

/* ---------- US: federal income tax and paycheck, 2026 ---------- */

export const US_STATUS = [
  { value: "single", label: "Single" },
  { value: "mfj", label: "Married filing jointly" },
  { value: "hoh", label: "Head of household" },
  { value: "mfs", label: "Married filing separately" },
];

const SINGLE_BANDS: Band[] = [
  { upTo: 12400, rate: 10 }, { upTo: 50400, rate: 12 }, { upTo: 105700, rate: 22 }, { upTo: 201775, rate: 24 }, { upTo: 256225, rate: 32 }, { upTo: 640600, rate: 35 }, { upTo: Infinity, rate: 37 },
];
const US_BANDS: Record<string, Band[]> = {
  single: SINGLE_BANDS,
  mfj: [{ upTo: 24800, rate: 10 }, { upTo: 100800, rate: 12 }, { upTo: 211400, rate: 22 }, { upTo: 403550, rate: 24 }, { upTo: 512450, rate: 32 }, { upTo: 768700, rate: 35 }, { upTo: Infinity, rate: 37 }],
  hoh: [{ upTo: 17700, rate: 10 }, { upTo: 67450, rate: 12 }, { upTo: 105700, rate: 22 }, { upTo: 201750, rate: 24 }, { upTo: 256200, rate: 32 }, { upTo: 640600, rate: 35 }, { upTo: Infinity, rate: 37 }],
  mfs: [...SINGLE_BANDS.slice(0, 5), { upTo: 384350, rate: 35 }, { upTo: Infinity, rate: 37 }],
};
const US_STD: Record<string, number> = { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 };
export const SS_WAGE_BASE = 184500;

export function usFederalTax(taxable: number, status: string) {
  const bands = US_BANDS[status] ?? SINGLE_BANDS;
  const s = slice(taxable, bands);
  const marginal = taxable <= 0 ? 10 : (bands.find((b) => taxable <= b.upTo) ?? bands[bands.length - 1]).rate;
  return { ...s, marginal };
}

export function usFica(wages: number, status: string) {
  const ss = Math.min(wages, SS_WAGE_BASE) * 0.062;
  const threshold = status === "mfj" ? 250000 : status === "mfs" ? 125000 : 200000;
  const medicare = wages * 0.0145 + Math.max(0, wages - threshold) * 0.009;
  return { ss, medicare };
}

const statusField = { id: "status", label: "Filing status", kind: "select" as const, default: "single", options: US_STATUS };

export const federalIncomeTax: CalcDef = {
  id: "federal-income-tax",
  fields: [
    { id: "income", label: "Annual income before tax ($)", kind: "number", default: "75000", step: "any" },
    statusField,
    { id: "extra", label: "Pre-tax deductions, such as 401(k) or HSA ($ a year)", kind: "number", default: "0", step: "any" },
  ],
  compute: (v) =>
    guard(() => {
      const income = positive(num(v, "income", "Annual income"), "Annual income");
      const extra = num(v, "extra", "Pre-tax deductions");
      if (extra < 0) throw new Bad("Deductions cannot be negative.");
      if (income > 1e9) throw new Bad("Enter an income below $1,000,000,000.");
      const std = US_STD[v.status] ?? US_STD.single;
      const taxable = Math.max(0, income - extra - std);
      const r = usFederalTax(taxable, v.status);
      return {
        rows: [
          { label: "Federal income tax", value: usd(r.total, 0), big: true },
          { label: "Taxable income", value: usd(taxable, 0) },
          { label: "Standard deduction used", value: usd(std, 0) },
          { label: "Marginal tax rate", value: `${r.marginal}%` },
          { label: "Effective tax rate", value: `${plain((r.total / income) * 100, 2)}%` },
        ],
        table: { caption: "Tax in each bracket", head: ["Taxable income", "In bracket", "Rate", "Tax"], rows: r.rows.map((b) => [`${usd(b.from, 0)} to ${usd(b.to, 0)}`, usd(b.amount, 0), `${b.rate}%`, usd(b.tax, 0)]) },
        notes: ["2026 federal rates and the standard deduction. This ignores credits, itemized deductions, other income types, state tax and self-employment tax."],
      };
    }),
};

const FREQ: Record<string, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, annual: 1 };

export const paycheck: CalcDef = {
  id: "paycheck",
  fields: [
    { id: "gross", label: "Gross pay per paycheck ($)", kind: "number", default: "2500", step: "any" },
    { id: "freq", label: "Paid", kind: "select", default: "biweekly", options: [{ value: "weekly", label: "Weekly" }, { value: "biweekly", label: "Every two weeks" }, { value: "semimonthly", label: "Twice a month" }, { value: "monthly", label: "Monthly" }, { value: "annual", label: "Yearly (enter annual salary)" }] },
    statusField,
    { id: "k401", label: "Pre-tax retirement contribution (% of pay)", kind: "number", default: "0", step: "any" },
    { id: "state", label: "State income tax rate (%, your estimate)", kind: "number", default: "0", step: "any", hint: "Enter 0 for states with no income tax. State rules vary, so this is a flat estimate." },
  ],
  compute: (v) =>
    guard(() => {
      const gross = positive(num(v, "gross", "Gross pay"), "Gross pay");
      const k = num(v, "k401", "Retirement contribution");
      const st = num(v, "state", "State tax rate");
      if (k < 0 || k > 100) throw new Bad("Enter a retirement contribution from 0 to 100%.");
      if (st < 0 || st > 20) throw new Bad("Enter a state tax rate from 0 to 20%.");
      const n = FREQ[v.freq] ?? 26;
      const annual = gross * n;
      if (annual > 1e9) throw new Bad("That pay is too large.");
      const pre = (annual * k) / 100;
      const std = US_STD[v.status] ?? US_STD.single;
      const taxable = Math.max(0, annual - pre - std);
      const fed = usFederalTax(taxable, v.status).total;
      const fica = usFica(annual, v.status);
      const state = ((annual - pre) * st) / 100;
      const net = annual - pre - fed - fica.ss - fica.medicare - state;
      const per = (x: number) => usd(x / n);
      return {
        rows: [
          { label: "Take-home pay per paycheck", value: per(net), big: true },
          { label: "Federal income tax", value: per(fed) },
          { label: "Social Security (6.2%)", value: per(fica.ss) },
          { label: "Medicare", value: per(fica.medicare) },
          { label: "State income tax (estimate)", value: per(state) },
          { label: "Retirement contribution", value: per(pre) },
          { label: "Take-home pay per year", value: usd(net, 0) },
          { label: "Total tax rate", value: `${plain(((fed + fica.ss + fica.medicare + state) / annual) * 100, 1)}%` },
        ],
        notes: ["2026 federal tax with the standard deduction, plus Social Security and Medicare. Credits, local taxes, health insurance and other deductions are not included, so your real paycheck will differ."],
      };
    }),
};

/* ---------- Mortgages ---------- */

export const mortgageUs: CalcDef = {
  id: "mortgage-us",
  fields: [
    { id: "price", label: "Home price ($)", kind: "number", default: "400000", step: "any" },
    { id: "down", label: "Down payment (%)", kind: "number", default: "20", step: "any" },
    { id: "rate", label: "Interest rate (% a year)", kind: "number", default: "6.5", step: "any" },
    { id: "years", label: "Loan term (years)", kind: "number", default: "30", step: "any" },
    { id: "tax", label: "Property tax (% of home price a year)", kind: "number", default: "1.1", step: "any" },
    { id: "ins", label: "Home insurance ($ a year)", kind: "number", default: "1500", step: "any" },
    { id: "pmi", label: "Mortgage insurance (% of loan a year, if down payment is under 20%)", kind: "number", default: "0.5", step: "any" },
    { id: "hoa", label: "HOA fees ($ a month)", kind: "number", default: "0", step: "any" },
  ],
  compute: (v) =>
    guard(() => {
      const price = positive(num(v, "price", "Home price"), "Home price");
      const down = num(v, "down", "Down payment");
      const rate = num(v, "rate", "Interest rate");
      const years = positive(num(v, "years", "Loan term"), "Loan term");
      const tax = num(v, "tax", "Property tax");
      const ins = num(v, "ins", "Home insurance");
      const pmi = num(v, "pmi", "Mortgage insurance");
      const hoa = num(v, "hoa", "HOA fees");
      if (down < 0 || down >= 100) throw new Bad("Enter a down payment from 0 to under 100%.");
      if (rate < 0 || rate > 50) throw new Bad("Enter an interest rate from 0 to 50%.");
      if (years > 50) throw new Bad("Use a loan term of 50 years or less.");
      if (tax < 0 || ins < 0 || pmi < 0 || hoa < 0) throw new Bad("Costs cannot be negative.");
      const loan = price * (1 - down / 100);
      const s = loanSchedule(loan, rate, years, 12);
      const taxM = (price * tax) / 100 / 12;
      const insM = ins / 12;
      const pmiM = down < 20 ? (loan * pmi) / 100 / 12 : 0;
      const total = s.payment + taxM + insM + pmiM + hoa;
      return {
        rows: [
          { label: "Monthly payment", value: usd(total), big: true },
          { label: "Principal and interest", value: usd(s.payment) },
          { label: "Property tax", value: usd(taxM) },
          { label: "Home insurance", value: usd(insM) },
          ...(pmiM ? [{ label: "Mortgage insurance (estimate)", value: usd(pmiM) }] : []),
          ...(hoa ? [{ label: "HOA fees", value: usd(hoa) }] : []),
          { label: "Loan amount", value: usd(loan, 0) },
          { label: "Total interest over the loan", value: usd(s.totalInterest, 0) },
        ],
        table: { caption: "Principal and interest by year", head: ["Year", "Principal paid", "Interest paid", "Balance left"], rows: s.rows.map((r) => [String(r.year), usd(r.principalPaid, 0), usd(r.interestPaid, 0), usd(r.balance, 0)]) },
        notes: ["Interest is worked out monthly on the reducing balance. Tax, insurance and fees vary by home and lender, so treat this as an estimate and ask your lender for a Loan Estimate."],
      };
    }),
};

export const mortgageUk: CalcDef = {
  id: "mortgage-uk",
  fields: [
    { id: "price", label: "Property price (£)", kind: "number", default: "300000", step: "any" },
    { id: "deposit", label: "Deposit (£)", kind: "number", default: "30000", step: "any" },
    { id: "rate", label: "Interest rate (% a year)", kind: "number", default: "4.5", step: "any" },
    { id: "years", label: "Mortgage term (years)", kind: "number", default: "25", step: "any" },
    { id: "type", label: "Mortgage type", kind: "select", default: "repayment", options: [{ value: "repayment", label: "Repayment" }, { value: "io", label: "Interest-only" }] },
  ],
  compute: (v) =>
    guard(() => {
      const price = positive(num(v, "price", "Property price"), "Property price");
      const deposit = num(v, "deposit", "Deposit");
      const rate = num(v, "rate", "Interest rate");
      const years = positive(num(v, "years", "Mortgage term"), "Mortgage term");
      if (deposit < 0 || deposit >= price) throw new Bad("The deposit must be less than the property price.");
      if (rate < 0 || rate > 50) throw new Bad("Enter an interest rate from 0 to 50%.");
      if (years > 50) throw new Bad("Use a term of 50 years or less.");
      const loan = price - deposit;
      const ltv = (loan / price) * 100;
      if (v.type === "io") {
        const monthly = (loan * rate) / 100 / 12;
        return {
          rows: [
            { label: "Monthly interest payment", value: gbp(monthly), big: true },
            { label: "Mortgage amount", value: gbp(loan, 0) },
            { label: "Loan to value (LTV)", value: `${plain(ltv, 1)}%` },
            { label: "Total interest over the term", value: gbp(monthly * 12 * years, 0) },
            { label: "Still owed at the end", value: gbp(loan, 0) },
          ],
          notes: ["With an interest-only mortgage you repay none of the loan during the term, so you need a plan to repay it at the end. Fees and the rate after any fixed period are not included."],
        };
      }
      const s = loanSchedule(loan, rate, years, 12);
      return {
        rows: [
          { label: "Monthly repayment", value: gbp(s.payment), big: true },
          { label: "Mortgage amount", value: gbp(loan, 0) },
          { label: "Loan to value (LTV)", value: `${plain(ltv, 1)}%` },
          { label: "Total interest over the term", value: gbp(s.totalInterest, 0) },
          { label: "Total repaid", value: gbp(s.totalPaid, 0) },
        ],
        table: { caption: "Paid and remaining at the end of each year", head: ["Year", "Capital repaid", "Interest paid", "Balance left"], rows: s.rows.map((r) => [String(r.year), gbp(r.principalPaid, 0), gbp(r.interestPaid, 0), gbp(r.balance, 0)]) },
        notes: ["Based on one rate for the whole term. Most UK mortgages have a fixed period and then change rate, and fees are not included, so a lender's figure will differ."],
      };
    }),
};

export const taxDefs: Record<string, CalcDef> = { "stamp-duty": stampDuty, "uk-take-home": ukTakeHomePay, "federal-income-tax": federalIncomeTax, paycheck, "mortgage-us": mortgageUs, "mortgage-uk": mortgageUk };
