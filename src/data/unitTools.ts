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
  sqcm: { t: "Square CM", p: "square centimeters", s: "square centimeter" },
  sqm: { t: "Square Meters", p: "square meters", s: "square meter" },
  sqkm: { t: "Square KM", p: "square kilometers", s: "square kilometer" },
  sqft: { t: "Square Feet", p: "square feet", s: "square foot" },
  sqmi: { t: "Square Miles", p: "square miles", s: "square mile" },
  acre: { t: "Acres", p: "acres", s: "acre" },
  ha: { t: "Hectares", p: "hectares", s: "hectare" },
  ms: { t: "Meters per Second", p: "meters per second", s: "meter per second" },
  kmh: { t: "KMH", p: "kilometers per hour", s: "kilometer per hour" },
  mph: { t: "MPH", p: "miles per hour", s: "mile per hour" },
  knot: { t: "Knots", p: "knots", s: "knot" },
  kb: { t: "KB", p: "kilobytes", s: "kilobyte" },
  mb: { t: "MB", p: "megabytes", s: "megabyte" },
  gb: { t: "GB", p: "gigabytes", s: "gigabyte" },
  tb: { t: "TB", p: "terabytes", s: "terabyte" },
  min: { t: "Minutes", p: "minutes", s: "minute" },
  hr: { t: "Hours", p: "hours", s: "hour" },
  day: { t: "Days", p: "days", s: "day" },
  bar: { t: "Bar", p: "bar", s: "bar" },
  psi: { t: "PSI", p: "psi", s: "psi" },
  kpa: { t: "kPa", p: "kilopascals", s: "kilopascal" },
  j: { t: "Joules", p: "joules", s: "joule" },
  kj: { t: "kJ", p: "kilojoules", s: "kilojoule" },
  cal: { t: "Calories", p: "calories", s: "calorie" },
  kcal: { t: "Kcal", p: "kilocalories", s: "kilocalorie" },
  kwh: { t: "kWh", p: "kilowatt-hours", s: "kilowatt-hour" },
  btu: { t: "BTU", p: "BTU", s: "BTU" },
  mg: { t: "MG", p: "milligrams", s: "milligram" },
  tonne: { t: "Tonnes", p: "metric tonnes", s: "metric tonne" },
  tsp: { t: "Teaspoons", p: "US teaspoons", s: "US teaspoon" },
  tbsp: { t: "Tablespoons", p: "US tablespoons", s: "US tablespoon" },
  pint: { t: "Pints", p: "US pints", s: "US pint" },
  quart: { t: "Quarts", p: "US quarts", s: "US quart" },
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
  { slug: "square-feet-to-square-meters", from: "sqft", to: "sqm", value: "1000", tip: "A square meter is about 10.76 square feet, so divide square feet by 10.764 for a quick estimate.", related: ["square-meters-to-square-feet", "acres-to-square-feet", "acres-to-hectares", "cm-to-feet"] },
  { slug: "square-meters-to-square-feet", from: "sqm", to: "sqft", value: "100", tip: "Multiply square meters by 10.764 for square feet. Property listings in some countries use one unit and some the other.", related: ["square-feet-to-square-meters", "acres-to-square-feet", "hectares-to-acres", "meters-to-feet"] },
  { slug: "acres-to-hectares", from: "acre", to: "ha", value: "10", tip: "One hectare is about 2.47 acres, so an acre is roughly 0.4 hectare.", related: ["hectares-to-acres", "acres-to-square-feet", "square-km-to-square-miles", "square-feet-to-square-meters"] },
  { slug: "hectares-to-acres", from: "ha", to: "acre", value: "10", tip: "Multiply hectares by 2.471 to get acres.", related: ["acres-to-hectares", "acres-to-square-feet", "square-km-to-square-miles", "square-meters-to-square-feet"] },
  { slug: "acres-to-square-feet", from: "acre", to: "sqft", value: "1", tip: "An acre is exactly 43,560 square feet, which is why land sold in the US is often quoted both ways.", related: ["square-feet-to-square-meters", "acres-to-hectares", "hectares-to-acres", "square-km-to-square-miles"] },
  { slug: "square-km-to-square-miles", from: "sqkm", to: "sqmi", value: "100", tip: "One square mile is about 2.59 square kilometers.", related: ["acres-to-hectares", "hectares-to-acres", "miles-to-km", "km-to-miles"] },
  { slug: "mph-to-kmh", from: "mph", to: "kmh", value: "60", tip: "For a quick estimate, multiply mph by 1.6.", related: ["kmh-to-mph", "knots-to-mph", "meters-per-second-to-kmh", "miles-to-km"] },
  { slug: "kmh-to-mph", from: "kmh", to: "mph", value: "100", tip: "For a quick estimate, multiply km/h by 0.62.", related: ["mph-to-kmh", "knots-to-mph", "meters-per-second-to-kmh", "km-to-miles"] },
  { slug: "knots-to-mph", from: "knot", to: "mph", value: "10", tip: "A knot is one nautical mile per hour (1.852 km/h), used at sea and in aviation.", related: ["mph-to-kmh", "kmh-to-mph", "meters-per-second-to-kmh", "miles-to-km"] },
  { slug: "meters-per-second-to-kmh", from: "ms", to: "kmh", value: "10", tip: "Multiply meters per second by 3.6 to get km/h.", related: ["kmh-to-mph", "mph-to-kmh", "knots-to-mph", "meters-to-feet"] },
  { slug: "mb-to-gb", from: "mb", to: "gb", value: "1000", tip: "This uses the decimal standard (1 GB = 1,000 MB), which storage makers and mobile networks use. Some operating systems count 1,024 instead.", related: ["gb-to-mb", "gb-to-tb", "kb-to-mb", "hours-to-minutes"] },
  { slug: "gb-to-mb", from: "gb", to: "mb", value: "1", tip: "This uses the decimal standard (1 GB = 1,000 MB). Some operating systems count 1,024 instead, so file sizes can differ slightly.", related: ["mb-to-gb", "gb-to-tb", "kb-to-mb", "minutes-to-hours"] },
  { slug: "gb-to-tb", from: "gb", to: "tb", value: "500", tip: "This uses the decimal standard (1 TB = 1,000 GB), which drive makers use.", related: ["mb-to-gb", "gb-to-mb", "kb-to-mb", "days-to-hours"] },
  { slug: "kb-to-mb", from: "kb", to: "mb", value: "2048", tip: "This uses the decimal standard (1 MB = 1,000 KB). Some systems count 1,024.", related: ["mb-to-gb", "gb-to-mb", "gb-to-tb", "minutes-to-hours"] },
  { slug: "hours-to-minutes", from: "hr", to: "min", value: "2.5", tip: "Multiply hours by 60. For 2 hours 30 minutes, enter 2.5.", related: ["minutes-to-hours", "days-to-hours", "gb-to-mb", "mph-to-kmh"] },
  { slug: "minutes-to-hours", from: "min", to: "hr", value: "90", tip: "Divide minutes by 60. The decimal part times 60 gives the leftover minutes.", related: ["hours-to-minutes", "days-to-hours", "mb-to-gb", "kmh-to-mph"] },
  { slug: "days-to-hours", from: "day", to: "hr", value: "7", tip: "A day is 24 hours, so a week is 168 hours.", related: ["hours-to-minutes", "minutes-to-hours", "gb-to-tb", "mph-to-kmh"] },
  { slug: "psi-to-bar", from: "psi", to: "bar", value: "32", tip: "Tire pressure is often quoted in psi or bar. 32 psi is about 2.2 bar.", related: ["bar-to-psi", "kpa-to-psi", "kcal-to-kj", "celsius-to-fahrenheit"] },
  { slug: "bar-to-psi", from: "bar", to: "psi", value: "2", tip: "Multiply bar by 14.504 for psi.", related: ["psi-to-bar", "kpa-to-psi", "kj-to-kcal", "fahrenheit-to-celsius"] },
  { slug: "kpa-to-psi", from: "kpa", to: "psi", value: "220", tip: "Many cars list tire pressure in kPa. Divide by 6.895 for psi.", related: ["psi-to-bar", "bar-to-psi", "kcal-to-kj", "celsius-to-fahrenheit"] },
  { slug: "kcal-to-kj", from: "kcal", to: "kj", value: "100", tip: "Food labels in Europe and Australia show kJ as well as kcal. One kcal is 4.184 kJ.", related: ["kj-to-kcal", "calories-to-joules", "btu-to-kwh", "psi-to-bar"] },
  { slug: "kj-to-kcal", from: "kj", to: "kcal", value: "1000", tip: "Divide kilojoules by 4.184 for kilocalories (the \"Calories\" on food labels).", related: ["kcal-to-kj", "calories-to-joules", "btu-to-kwh", "bar-to-psi"] },
  { slug: "calories-to-joules", from: "cal", to: "j", value: "1", tip: "A food Calorie is a kilocalorie (1,000 small calories). Use the Kcal pages for food energy.", related: ["kcal-to-kj", "kj-to-kcal", "btu-to-kwh", "psi-to-bar"] },
  { slug: "btu-to-kwh", from: "btu", to: "kwh", value: "10000", tip: "Heating and cooling equipment is rated in BTU, while electricity is billed in kWh.", related: ["kcal-to-kj", "kj-to-kcal", "calories-to-joules", "bar-to-psi"] },
  { slug: "km-to-meters", from: "km", to: "m", value: "5", tip: "One kilometer is exactly 1,000 meters, so multiply kilometers by 1,000.", related: ["meters-to-km", "meters-to-cm", "cm-to-meters", "cm-to-inches"] },
  { slug: "meters-to-km", from: "m", to: "km", value: "2500", tip: "Divide meters by 1,000 to get kilometers.", related: ["km-to-meters", "meters-to-cm", "cm-to-meters", "cm-to-inches"] },
  { slug: "meters-to-cm", from: "m", to: "cm", value: "1.75", tip: "One meter is exactly 100 centimeters, so move the decimal point two places to the right.", related: ["cm-to-meters", "km-to-meters", "meters-to-km", "cm-to-inches"] },
  { slug: "cm-to-meters", from: "cm", to: "m", value: "180", tip: "Divide centimeters by 100 to get meters.", related: ["meters-to-cm", "km-to-meters", "meters-to-km", "cm-to-inches"] },
  { slug: "cm-to-mm", from: "cm", to: "mm", value: "12", tip: "One centimeter is exactly 10 millimeters, so multiply by 10.", related: ["mm-to-cm", "km-to-meters", "meters-to-km", "cm-to-inches"] },
  { slug: "mm-to-cm", from: "mm", to: "cm", value: "85", tip: "Divide millimeters by 10 to get centimeters.", related: ["cm-to-mm", "km-to-meters", "meters-to-km", "cm-to-inches"] },
  { slug: "feet-to-inches", from: "ft", to: "in", value: "6", tip: "One foot is exactly 12 inches. For feet and inches, multiply the feet by 12 and add the extra inches.", related: ["inches-to-feet", "km-to-meters", "meters-to-km", "cm-to-inches"] },
  { slug: "inches-to-feet", from: "in", to: "ft", value: "72", tip: "Divide inches by 12. The decimal part times 12 gives the extra inches.", related: ["feet-to-inches", "km-to-meters", "meters-to-km", "cm-to-inches"] },
  { slug: "miles-to-feet", from: "mi", to: "ft", value: "1", tip: "One mile is exactly 5,280 feet.", related: ["km-to-meters", "meters-to-km", "meters-to-cm", "cm-to-inches"] },
  { slug: "miles-to-meters", from: "mi", to: "m", value: "1", tip: "One mile is exactly 1,609.344 meters.", related: ["km-to-meters", "meters-to-km", "meters-to-cm", "cm-to-inches"] },
  { slug: "meters-to-yards", from: "m", to: "yd", value: "100", tip: "A meter is slightly longer than a yard (1.0936 yards), so the yard figure is a little larger.", related: ["km-to-meters", "meters-to-km", "meters-to-cm", "cm-to-inches"] },
  { slug: "yards-to-feet", from: "yd", to: "ft", value: "10", tip: "One yard is exactly 3 feet.", related: ["km-to-meters", "meters-to-km", "meters-to-cm", "cm-to-inches"] },
  { slug: "km-to-feet", from: "km", to: "ft", value: "1", tip: "One kilometer is about 3,280.84 feet.", related: ["km-to-meters", "meters-to-km", "meters-to-cm", "cm-to-inches"] },
  { slug: "lbs-to-oz", from: "lb", to: "oz", value: "5", tip: "One pound is exactly 16 ounces. This is the ounce used for food and mail, not the troy ounce used for gold.", related: ["oz-to-lbs", "grams-to-kg", "kg-to-grams", "kg-to-lbs"] },
  { slug: "oz-to-lbs", from: "oz", to: "lb", value: "24", tip: "Divide ounces by 16 to get pounds.", related: ["lbs-to-oz", "grams-to-kg", "kg-to-grams", "kg-to-lbs"] },
  { slug: "grams-to-kg", from: "g", to: "kg", value: "2500", tip: "Divide grams by 1,000 to get kilograms.", related: ["kg-to-grams", "lbs-to-oz", "oz-to-lbs", "kg-to-lbs"] },
  { slug: "kg-to-grams", from: "kg", to: "g", value: "1.5", tip: "One kilogram is exactly 1,000 grams.", related: ["grams-to-kg", "lbs-to-oz", "oz-to-lbs", "kg-to-lbs"] },
  { slug: "kg-to-oz", from: "kg", to: "oz", value: "1", tip: "One kilogram is about 35.274 ounces.", related: ["lbs-to-oz", "oz-to-lbs", "grams-to-kg", "kg-to-lbs"] },
  { slug: "lbs-to-grams", from: "lb", to: "g", value: "1", tip: "One pound is exactly 453.59237 grams.", related: ["grams-to-lbs", "lbs-to-oz", "oz-to-lbs", "kg-to-lbs"] },
  { slug: "grams-to-lbs", from: "g", to: "lb", value: "500", tip: "Divide grams by 453.592 to get pounds.", related: ["lbs-to-grams", "lbs-to-oz", "oz-to-lbs", "kg-to-lbs"] },
  { slug: "mg-to-grams", from: "mg", to: "g", value: "500", tip: "One gram is 1,000 milligrams, so divide milligrams by 1,000. Check medicine doses with a pharmacist, not an online converter.", related: ["lbs-to-oz", "oz-to-lbs", "grams-to-kg", "kg-to-lbs"] },
  { slug: "tonnes-to-kg", from: "tonne", to: "kg", value: "2.5", tip: "A metric tonne is 1,000 kilograms. It is not the same as the US short ton (2,000 lb).", related: ["lbs-to-oz", "oz-to-lbs", "grams-to-kg", "kg-to-lbs"] },
  { slug: "stone-to-lbs", from: "st", to: "lb", value: "12", tip: "One stone is exactly 14 pounds. It is used for body weight in the UK and Ireland.", related: ["lbs-to-stone", "lbs-to-oz", "oz-to-lbs", "kg-to-lbs"] },
  { slug: "lbs-to-stone", from: "lb", to: "st", value: "168", tip: "Divide pounds by 14. The decimal part times 14 gives the extra pounds.", related: ["stone-to-lbs", "lbs-to-oz", "oz-to-lbs", "kg-to-lbs"] },
  { slug: "cups-to-tablespoons", from: "cup", to: "tbsp", value: "1", tip: "In US cooking 1 cup is 16 tablespoons. Metric tablespoons in some countries differ slightly (15 ml, and 20 ml in Australia).", related: ["tablespoons-to-cups", "teaspoons-to-tablespoons", "tablespoons-to-teaspoons", "ml-to-oz"] },
  { slug: "tablespoons-to-cups", from: "tbsp", to: "cup", value: "8", tip: "Divide tablespoons by 16 to get US cups.", related: ["cups-to-tablespoons", "teaspoons-to-tablespoons", "tablespoons-to-teaspoons", "ml-to-oz"] },
  { slug: "teaspoons-to-tablespoons", from: "tsp", to: "tbsp", value: "3", tip: "Three teaspoons make one tablespoon (US).", related: ["tablespoons-to-teaspoons", "cups-to-tablespoons", "tablespoons-to-cups", "ml-to-oz"] },
  { slug: "tablespoons-to-teaspoons", from: "tbsp", to: "tsp", value: "2", tip: "One tablespoon is 3 teaspoons (US).", related: ["teaspoons-to-tablespoons", "cups-to-tablespoons", "tablespoons-to-cups", "ml-to-oz"] },
  { slug: "tablespoons-to-ml", from: "tbsp", to: "ml", value: "1", tip: "A US tablespoon is about 14.79 ml. Many recipes round to 15 ml, and an Australian tablespoon is 20 ml.", related: ["cups-to-tablespoons", "tablespoons-to-cups", "teaspoons-to-tablespoons", "ml-to-oz"] },
  { slug: "teaspoons-to-ml", from: "tsp", to: "ml", value: "1", tip: "A US teaspoon is about 4.93 ml. Many recipes round to 5 ml.", related: ["cups-to-tablespoons", "tablespoons-to-cups", "teaspoons-to-tablespoons", "ml-to-oz"] },
  { slug: "ml-to-cups", from: "ml", to: "cup", value: "250", tip: "This uses the US cup (about 236.6 ml). A metric cup is 250 ml.", related: ["cups-to-tablespoons", "tablespoons-to-cups", "teaspoons-to-tablespoons", "ml-to-oz"] },
  { slug: "cups-to-fluid-ounces", from: "cup", to: "floz", value: "1", tip: "One US cup is 8 US fluid ounces. This is a measure of volume, not weight.", related: ["fluid-ounces-to-cups", "cups-to-tablespoons", "tablespoons-to-cups", "ml-to-oz"] },
  { slug: "fluid-ounces-to-cups", from: "floz", to: "cup", value: "16", tip: "Divide US fluid ounces by 8 to get cups.", related: ["cups-to-fluid-ounces", "cups-to-tablespoons", "tablespoons-to-cups", "ml-to-oz"] },
  { slug: "cups-to-liters", from: "cup", to: "l", value: "4", tip: "Four US cups are just under a liter (0.946 L). A metric cup is 250 ml, so four make exactly 1 L.", related: ["cups-to-tablespoons", "tablespoons-to-cups", "teaspoons-to-tablespoons", "ml-to-oz"] },
  { slug: "pints-to-cups", from: "pint", to: "cup", value: "1", tip: "One US pint is 2 US cups. A UK imperial pint is larger (568 ml).", related: ["cups-to-tablespoons", "tablespoons-to-cups", "teaspoons-to-tablespoons", "ml-to-oz"] },
  { slug: "quarts-to-liters", from: "quart", to: "l", value: "1", tip: "A US quart is 0.946 L. A UK imperial quart is larger (1.137 L).", related: ["cups-to-tablespoons", "tablespoons-to-cups", "teaspoons-to-tablespoons", "ml-to-oz"] },
  { slug: "quarts-to-cups", from: "quart", to: "cup", value: "1", tip: "One US quart is 4 US cups.", related: ["cups-to-tablespoons", "tablespoons-to-cups", "teaspoons-to-tablespoons", "ml-to-oz"] },
];

const GROUP_NAME: Record<UnitGroup, string> = { length: "length", mass: "weight", volume: "volume", temperature: "temperature", area: "area", speed: "speed", data: "data size", time: "time", pressure: "pressure", energy: "energy" };

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
      : [
          `Convert ${wa.p} to ${wb.p}: ${fact}. Instant converter with a table of other units and examples. Free, private.`,
          `${fact}. Convert ${wa.p} to ${wb.p} instantly, with a table of other units. Free and private.`,
          `Convert ${wa.p} to ${wb.p} instantly: ${fact}. Free and private.`,
        ].find((d) => d.length <= 155) ?? `Convert ${wa.p} to ${wb.p} instantly. Free and private.`,
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
