import { Bad, guard, money, num, pct, plain, positive } from "./calcDefs.ts";
import type { CalcDef, Field, Values } from "./calcDefs.ts";
import { addDays, addMonths, ageAt, compare, daysBetween, fromSeconds, iso, minutesBetween, parseClock, parseDate, todayLocal, toSeconds, weekday, ymdDiff } from "./dateCalc.ts";
import type { YMD } from "./dateCalc.ts";
import { LB_PER_KG, CM_PER_IN, bmi, bmiCategory, gpa, gradePoints, hourlyToAnnual, letterFor, neededOnFinal, percentage, weightedAverage } from "./calcMisc.ts";
import type { PercentMode } from "./calcMisc.ts";
import { amortize } from "./finance.ts";

const date = (v: Values, id: string, label: string): YMD => {
  const p = parseDate(v[id] ?? "");
  if (!p) throw new Bad(`Enter “${label}” as a real date.`);
  if (p.y < 1000) throw new Bad(`“${label}” must be a year from 1000.`);
  return p;
};
const longDate = (p: YMD) => `${weekday(p)}, ${iso(p)}`;
const plural = (n: number, word: string) => `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;
const dayRows = (d: number) => [{ label: "In weeks", value: `${plural(Math.floor(Math.abs(d) / 7), "week")} and ${plural(Math.abs(d) % 7, "day")}` }];

/** Reads lines such as "85, 30" into numbers; skips blank lines. */
const parseLines = (text: string, min: number, label: string): number[][] => {
  const rows = (text ?? "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(/[,;\t ]+/).filter(Boolean));
  if (rows.length === 0) throw new Bad(`Enter at least one line for “${label}”.`);
  return rows.map((cells, i) => {
    const nums = cells.map(Number);
    if (cells.length < min || nums.some((n) => !Number.isFinite(n))) throw new Bad(`Line ${i + 1} of “${label}” is not valid. Use numbers separated by a comma.`);
    return nums;
  });
};

/* ---------- Age ---------- */

export const age: CalcDef = {
  id: "age",
  volatile: true,
  fields: [
    { id: "birth", label: "Date of birth", kind: "date", default: "1990-05-15" },
    { id: "at", label: "Age on this date (leave empty for today)", kind: "date", default: "" },
  ],
  compute: (v) =>
    guard(() => {
      const birth = date(v, "birth", "Date of birth");
      const at = (v.at ?? "").trim() === "" ? todayLocal() : date(v, "at", "Age on this date");
      if (compare(birth, at) > 0) throw new Bad("The date of birth is after the date you are measuring to.");
      const a = ageAt(birth, at);
      return {
        rows: [
          { label: "Age", value: `${plural(a.years, "year")}, ${plural(a.months, "month")}, ${plural(a.days, "day")}`, big: true },
          { label: "Total months", value: a.totalMonths.toLocaleString("en-US") },
          { label: "Total weeks", value: a.totalWeeks.toLocaleString("en-US") },
          { label: "Total days", value: a.totalDays.toLocaleString("en-US") },
          { label: "Next birthday", value: a.next.days === 0 ? "Today" : `${longDate(a.next.date)} (in ${plural(a.next.days, "day")})` },
          { label: "Born on a", value: weekday(birth) },
        ],
        notes: ["A 29 February birthday is counted on 28 February in years that are not leap years."],
      };
    }),
};

/* ---------- Date ---------- */

export const dateCalc: CalcDef = {
  id: "date",
  volatile: true,
  fields: [
    { id: "mode", label: "What do you want to do?", kind: "select", default: "between", options: [{ value: "between", label: "Days between two dates" }, { value: "add", label: "Add to a date" }, { value: "sub", label: "Subtract from a date" }, { value: "today", label: "Days from today (add or subtract)" }] },
    { id: "from", label: "Start date", kind: "date", default: "2024-01-01", show: (v) => v.mode !== "today" },
    { id: "to", label: "End date", kind: "date", default: "2024-12-31", show: (v) => v.mode === "between" },
    { id: "years", label: "Years", kind: "number", default: "0", step: "1", show: (v) => v.mode === "add" || v.mode === "sub" },
    { id: "months", label: "Months", kind: "number", default: "0", step: "1", show: (v) => v.mode === "add" || v.mode === "sub" },
    { id: "days", label: "Days", kind: "number", default: "30", step: "1", show: (v) => v.mode !== "between" },
    { id: "dir", label: "From today", kind: "select", default: "after", options: [{ value: "after", label: "Days after today" }, { value: "before", label: "Days before today" }], show: (v) => v.mode === "today" },
    { id: "inc", label: "Count the end date too", kind: "select", default: "no", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes, add one day" }], show: (v) => v.mode === "between" },
  ],
  compute: (v) =>
    guard(() => {
      if (v.mode === "between") {
        const from = date(v, "from", "Start date");
        const to = date(v, "to", "End date");
        const raw = daysBetween(from, to);
        const total = raw + (v.inc === "yes" ? Math.sign(raw || 1) : 0);
        const lo = compare(from, to) <= 0 ? from : to;
        const hi = compare(from, to) <= 0 ? to : from;
        const d = ymdDiff(lo, hi);
        return {
          rows: [
            { label: "Days between", value: `${Math.abs(total).toLocaleString("en-US")}${raw < 0 ? " (end date is earlier)" : ""}`, big: true },
            ...dayRows(total),
            { label: "As years, months and days", value: `${d.years} y, ${d.months} m, ${d.days} d` },
          ],
        };
      }
      const whole = (id: string, label: string) => {
        const n = num(v, id, label);
        if (!Number.isInteger(n) || Math.abs(n) > 1_000_000) throw new Bad(`“${label}” must be a whole number.`);
        return n;
      };
      let start: YMD;
      let sign = 1;
      let years = 0;
      let months = 0;
      let days = whole("days", "Days");
      if (v.mode === "today") {
        start = todayLocal();
        sign = v.dir === "before" ? -1 : 1;
      } else {
        start = date(v, "from", "Start date");
        sign = v.mode === "sub" ? -1 : 1;
        years = whole("years", "Years");
        months = whole("months", "Months");
      }
      const moved = addDays(addMonths(start, sign * (years * 12 + months)), sign * days);
      if (moved.y < 1 || moved.y > 9999) throw new Bad("The result is outside the years this calculator can show.");
      return {
        rows: [
          { label: "Result", value: longDate(moved), big: true },
          { label: v.mode === "today" ? "Today is" : "Start date", value: longDate(start) },
          { label: "Days apart", value: Math.abs(daysBetween(start, moved)).toLocaleString("en-US") },
        ],
        notes: ["Months are added first. If the day does not exist in that month, the last day of the month is used."],
      };
    }),
};

/* ---------- Time ---------- */

const timeField = (id: string, label: string, def: string): Field => ({ id, label, kind: "number", default: def, step: "any" });

export const timeCalc: CalcDef = {
  id: "time",
  fields: [
    { id: "op", label: "Operation", kind: "select", default: "add", options: [{ value: "add", label: "Add the two times" }, { value: "sub", label: "Subtract the second from the first" }] },
    timeField("d1", "First time: days", "0"),
    timeField("h1", "First time: hours", "5"),
    timeField("m1", "First time: minutes", "45"),
    timeField("s1", "First time: seconds", "0"),
    timeField("d2", "Second time: days", "0"),
    timeField("h2", "Second time: hours", "3"),
    timeField("m2", "Second time: minutes", "30"),
    timeField("s2", "Second time: seconds", "0"),
  ],
  compute: (v) =>
    guard(() => {
      const t = (a: string, b: string, c: string, d: string, name: string) => {
        const parts = [a, b, c, d].map((id, i) => num(v, id, `${name}: ${["days", "hours", "minutes", "seconds"][i]}`));
        if (parts.some((n) => n < 0)) throw new Bad(`${name}: use zero or positive numbers.`);
        return toSeconds(parts[0], parts[1], parts[2], parts[3]);
      };
      const a = t("d1", "h1", "m1", "s1", "First time");
      const b = t("d2", "h2", "m2", "s2", "Second time");
      const total = v.op === "sub" ? a - b : a + b;
      const r = fromSeconds(total);
      const text = `${r.sign < 0 ? "−" : ""}${r.d ? `${r.d} d ` : ""}${r.h} h ${r.m} m ${r.s} s`;
      return {
        rows: [
          { label: "Result", value: text, big: true },
          { label: "Total hours", value: plain(total / 3600, 4) },
          { label: "Total minutes", value: plain(total / 60, 2) },
          { label: "Total seconds", value: plain(total, 0) },
        ],
        notes: total < 0 ? ["The second time is longer than the first, so the result is negative."] : undefined,
      };
    }),
};

/* ---------- Hours ---------- */

export const hours: CalcDef = {
  id: "hours",
  fields: [
    { id: "start", label: "Start time", kind: "time", default: "09:00" },
    { id: "end", label: "End time", kind: "time", default: "17:30" },
    { id: "brk", label: "Unpaid break (minutes)", kind: "number", default: "30", step: "1" },
    { id: "days", label: "Days worked per week", kind: "number", default: "5", step: "any" },
    { id: "rate", label: "Hourly pay (optional)", kind: "number", default: "", step: "any", hint: "Leave empty to skip the pay figures." },
  ],
  compute: (v) =>
    guard(() => {
      const start = parseClock(v.start);
      const end = parseClock(v.end);
      if (start === null) throw new Bad("Enter the start time as hours and minutes.");
      if (end === null) throw new Bad("Enter the end time as hours and minutes.");
      const brk = num(v, "brk", "Unpaid break (minutes)");
      const days = num(v, "days", "Days worked per week");
      if (brk < 0 || days < 0 || days > 7) throw new Bad("Use a break of 0 or more minutes and 0 to 7 days a week.");
      const span = minutesBetween(start, end);
      const worked = span - brk;
      if (worked < 0) throw new Bad("The break is longer than the time between start and end.");
      const dec = worked / 60;
      const rows = [
        { label: "Hours worked", value: `${Math.floor(worked / 60)} h ${worked % 60} m`, big: true },
        { label: "As decimal hours", value: plain(dec, 2) },
        { label: "Per week", value: `${plain(dec * days, 2)} hours` },
        { label: "Per month (4.33 weeks)", value: `${plain(dec * days * (52 / 12), 2)} hours` },
      ];
      if ((v.rate ?? "").trim() !== "") {
        const rate = num(v, "rate", "Hourly pay");
        rows.push({ label: "Pay for the day", value: money(dec * rate) }, { label: "Pay for the week", value: money(dec * rate * days) });
      }
      return { rows, notes: end <= start ? ["The end time is not later than the start time, so it is counted as the next day (a night shift)."] : undefined };
    }),
};

/* ---------- Percentage ---------- */

const PCT: Record<string, { a: string; b: string; out: string }> = {
  of: { a: "Percentage (%)", b: "Number", out: "Result" },
  whatpct: { a: "Number", b: "Out of", out: "Percentage" },
  change: { a: "From (old value)", b: "To (new value)", out: "Percentage change" },
  total: { a: "Number", b: "Is this percentage (%)", out: "Whole amount" },
  up: { a: "Number", b: "Increase by (%)", out: "New value" },
  down: { a: "Number", b: "Decrease by (%)", out: "New value" },
};

export const percentageCalc: CalcDef = {
  id: "percentage",
  fields: [
    {
      id: "mode",
      label: "What do you want to find?",
      kind: "select",
      default: "of",
      options: [
        { value: "of", label: "X% of Y" },
        { value: "whatpct", label: "X is what % of Y" },
        { value: "change", label: "% change from X to Y" },
        { value: "total", label: "X is Y% of what number" },
        { value: "up", label: "Increase X by Y%" },
        { value: "down", label: "Decrease X by Y%" },
      ],
    },
    { id: "a", label: "First number", kind: "number", default: "15", step: "any" },
    { id: "b", label: "Second number", kind: "number", default: "200", step: "any" },
  ],
  compute: (v) =>
    guard(() => {
      const mode = (v.mode in PCT ? v.mode : "of") as PercentMode;
      const a = num(v, "a", PCT[mode].a);
      const b = num(v, "b", PCT[mode].b);
      if ((mode === "whatpct" && b === 0) || (mode === "change" && a === 0) || (mode === "total" && b === 0)) throw new Bad(mode === "change" ? "The old value cannot be zero for a percentage change." : "That number cannot be zero here.");
      const r = percentage(mode, a, b);
      const text = mode === "whatpct" || mode === "change" ? pct(r, 4) : plain(r, 6);
      const rows = [{ label: PCT[mode].out, value: text, big: true }];
      if (mode === "change") rows.push({ label: "Difference", value: plain(b - a, 6) });
      if (mode === "up" || mode === "down") rows.push({ label: "Change", value: plain(r - a, 6) });
      return { rows };
    }),
};

/* ---------- Hourly to salary ---------- */

export const hourlyToSalary: CalcDef = {
  id: "hourly-to-salary",
  fields: [
    { id: "from", label: "I know my", kind: "select", default: "hourly", options: [{ value: "hourly", label: "Hourly pay" }, { value: "annual", label: "Yearly salary" }] },
    { id: "hourly", label: "Hourly pay", kind: "number", default: "25", step: "any", show: (v) => v.from === "hourly" },
    { id: "annual", label: "Yearly salary", kind: "number", default: "52000", step: "any", show: (v) => v.from === "annual" },
    { id: "hours", label: "Hours per week", kind: "number", default: "40", step: "any" },
    { id: "weeks", label: "Paid weeks per year", kind: "number", default: "52", step: "any", hint: "Use 50 if you have two unpaid weeks, for example." },
  ],
  compute: (v) =>
    guard(() => {
      const hours = positive(num(v, "hours", "Hours per week"), "Hours per week");
      const weeks = positive(num(v, "weeks", "Paid weeks per year"), "Paid weeks per year");
      if (hours > 168) throw new Bad("A week has 168 hours.");
      if (weeks > 52) throw new Bad("Use 52 weeks or fewer.");
      const hourly = v.from === "annual" ? positive(num(v, "annual", "Yearly salary"), "Yearly salary") / (hours * weeks) : positive(num(v, "hourly", "Hourly pay"), "Hourly pay");
      const r = hourlyToAnnual(hourly, hours, weeks);
      const rows = v.from === "annual" ? [{ label: "Hourly pay", value: money(hourly), big: true }] : [{ label: "Yearly salary", value: money(r.annual), big: true }];
      rows.push({ label: "Monthly", value: money(r.monthly) }, { label: "Every 2 weeks", value: money(r.biweekly) }, { label: "Weekly", value: money(r.weekly) }, { label: "Daily (5 days)", value: money(r.daily) });
      return { rows, notes: ["Before tax and other deductions."] };
    }),
};

/* ---------- Grade ---------- */

export const grade: CalcDef = {
  id: "grade",
  fields: [
    { id: "mode", label: "What do you want to find?", kind: "select", default: "average", options: [{ value: "average", label: "My weighted grade" }, { value: "final", label: "The score I need on my final" }] },
    { id: "items", label: "Scores, one per line: score, weight", kind: "textarea", default: "92, 20\n85, 30\n78, 50", hint: "Scores are percentages. Weights are relative, so 20, 30 and 50 work the same as 2, 3 and 5. Leave the weight out for equal weights.", show: (v) => v.mode === "average" },
    { id: "current", label: "Current grade (%)", kind: "number", default: "82", step: "any", show: (v) => v.mode === "final" },
    { id: "fw", label: "Final exam is worth (% of course)", kind: "number", default: "30", step: "any", show: (v) => v.mode === "final" },
    { id: "target", label: "Grade I want (%)", kind: "number", default: "85", step: "any", show: (v) => v.mode === "final" },
  ],
  compute: (v) =>
    guard(() => {
      if (v.mode === "final") {
        const current = num(v, "current", "Current grade (%)");
        const fw = num(v, "fw", "Final exam is worth (% of course)");
        const target = num(v, "target", "Grade I want (%)");
        if (!(fw > 0 && fw <= 100)) throw new Bad("The final exam weight must be above 0 and up to 100.");
        const need = neededOnFinal(current, fw, target);
        const notes = need > 100 ? ["The score needed is above 100%, so this target is out of reach unless extra credit is available."] : need < 0 ? ["You already have more than the target, so even a 0 on the final would be enough."] : undefined;
        return { rows: [{ label: "Score needed on the final", value: pct(need, 2), big: true }], notes };
      }
      const rows = parseLines(v.items, 1, "Scores").map((r) => ({ score: r[0], weight: r.length > 1 ? r[1] : 1 }));
      if (rows.some((r) => r.weight < 0 || r.score < 0)) throw new Bad("Scores and weights cannot be negative.");
      if (rows.reduce((s, r) => s + r.weight, 0) <= 0) throw new Bad("The weights must add up to more than zero.");
      const avg = weightedAverage(rows);
      return { rows: [{ label: "Weighted grade", value: pct(avg, 2), big: true }, { label: "Typical letter grade", value: letterFor(avg) }, { label: "Items counted", value: String(rows.length) }], notes: ["Letter cut-offs differ between schools. This uses the common 90, 80, 70, 60 scale."] };
    }),
};

/* ---------- GPA ---------- */

export const gpaCalc: CalcDef = {
  id: "gpa",
  fields: [
    { id: "items", label: "Courses, one per line: grade, credits", kind: "textarea", default: "A, 3\nB+, 4\nA-, 3\nB, 2", hint: "Use letters (A+ to F) or grade points such as 3.5. Leave the credits out for 1 credit." },
  ],
  compute: (v) =>
    guard(() => {
      const lines = (v.items ?? "").split(/\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) throw new Bad("Enter at least one course.");
      const items = lines.map((line, i) => {
        const [g, c] = line.split(/[,;\t ]+/).filter(Boolean);
        const credits = c === undefined ? 1 : Number(c);
        const points = gradePoints(g ?? "") ?? (g !== undefined && Number.isFinite(Number(g)) ? Number(g) : null);
        if (points === null || points < 0 || points > 5) throw new Bad(`Line ${i + 1}: “${g}” is not a letter grade (A+ to F) or a grade-point number from 0 to 5.`);
        if (!Number.isFinite(credits) || credits <= 0) throw new Bad(`Line ${i + 1}: credits must be a number above zero.`);
        return { points, credits };
      });
      const r = gpa(items);
      return { rows: [{ label: "GPA", value: r.gpa.toFixed(2), big: true }, { label: "Total credits", value: plain(r.credits, 2) }, { label: "Quality points", value: plain(r.quality, 2) }], notes: ["Uses the common unweighted 4.0 scale (A = 4.0, A− = 3.7, B+ = 3.3 and so on). Your school's scale may differ."] };
    }),
};

/* ---------- Amortization ---------- */

export const amortization: CalcDef = {
  id: "amortization",
  fields: [
    { id: "amount", label: "Loan amount", kind: "number", default: "250000", step: "any" },
    { id: "rate", label: "Annual interest rate (%)", kind: "number", default: "6.5", step: "any" },
    { id: "years", label: "Loan term (years)", kind: "number", default: "30", step: "any" },
    { id: "extra", label: "Extra payment each month", kind: "number", default: "200", step: "any", hint: "Paid on top of the regular payment and applied to the balance. Use 0 for none." },
  ],
  compute: (v) =>
    guard(() => {
      const amount = positive(num(v, "amount", "Loan amount"), "Loan amount");
      const rate = num(v, "rate", "Annual interest rate (%)");
      const years = positive(num(v, "years", "Loan term (years)"), "Loan term (years)");
      const extra = num(v, "extra", "Extra payment each month");
      if (rate < 0 || rate > 100) throw new Bad("Enter an interest rate from 0 to 100%.");
      if (years > 60) throw new Bad("Use a term of 60 years or fewer.");
      if (extra < 0) throw new Bad("The extra payment cannot be negative.");
      const base = amortize(amount, rate, years, 0);
      const fast = amortize(amount, rate, years, extra);
      const yrs = (m: number) => `${Math.floor(m / 12)} years ${m % 12} months`;
      const rows = [
        { label: "Regular monthly payment", value: money(base.payment), big: true },
        { label: "Total interest (no extra)", value: money(base.totalInterest) },
      ];
      if (extra > 0) rows.push({ label: "Total interest (with extra)", value: money(fast.totalInterest) }, { label: "Interest saved", value: money(base.totalInterest - fast.totalInterest) }, { label: "Paid off after", value: yrs(fast.months) }, { label: "Time saved", value: yrs(base.months - fast.months) });
      else rows.push({ label: "Paid off after", value: yrs(base.months) });
      const plan = extra > 0 ? fast : base;
      return { rows, table: { caption: `Year by year${extra > 0 ? " (with the extra payment)" : ""}`, head: ["Year", "Principal paid", "Interest paid", "Balance left"], rows: plan.rows.map((r) => [String(r.year), money(r.principalPaid), money(r.interestPaid), money(r.balance)]) }, notes: ["Principal and interest only. Fees, insurance and taxes are not included, and a lender's schedule may differ slightly."] };
    }),
};

/* ---------- BMI ---------- */

export const bmiCalc: CalcDef = {
  id: "bmi",
  fields: [
    { id: "units", label: "Units", kind: "select", default: "metric", options: [{ value: "metric", label: "Metric (cm, kg)" }, { value: "imperial", label: "US (feet, inches, pounds)" }] },
    { id: "cm", label: "Height (cm)", kind: "number", default: "175", step: "any", show: (v) => v.units === "metric" },
    { id: "kg", label: "Weight (kg)", kind: "number", default: "70", step: "any", show: (v) => v.units === "metric" },
    { id: "ft", label: "Height: feet", kind: "number", default: "5", step: "any", show: (v) => v.units === "imperial" },
    { id: "inch", label: "Height: inches", kind: "number", default: "9", step: "any", show: (v) => v.units === "imperial" },
    { id: "lb", label: "Weight (pounds)", kind: "number", default: "154", step: "any", show: (v) => v.units === "imperial" },
  ],
  compute: (v) =>
    guard(() => {
      let meters: number;
      let kg: number;
      if (v.units === "imperial") {
        const inches = positive(num(v, "ft", "Height: feet") * 12 + num(v, "inch", "Height: inches"), "Height");
        meters = (inches * CM_PER_IN) / 100;
        kg = positive(num(v, "lb", "Weight (pounds)"), "Weight (pounds)") / LB_PER_KG;
      } else {
        meters = positive(num(v, "cm", "Height (cm)"), "Height (cm)") / 100;
        kg = positive(num(v, "kg", "Weight (kg)"), "Weight (kg)");
      }
      if (meters < 0.5 || meters > 2.8) throw new Bad("Check the height. It should be between about 50 cm and 280 cm.");
      const value = bmi(kg, meters);
      const lo = 18.5 * meters * meters;
      const hi = 24.9 * meters * meters;
      const range = v.units === "imperial" ? `${plain(lo * LB_PER_KG, 0)} to ${plain(hi * LB_PER_KG, 0)} lb` : `${plain(lo, 1)} to ${plain(hi, 1)} kg`;
      return { rows: [{ label: "BMI", value: value.toFixed(1), big: true }, { label: "Category for adults", value: bmiCategory(value) }, { label: "Weight range for BMI 18.5 to 24.9 at this height", value: range }], notes: ["BMI is a screening number for adults aged 20 and over. It does not measure body fat or health, and it is not a diagnosis. For children and teenagers, doctors use percentile charts. Speak to a health professional about your health."] };
    }),
};

export const moreDefs: Record<string, CalcDef> = {
  age,
  date: dateCalc,
  time: timeCalc,
  hours,
  percentage: percentageCalc,
  "hourly-to-salary": hourlyToSalary,
  grade,
  gpa: gpaCalc,
  amortization,
  bmi: bmiCalc,
};

