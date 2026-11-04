/* Calendar maths on whole dates (no time zones): ages, differences and adding days, months and years. */

export interface YMD {
  y: number;
  m: number; // 1-12
  d: number;
}

export const dim = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export const toUtc = (p: YMD) => Date.UTC(p.y, p.m - 1, p.d);
export const fromUtc = (ms: number): YMD => {
  const dt = new Date(ms);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
};

/** Parses YYYY-MM-DD and rejects dates that do not exist (such as 2023-02-30). */
export function parseDate(text: string): YMD | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((text ?? "").trim());
  if (!m) return null;
  const p = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  if (p.m < 1 || p.m > 12 || p.d < 1 || p.d > dim(p.y, p.m)) return null;
  return p;
}

export const iso = (p: YMD) => `${String(p.y).padStart(4, "0")}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
export const compare = (a: YMD, b: YMD) => toUtc(a) - toUtc(b);
export const daysBetween = (a: YMD, b: YMD) => Math.round((toUtc(b) - toUtc(a)) / 86_400_000);

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const weekday = (p: YMD) => WEEKDAYS[new Date(toUtc(p)).getUTCDay()];

/** Adds whole months, keeping the day of the month where possible and otherwise using the last day of the month. */
export function addMonths(p: YMD, months: number): YMD {
  const total = p.y * 12 + (p.m - 1) + months;
  const y = Math.floor(total / 12);
  const m = (((total % 12) + 12) % 12) + 1;
  return { y, m, d: Math.min(p.d, dim(y, m)) };
}

export const addDays = (p: YMD, days: number): YMD => fromUtc(toUtc(p) + days * 86_400_000);

/** Whole years, months and days from `from` to `to` (from must not be after to). */
export function ymdDiff(from: YMD, to: YMD) {
  let k = (to.y - from.y) * 12 + (to.m - from.m);
  if (compare(addMonths(from, k), to) > 0) k -= 1;
  const days = daysBetween(addMonths(from, k), to);
  return { years: Math.floor(k / 12), months: k % 12, days, totalMonths: k };
}

/** Days from `at` until the next birthday (0 if it is today). A 29 February birthday is celebrated on 28 February in other years. */
export function daysToNextBirthday(birth: YMD, at: YMD) {
  const on = (year: number): YMD => ({ y: year, m: birth.m, d: Math.min(birth.d, dim(year, birth.m)) });
  let next = on(at.y);
  if (compare(next, at) < 0) next = on(at.y + 1);
  return { days: daysBetween(at, next), date: next };
}

export function ageAt(birth: YMD, at: YMD) {
  const diff = ymdDiff(birth, at);
  return { ...diff, totalDays: daysBetween(birth, at), totalWeeks: Math.floor(daysBetween(birth, at) / 7), next: daysToNextBirthday(birth, at) };
}

export const todayLocal = (): YMD => {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
};

/** Hours, minutes and seconds as a total number of seconds, and back. */
export const toSeconds = (d: number, h: number, m: number, s: number) => d * 86400 + h * 3600 + m * 60 + s;
export function fromSeconds(total: number) {
  const sign = total < 0 ? -1 : 1;
  let t = Math.abs(Math.round(total));
  const d = Math.floor(t / 86400);
  t -= d * 86400;
  const h = Math.floor(t / 3600);
  t -= h * 3600;
  const m = Math.floor(t / 60);
  return { sign, d, h, m, s: t - m * 60 };
}

/** Parses HH:MM into minutes after midnight. */
export function parseClock(text: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec((text ?? "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h > 23 || min > 59 ? null : h * 60 + min;
}

/** Minutes worked between two clock times, treating an end that is not later than the start as the next day. */
export function minutesBetween(start: number, end: number): number {
  return end > start ? end - start : end + 1440 - start;
}
