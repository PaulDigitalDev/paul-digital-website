/* International unit data. Linear units store their size in a base unit (metre, gram, litre, square metre, metre per second, byte, second, pascal, joule). Temperature is converted through kelvin. */

export type UnitGroup = "length" | "mass" | "volume" | "temperature" | "area" | "speed" | "data" | "time" | "pressure" | "energy";

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
  { id: "sqcm", name: "Square centimeter (cm²)", symbol: "cm²", group: "area", factor: 0.0001 },
  { id: "sqm", name: "Square meter (m²)", symbol: "m²", group: "area", factor: 1 },
  { id: "sqkm", name: "Square kilometer (km²)", symbol: "km²", group: "area", factor: 1e6 },
  { id: "sqin", name: "Square inch (in²)", symbol: "in²", group: "area", factor: 0.00064516 },
  { id: "sqft", name: "Square foot (ft²)", symbol: "ft²", group: "area", factor: 0.09290304 },
  { id: "sqyd", name: "Square yard (yd²)", symbol: "yd²", group: "area", factor: 0.83612736 },
  { id: "sqmi", name: "Square mile (mi²)", symbol: "mi²", group: "area", factor: 2589988.110336 },
  { id: "acre", name: "Acre", symbol: "acres", group: "area", factor: 4046.8564224 },
  { id: "ha", name: "Hectare (ha)", symbol: "ha", group: "area", factor: 10000 },
  { id: "ms", name: "Meters per second (m/s)", symbol: "m/s", group: "speed", factor: 1 },
  { id: "kmh", name: "Kilometers per hour (km/h)", symbol: "km/h", group: "speed", factor: 1 / 3.6 },
  { id: "mph", name: "Miles per hour (mph)", symbol: "mph", group: "speed", factor: 0.44704 },
  { id: "knot", name: "Knots (kn)", symbol: "kn", group: "speed", factor: 1852 / 3600 },
  { id: "fts", name: "Feet per second (ft/s)", symbol: "ft/s", group: "speed", factor: 0.3048 },
  { id: "bit", name: "Bit", symbol: "bits", group: "data", factor: 0.125 },
  { id: "byte", name: "Byte (B)", symbol: "B", group: "data", factor: 1 },
  { id: "kb", name: "Kilobyte (KB)", symbol: "KB", group: "data", factor: 1e3 },
  { id: "mb", name: "Megabyte (MB)", symbol: "MB", group: "data", factor: 1e6 },
  { id: "gb", name: "Gigabyte (GB)", symbol: "GB", group: "data", factor: 1e9 },
  { id: "tb", name: "Terabyte (TB)", symbol: "TB", group: "data", factor: 1e12 },
  { id: "msec", name: "Millisecond (ms)", symbol: "ms", group: "time", factor: 0.001 },
  { id: "sec", name: "Second (s)", symbol: "s", group: "time", factor: 1 },
  { id: "min", name: "Minute (min)", symbol: "min", group: "time", factor: 60 },
  { id: "hr", name: "Hour (h)", symbol: "h", group: "time", factor: 3600 },
  { id: "day", name: "Day", symbol: "days", group: "time", factor: 86400 },
  { id: "week", name: "Week", symbol: "weeks", group: "time", factor: 604800 },
  { id: "pa", name: "Pascal (Pa)", symbol: "Pa", group: "pressure", factor: 1 },
  { id: "kpa", name: "Kilopascal (kPa)", symbol: "kPa", group: "pressure", factor: 1000 },
  { id: "bar", name: "Bar", symbol: "bar", group: "pressure", factor: 1e5 },
  { id: "psi", name: "Pounds per square inch (psi)", symbol: "psi", group: "pressure", factor: 6894.757293168 },
  { id: "atm", name: "Atmosphere (atm)", symbol: "atm", group: "pressure", factor: 101325 },
  { id: "mmhg", name: "Millimeter of mercury (mmHg)", symbol: "mmHg", group: "pressure", factor: 133.322387415 },
  { id: "j", name: "Joule (J)", symbol: "J", group: "energy", factor: 1 },
  { id: "kj", name: "Kilojoule (kJ)", symbol: "kJ", group: "energy", factor: 1000 },
  { id: "cal", name: "Calorie (cal)", symbol: "cal", group: "energy", factor: 4.184 },
  { id: "kcal", name: "Kilocalorie (kcal)", symbol: "kcal", group: "energy", factor: 4184 },
  { id: "wh", name: "Watt-hour (Wh)", symbol: "Wh", group: "energy", factor: 3600 },
  { id: "kwh", name: "Kilowatt-hour (kWh)", symbol: "kWh", group: "energy", factor: 3.6e6 },
  { id: "btu", name: "British thermal unit (BTU)", symbol: "BTU", group: "energy", factor: 1055.05585262 },
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
