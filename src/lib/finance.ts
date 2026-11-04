/* Pure finance maths for the calculators. No DOM, no rounding: results are rounded only when shown. */

export type Timing = 0 | 1; // 0 = payments at the end of each period, 1 = at the start

const annuityFactor = (r: number, n: number) => (r === 0 ? n : (Math.pow(1 + r, n) - 1) / r);

/** Cash-flow residual: PV(1+r)^n + PMT(1+rT)((1+r)^n-1)/r + FV. It is zero for a consistent set of values. */
export function tvmResidual(n: number, r: number, pv: number, pmt: number, fv: number, t: Timing): number {
  return pv * Math.pow(1 + r, n) + pmt * (1 + r * t) * annuityFactor(r, n) + fv;
}

export function solveFv(n: number, r: number, pv: number, pmt: number, t: Timing): number {
  return -(pv * Math.pow(1 + r, n) + pmt * (1 + r * t) * annuityFactor(r, n));
}

export function solvePv(n: number, r: number, pmt: number, fv: number, t: Timing): number {
  return -(fv + pmt * (1 + r * t) * annuityFactor(r, n)) / Math.pow(1 + r, n);
}

export function solvePmt(n: number, r: number, pv: number, fv: number, t: Timing): number {
  const f = (1 + r * t) * annuityFactor(r, n);
  if (f === 0) return NaN;
  return -(fv + pv * Math.pow(1 + r, n)) / f;
}

/** Number of periods, or NaN when the numbers cannot reach each other (for example a balance that never grows). */
export function solveN(r: number, pv: number, pmt: number, fv: number, t: Timing): number {
  if (r === 0) return pmt === 0 ? NaN : -(pv + fv) / pmt;
  const k = (pmt * (1 + r * t)) / r;
  const top = k - fv;
  const bottom = k + pv;
  if (bottom === 0 || top / bottom <= 0) return NaN;
  const n = Math.log(top / bottom) / Math.log(1 + r);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

/** Rate per period found by scanning for a sign change and bisecting. Returns NaN when there is none. */
export function solveRate(n: number, pv: number, pmt: number, fv: number, t: Timing): number {
  if (!(n > 0)) return NaN;
  const f = (r: number) => tvmResidual(n, r, pv, pmt, fv, t);
  const grid: number[] = [];
  for (let x = -0.99; x < 0; x += 0.01) grid.push(x);
  for (let x = 0; x <= 1; x += 0.0005) grid.push(x);
  for (let x = 1; x <= 20; x += 0.05) grid.push(x);
  let prev = grid[0];
  let fp = f(prev);
  for (let i = 1; i < grid.length; i++) {
    const cur = grid[i];
    const fc = f(cur);
    if (Number.isFinite(fp) && Number.isFinite(fc) && fp !== 0 && fp * fc <= 0) {
      let lo = prev;
      let hi = cur;
      let flo = fp;
      for (let k = 0; k < 200; k++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (flo * fm <= 0) hi = mid;
        else {
          lo = mid;
          flo = fm;
        }
      }
      return (lo + hi) / 2;
    }
    if (fc === 0) return cur;
    prev = cur;
    fp = fc;
  }
  return NaN;
}

/** Converts a nominal annual percentage compounded `m` times a year into the equivalent rate per month. */
export function monthlyRate(annualPercent: number, compoundsPerYear: number): number {
  const m = compoundsPerYear;
  if (m === 0) return Math.exp(annualPercent / 100 / 12) - 1;
  return Math.pow(1 + annualPercent / 100 / m, m / 12) - 1;
}

export interface GrowthRow {
  year: number;
  deposits: number;
  interest: number;
  balance: number;
}

/** Growth of a starting amount plus equal deposits at the end of each month, with the rate compounded `compoundsPerYear` times a year (0 = continuously). */
export function growth(principal: number, monthlyDeposit: number, annualPercent: number, years: number, compoundsPerYear: number) {
  const r = monthlyRate(annualPercent, compoundsPerYear);
  const months = Math.round(years * 12);
  const rows: GrowthRow[] = [];
  let balance = principal;
  let deposits = principal;
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) + monthlyDeposit;
    deposits += monthlyDeposit;
    if (m % 12 === 0 || m === months) rows.push({ year: Math.ceil(m / 12), deposits, interest: balance - deposits, balance });
  }
  return { final: balance, deposits, interest: balance - deposits, rows };
}

export interface SalaryResult {
  newSalary: number;
  increase: number;
  percent: number;
}

/** Either a percentage raise on the current pay, or the percentage implied by a new amount. */
export function salaryFromPercent(current: number, percent: number): SalaryResult {
  const newSalary = current * (1 + percent / 100);
  return { newSalary, increase: newSalary - current, percent };
}

export function salaryFromNew(current: number, newSalary: number): SalaryResult {
  return { newSalary, increase: newSalary - current, percent: current === 0 ? NaN : ((newSalary - current) / current) * 100 };
}

/** Level payment on a loan with `n` payments at `r` interest per payment. */
export function loanPayment(principal: number, r: number, n: number): number {
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export interface LoanYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export function loanSchedule(principal: number, annualPercent: number, years: number, paymentsPerYear: number) {
  const n = Math.round(years * paymentsPerYear);
  const r = annualPercent / 100 / paymentsPerYear;
  const payment = loanPayment(principal, r, n);
  let balance = principal;
  let totalInterest = 0;
  const rows: LoanYear[] = [];
  let yearPrincipal = 0;
  let yearInterest = 0;
  for (let k = 1; k <= n; k++) {
    const interest = balance * r;
    const principalPart = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    yearInterest += interest;
    yearPrincipal += principalPart;
    if (k % paymentsPerYear === 0 || k === n) {
      rows.push({ year: Math.ceil(k / paymentsPerYear), principalPaid: yearPrincipal, interestPaid: yearInterest, balance });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }
  return { payment, n, totalPaid: payment * n, totalInterest, rows };
}

export interface RoiResult {
  gain: number;
  roiPercent: number;
  annualizedPercent: number | null;
}

export function roi(invested: number, returned: number, years: number | null): RoiResult {
  const gain = returned - invested;
  const roiPercent = (gain / invested) * 100;
  let annualizedPercent: number | null = null;
  if (years && years > 0 && returned > 0) annualizedPercent = (Math.pow(returned / invested, 1 / years) - 1) * 100;
  return { gain, roiPercent, annualizedPercent };
}

export interface PayoffYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

/** Fixed-rate loan with monthly payments and an optional extra amount paid every month. Extra payments shorten the loan. */
export function amortize(principal: number, annualPercent: number, years: number, extraMonthly = 0) {
  const r = annualPercent / 100 / 12;
  const n = Math.round(years * 12);
  const payment = loanPayment(principal, r, n);
  let balance = principal;
  let totalInterest = 0;
  let months = 0;
  const rows: PayoffYear[] = [];
  let yp = 0;
  let yi = 0;
  while (balance > 0.005 && months < n + 1) {
    const interest = balance * r;
    const principalPart = Math.min(balance, payment - interest + extraMonthly);
    balance -= principalPart;
    totalInterest += interest;
    yp += principalPart;
    yi += interest;
    months++;
    if (months % 12 === 0 || balance <= 0.005) {
      rows.push({ year: Math.ceil(months / 12), principalPaid: yp, interestPaid: yi, balance: Math.max(0, balance) });
      yp = 0;
      yi = 0;
    }
  }
  return { payment, months, totalInterest, totalPaid: principal + totalInterest, rows };
}
