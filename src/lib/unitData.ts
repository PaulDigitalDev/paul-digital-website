/* International unit data. Linear units store their size in a base unit (metre, gram, litre). Temperature is converted through kelvin. */

export type UnitGroup = "length" | "mass" | "volume" | "temperature";

export interface GlobalUnit {
  id: string;
  name: string;
  /** Short symbol used in results. */
  symbol: string;
  group: UnitGroup;
  /** Size in the base unit (metre, gram, litre). Unused for temperature. */
  factor: number;
}

export const UNITS: GlobalUnit[] = [
  { id: "mm", name: "Millimetre (mm)", symbol: "mm", group: "length", factor: 0.001 },
  { id: "cm", name: "Centimetre (cm)", symbol: "cm", group: "length", factor: 0.01 },
  { id: "m", name: "Metre (m)", symbol: "m", group: "length", factor: 1 },
  { id: "km", name: "Kilometre (km)", symbol: "km", group: "length", factor: 1000 },
  { id: "in", name: "Inch (in)", symbol: "in", group: "length", factor: 0.0254 },
  { id: "ft", name: "Foot (ft)", symbol: "ft", group: "length", factor: 0.3048 },
  { id: "yd", name: "Yard (yd)", symbol: "yd", group: "length", factor: 0.9144 },
  { id: "mi", name: "Mile (mi)", symbol: "mi", group: "length", factor: 1609.344 },
  { id: "g", name: "Gram (g)", symbol: "g", group: "mass", factor: 1 },
  { id: "kg", name: "Kilogram (kg)", symbol: "kg", group: "mass", factor: 1000 },
  { id: "mg", name: "Milligram (mg)", symbol: "mg", group: "mass", factor: 0.001 },
  { id: "oz", name: "Ounce (oz)", symbol: "oz", group: "mass", factor: 28.349523125 },
  { id: "lb", name: "Pound (lb)", symbol: "lb", group: "mass", factor: 453.59237 },
  { id: "st", name: "Stone (st)", symbol: "st", group: "mass", factor: 6350.29318 },
  { id: "tonne", name: "Metric tonne (t)", symbol: "t", group: "mass", factor: 1000000 },
  { id: "ml", name: "Millilitre (ml)", symbol: "ml", group: "volume", factor: 0.001 },
  { id: "l", name: "Litre (L)", symbol: "L", group: "volume", factor: 1 },
  { id: "floz", name: "US fluid ounce (fl oz)", symbol: "fl oz", group: "volume", factor: 0.0295735295625 },
  { id: "cup", name: "US cup", symbol: "cups", group: "volume", factor: 0.2365882365 },
  { id: "gal", name: "US gallon (gal)", symbol: "US gal", group: "volume", factor: 3.785411784 },
  { id: "ukgal", name: "UK (imperial) gallon", symbol: "UK gal", group: "volume", factor: 4.54609 },
  { id: "c", name: "Celsius (°C)", symbol: "°C", group: "temperature", factor: 1 },
  { id: "f", name: "Fahrenheit (°F)", symbol: "°F", group: "temperature", factor: 1 },
  { id: "k", name: "Kelvin (K)", symbol: "K", group: "temperature", factor: 1 },
];

export const unitById = new Map(UNITS.map((u) => [u.id, u]));
export const unitsOf = (group: UnitGroup) => UNITS.filter((u) => u.group === group);

const toKelvin = (v: number, id: string) => (id === "c" ? v + 273.15 : id === "f" ? ((v - 32) * 5) / 9 + 273.15 : v);
const fromKelvin = (k: number, id: string) => (id === "c" ? k - 273.15 : id === "f" ? ((k - 273.15) * 9) / 5 + 32 : k);

export function convertUnit(value: number, from: string, to: string): number {
  const a = unitById.get(from)!;
  const b = unitById.get(to)!;
  if (a.group === "temperature") return fromKelvin(toKelvin(value, from), to);
  return (value * a.factor) / b.factor;
}

/** International digit grouping, with enough decimals for small results. */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  const digits = abs >= 1000 ? 3 : abs >= 1 ? 5 : 8;
  const r = Number(n.toFixed(digits + 2));
  return r.toLocaleString("en-US", { maximumFractionDigits: digits });
}

/** Parses a typed number. Negative numbers are allowed (for temperature). */
export function parseSigned(raw: string): number | null {
  const s = raw.replace(/[,\s]/g, "");
  if (!/^-?\d*\.?\d*$/.test(s) || s === "" || s === "-" || s === "." || s === "-.") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
