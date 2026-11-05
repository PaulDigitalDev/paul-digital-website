/*
 * Bangla (Bengali) calendar for two traditions.
 *  - Bangladesh: the revised calendar (Bangla Academy 1966/1987, revised 2019). Month start dates are fixed.
 *  - West Bengal: the traditional solar calendar worked out with the Surya Siddhanta. A month begins the day after the
 *    Sun enters the sign, and one day later if that happens after midnight. Printed panjikas can differ by a day.
 */

export type Tradition = "bd" | "wb";
export interface YMD { y: number; m: number; d: number }
export interface BanglaDate { year: number; month: number; day: number }

export const BANGLA_MONTHS = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
export const BANGLA_SEASONS = ["গ্রীষ্ম", "গ্রীষ্ম", "বর্ষা", "বর্ষা", "শরৎ", "শরৎ", "হেমন্ত", "হেমন্ত", "শীত", "শীত", "বসন্ত", "বসন্ত"];
export const WEEKDAYS_BN = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
export const GREG_MONTHS_BN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

const DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export const bn = (n: number | string) => String(n).replace(/\d/g, (c) => DIGITS[Number(c)]);

const DAY = 86_400_000;
export const utc = (p: YMD) => Date.UTC(p.y, p.m - 1, p.d);
export const fromUtc = (ms: number): YMD => {
  const d = new Date(ms);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
};
export const addDays = (p: YMD, n: number): YMD => fromUtc(utc(p) + n * DAY);
export const diffDays = (a: YMD, b: YMD) => Math.round((utc(b) - utc(a)) / DAY);
export const weekdayIndex = (p: YMD) => new Date(utc(p)).getUTCDay();
export const isRealDate = (p: YMD) => {
  const q = fromUtc(utc(p));
  return q.y === p.y && q.m === p.m && q.d === p.d;
};
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/* ---------- Bangladesh (revised calendar) ---------- */

const BD_STARTS: [number, number][] = [[4, 14], [5, 15], [6, 15], [7, 16], [8, 16], [9, 16], [10, 17], [11, 16], [12, 16], [1, 15], [2, 14], [3, 15]];

/** Days in each month for the Bangla year that begins on 14 April of `startYear`. */
function bdLengths(startYear: number): number[] {
  const starts = BD_STARTS.map(([m, d], i) => ({ y: i < 9 ? startYear : startYear + 1, m, d }));
  starts.push({ y: startYear + 1, m: 4, d: 14 });
  return starts.slice(0, 12).map((s, i) => diffDays(s, starts[i + 1]));
}

export function bdYearStart(banglaYear: number): YMD {
  return { y: banglaYear + 593, m: 4, d: 14 };
}

export function bdMonthStart(banglaYear: number, month: number): YMD {
  const lengths = bdLengths(banglaYear + 593);
  let offset = 0;
  for (let i = 0; i < month; i++) offset += lengths[i];
  return addDays(bdYearStart(banglaYear), offset);
}

export const bdMonthLength = (banglaYear: number, month: number) => bdLengths(banglaYear + 593)[month];

function bdFromGregorian(p: YMD): BanglaDate {
  const startYear = diffDays({ y: p.y, m: 4, d: 14 }, p) >= 0 ? p.y : p.y - 1;
  let left = diffDays({ y: startYear, m: 4, d: 14 }, p);
  const lengths = bdLengths(startYear);
  let month = 0;
  while (left >= lengths[month]) {
    left -= lengths[month];
    month++;
  }
  return { year: startYear - 593, month, day: left + 1 };
}

/* ---------- West Bengal (Surya Siddhanta) ---------- */

const EPOCH = -1132959; // R.D. day of the Hindu epoch (18 February 3102 BCE, Julian)
const YEAR = 1577917828 / 4320000; // Surya Siddhanta sidereal year in days
const UJJAIN = 75.7683 / 360;
const APOGEE = 77.2833;
/** Shift (days) that brings the computed Sun-sign changes in line with published Bengali panjika times for 1433. */
const CALIBRATION = 0.0345;

const SINE_TABLE = Array.from({ length: 25 }, (_, k) => {
  const exact = 3438 * Math.sin((k * 3.75 * Math.PI) / 180);
  return Math.round(exact + 0.215 * Math.sign(exact) * Math.sign(Math.abs(exact) - 1716)) / 3438;
});
const quarterSine = (deg: number) => {
  const e = deg / 3.75;
  const f = e % 1;
  return f * SINE_TABLE[Math.ceil(e)] + (1 - f) * SINE_TABLE[Math.floor(e)];
};
const hinduSine = (deg: number) => {
  const t = ((deg % 360) + 360) % 360;
  if (t <= 90) return quarterSine(t);
  if (t <= 180) return quarterSine(180 - t);
  if (t <= 270) return -quarterSine(t - 180);
  return -quarterSine(360 - t);
};
const hinduArcsin = (a: number): number => {
  if (a < 0) return -hinduArcsin(-a);
  let p = 0;
  while (!(a <= SINE_TABLE[p])) p++;
  const below = SINE_TABLE[p - 1];
  return 3.75 * (p - 1 + (a - below) / (SINE_TABLE[p] - below));
};

/** Sidereal longitude of the Sun in degrees at a day count measured at Ujjain (R.D. scale). */
function sunLongitude(tee: number): number {
  const mean = 360 * ((((tee - EPOCH) / YEAR) % 1 + 1) % 1);
  const lam = ((mean % 360) + 360) % 360;
  const offset = hinduSine(lam - APOGEE);
  const size = 14 / 360;
  const equation = hinduArcsin(offset * (size - (Math.abs(offset) * size) / 42));
  return (((lam - equation) % 360) + 360) % 360;
}

function crossing(approx: number, target: number): number {
  let t = approx;
  for (let i = 0; i < 80; i++) {
    const d = ((target - sunLongitude(t) + 540) % 360) - 180;
    t += (d / 360) * YEAR;
    if (Math.abs(d) < 1e-10) break;
  }
  return t;
}

const RD_1970 = 719163;
const rdOf = (p: YMD) => utc(p) / DAY + RD_1970;

const wbCache = new Map<number, YMD[]>();

/** The 13 month start dates (12 months plus the next Boishakh) of the Bangla year `banglaYear`. */
export function wbMonthStarts(banglaYear: number): YMD[] {
  const cached = wbCache.get(banglaYear);
  if (cached) return cached;
  const g = banglaYear + 593;
  const starts: YMD[] = [];
  for (let i = 0; i < 13; i++) {
    const t = crossing(rdOf({ y: g, m: 4, d: 14 }) + i * 30.44 + UJJAIN, (i * 30) % 360);
    // Time in India (UTC+5:30), then the day after the civil date of the Sun-sign change.
    const ist = t - UJJAIN + 5.5 / 24 + CALIBRATION;
    starts.push(fromUtc((Math.floor(ist) + 1 - RD_1970) * DAY));
  }
  wbCache.set(banglaYear, starts);
  return starts;
}

export const wbMonthStart = (banglaYear: number, month: number) => wbMonthStarts(banglaYear)[month];
export const wbMonthLength = (banglaYear: number, month: number) => {
  const s = wbMonthStarts(banglaYear);
  return diffDays(s[month], s[month + 1]);
};

function wbFromGregorian(p: YMD): BanglaDate {
  let year = p.y - 593;
  if (diffDays(wbMonthStart(year, 0), p) < 0) year -= 1;
  const starts = wbMonthStarts(year);
  let month = 11;
  for (let i = 0; i < 12; i++) {
    if (diffDays(p, starts[i + 1]) > 0) {
      month = i;
      break;
    }
  }
  return { year, month, day: diffDays(starts[month], p) + 1 };
}

/* ---------- Common ---------- */

export function toBangla(p: YMD, t: Tradition): BanglaDate {
  return t === "bd" ? bdFromGregorian(p) : wbFromGregorian(p);
}

export const monthLength = (year: number, month: number, t: Tradition) => (t === "bd" ? bdMonthLength(year, month) : wbMonthLength(year, month));
export const monthStart = (year: number, month: number, t: Tradition) => (t === "bd" ? bdMonthStart(year, month) : wbMonthStart(year, month));

/** Gregorian date for a Bangla date, or null if the day does not exist in that month. */
export function toGregorian(b: BanglaDate, t: Tradition): YMD | null {
  if (b.month < 0 || b.month > 11 || b.day < 1 || b.day > monthLength(b.year, b.month, t)) return null;
  return addDays(monthStart(b.year, b.month, t), b.day - 1);
}

export const formatBangla = (b: BanglaDate) => `${bn(b.day)} ${BANGLA_MONTHS[b.month]} ${bn(b.year)} বঙ্গাব্দ`;
export const formatGregorian = (p: YMD) => `${bn(p.d)} ${GREG_MONTHS_BN[p.m - 1]} ${bn(p.y)}`;

export const todayLocal = (): YMD => {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
};
export { isLeap };
