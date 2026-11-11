import type { CalculatorTool } from "./calculatorTools.ts";
import { plotArea, pondVolume, toScriptDigits } from "../lib/calcDefsRegional.ts";

const PRIVACY = { q: "Are my numbers saved or sent anywhere?", a: "No. The calculation runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const VARIES = { q: "Is a katha the same everywhere?", a: "No. The katha and bigha differ between regions. This page uses 720 sq ft per katha and 20 katha per bigha (Bangladesh and West Bengal). Check the value in your deed and with the local land office." };
const f = (n: number, d = 2) => n.toLocaleString("en-US", { maximumFractionDigits: d });

const DIGIT_MORE: Record<string, { about: string[]; faq: { q: string; a: string } }> = {
  bn: {
    about: [
      "Bangla digits (০১২৩৪৫৬৭৮৯) are the numerals of the Bengali script, used in Bangladesh and in West Bengal, Tripura and parts of Assam. They appear in Bangla dates, newspapers, school documents, land records and many government forms, while banks, phones and websites often show the same numbers with English digits.",
      "In Unicode the Bangla digits occupy the range U+09E6 to U+09EF, so they are real characters, not a font style, and they copy and paste into other apps. Searching a Bangla document for ২০২৬ will not match 2026, so convert the digits first if you need to search or sort.",
    ],
    faq: { q: "Why do some Bangla documents show English digits?", a: "Both are in use. Government and literary texts often use Bangla digits, while banks, software and many websites use English digits for compatibility with search and calculation." },
  },
  hi: {
    about: [
      "Hindi numerals (०१२३४५६७८९) are the Devanagari digits. They are also used for Marathi and Nepali, which share the same script. In India the Constitution specifies the international form of Indian numerals, meaning the digits 0 to 9, for the official purposes of the Union, so English digits are the norm on government forms, but the Devanagari digits are widely used in books, newspapers and traditional documents.",
      "The Devanagari digits occupy the Unicode range U+0966 to U+096F. They copy and paste as real characters, but spreadsheets and calculators do not treat them as numbers, so convert them back to English digits before you add them up.",
    ],
    faq: { q: "Are Hindi and Marathi numerals the same?", a: "Yes. Hindi, Marathi and Nepali all use the Devanagari digits ०१२३४५६७८९, so this converter works for all three." },
  },
  ar: {
    about: [
      "This converter uses the Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩), which are common in Egypt, Iraq, Saudi Arabia and many other Arabic-speaking countries. The Maghreb countries, Morocco, Algeria and Tunisia, mostly use the Western digits 0 to 9 in writing, which are also called Arabic numerals in English because they came to Europe through the Arab world.",
      "Persian, Urdu and Pashto use a related set (۰۱۲۳۴۵۶۷۸۹) in which the digits for 4, 5 and 6 look different from the Eastern Arabic ones, so this tool is not for those languages. Numbers are written left to right even inside right-to-left Arabic text, so the digits do not reverse.",
    ],
    faq: { q: "Are Persian and Urdu digits the same as Arabic digits?", a: "Not entirely. The digits for 4, 5 and 6 are different (۴ ۵ ۶ against ٤ ٥ ٦). This tool converts to the Eastern Arabic set." },
  },
};

const digitPage = (slug: string, script: string, name: string, native: string, kw: string[]): CalculatorTool => ({
  slug,
  calc: "digit-convert",
  preset: { script },
  h1: `English to ${name} Number Converter`,
  title: `English to ${name} Number Converter: 0-9 to ${native}`,
  description: `Convert English (0-9) digits to ${name} numerals (${native}) and back. Paste numbers or whole text. Free and private, runs in your browser.`,
  summary: `Convert English digits to ${name} numerals and back.`,
  intro: `Type or paste numbers or text to swap English digits for ${name} digits, or ${name} digits back to English.`,
  keywords: kw,
  steps: ["Type or paste your numbers or text.", `Check that the script is set to ${name}.`, "Copy the converted result."],
  explanation: [
    `${name} numerals are a different set of symbols for the digits 0 to 9. This tool replaces each English digit with its ${name} form, so 2026 becomes ${toScriptDigits("2026", script)}. Letters, commas, points and other symbols stay the same.`,
    `It also works in the other direction: if your text has digits in ${name}, Bangla, Hindi or Arabic script, the second result shows them as English digits.`,
    ...DIGIT_MORE[script].about,
  ],
  formula: [`0 1 2 3 4 5 6 7 8 9 → ${toScriptDigits("0123456789", script).split("").join(" ")}`],
  worked: () => [`2026 → ${toScriptDigits("2026", script)}`, `1,50,000 → ${toScriptDigits("1,50,000", script)}`, `3.14 → ${toScriptDigits("3.14", script)}`],
  tips: ["Paste a whole paragraph: only the digits change.", "For numbers written out in words, use the number to words converter."],
  faqs: [
    { q: `How do I write 2026 in ${name} numerals?`, a: `2026 is written ${toScriptDigits("2026", script)}.` },
    { q: "Does it change letters?", a: "No. Only the digits 0 to 9 are changed." },
    { q: "Can it convert back to English digits?", a: "Yes. The second result always shows English digits." },
    DIGIT_MORE[script].faq,
    PRIVACY,
  ],
  related: script === "bn" ? ["number-to-words-in-bangla", "taka-in-words", "bangla-date-converter", "english-to-hindi-number-converter"] : ["number-to-words-in-hindi", "rupees-in-words", "english-to-bangla-number-converter", "number-to-words"],
});

export const regionalCalculatorTools: CalculatorTool[] = [
  {
    slug: "plot-area-calculator",
    calc: "plot-area",
    h1: "Plot Area Calculator",
    title: "Plot Area Calculator: Katha, Decimal, Bigha and Square Feet",
    description: "Find the area of a rectangular plot from its length and width in feet, meters or hat, in square feet, katha, decimal, bigha and acre. Free and private.",
    summary: "Find a plot's area in square feet, katha, decimal, bigha and acre.",
    intro: "Enter the length and width of a rectangular plot to see its area in square feet, katha, decimal, bigha, acre and square meters.",
    keywords: ["plot area calculator", "land area calculator", "katha calculator", "plot size in katha", "decimal calculator land", "length width to katha"],
    steps: ["Enter the length and the width of the plot.", "Choose the unit you measured in: feet, meters, hat, yards or inches.", "Read the area in square feet, katha, decimal, bigha and acre."],
    explanation: [
      "The area of a rectangular plot is its length times its width. This calculator turns the measurements into square feet, then into the units used for land in Bangladesh and West Bengal: 1 katha is 720 sq ft, 1 decimal is 435.6 sq ft, 1 bigha is 20 katha (14,400 sq ft) and 1 acre is 43,560 sq ft.",
      "A hat (cubit) is taken as 1.5 feet. For an irregular plot, split it into rectangles and triangles and add the areas. Katha and bigha differ between regions, so use the official record for any sale or registration.",
    ],
    formula: ["Area (sq ft) = length (ft) × width (ft).", "Katha = sq ft ÷ 720. Decimal = sq ft ÷ 435.6. Bigha = sq ft ÷ 14,400."],
    worked: () => {
      const a = plotArea(60, 40, "ft");
      const b = plotArea(24, 30, "hat");
      return [`60 ft × 40 ft = ${f(a.sqft, 0)} sq ft = ${f(a.katha, 2)} katha = ${f(a.decimal, 2)} decimal.`, `24 hat × 30 hat = ${f(b.sqft, 0)} sq ft = ${f(b.katha, 2)} katha.`];
    },
    tips: ["Measure each side twice and use the average if the plot is not a perfect rectangle.", "For legal use, rely on the area in the deed or survey record."],
    faqs: [
      { q: "How many katha is a 60 ft by 40 ft plot?", a: `${f(plotArea(60, 40, "ft").katha, 2)} katha (2,400 square feet).` },
      { q: "How do I find the area of a plot?", a: "Multiply the length by the width for a rectangular plot." },
      { q: "How many feet is a hat?", a: "This calculator uses 1 hat = 1.5 feet (18 inches)." },
      VARIES,
      PRIVACY,
    ],
    related: ["square-feet-to-katha", "square-feet-to-decimal", "bangladesh-land-converter", "pond-excavation-calculator"],
  },
  {
    slug: "pond-excavation-calculator",
    calc: "pond",
    h1: "Pond Excavation Calculator",
    title: "Pond Excavation Calculator: Earth Volume, Capacity and Digging Cost",
    description: "Estimate the earth to dig out for a pond (pukur) from its length, width, depth and side slope, in cubic feet and meters, with water capacity and optional cost.",
    summary: "Estimate earth volume, water capacity and digging cost for a pond.",
    intro: "Enter the pond length, width, depth and side slope to estimate the earth to dig, the water it will hold and, if you give a rate, the cost.",
    keywords: ["pond excavation calculator", "pukur khonon calculator", "pond volume calculator", "earth work calculator", "pond digging cost calculator", "excavation volume calculator"],
    steps: ["Enter the length and width at the top of the pond, and the depth.", "Choose feet, meters, hat or yards.", "Enter the side slope if the sides are not straight (0 for straight sides).", "Add a digging rate per 1,000 cubic feet if you want a cost."],
    explanation: [
      "The volume of a rectangular pit with straight sides is length × width × depth. If the sides slope, the bottom is smaller than the top, so the volume is less. The slope is the horizontal run for each 1 unit of depth: a slope of 1 means the side moves in 1 foot for every 1 foot down.",
      "The result is the volume of soil to remove, and the water the pond holds when full to the top. Real ponds have rounded corners and uneven bottoms, and loose soil takes up more space than soil in place, so treat the figure as an estimate and ask the contractor for a measured quote.",
    ],
    formula: ["Straight sides: volume = length × width × depth.", "Sloping sides: volume = L·W·D − s·D²·(L + W) + (4/3)·s²·D³, where s is the side slope.", "1 cubic meter = 35.3147 cubic feet = 1,000 liters."],
    worked: () => [`100 ft × 60 ft × 8 ft, straight sides: ${f(pondVolume(100, 60, 8, 0), 0)} cubic feet (${f(pondVolume(100, 60, 8, 0) / 35.3146667, 1)} cubic meters).`, `The same pond with a side slope of 1: ${f(pondVolume(100, 60, 8, 1), 0)} cubic feet.`, `At a rate of 5,000 per 1,000 cubic feet, the straight-sided pond costs about ${f((pondVolume(100, 60, 8, 0) / 1000) * 5000, 0)}.`],
    tips: ["Dig rates depend on soil, access and distance for carrying the earth, so use a quote from your contractor.", "A steeper slope needs less digging but can collapse in soft soil.", "Use the plot area calculator for the pond's surface area in decimal."],
    faqs: [
      { q: "How do I calculate the earth to dig for a pond?", a: "Multiply the length, width and depth for straight sides, and use the sloping-side formula if the sides slope." },
      { q: "How many cubic feet in a cubic meter?", a: "About 35.3147 cubic feet." },
      { q: "Does this include soil swell?", a: "No. Loosened soil takes up more space, so plan extra for carrying or filling." },
      PRIVACY,
    ],
    related: ["plot-area-calculator", "square-feet-to-decimal", "square-feet-to-katha"],
  },
  digitPage("english-to-bangla-number-converter", "bn", "Bangla", "০-৯", ["english to bangla number converter", "convert english numbers to bangla", "bangla digits converter", "english to bengali numerals", "bangla number converter online"]),
  digitPage("english-to-hindi-number-converter", "hi", "Hindi", "०-९", ["english to hindi number converter", "convert english numbers to hindi", "hindi digits converter", "english to devanagari numerals", "hindi numerals converter"]),
  digitPage("english-to-arabic-numerals-converter", "ar", "Arabic", "٠-٩", ["english to arabic numerals converter", "convert numbers to arabic numerals", "arabic digits converter", "english to arabic numbers", "eastern arabic numerals"]),
];
