import { Bad, guard, num, positive } from "./calcDefs.ts";
import type { CalcDef, Values } from "./calcDefs.ts";
import { compare, iso, parseDate, weekday } from "./dateCalc.ts";
import type { YMD } from "./dateCalc.ts";
import { COMMUTATION_FACTORS, GRATUITY_CEILING, basicPension, commutation, deathGratuity, deathGratuityMultiple, halfYearsToText, incrementSchedule, leaveSalary, qualifyingHalfYears, retiringGratuity, serviceLength, superannuationDate } from "./wbRules.ts";
import { addDays } from "./dateCalc.ts";

const date = (v: Values, id: string, label: string): YMD => {
  const p = parseDate(v[id] ?? "");
  if (!p) throw new Bad(`Enter “${label}” as a real date.`);
  return p;
};
const nonNeg = (n: number, label: string) => {
  if (n < 0) throw new Bad(`“${label}” cannot be negative.`);
  return n;
};
const longDate = (p: YMD) => `${weekday(p)}, ${iso(p)}`;
const inr = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rs = (n: number) => `Rs ${inr(n)}`;
const CHECK = "An estimate from the rules in Finance Department notification 535-F (01.10.2019) as summarised by WBXPress. Check the current notification and your office before relying on it.";

const SERVICE_FIELDS = [
  { id: "years", label: "Qualifying service: completed years", kind: "number" as const, default: "30", step: "1" },
  { id: "months", label: "Qualifying service: extra months", kind: "number" as const, default: "0", step: "1" },
];
const halfYearsOf = (v: Values) => {
  const y = nonNeg(num(v, "years", "Qualifying service years"), "Qualifying service years");
  const m = nonNeg(num(v, "months", "Extra months"), "Extra months");
  return qualifyingHalfYears(Math.floor(y) * 12 + Math.floor(m));
};

export const wbSuperannuation: CalcDef = {
  id: "wb-superannuation",
  fields: [
    { id: "birth", label: "Date of birth", kind: "date", default: "1966-05-15" },
    { id: "age", label: "Retirement age", kind: "number", default: "60", step: "1", hint: "60 for most employees. Some groups have a different age." },
  ],
  compute: (v) =>
    guard(() => {
      const birth = date(v, "birth", "Date of birth");
      const age = positive(num(v, "age", "Retirement age"), "Retirement age");
      if (!Number.isInteger(age) || age > 70) throw new Bad("Enter a whole retirement age up to 70.");
      const last = superannuationDate(birth, age);
      const next = addDays(last, 1);
      return {
        rows: [
          { label: "Date of superannuation (retirement)", value: longDate(last), big: true },
          { label: "Pension starts from", value: longDate(next) },
          { label: `Date you reach ${age}`, value: iso({ y: birth.y + age, m: birth.m, d: birth.d }) },
        ],
        notes: ["Retirement is on the last day of the month in which the age is reached. If the birth date is the 1st of a month, it is the last day of the month before.", "Check the rule for your service group."],
      };
    }),
};

export const wbService: CalcDef = {
  id: "wb-service",
  fields: [
    { id: "join", label: "Date of joining", kind: "date", default: "1996-06-10" },
    { id: "end", label: "Date of retirement or leaving", kind: "date", default: "2026-05-31" },
    { id: "deduct", label: "Days that do not count (EL, suspension)", kind: "number", default: "0", step: "1" },
    { id: "both", label: "Count both dates", kind: "select", default: "yes", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  ],
  compute: (v) =>
    guard(() => {
      const join = date(v, "join", "Date of joining");
      const end = date(v, "end", "Date of retirement or leaving");
      if (compare(join, end) > 0) throw new Bad("The joining date is after the end date.");
      const deduct = nonNeg(num(v, "deduct", "Days that do not count"), "Days that do not count");
      const s = serviceLength(join, end, Math.floor(deduct), v.both !== "no");
      if (!s) throw new Bad("The days that do not count are more than the whole period.");
      return {
        rows: [
          { label: "Length of service", value: `${s.years} years, ${s.months} months, ${s.days} days`, big: true },
          { label: "Qualifying service (rounded)", value: halfYearsToText(s.halfYears) },
          { label: "Completed six-month periods", value: String(s.halfYears) },
          { label: "Net days of service", value: s.netDays.toLocaleString("en-US") },
        ],
        notes: ["Qualifying service is rounded to six-month periods: 3 months or more counts as another half year and less than 3 months is ignored.", CHECK],
      };
    }),
};

export const wbIncrement: CalcDef = {
  id: "wb-increment",
  fields: [
    { id: "basic", label: "Current basic pay (Rs)", kind: "number", default: "50000" },
    { id: "percent", label: "Yearly increment (%)", kind: "number", default: "3", step: "0.1" },
    { id: "years", label: "Number of yearly increments", kind: "number", default: "5", step: "1" },
    { id: "round", label: "Round each increment up to", kind: "select", default: "100", options: [{ value: "0", label: "No rounding" }, { value: "10", label: "Next Rs 10" }, { value: "100", label: "Next Rs 100" }] },
  ],
  compute: (v) =>
    guard(() => {
      const basic = positive(num(v, "basic", "Current basic pay"), "Current basic pay");
      const percent = positive(num(v, "percent", "Yearly increment"), "Yearly increment");
      const years = Math.floor(positive(num(v, "years", "Number of increments"), "Number of increments"));
      if (years > 40) throw new Bad("Use 40 increments or fewer.");
      const rows = incrementSchedule(basic, percent, years, Number(v.round) || 0);
      const last = rows[rows.length - 1];
      return {
        rows: [
          { label: `Basic pay after ${years} increment${years === 1 ? "" : "s"}`, value: rs(last.basic), big: true },
          { label: "First increment", value: rs(rows[0].increment) },
          { label: "Total increase", value: rs(last.basic - basic) },
        ],
        table: { caption: "Basic pay year by year", head: ["Year", "Increment", "Basic pay"], rows: rows.map((r) => [String(r.year), inr(r.increment), inr(r.basic)]) },
        notes: ["A simple percentage model. Under a pay matrix, increments move to the next cell, so check your pay matrix for the exact figure."],
      };
    }),
};

export const wbLeave: CalcDef = {
  id: "wb-leave",
  fields: [
    { id: "basic", label: "Basic pay (Rs)", kind: "number", default: "40000" },
    { id: "da", label: "Dearness allowance (Rs)", kind: "number", default: "20000" },
    { id: "days", label: "Days of leave to encash", kind: "number", default: "300", step: "1" },
  ],
  compute: (v) =>
    guard(() => {
      const basic = positive(num(v, "basic", "Basic pay"), "Basic pay");
      const da = nonNeg(num(v, "da", "Dearness allowance"), "Dearness allowance");
      const days = positive(num(v, "days", "Days of leave"), "Days of leave");
      return {
        rows: [
          { label: "Leave salary", value: rs(leaveSalary(basic, da, days)), big: true },
          { label: "Per day (pay + DA ÷ 30)", value: rs((basic + da) / 30) },
        ],
        notes: ["Leave salary = (basic pay + dearness allowance) ÷ 30 × days of leave.", "The number of days you may encash is limited by the leave rules, so check your entitlement. This calculator does not limit the days."],
      };
    }),
};

export const wbGratuity: CalcDef = {
  id: "wb-gratuity",
  fields: [
    { id: "basic", label: "Last basic pay (Rs)", kind: "number", default: "15000" },
    { id: "da", label: "Dearness allowance (Rs)", kind: "number", default: "3000" },
    ...SERVICE_FIELDS.map((f) => (f.id === "years" ? { ...f, default: "20" } : f)),
    { id: "ceiling", label: "Maximum gratuity (Rs)", kind: "number", default: String(GRATUITY_CEILING), hint: "Rs 12,00,000 for those retiring after 01.01.2016 per the notification." },
  ],
  compute: (v) =>
    guard(() => {
      const basic = positive(num(v, "basic", "Last basic pay"), "Last basic pay");
      const da = nonNeg(num(v, "da", "Dearness allowance"), "Dearness allowance");
      const ceiling = positive(num(v, "ceiling", "Maximum gratuity"), "Maximum gratuity");
      const h = halfYearsOf(v);
      const emol = basic + da;
      return {
        rows: [
          { label: "Retiring gratuity", value: rs(retiringGratuity(emol, h, ceiling)), big: true },
          { label: "Death gratuity", value: rs(deathGratuity(emol, h, ceiling)) },
          { label: "Emoluments (basic + DA)", value: rs(emol) },
          { label: "Qualifying service used", value: halfYearsToText(h) },
          { label: "Death gratuity multiple", value: `${deathGratuityMultiple(h)} × emoluments` },
        ],
        notes: ["Retiring gratuity is one quarter of the emoluments for each completed six-month period, up to 16½ times the emoluments.", CHECK],
      };
    }),
};

export const wbPension: CalcDef = {
  id: "wb-pension",
  fields: [
    { id: "basic", label: "Last basic pay (Rs)", kind: "number", default: "30000" },
    ...SERVICE_FIELDS.map((f) => (f.id === "years" ? { ...f, default: "22" } : f)),
  ],
  compute: (v) =>
    guard(() => {
      const basic = positive(num(v, "basic", "Last basic pay"), "Last basic pay");
      const h = halfYearsOf(v);
      const { pension, full } = basicPension(basic, h);
      if (pension === 0) throw new Bad("A pension needs at least 10 years of qualifying service.");
      return {
        rows: [
          { label: "Basic pension per month", value: rs(pension), big: true },
          { label: "Qualifying service used", value: halfYearsToText(h) },
          { label: "Basis", value: full ? "50% of last basic pay (20 years or more)" : "In proportion to 20 years of service" },
          { label: "Pension after commuting 40%", value: rs(pension * 0.6) },
        ],
        notes: ["Pension is limited to Rs 1,00,500 a month, and the full pension is not lower than Rs 8,500.", "Dearness relief and additional pension for old age are not included.", CHECK],
      };
    }),
};

export const wbCommutation: CalcDef = {
  id: "wb-commutation",
  fields: [
    { id: "pension", label: "Basic pension per month (Rs)", kind: "number", default: "15000" },
    { id: "percent", label: "Share of pension to commute (%)", kind: "number", default: "40", step: "1", hint: "Up to 40%." },
    { id: "age", label: "Age at next birthday", kind: "number", default: "61", step: "1", hint: "Between 20 and 81." },
  ],
  compute: (v) =>
    guard(() => {
      const pension = positive(num(v, "pension", "Basic pension"), "Basic pension");
      const percent = positive(num(v, "percent", "Share to commute"), "Share to commute");
      if (percent > 40) throw new Bad("At most 40% of the pension can be commuted.");
      const age = Math.floor(num(v, "age", "Age at next birthday"));
      const c = commutation(pension, percent, age);
      if (!c) throw new Bad(`Enter an age at next birthday between ${Math.min(...Object.keys(COMMUTATION_FACTORS).map(Number))} and ${Math.max(...Object.keys(COMMUTATION_FACTORS).map(Number))}.`);
      return {
        rows: [
          { label: "Commuted value (lump sum)", value: rs(c.lumpSum), big: true },
          { label: "Pension commuted per month", value: rs(c.commuted) },
          { label: "Commutation factor", value: String(c.factor) },
          { label: "Reduced pension per month", value: rs(c.reducedPension) },
        ],
        notes: ["Lump sum = commuted pension × factor for the age × 12. Factors are from the Finance Department table (LIC 94-96 Ultimate, 8% interest).", CHECK],
      };
    }),
};

export const wbDefs: Record<string, CalcDef> = {
  "wb-superannuation": wbSuperannuation,
  "wb-service": wbService,
  "wb-increment": wbIncrement,
  "wb-leave": wbLeave,
  "wb-gratuity": wbGratuity,
  "wb-pension": wbPension,
  "wb-commutation": wbCommutation,
};
