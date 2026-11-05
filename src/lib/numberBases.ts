/* Number base and Roman numeral conversion. Uses BigInt, so long values stay exact. */

export const BASES = [
  { base: 2, name: "Binary (base 2)" },
  { base: 8, name: "Octal (base 8)" },
  { base: 10, name: "Decimal (base 10)" },
  { base: 16, name: "Hexadecimal (base 16)" },
] as const;

export const baseName = (b: number) => BASES.find((x) => x.base === b)!.name;
export const MAX_DIGITS = 200;

const DIGITS = "0123456789ABCDEF";

/** Reads text as a whole number in the given base. Allows a leading minus, spaces, underscores and 0b/0o/0x prefixes. */
export function parseInBase(raw: string, base: number): bigint | null {
  let s = raw.trim().replace(/[\s_,]/g, "").toUpperCase();
  let neg = false;
  if (s.startsWith("-")) {
    neg = true;
    s = s.slice(1);
  }
  const prefix = base === 2 ? "0B" : base === 8 ? "0O" : base === 16 ? "0X" : "";
  if (prefix && s.startsWith(prefix)) s = s.slice(2);
  if (s === "" || s.length > MAX_DIGITS) return null;
  let n = 0n;
  const b = BigInt(base);
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return null;
    n = n * b + BigInt(d);
  }
  return neg ? -n : n;
}

export function toBase(n: bigint, base: number): string {
  return n.toString(base).toUpperCase();
}

/** Groups binary in fours and hex in groups of four for reading. */
export function group(text: string, base: number): string {
  if (base !== 2 && base !== 16) return text;
  const neg = text.startsWith("-");
  const body = neg ? text.slice(1) : text;
  const size = 4;
  const pad = base === 2 ? (size - (body.length % size)) % size : 0;
  const padded = "0".repeat(pad) + body;
  const parts = padded.match(new RegExp(`.{1,${size}}`, "g")) ?? [padded];
  return (neg ? "-" : "") + parts.join(" ");
}

const ROMAN: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

/** Standard Roman numerals for 1 to 3999. */
export function toRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
  let out = "";
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
}

/** Reads a Roman numeral. Only the standard (subtractive) form is accepted. */
export function fromRoman(raw: string): number | null {
  const s = raw.trim().toUpperCase();
  if (!/^[IVXLCDM]+$/.test(s)) return null;
  const val: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const a = val[s[i]];
    const b = val[s[i + 1]] ?? 0;
    total += a < b ? -a : a;
  }
  return toRoman(total) === s ? total : null;
}
