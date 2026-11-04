import test from "node:test";
import assert from "node:assert/strict";
import { parseDate, daysBetween, ymdDiff, addMonths, addDays, ageAt, daysToNextBirthday, weekday, iso, fromSeconds, toSeconds, parseClock, minutesBetween } from "../src/lib/dateCalc.ts";
import { percentage, hourlyToAnnual, weightedAverage, neededOnFinal, letterFor, gradePoints, gpa, bmi, bmiCategory } from "../src/lib/calcMisc.ts";
import { amortize, loanSchedule } from "../src/lib/finance.ts";

const P = (s) => parseDate(s);
const close = (a, b, t = 0.01) => assert.ok(Math.abs(a - b) <= t, `${a} vs ${b}`);

test("date parsing rejects impossible dates", () => {
  assert.equal(parseDate("2023-02-30"), null);
  assert.equal(parseDate("2024-02-29").d, 29);
  assert.equal(parseDate("2023-13-01"), null);
  assert.equal(parseDate("2023-1-1"), null);
  assert.equal(parseDate(""), null);
});

test("days between and weekdays", () => {
  assert.equal(daysBetween(P("2024-01-01"), P("2024-12-31")), 365);
  assert.equal(daysBetween(P("2023-01-01"), P("2023-12-31")), 364);
  assert.equal(daysBetween(P("2024-03-01"), P("2024-02-01")), -29);
  assert.equal(weekday(P("2000-01-01")), "Saturday");
  assert.equal(weekday(P("2024-02-29")), "Thursday");
});

test("year, month, day difference", () => {
  assert.deepEqual(ymdDiff(P("1990-05-15"), P("2024-05-14")), { years: 33, months: 11, days: 29, totalMonths: 407 });
  const a = ymdDiff(P("2000-01-31"), P("2000-03-01"));
  assert.deepEqual([a.years, a.months, a.days], [0, 1, 1]);
  const b = ymdDiff(P("2020-02-29"), P("2021-02-28"));
  assert.deepEqual([b.years, b.months], [1, 0]);
  assert.deepEqual([ymdDiff(P("2024-01-01"), P("2024-01-01")).years, ymdDiff(P("2024-01-01"), P("2024-01-01")).days], [0, 0]);
});

test("adding months clamps to the end of the month", () => {
  assert.equal(iso(addMonths(P("2024-01-31"), 1)), "2024-02-29");
  assert.equal(iso(addMonths(P("2023-01-31"), 1)), "2023-02-28");
  assert.equal(iso(addMonths(P("2024-03-15"), -3)), "2023-12-15");
  assert.equal(iso(addDays(P("2024-02-28"), 2)), "2024-03-01");
  assert.equal(iso(addDays(P("2024-01-01"), -1)), "2023-12-31");
});

test("age and next birthday", () => {
  const a = ageAt(P("1990-05-15"), P("2024-05-15"));
  assert.equal(a.years, 34);
  assert.equal(a.months, 0);
  assert.equal(a.next.days, 0);
  assert.equal(daysToNextBirthday(P("2000-02-29"), P("2023-03-01")).days, 365 - 0 + 0 === 365 ? daysBetween(P("2023-03-01"), P("2024-02-29")) : 0);
  assert.equal(iso(daysToNextBirthday(P("2000-02-29"), P("2023-01-10")).date), "2023-02-28");
});

test("time arithmetic", () => {
  assert.deepEqual(fromSeconds(toSeconds(1, 2, 3, 4)), { sign: 1, d: 1, h: 2, m: 3, s: 4 });
  assert.equal(fromSeconds(-90).sign, -1);
  assert.equal(fromSeconds(3600 + 59).m, 0);
  assert.equal(parseClock("09:30"), 570);
  assert.equal(parseClock("24:00"), null);
  assert.equal(minutesBetween(540, 1020), 480);
  assert.equal(minutesBetween(1320, 360), 480);
});

test("percentage modes", () => {
  assert.equal(percentage("of", 15, 200), 30);
  close(percentage("whatpct", 30, 200), 15);
  close(percentage("change", 50, 75), 50);
  close(percentage("change", 80, 60), -25);
  close(percentage("total", 30, 15), 200);
  close(percentage("up", 200, 10), 220);
  close(percentage("down", 200, 25), 150);
});

test("hourly to salary", () => {
  const r = hourlyToAnnual(25, 40, 52);
  close(r.annual, 52000);
  close(r.monthly, 4333.33);
  close(r.biweekly, 2000);
  close(r.weekly, 1000);
  close(r.daily, 200);
});

test("grades", () => {
  close(weightedAverage([{ score: 90, weight: 30 }, { score: 80, weight: 70 }]), 83);
  close(weightedAverage([{ score: 70, weight: 1 }, { score: 90, weight: 1 }]), 80);
  close(neededOnFinal(80, 20, 85), 105);
  close(neededOnFinal(90, 25, 85), 70);
  assert.equal(letterFor(89.9), "B");
  assert.equal(letterFor(90), "A");
});

test("GPA", () => {
  assert.equal(gradePoints("a-"), 3.7);
  assert.equal(gradePoints("Z"), null);
  const g = gpa([{ points: 4, credits: 3 }, { points: 3, credits: 4 }, { points: 2, credits: 1 }]);
  close(g.gpa, (12 + 12 + 2) / 8);
  assert.equal(g.credits, 8);
});

test("BMI", () => {
  close(bmi(70, 1.75), 22.86);
  assert.equal(bmiCategory(18.4), "Underweight");
  assert.equal(bmiCategory(18.5), "Healthy weight range");
  assert.equal(bmiCategory(25), "Overweight");
  assert.equal(bmiCategory(30), "Obesity range");
});

test("amortization with and without extra payments", () => {
  const base = amortize(200000, 6, 30, 0);
  const plain = loanSchedule(200000, 6, 30, 12);
  close(base.totalInterest, plain.totalInterest, 1);
  assert.equal(base.months, 360);
  const extra = amortize(200000, 6, 30, 200);
  assert.ok(extra.months < 360 && extra.months > 200);
  assert.ok(extra.totalInterest < base.totalInterest);
  close(extra.rows[extra.rows.length - 1].balance, 0, 0.01);
  const zero = amortize(1200, 0, 1, 0);
  assert.equal(zero.months, 12);
  close(zero.totalInterest, 0);
});
