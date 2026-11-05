/* Land area units. Every unit is stored as square feet, so any unit converts to any other. Values for traditional units are the standard ones; local practice can differ. */

export type UnitId =
  | "sqft" | "sqm" | "sqyd" | "acre" | "hectare"
  | "decimal" | "ojutangsho" | "katha" | "chhatak" | "bigha"
  | "gunta" | "kanal" | "marla" | "ground"
  | "ropani" | "aana" | "paisa" | "dam" | "np-bigha" | "np-kattha" | "np-dhur";

export interface LandUnit {
  id: UnitId;
  name: string;
  bn: string;
  /** Square feet in one of this unit. */
  sqft: number;
  note?: string;
}

export const SQFT_PER_SQM = 1 / 0.09290304;

export const LAND_UNITS: LandUnit[] = [
  { id: "sqft", name: "Square foot (sq ft)", bn: "বর্গফুট", sqft: 1 },
  { id: "sqm", name: "Square metre (sq m)", bn: "বর্গমিটার", sqft: SQFT_PER_SQM },
  { id: "sqyd", name: "Square yard (gaj)", bn: "বর্গগজ", sqft: 9 },
  { id: "acre", name: "Acre", bn: "একর", sqft: 43560 },
  { id: "hectare", name: "Hectare", bn: "হেক্টর", sqft: 10000 * SQFT_PER_SQM },
  { id: "decimal", name: "Decimal / Cent / Shotangsho", bn: "শতাংশ", sqft: 435.6, note: "1/100 acre" },
  { id: "ojutangsho", name: "Ojutangsho", bn: "অযুতাংশ", sqft: 4.356, note: "1/100 decimal" },
  { id: "katha", name: "Katha / Cottah (Bangladesh, West Bengal)", bn: "কাঠা", sqft: 720 },
  { id: "chhatak", name: "Chhatak (Bangladesh, West Bengal)", bn: "ছটাক", sqft: 45, note: "1/16 katha" },
  { id: "bigha", name: "Bigha (Bangladesh, West Bengal)", bn: "বিঘা", sqft: 14400, note: "20 katha" },
  { id: "gunta", name: "Gunta (Karnataka, Andhra Pradesh, Telangana)", bn: "গুন্টা", sqft: 1089 },
  { id: "kanal", name: "Kanal (Punjab, Haryana)", bn: "কানাল", sqft: 5445, note: "20 marla" },
  { id: "marla", name: "Marla (Punjab, Haryana)", bn: "মারলা", sqft: 272.25 },
  { id: "ground", name: "Ground (Tamil Nadu)", bn: "গ্রাউন্ড", sqft: 2400 },
  { id: "ropani", name: "Ropani (Nepal hills)", bn: "রোপনি", sqft: 5476, note: "16 aana" },
  { id: "aana", name: "Aana (Nepal hills)", bn: "আনা", sqft: 342.25, note: "4 paisa" },
  { id: "paisa", name: "Paisa (Nepal hills)", bn: "পাইসা", sqft: 85.5625, note: "4 dam" },
  { id: "dam", name: "Dam (Nepal hills)", bn: "দাম", sqft: 21.390625 },
  { id: "np-bigha", name: "Bigha (Nepal Terai)", bn: "বিঘা (নেপাল)", sqft: 72900, note: "20 kattha" },
  { id: "np-kattha", name: "Kattha (Nepal Terai)", bn: "কাঠা (নেপাল)", sqft: 3645, note: "20 dhur" },
  { id: "np-dhur", name: "Dhur (Nepal Terai)", bn: "ধুর (নেপাল)", sqft: 182.25 },
];

export const unitById = new Map(LAND_UNITS.map((u) => [u.id, u]));

export function convertArea(value: number, from: UnitId, to: UnitId): number {
  return (value * unitById.get(from)!.sqft) / unitById.get(to)!.sqft;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Readable number: Indian digit grouping, no long tails. Bangla digits when `bangla` is set. */
export function formatArea(n: number, bangla = false): string {
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 4 : abs >= 1 ? 6 : 8;
  const text = n.toLocaleString("en-IN", { maximumFractionDigits: digits });
  return bangla ? text.replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : text;
}

/** Parses a typed number, accepting Bangla digits and commas. */
export function parseNumber(raw: string): number | null {
  const ascii = raw.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d))).replace(/[,\s]/g, "");
  if (ascii === "" || !/^\d*\.?\d*$/.test(ascii) || ascii === ".") return null;
  const n = Number(ascii);
  return Number.isFinite(n) ? n : null;
}
