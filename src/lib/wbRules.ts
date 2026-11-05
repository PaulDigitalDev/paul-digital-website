import { addDays, addMonths, daysBetween, dim, ymdDiff } from "./dateCalc.ts";
import type { YMD } from "./dateCalc.ts";

/*
 * Rules used by the West Bengal government employee calculators. They follow the Finance Department (Pension Branch)
 * notification 535-F dated 01.10.2019 (ROPA 2019 death-cum-retirement benefits) as summarised on WBXPress, and the usual
 * superannuation rule of West Bengal Service Rules. They are estimates: check the current notification and your office.
 */

export const PENSION_MIN = 8500;
export const PENSION_MAX = 100500;
export const GRATUITY_CEILING = 1200000;

/** Retirement on the last day of the month in which the retirement age is reached; if born on the 1st, the last day of the month before. */
export function superannuationDate(birth: YMD, age: number): YMD {
  const reach = { y: birth.y + age, m: birth.m };
  const target = birth.d === 1 ? addMonths({ y: reach.y, m: reach.m, d: 1 }, -1) : { y: reach.y, m: reach.m, d: 1 };
  return { y: target.y, m: target.m, d: dim(target.y, target.m) };
}

export { addDays };

/** Whole years, months and days of service between two dates, optionally counting both of them, less days that do not count (such as earned leave or suspension). */
export function serviceLength(join: YMD, end: YMD, deductDays: number, countBoth: boolean) {
  const gross = daysBetween(join, end) + (countBoth ? 1 : 0);
  const net = gross - deductDays;
  if (net < 0) return null;
  const finish = addDays(join, net);
  const ymd = ymdDiff(join, finish);
  return { grossDays: gross, netDays: net, ...ymd, halfYears: qualifyingHalfYears(ymd.totalMonths) };
}

/** Qualifying service in completed six-month periods: a part of 3 months or more counts as another half year, less than 3 months does not count. */
export function qualifyingHalfYears(completedMonths: number): number {
  return Math.floor(completedMonths / 6) + (completedMonths % 6 >= 3 ? 1 : 0);
}

export const halfYearsToText = (h: number) => `${Math.floor(h / 2)} years${h % 2 ? " 6 months" : ""}`;

export function retiringGratuity(emoluments: number, halfYears: number, ceiling = GRATUITY_CEILING) {
  const raw = Math.min(0.25 * halfYears * emoluments, 16.5 * emoluments);
  return Math.min(raw, ceiling);
}

export function deathGratuityMultiple(halfYears: number): number {
  const years = halfYears / 2;
  if (years < 1) return 2;
  if (years < 5) return 6;
  if (years < 11) return 12;
  if (years < 20) return 20;
  return Math.min(0.5 * halfYears, 33);
}

export const deathGratuity = (emoluments: number, halfYears: number, ceiling = GRATUITY_CEILING) => Math.min(deathGratuityMultiple(halfYears) * emoluments, ceiling);

/** Basic pension: half of the last basic pay for 20 years or more, in proportion between 10 and 20 years, nothing below 10 years. */
export function basicPension(lastBasic: number, halfYears: number) {
  const years = halfYears / 2;
  if (years < 10) return { pension: 0, full: false };
  const proportion = Math.min(years, 20) / 20;
  let pension = Math.min(0.5 * lastBasic * proportion, PENSION_MAX);
  if (years >= 20) pension = Math.max(pension, PENSION_MIN);
  return { pension, full: years >= 20 };
}

/** Commutation factors by age at next birthday (LIC 94-96 Ultimate, 8%), as in the Finance Department table. */
export const COMMUTATION_FACTORS: Record<number, number> = Object.fromEntries(
  [9.188, 9.187, 9.186, 9.185, 9.184, 9.183, 9.182, 9.18, 9.178, 9.176, 9.173, 9.169, 9.164, 9.159, 9.152, 9.145, 9.136, 9.126, 9.116, 9.103, 9.09, 9.075, 9.059, 9.04, 9.019, 8.996, 8.971, 8.943, 8.913, 8.881, 8.846, 8.808, 8.768, 8.724, 8.678, 8.627, 8.572, 8.512, 8.446, 8.371, 8.287, 8.194, 8.093, 7.982, 7.862, 7.731, 7.591, 7.431, 7.262, 7.083, 6.897, 6.703, 6.502, 6.296, 6.085, 5.872, 5.657, 5.443, 5.229, 5.018, 4.812, 4.611].map((f, i) => [20 + i, f]),
);

export function commutation(pension: number, percent: number, ageNextBirthday: number) {
  const factor = COMMUTATION_FACTORS[ageNextBirthday];
  if (factor === undefined) return null;
  const commuted = (pension * percent) / 100;
  return { factor, commuted, lumpSum: commuted * factor * 12, reducedPension: pension - commuted };
}

/** Pay after yearly increments of a percentage, optionally rounded up to the next multiple of a number of rupees. */
export function incrementSchedule(basic: number, percent: number, years: number, roundTo: number) {
  const rows: { year: number; increment: number; basic: number }[] = [];
  let pay = basic;
  for (let y = 1; y <= years; y++) {
    let inc = (pay * percent) / 100;
    if (roundTo > 0) inc = Math.ceil(inc / roundTo) * roundTo;
    pay += inc;
    rows.push({ year: y, increment: inc, basic: pay });
  }
  return rows;
}

export const leaveSalary = (basic: number, da: number, days: number) => ((basic + da) / 30) * days;
