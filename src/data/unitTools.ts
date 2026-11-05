import type { Faq } from "./formatTools";
import { convertUnit, formatNumber, unitsOf, unitById } from "../lib/unitData.ts";
import type { UnitGroup } from "../lib/unitData.ts";

export interface UnitTool {
  slug: string;
  group: UnitGroup;
  units: string[];
  from: string;
  to: string;
  value: string;
  h1: string;
  title: string;
  description: string;
  summary: string;
  intro: string;
  keywords: string[];
  steps: string[];
  explanation: string[];
  formula: string[];
  worked: () => string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

/** Words for each unit: title form, plural in sentences, and singular. */
const W: Record<string, { t: string; p: string; s: string }> = {
  mm: { t: "MM", p: "millimeters", s: "millimeter" },
  cm: { t: "CM", p: "centimeters", s: "centimeter" },
  m: { t: "Meters", p: "meters", s: "meter" },
  km: { t: "KM", p: "kilometers", s: "kilometer" },
  in: { t: "Inches", p: "inches", s: "inch" },
  ft: { t: "Feet", p: "feet", s: "foot" },
  yd: { t: "Yards", p: "yards", s: "yard" },
  mi: { t: "Miles", p: "miles", s: "mile" },
  g: { t: "Grams", p: "grams", s: "gram" },
  kg: { t: "KG", p: "kilograms", s: "kilogram" },
  oz: { t: "Ounces", p: "ounces", s: "ounce" },
  lb: { t: "Pounds", p: "pounds", s: "pound" },
  st: { t: "Stone", p: "stone", s: "stone" },
  ml: { t: "ML", p: "milliliters", s: "milliliter" },
  l: { t: "Liters", p: "liters", s: "liter" },
  gal: { t: "Gallons", p: "US gallons", s: "US gallon" },
  cup: { t: "Cups", p: "US cups", s: "US cup" },
  floz: { t: "Fluid Ounces", p: "US fluid ounces", s: "US fluid ounce" },
  c: { t: "Celsius", p: "degrees Celsius", s: "degree Celsius" },
  f: { t: "Fahrenheit", p: "degrees Fahrenheit", s: "degree Fahrenheit" },
};

const PRIVACY: Faq = { q: "Are my numbers saved or sent anywhere?", a: "No. The conversion runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const STEPS = ["Type the amount.", "Check the From and To units, or change them.", "Read the result. The table shows the same amount in other units."];

interface Spec {
  slug: string;
  from: string;
  to: string;
  value?: string;
  tip: string;
  related: string[];
}

const SPECS: Spec[] = [
  { slug: "cm-to-inches", from: "cm", to: "in", value: "170", tip: "Screen sizes, clothing and furniture are often sold in inches, while many countries measure in centimeters.", related: ["inches-to-cm", "feet-to-cm", "mm-to-inches", "cm-to-feet"] },
  { slug: "inches-to-cm", from: "in", to: "cm", value: "10", tip: "Multiply by 2.54 for a quick result: 10 inches is 25.4 cm.", related: ["cm-to-inches", "inches-to-mm", "feet-to-cm", "mm-to-inches"] },
  { slug: "feet-to-cm", from: "ft", to: "cm", value: "6", tip: "Height is often given in feet and inches. Convert the feet here and add the inches separately (1 inch is 2.54 cm).", related: ["cm-to-feet", "inches-to-cm", "feet-to-meters", "cm-to-inches"] },
  { slug: "cm-to-feet", from: "cm", to: "ft", value: "180", tip: "To show feet and inches, take the whole number of feet and multiply the decimal part by 12 for the inches.", related: ["feet-to-cm", "cm-to-inches", "meters-to-feet", "inches-to-cm"] },
  { slug: "mm-to-inches", from: "mm", to: "in", value: "25.4", tip: "25.4 mm is exactly one inch, so divide millimeters by 25.4.", related: ["inches-to-mm", "cm-to-inches", "inches-to-cm", "feet-to-cm"] },
  { slug: "inches-to-mm", from: "in", to: "mm", value: "1", tip: "One inch is defined as exactly 25.4 mm, so this conversion is exact.", related: ["mm-to-inches", "inches-to-cm", "cm-to-inches", "feet-to-cm"] },
  { slug: "miles-to-km", from: "mi", to: "km", value: "10", tip: "For a quick mental estimate, multiply miles by 1.6.", related: ["km-to-miles", "meters-to-feet", "yards-to-meters", "feet-to-meters"] },
  { slug: "km-to-miles", from: "km", to: "mi", value: "10", tip: "For a quick mental estimate, multiply kilometers by 0.62.", related: ["miles-to-km", "meters-to-feet", "yards-to-meters", "feet-to-meters"] },
  { slug: "meters-to-feet", from: "m", to: "ft", value: "100", tip: "A meter is a little over 3 feet, so multiply by 3.28 for a close estimate.", related: ["feet-to-meters", "yards-to-meters", "cm-to-feet", "miles-to-km"] },
  { slug: "feet-to-meters", from: "ft", to: "m", value: "100", tip: "One foot is exactly 0.3048 meters.", related: ["meters-to-feet", "feet-to-cm", "yards-to-meters", "miles-to-km"] },
  { slug: "yards-to-meters", from: "yd", to: "m", value: "100", tip: "A yard is just under a meter (0.9144 m), so the meter figure is a little smaller than the yard figure.", related: ["meters-to-feet", "feet-to-meters", "miles-to-km", "km-to-miles"] },
  { slug: "kg-to-lbs", from: "kg", to: "lb", value: "70", tip: "Multiply kilograms by 2.2 for a quick estimate of pounds.", related: ["lbs-to-kg", "kg-to-stone", "stone-to-kg", "grams-to-oz"] },
  { slug: "lbs-to-kg", from: "lb", to: "kg", value: "150", tip: "Divide pounds by 2.2 for a quick estimate of kilograms.", related: ["kg-to-lbs", "stone-to-kg", "kg-to-stone", "oz-to-grams"] },
  { slug: "oz-to-grams", from: "oz", to: "g", value: "8", tip: "This is the ounce used for food and mail (avoirdupois). Gold and silver use troy ounces, which are heavier.", related: ["grams-to-oz", "lbs-to-kg", "kg-to-lbs", "ml-to-oz"] },
  { slug: "grams-to-oz", from: "g", to: "oz", value: "100", tip: "Divide grams by 28.35 for ounces. Gold and silver use troy ounces, which are heavier.", related: ["oz-to-grams", "kg-to-lbs", "lbs-to-kg", "ml-to-oz"] },
  { slug: "stone-to-kg", from: "st", to: "kg", value: "11", tip: "Stone is used for body weight in the UK and Ireland. One stone is 14 pounds.", related: ["kg-to-stone", "lbs-to-kg", "kg-to-lbs", "grams-to-oz"] },
  { slug: "kg-to-stone", from: "kg", to: "st", value: "70", tip: "Stone is used for body weight in the UK and Ireland. The decimal part times 14 gives the extra pounds.", related: ["stone-to-kg", "kg-to-lbs", "lbs-to-kg", "oz-to-grams"] },
  { slug: "celsius-to-fahrenheit", from: "c", to: "f", value: "25", tip: "Multiply by 1.8 and add 32. Water freezes at 0°C (32°F) and boils at 100°C (212°F) at sea level.", related: ["fahrenheit-to-celsius", "cups-to-ml", "liters-to-gallons", "kg-to-lbs"] },
  { slug: "fahrenheit-to-celsius", from: "f", to: "c", value: "98.6", tip: "Subtract 32 and divide by 1.8. Normal body temperature is about 98.6°F (37°C).", related: ["celsius-to-fahrenheit", "cups-to-ml", "liters-to-gallons", "lbs-to-kg"] },
  { slug: "liters-to-gallons", from: "l", to: "gal", value: "10", tip: "This page uses the US gallon (3.785 L). The UK gallon is larger (4.546 L), so UK fuel figures differ.", related: ["gallons-to-liters", "ml-to-oz", "cups-to-ml", "miles-to-km"] },
  { slug: "gallons-to-liters", from: "gal", to: "l", value: "1", tip: "This page uses the US gallon (3.785 L). The UK gallon is larger (4.546 L).", related: ["liters-to-gallons", "ml-to-oz", "cups-to-ml", "miles-to-km"] },
  { slug: "ml-to-oz", from: "ml", to: "floz", value: "250", tip: "This uses the US fluid ounce (29.57 ml). The UK fluid ounce is slightly smaller (28.41 ml).", related: ["cups-to-ml", "liters-to-gallons", "gallons-to-liters", "grams-to-oz"] },
  { slug: "cups-to-ml", from: "cup", to: "ml", value: "1", tip: "This uses the US cup (about 237 ml). Metric cups used in Australia and the UK are 250 ml.", related: ["ml-to-oz", "liters-to-gallons", "gallons-to-liters", "oz-to-grams"] },
];

const GROUP_NAME: Record<UnitGroup, string> = { length: "length", mass: "weight", volume: "volume", temperature: "temperature" };

const num = (n: number) => formatNumber(n);

function build(s: Spec): UnitTool {
  const a = unitById.get(s.from)!;
  const b = unitById.get(s.to)!;
  const wa = W[s.from];
  const wb = W[s.to];
  const temp = a.group === "temperature";
  const one = convertUnit(1, s.from, s.to);
  const back = convertUnit(1, s.to, s.from);
  const sample = [1, 5, 10, 50, 100];
  const h1 = `${wa.t} to ${wb.t}`;
  const keyword = `${wa.p} to ${wb.p}`;
  const fact = temp ? "" : `1 ${wa.s} = ${num(one)} ${wb.p}`;
  const formula = temp
    ? s.from === "c"
      ? ["°F = °C × 9/5 + 32", "°C = (°F − 32) × 5/9", "K = °C + 273.15"]
      : ["°C = (°F − 32) × 5/9", "°F = °C × 9/5 + 32", "K = (°F − 32) × 5/9 + 273.15"]
    : [`${wb.p} = ${wa.p} × ${num(one)}`, `${wa.p} = ${wb.p} × ${num(back)}`];
  const rawTitle = temp ? `${h1} Converter: Temperature Formula and Examples` : `${h1} Converter: ${fact}`;
  const title = rawTitle.length > 70 ? `${h1} Converter: Formula and Examples` : rawTitle;
  return {
    slug: s.slug,
    group: a.group,
    units: unitsOf(a.group).map((u) => u.id),
    from: s.from,
    to: s.to,
    value: s.value ?? "1",
    h1: `${h1} Converter`,
    title,
    description: temp
      ? `Convert ${wa.p} to ${wb.p} instantly. Formula and worked examples. Free, private, runs in your browser.`
      : `Convert ${wa.p} to ${wb.p}: ${fact}. Instant converter with a table of other units and examples. Free, private, runs in your browser.`,
    summary: `Convert ${wa.p} to ${wb.p}.`,
    intro: `Type an amount in ${wa.p} to see it in ${wb.p} and other ${GROUP_NAME[a.group]} units.`,
    keywords: [keyword, `${wa.p} to ${wb.p} converter`, `how many ${wb.p} in a ${wa.s}`, `${h1.toLowerCase()} calculator`, `convert ${wa.p} to ${wb.p}`],
    steps: STEPS,
    explanation: temp
      ? [
          `To convert ${wa.p} to ${wb.p}, use the formula ${formula[0]}. For example, ${num(Number(s.value ?? 1))} ${a.symbol} is ${num(convertUnit(Number(s.value ?? 1), s.from, s.to))} ${b.symbol}.`,
          `Unlike most units, temperature scales start at different zero points, so a simple multiplication is not enough. Water freezes at 0°C (32°F) and boils at 100°C (212°F) at sea level, and the two scales meet at −40.`,
        ]
      : [
          `${fact}, so to convert ${wa.p} to ${wb.p}, multiply by ${num(one)}. To go the other way, ${num(1)} ${wb.s} = ${num(back)} ${wa.p}.`,
          s.tip,
        ],
    formula,
    worked: () => sample.map((v) => `${num(v)} ${a.symbol} = ${num(convertUnit(v, s.from, s.to))} ${b.symbol}`),
    tips: [s.tip, "Use Swap units to convert the other way.", "Results are rounded for display. The exact factor is used in the calculation."],
    faqs: [
      temp
        ? { q: `How do I convert ${wa.p} to ${wb.p}?`, a: `Use ${formula[0]}.` }
        : { q: `How many ${wb.p} are in 1 ${wa.s}?`, a: `${fact}.` },
      temp
        ? { q: `What is 0 ${a.symbol} in ${b.symbol}?`, a: `0 ${a.symbol} is ${num(convertUnit(0, s.from, s.to))} ${b.symbol}.` }
        : { q: `How many ${wa.p} are in 1 ${wb.s}?`, a: `1 ${wb.s} = ${num(back)} ${wa.p}.` },
      { q: `How do I convert ${wa.p} to ${wb.p}?`, a: temp ? `Use ${formula[0]}.` : `Multiply the number of ${wa.p} by ${num(one)}.` },
      PRIVACY,
    ].filter((f, i, arr) => arr.findIndex((g) => g.q === f.q) === i),
    related: s.related,
  };
}

export const unitTools: UnitTool[] = SPECS.map(build);
export const unitToolBySlug = new Map(unitTools.map((t) => [t.slug, t]));
