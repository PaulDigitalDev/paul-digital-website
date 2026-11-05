import { Bad, guard, num, plain, positive } from "./calcDefs.ts";
import type { CalcDef } from "./calcDefs.ts";
import { convertArea } from "./landUnits.ts";

/* Bangladesh and West Bengal helpers: plot area, pond excavation, and digit conversion between English and Bangla, Hindi or Arabic digits. */

/** Length units in feet. A hat (cubit) is taken as 1.5 feet (18 inches). */
export const LENGTH_FEET: Record<string, number> = { ft: 1, m: 3.280839895, hat: 1.5, yd: 3, in: 1 / 12 };
const LENGTH_OPTIONS = [
  { value: "ft", label: "Feet" },
  { value: "m", label: "Meters" },
  { value: "hat", label: "Hat / cubit (1.5 ft)" },
  { value: "yd", label: "Yards (gaj)" },
  { value: "in", label: "Inches" },
];

export function plotArea(length: number, width: number, unit: string) {
  const f = LENGTH_FEET[unit] ?? 1;
  const sqft = length * f * (width * f);
  return {
    sqft,
    sqm: convertArea(sqft, "sqft", "sqm"),
    katha: sqft / 720,
    decimal: sqft / 435.6,
    bigha: sqft / 14400,
    acre: sqft / 43560,
  };
}

export const plotAreaCalc: CalcDef = {
  id: "plot-area",
  fields: [
    { id: "length", label: "Length", kind: "number", default: "60", step: "any" },
    { id: "width", label: "Width", kind: "number", default: "40", step: "any" },
    { id: "unit", label: "Measured in", kind: "select", default: "ft", options: LENGTH_OPTIONS },
  ],
  compute: (v) =>
    guard(() => {
      const length = positive(num(v, "length", "Length"), "Length");
      const width = positive(num(v, "width", "Width"), "Width");
      const a = plotArea(length, width, v.unit);
      if (!Number.isFinite(a.sqft) || a.sqft > 1e10) throw new Bad("Those sizes are too large.");
      return {
        rows: [
          { label: "Area in square feet", value: plain(a.sqft, 2), big: true },
          { label: "Katha (720 sq ft)", value: plain(a.katha, 4) },
          { label: "Decimal / Shotangsho (435.6 sq ft)", value: plain(a.decimal, 4) },
          { label: "Bigha (20 katha)", value: plain(a.bigha, 4) },
          { label: "Acre", value: plain(a.acre, 5) },
          { label: "Square meters", value: plain(a.sqm, 2) },
        ],
        notes: ["Works for a rectangular plot. For other shapes, split the plot into rectangles and add the areas. Katha and bigha use the standard Bangladesh and West Bengal values, which can differ by district, so check the area in the official record."],
      };
    }),
};

/** Volume of a rectangular pit with sloping sides: top length and width, depth, side slope (horizontal run per 1 of depth). */
export function pondVolume(length: number, width: number, depth: number, slope: number) {
  return length * width * depth - slope * depth * depth * (length + width) + (4 / 3) * slope * slope * depth ** 3;
}

export const pondCalc: CalcDef = {
  id: "pond",
  fields: [
    { id: "length", label: "Pond length at the top", kind: "number", default: "100", step: "any" },
    { id: "width", label: "Pond width at the top", kind: "number", default: "60", step: "any" },
    { id: "depth", label: "Depth", kind: "number", default: "8", step: "any" },
    { id: "unit", label: "All measured in", kind: "select", default: "ft", options: LENGTH_OPTIONS.filter((o) => o.value !== "in") },
    { id: "slope", label: "Side slope (horizontal run for each 1 of depth, 0 for straight sides)", kind: "number", default: "0", step: "any" },
    { id: "rate", label: "Digging rate per 1,000 cubic feet (optional)", kind: "number", default: "0", step: "any", hint: "Leave 0 to skip the cost. Rates vary by place and soil, so enter the quote you were given." },
  ],
  compute: (v) =>
    guard(() => {
      const f = LENGTH_FEET[v.unit] ?? 1;
      const L = positive(num(v, "length", "Length"), "Length") * f;
      const W = positive(num(v, "width", "Width"), "Width") * f;
      const D = positive(num(v, "depth", "Depth"), "Depth") * f;
      const s = num(v, "slope", "Side slope");
      const rate = num(v, "rate", "Digging rate");
      if (s < 0 || s > 10) throw new Bad("Enter a side slope from 0 to 10.");
      if (rate < 0) throw new Bad("The digging rate cannot be negative.");
      if (L - 2 * s * D <= 0 || W - 2 * s * D <= 0) throw new Bad("The sloping sides meet before the bottom. Use a smaller slope or depth, or a larger pond.");
      const cft = pondVolume(L, W, D, s);
      if (!Number.isFinite(cft) || cft > 1e11) throw new Bad("Those sizes are too large.");
      const m3 = cft / 35.3146667;
      const surfaceSqft = L * W;
      return {
        rows: [
          { label: "Earth to dig out (cubic feet)", value: plain(cft, 1), big: true },
          { label: "Cubic meters", value: plain(m3, 2) },
          { label: "Water capacity when full (liters)", value: plain(m3 * 1000, 0) },
          { label: "Pond surface area, decimal", value: plain(surfaceSqft / 435.6, 3) },
          { label: "Pond surface area, katha", value: plain(surfaceSqft / 720, 3) },
          ...(rate > 0 ? [{ label: "Estimated digging cost", value: plain((cft / 1000) * rate, 0) }] : []),
        ],
        notes: ["Volume is for a rectangular pit. Real ponds have rounded corners and uneven bottoms, and dug soil swells when loosened, so allow extra when planning hauling or fill."],
      };
    }),
};

/* ---------- Digits ---------- */

export const DIGITS: Record<string, string> = { bn: "০১২৩৪৫৬৭৮৯", hi: "०१२३४५६७८९", ar: "٠١٢٣٤٥٦٧٨٩" };
const ALL_NON_ASCII = Object.values(DIGITS);

export function toScriptDigits(text: string, script: string): string {
  const d = DIGITS[script] ?? DIGITS.bn;
  return text.replace(/[0-9]/g, (c) => d[Number(c)]);
}

/** Replaces Bangla, Devanagari and Arabic-Indic digits with English digits. */
export function toEnglishDigits(text: string): string {
  let out = text;
  for (const set of ALL_NON_ASCII) out = out.replace(new RegExp(`[${set}]`, "g"), (c) => String(set.indexOf(c)));
  return out;
}

const SCRIPT_NAME: Record<string, string> = { bn: "Bangla", hi: "Hindi (Devanagari)", ar: "Arabic (Eastern)" };

export const digitConvert: CalcDef = {
  id: "digit-convert",
  fields: [
    { id: "text", label: "Type or paste numbers or text", kind: "textarea", default: "Total: 2026, 1,50,000 and 3.14", hint: "English or other digits. Letters and symbols stay as they are." },
    { id: "script", label: "Convert English digits to", kind: "select", default: "bn", options: Object.entries(SCRIPT_NAME).map(([value, label]) => ({ value, label })) },
  ],
  compute: (v) =>
    guard(() => {
      const text = v.text ?? "";
      if (text.trim() === "") throw new Bad("Enter some numbers or text to convert.");
      if (text.length > 20000) throw new Bad("Use 20,000 characters or fewer.");
      const english = toEnglishDigits(text);
      const script = DIGITS[v.script] ? v.script : "bn";
      return {
        rows: [
          { label: `In ${SCRIPT_NAME[script]} digits`, value: toScriptDigits(english, script), big: true },
          { label: "In English digits", value: english },
        ],
        notes: ["Only the digits 0 to 9 are changed. Commas, points, letters and symbols stay the same."],
      };
    }),
};

export const regionalDefs: Record<string, CalcDef> = { "plot-area": plotAreaCalc, pond: pondCalc, "digit-convert": digitConvert };
