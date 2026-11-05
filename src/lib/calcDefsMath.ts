import { Bad, guard, num, plain } from "./calcDefs.ts";
import type { CalcDef, Values } from "./calcDefs.ts";

/* Everyday maths calculators: fractions, averages, ratios, percentage change, scientific notation, GCF and LCM, standard deviation. */

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};
export const lcm = (a: number, b: number) => (a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b));

export interface Frac {
  n: number;
  d: number;
}
export function simplify(f: Frac): Frac {
  const g = gcd(f.n, f.d) || 1;
  const s = f.d < 0 ? -1 : 1;
  return { n: (s * f.n) / g, d: (s * f.d) / g };
}
export function fracOp(a: Frac, b: Frac, op: string): Frac {
  if (op === "+") return simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
  if (op === "-") return simplify({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
  if (op === "*") return simplify({ n: a.n * b.n, d: a.d * b.d });
  if (b.n === 0) throw new Bad("You cannot divide by zero.");
  return simplify({ n: a.n * b.d, d: a.d * b.n });
}
export function mixed(f: Frac): string {
  if (f.d === 1) return String(f.n);
  const whole = Math.trunc(f.n / f.d);
  const rem = Math.abs(f.n % f.d);
  if (whole === 0) return `${f.n}/${f.d}`;
  return `${whole} ${rem}/${f.d}`;
}

/** Splits text into numbers (commas, spaces, semicolons and new lines). */
export function parseList(raw: string, label: string): number[] {
  const parts = raw.split(/[\s,;]+/).filter(Boolean);
  if (parts.length === 0) throw new Bad(`Enter at least one number in “${label}”.`);
  const out = parts.map((p) => Number(p));
  if (out.some((n) => !Number.isFinite(n))) throw new Bad(`“${label}” can only contain numbers.`);
  if (out.length > 5000) throw new Bad("Use 5,000 numbers or fewer.");
  return out;
}

export function stats(xs: number[]) {
  const n = xs.length;
  const sum = xs.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const sorted = [...xs].sort((a, b) => a - b);
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  const top = Math.max(...counts.values());
  const modes = top === 1 ? [] : [...counts.entries()].filter(([, c]) => c === top).map(([v]) => v).sort((a, b) => a - b);
  const ss = xs.reduce((a, x) => a + (x - mean) ** 2, 0);
  return { n, sum, mean, median, modes, min: sorted[0], max: sorted[n - 1], range: sorted[n - 1] - sorted[0], ss };
}

const fracField = (id: string, label: string, def: string) => ({ id, label, kind: "number" as const, default: def, step: "1" });
const intOf = (v: Values, id: string, label: string) => {
  const n = num(v, id, label);
  if (!Number.isInteger(n) || Math.abs(n) > 1e9) throw new Bad(`“${label}” must be a whole number up to 1,000,000,000.`);
  return n;
};

export const fraction: CalcDef = {
  id: "fraction",
  fields: [
    fracField("an", "First fraction: numerator (top)", "1"),
    fracField("ad", "First fraction: denominator (bottom)", "2"),
    { id: "op", label: "Operation", kind: "select", default: "+", options: [{ value: "+", label: "Add (+)" }, { value: "-", label: "Subtract (−)" }, { value: "*", label: "Multiply (×)" }, { value: "/", label: "Divide (÷)" }] },
    fracField("bn", "Second fraction: numerator (top)", "1"),
    fracField("bd", "Second fraction: denominator (bottom)", "3"),
  ],
  compute: (v) =>
    guard(() => {
      const a = { n: intOf(v, "an", "First numerator"), d: intOf(v, "ad", "First denominator") };
      const b = { n: intOf(v, "bn", "Second numerator"), d: intOf(v, "bd", "Second denominator") };
      if (a.d === 0 || b.d === 0) throw new Bad("A denominator cannot be zero.");
      const r = fracOp(a, b, v.op);
      if (!Number.isSafeInteger(r.n) || !Number.isSafeInteger(r.d)) throw new Bad("Those numbers are too large.");
      return {
        rows: [
          { label: "Result", value: r.d === 1 ? String(r.n) : `${r.n}/${r.d}`, big: true },
          { label: "As a mixed number", value: mixed(r) },
          { label: "As a decimal", value: plain(r.n / r.d, 8) },
        ],
        notes: ["The result is reduced to its lowest terms."],
      };
    }),
};

export const average: CalcDef = {
  id: "average",
  fields: [{ id: "items", label: "Numbers (separated by commas, spaces or new lines)", kind: "textarea", default: "12, 15, 18, 15, 20", hint: "Up to 5,000 numbers." }],
  compute: (v) =>
    guard(() => {
      const s = stats(parseList(v.items ?? "", "Numbers"));
      return {
        rows: [
          { label: "Average (mean)", value: plain(s.mean, 6), big: true },
          { label: "Median", value: plain(s.median, 6) },
          { label: "Mode", value: s.modes.length ? s.modes.map((m) => plain(m, 6)).join(", ") : "No repeated value" },
          { label: "Sum", value: plain(s.sum, 6) },
          { label: "Count", value: String(s.n) },
          { label: "Smallest", value: plain(s.min, 6) },
          { label: "Largest", value: plain(s.max, 6) },
          { label: "Range", value: plain(s.range, 6) },
        ],
      };
    }),
};

export const ratio: CalcDef = {
  id: "ratio",
  fields: [
    { id: "a", label: "A", kind: "number", default: "3", step: "any" },
    { id: "b", label: "B", kind: "number", default: "4", step: "any" },
    { id: "c", label: "C (to find D so that A : B = C : D)", kind: "number", default: "9", step: "any" },
  ],
  compute: (v) =>
    guard(() => {
      const a = num(v, "a", "A");
      const b = num(v, "b", "B");
      const c = num(v, "c", "C");
      if (a === 0) throw new Bad("A cannot be zero.");
      const rows = [{ label: `D, so that ${plain(a)} : ${plain(b)} = ${plain(c)} : D`, value: plain((b * c) / a, 8), big: true }];
      if (Number.isInteger(a) && Number.isInteger(b) && Math.abs(a) < 1e12 && Math.abs(b) < 1e12 && b !== 0) {
        const g = gcd(a, b);
        rows.push({ label: "A : B in simplest form", value: `${a / g} : ${b / g}`, big: false });
      }
      rows.push({ label: "A ÷ B as a decimal", value: b === 0 ? "Not defined" : plain(a / b, 8), big: false });
      return { rows, notes: ["D = B × C ÷ A."] };
    }),
};

export const percentChange: CalcDef = {
  id: "percent-change",
  fields: [
    { id: "from", label: "Starting value", kind: "number", default: "80", step: "any" },
    { id: "to", label: "New value", kind: "number", default: "100", step: "any" },
  ],
  compute: (v) =>
    guard(() => {
      const from = num(v, "from", "Starting value");
      const to = num(v, "to", "New value");
      if (from === 0) throw new Bad("The starting value cannot be zero, because a percentage change from zero is not defined.");
      const change = ((to - from) / Math.abs(from)) * 100;
      return {
        rows: [
          { label: change >= 0 ? "Percentage increase" : "Percentage decrease", value: `${plain(Math.abs(change), 4)}%`, big: true },
          { label: "Change", value: plain(to - from, 6) },
          { label: "Percentage change (signed)", value: `${plain(change, 4)}%` },
        ],
        notes: ["Percentage change = (new − old) ÷ |old| × 100."],
      };
    }),
};

export const sciNotation: CalcDef = {
  id: "scientific-notation",
  fields: [{ id: "value", label: "Number", kind: "number", default: "123456", step: "any", hint: "You can type e-notation, such as 1.5e-7." }],
  compute: (v) =>
    guard(() => {
      const x = num(v, "value", "Number");
      if (x === 0) return { rows: [{ label: "Scientific notation", value: "0 × 10⁰", big: true }, { label: "E-notation", value: "0e+0" }] };
      const exp = Math.floor(Math.log10(Math.abs(x)));
      const e = x.toExponential();
      const [mant, ex] = e.split("e");
      const sup = (n: number) => String(n).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);
      const engExp = Math.floor(exp / 3) * 3;
      const engMant = x / Math.pow(10, engExp);
      return {
        rows: [
          { label: "Scientific notation", value: `${mant} × 10${sup(Number(ex))}`, big: true },
          { label: "E-notation", value: `${mant}e${Number(ex) >= 0 ? "+" : ""}${ex.replace("+", "")}` },
          { label: "Engineering notation", value: `${plain(engMant, 10)} × 10${sup(engExp)}` },
          { label: "Decimal", value: Math.abs(x) < 1e21 && Math.abs(x) >= 1e-7 ? plain(x, 20) : "Too large or small to show in full" },
        ],
      };
    }),
};

export const gcfLcm: CalcDef = {
  id: "gcf-lcm",
  fields: [{ id: "items", label: "Whole numbers (separated by commas, spaces or new lines)", kind: "textarea", default: "12, 18, 30", hint: "Two to ten whole numbers above zero." }],
  compute: (v) =>
    guard(() => {
      const xs = parseList(v.items ?? "", "Numbers");
      if (xs.length < 2 || xs.length > 10) throw new Bad("Enter between two and ten numbers.");
      if (xs.some((x) => !Number.isInteger(x) || x < 1 || x > 1e9)) throw new Bad("Use whole numbers from 1 to 1,000,000,000.");
      const g = xs.reduce(gcd);
      const l = xs.reduce(lcm);
      if (!Number.isSafeInteger(l)) throw new Bad("The least common multiple is too large to show exactly.");
      return {
        rows: [
          { label: "Greatest common factor (GCF / HCF)", value: String(g), big: true },
          { label: "Least common multiple (LCM)", value: l.toLocaleString("en-US") },
        ],
        notes: ["The GCF is also called the greatest common divisor (GCD) or highest common factor (HCF)."],
      };
    }),
};

export const stdDev: CalcDef = {
  id: "std-dev",
  fields: [
    { id: "items", label: "Numbers (separated by commas, spaces or new lines)", kind: "textarea", default: "4, 8, 6, 5, 3, 7", hint: "Up to 5,000 numbers." },
    { id: "kind", label: "Data is", kind: "select", default: "sample", options: [{ value: "sample", label: "A sample (divide by n − 1)" }, { value: "population", label: "The whole population (divide by n)" }] },
  ],
  compute: (v) =>
    guard(() => {
      const s = stats(parseList(v.items ?? "", "Numbers"));
      const pop = v.kind === "population";
      if (!pop && s.n < 2) throw new Bad("A sample needs at least two numbers.");
      const variance = s.ss / (pop ? s.n : s.n - 1);
      return {
        rows: [
          { label: pop ? "Population standard deviation" : "Sample standard deviation", value: plain(Math.sqrt(variance), 6), big: true },
          { label: pop ? "Population variance" : "Sample variance", value: plain(variance, 6) },
          { label: "Mean", value: plain(s.mean, 6) },
          { label: "Count", value: String(s.n) },
          { label: "Sum of squared differences", value: plain(s.ss, 6) },
        ],
      };
    }),
};

export const mathDefs: Record<string, CalcDef> = { fraction, average, ratio: ratio, "percent-change": percentChange, "scientific-notation": sciNotation, "gcf-lcm": gcfLcm, "std-dev": stdDev };
