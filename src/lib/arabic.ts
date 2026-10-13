/* Small helpers for the Arabic tools: Latin digits, bidi isolation of file names and Arabic plural agreement. */

/** Arabic locale with Latin digits, so page counts, sizes and percentages stay easy to compare with file properties. */
export const AR_LOCALE = "ar-u-nu-latn";

/** Wraps text (typically a file name) in a first-strong isolate so its punctuation cannot reorder the surrounding sentence. */
export const isolate = (value: string) => `\u2068${value}\u2069`;

const rules = new Intl.PluralRules("ar");

/** [zero, one, two, few (3–10), many (11–99), other]; "{n}" is replaced by the count. */
export type ArabicForms = readonly [string, string, string, string, string, string];

export function arabicPlural(n: number, forms: ArabicForms): string {
  const index = { zero: 0, one: 1, two: 2, few: 3, many: 4, other: 5 }[rules.select(n)];
  return forms[index].replace("{n}", String(n));
}

export const PAGE_FORMS: ArabicForms = ["لا صفحات", "صفحة واحدة", "صفحتان", "{n} صفحات", "{n} صفحة", "{n} صفحة"];
export const FILE_FORMS: ArabicForms = ["لا ملفات", "ملف واحد", "ملفان", "{n} ملفات", "{n} ملفًا", "{n} ملف"];

export const pagesText = (n: number) => arabicPlural(n, PAGE_FORMS);
export const filesText = (n: number) => arabicPlural(n, FILE_FORMS);

/** Percentage with Latin digits and an Arabic-style percent sign: "37٪" / "4.2٪". */
export function percentText(value: number): string {
  const abs = Math.abs(value);
  const digits = abs < 10 ? 1 : 0;
  return `${abs.toLocaleString(AR_LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits })}٪`;
}

/** Accepts what an Arabic keyboard produces in a page-range field: Arabic-Indic digits, "،" and "؛" separators, and en/em dashes. */
export function normalizeRangeInput(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[،؛，]/g, ",")
    .replace(/[‐-―−]/g, "-")
    .replace(/[‎‏‪-‮⁦-⁩]/g, "");
}
