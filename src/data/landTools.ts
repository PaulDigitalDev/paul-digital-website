import type { Faq } from "./formatTools";
import { convertArea, formatArea } from "../lib/landUnits.ts";
import type { UnitId } from "../lib/landUnits.ts";

export interface LandTool {
  slug: string;
  lang: "en" | "bn";
  units: UnitId[];
  from: UnitId;
  to: UnitId;
  value: string;
  h1: string;
  title: string;
  description: string;
  summary: string;
  intro: string;
  keywords: string[];
  steps: string[];
  explanation: string[];
  worked: () => string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

const PRIVACY: Faq = { q: "Are my numbers saved or sent anywhere?", a: "No. The conversion runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const VARIES: Faq = { q: "Can the size of a katha or bigha be different where I live?", a: "Yes. Katha, bigha and similar units are traditional and differ between regions. This page uses the standard values stated above. For a sale, deed or legal record, use the area written in the official document and check the local value with the land office or a surveyor." };

const AREA_STEPS = ["Type the area.", "Choose the unit you have, and the unit you want.", "Read the result. The table shows the same area in all the other units."];
const AREA_TIPS = ["Use Swap units to convert the other way.", "For legal or sale documents, trust the area on the official record and check it with a surveyor."];

const c = (v: number, from: UnitId, to: UnitId) => formatArea(convertArea(v, from, to));
const n = (v: number) => formatArea(v);

const BD_UNITS: UnitId[] = ["decimal", "ojutangsho", "katha", "chhatak", "bigha", "acre", "hectare", "sqft", "sqm", "sqyd"];

export const landTools: LandTool[] = [
  {
    slug: "land-area-converter",
    lang: "en",
    units: ["sqft", "sqm", "sqyd", "acre", "hectare", "decimal", "katha", "bigha", "gunta", "kanal", "marla", "ground", "ropani", "aana", "np-bigha", "np-kattha"],
    from: "acre",
    to: "sqft",
    value: "1",
    h1: "Land Area Converter",
    title: "Land Area Converter: Acre, Katha, Bigha, Decimal, Gunta",
    description: "Convert land area between square feet, square metres, acre, hectare, decimal, katha, bigha, gunta, kanal, marla and more. Free, in your browser.",
    summary: "Convert land area between acre, hectare, katha, bigha, decimal, gunta and more.",
    intro: "Convert land area between acres, hectares, square feet, square metres and the traditional South Asian units.",
    keywords: ["land area converter", "land converter", "acre to square feet", "bigha to acre", "gunta to square feet", "kanal to marla"],
    steps: AREA_STEPS,
    explanation: [
      "Every unit here is converted through square feet, so any unit can be turned into any other. The traditional units use their standard values: 1 acre is 43,560 sq ft, 1 decimal is 435.6 sq ft, 1 katha is 720 sq ft (Bangladesh and West Bengal), 1 gunta is 1,089 sq ft and 1 kanal is 5,445 sq ft.",
      "Traditional units are not the same everywhere. A bigha or katha can be a different size in another region, and Nepal has its own katha and bigha. The Nepal units are listed separately and marked.",
    ],
    worked: () => [`1 acre is ${c(1, "acre", "sqft")} sq ft, or ${c(1, "acre", "sqm")} sq m.`, `1 hectare is ${c(1, "hectare", "acre")} acres.`, `1 kanal is ${c(1, "kanal", "marla")} marla and ${c(1, "kanal", "sqft")} sq ft.`],
    tips: AREA_TIPS,
    faqs: [
      { q: "How many square feet are in an acre?", a: "43,560 square feet." },
      { q: "How many decimals are in an acre?", a: "100. One decimal is 435.6 square feet." },
      { q: "How many gunta are in an acre?", a: "40 gunta, at 1,089 square feet each." },
      VARIES,
      PRIVACY,
    ],
    related: ["bangladesh-land-converter", "west-bengal-land-converter", "nepal-land-converter", "katha-to-square-feet"],
  },
  {
    slug: "bangladesh-land-converter",
    lang: "en",
    units: BD_UNITS,
    from: "decimal",
    to: "katha",
    value: "10",
    h1: "Bangladesh Land Converter",
    title: "Bangladesh Land Converter: Katha, Bigha, Decimal, Acre",
    description: "Convert Bangladeshi land units: decimal (shotangsho), katha, chhatak, bigha, acre, hectare and square feet. Standard values, free, in your browser.",
    summary: "Convert katha, bigha, decimal (shotangsho), acre and square feet for Bangladesh.",
    intro: "Convert between decimal (shotangsho), katha, chhatak, bigha, acre, hectare, square feet and square metres.",
    keywords: ["bangladesh land converter", "katha to decimal", "decimal to katha", "shotangsho to katha", "bigha to katha", "জমি পরিমাপ"],
    steps: AREA_STEPS,
    explanation: [
      "In Bangladesh one katha is standardised at 720 square feet, one bigha is 20 katha (14,400 sq ft), and one decimal (shotangsho or shotok) is 435.6 sq ft, a hundredth of an acre. A katha is also 16 chhatak of 45 sq ft each.",
      "Some older records and some districts use a different bigha, for example the size of a bigha varies between regions. This converter uses the standard 20-katha bigha. Check the local value for your district before relying on it.",
    ],
    worked: () => [`10 decimal is ${c(10, "decimal", "katha")} katha, or ${n(10 * 435.6)} sq ft.`, `1 bigha is ${c(1, "bigha", "decimal")} decimal.`, `1 acre is ${c(1, "acre", "bigha")} bigha, or ${c(1, "acre", "katha")} katha.`],
    tips: AREA_TIPS,
    faqs: [
      { q: "How many decimals are in 1 katha?", a: `About ${c(1, "katha", "decimal")} decimal.` },
      { q: "How many katha are in 1 bigha?", a: "20 katha, or 14,400 square feet." },
      { q: "How many square feet is 1 decimal?", a: "435.6 square feet." },
      VARIES,
      PRIVACY,
    ],
    related: ["bangla-land-converter", "katha-to-square-feet", "decimal-to-square-feet", "bigha-to-square-feet"],
  },
  {
    slug: "west-bengal-land-converter",
    lang: "en",
    units: ["katha", "chhatak", "bigha", "decimal", "acre", "hectare", "sqft", "sqm", "sqyd"],
    from: "bigha",
    to: "katha",
    value: "2",
    h1: "West Bengal Land Converter",
    title: "West Bengal Land Converter: Cottah, Bigha, Decimal, Acre",
    description: "Convert West Bengal land units: cottah (katha), chhatak, bigha, decimal, acre and square feet. Standard values, free, in your browser.",
    summary: "Convert cottah (katha), chhatak, bigha, decimal and acre for West Bengal.",
    intro: "Convert between cottah (katha), chhatak, bigha, decimal, acre, hectare and square feet.",
    keywords: ["west bengal land converter", "cottah to square feet", "katha to sq ft west bengal", "bigha to katha", "kolkata land measurement"],
    steps: AREA_STEPS,
    explanation: [
      "In West Bengal one cottah (katha) is taken as 720 square feet, one bigha is 20 cottah (14,400 sq ft) and one chhatak is 45 sq ft, a sixteenth of a katha. The decimal (shatak) is 435.6 sq ft.",
      "Practice can differ by district and by builder, and some local records use other values. This page uses the standard figures. Check the area on your deed or the land record, and confirm with the local land office or a surveyor.",
    ],
    worked: () => [`2 bigha is ${c(2, "bigha", "katha")} katha, or ${c(2, "bigha", "sqft")} sq ft.`, `1 cottah is ${c(1, "katha", "decimal")} decimal and ${c(1, "katha", "sqm")} sq m.`, `3 katha 8 chhatak is ${c(3 * 16 + 8, "chhatak", "sqft")} sq ft.`],
    tips: ["A land area given as “3 katha 8 chhatak” is 3 × 16 + 8 = 56 chhatak.", ...AREA_TIPS],
    faqs: [
      { q: "How many square feet is 1 cottah in West Bengal?", a: "720 square feet." },
      { q: "How many cottah are in 1 bigha?", a: "20 cottah, or 14,400 square feet." },
      { q: "How many chhatak are in 1 katha?", a: "16 chhatak, at 45 square feet each." },
      VARIES,
      PRIVACY,
    ],
    related: ["katha-to-square-feet", "bigha-to-square-feet", "decimal-to-square-feet", "bangladesh-land-converter"],
  },
  {
    slug: "nepal-land-converter",
    lang: "en",
    units: ["ropani", "aana", "paisa", "dam", "np-bigha", "np-kattha", "np-dhur", "sqft", "sqm", "acre", "hectare"],
    from: "ropani",
    to: "sqft",
    value: "1",
    h1: "Nepal Land Converter",
    title: "Nepal Land Converter: Ropani, Aana, Bigha, Kattha, Dhur",
    description: "Convert Nepali land units: ropani, aana, paisa, dam, bigha, kattha, dhur, square feet and square metres. Free, in your browser.",
    summary: "Convert ropani, aana, paisa, dam, bigha, kattha and dhur for Nepal.",
    intro: "Convert between the hill units (ropani, aana, paisa, dam), the Terai units (bigha, kattha, dhur), square feet and square metres.",
    keywords: ["nepal land converter", "ropani to square feet", "aana to square feet", "bigha to kattha", "ropani to aana", "dhur to square feet"],
    steps: AREA_STEPS,
    explanation: [
      "Nepal uses two systems. In the hills and the Kathmandu Valley: 1 ropani = 16 aana = 64 paisa = 256 dam, and 1 ropani is 5,476 sq ft (about 508.74 sq m). In the Terai: 1 bigha = 20 kattha = 400 dhur, and 1 bigha is 72,900 sq ft (about 6,772.63 sq m).",
      "The Terai kattha and bigha are different from the kattha and bigha used in Bangladesh and West Bengal, so they are marked “Nepal Terai” here.",
    ],
    worked: () => [`1 ropani is ${c(1, "ropani", "sqft")} sq ft and ${c(1, "ropani", "sqm")} sq m.`, `1 aana is ${c(1, "aana", "sqft")} sq ft.`, `1 bigha is ${c(1, "np-bigha", "ropani")} ropani.`],
    tips: ["Use the table to see a plot in both hill and Terai units.", ...AREA_TIPS],
    faqs: [
      { q: "How many square feet is 1 ropani?", a: "5,476 square feet." },
      { q: "How many square feet is 1 aana?", a: "342.25 square feet." },
      { q: "How many ropani are in 1 bigha?", a: `About ${c(1, "np-bigha", "ropani")} ropani.` },
      { q: "Where does the Ropani system apply?", a: "In the hill and mountain regions and the Kathmandu Valley. The Terai plains use bigha, kattha and dhur." },
      PRIVACY,
    ],
    related: ["land-area-converter", "katha-to-square-feet", "bigha-to-square-feet", "bangladesh-land-converter"],
  },
  {
    slug: "katha-to-square-feet",
    lang: "en",
    units: ["katha", "np-kattha", "sqft", "sqm", "sqyd", "decimal", "chhatak", "bigha", "acre"],
    from: "katha",
    to: "sqft",
    value: "1",
    h1: "Katha to Square Feet",
    title: "Katha to Square Feet Converter (and Square Meter)",
    description: "How many square feet is a katha? 1 katha is 720 sq ft in Bangladesh and West Bengal. Convert katha to square feet, square metres, decimal and more.",
    summary: "Convert katha to square feet, square metres and decimal.",
    intro: "Type a number of katha to see it in square feet, square metres, decimal and other units.",
    keywords: ["katha to square feet", "katha to sq ft", "kattha to square feet", "1 katha in square feet", "katha to square meter", "cottah to sq ft"],
    steps: AREA_STEPS,
    explanation: [
      "In Bangladesh and West Bengal, 1 katha (cottah) is 720 square feet, about 66.89 square metres, or about 1.65 decimal. Multiply the number of katha by 720 to get square feet.",
      "The katha is not the same everywhere. In Nepal's Terai a kattha is 3,645 sq ft. In parts of Bihar, Jharkhand and Assam it is larger. Pick the unit that matches your region.",
    ],
    worked: () => [`1 katha = ${c(1, "katha", "sqft")} sq ft = ${c(1, "katha", "sqm")} sq m.`, `5 katha = ${c(5, "katha", "sqft")} sq ft.`, `1 Nepal kattha = ${c(1, "np-kattha", "sqft")} sq ft.`],
    tips: AREA_TIPS,
    faqs: [
      { q: "How many square feet is 1 katha?", a: "720 square feet in Bangladesh and West Bengal." },
      { q: "How many square metres is 1 katha?", a: `About ${c(1, "katha", "sqm")} square metres.` },
      { q: "How many decimal is 1 katha?", a: `About ${c(1, "katha", "decimal")} decimal.` },
      VARIES,
      PRIVACY,
    ],
    related: ["decimal-to-square-feet", "bigha-to-square-feet", "bangladesh-land-converter", "west-bengal-land-converter"],
  },
  {
    slug: "decimal-to-square-feet",
    lang: "en",
    units: ["decimal", "sqft", "sqm", "sqyd", "katha", "bigha", "acre", "ojutangsho", "gunta"],
    from: "decimal",
    to: "sqft",
    value: "1",
    h1: "Decimal to Square Feet",
    title: "Decimal to Square Feet Converter (Shotangsho, Cent)",
    description: "How many square feet is a decimal (shotangsho, shatak, cent)? 1 decimal is 435.6 sq ft. Convert decimal to sq ft, sq m, katha and acre.",
    summary: "Convert decimal (shotangsho, cent) to square feet, katha and acre.",
    intro: "Type a number of decimals to see it in square feet, square metres, katha, bigha and acres.",
    keywords: ["decimal to square feet", "decimal to sq ft", "shotangsho to square feet", "shatak to sq ft", "dismil to square feet", "cent to sq ft"],
    steps: AREA_STEPS,
    explanation: [
      "A decimal, called shotangsho, shotok or shatak in Bengali and cent or dismil elsewhere, is one hundredth of an acre. Since an acre is 43,560 sq ft, 1 decimal is 435.6 sq ft, about 40.47 sq m.",
      "To convert decimals to square feet, multiply by 435.6. To get katha, divide the square feet by 720. For example 10 decimal is 4,356 sq ft, or 6.05 katha.",
    ],
    worked: () => [`1 decimal = ${c(1, "decimal", "sqft")} sq ft = ${c(1, "decimal", "sqm")} sq m.`, `10 decimal = ${c(10, "decimal", "sqft")} sq ft = ${c(10, "decimal", "katha")} katha.`, `33 decimal = ${c(33, "decimal", "bigha")} bigha.`],
    tips: AREA_TIPS,
    faqs: [
      { q: "How many square feet is 1 decimal?", a: "435.6 square feet." },
      { q: "How many decimals make an acre?", a: "100 decimals make 1 acre." },
      { q: "How many katha is 1 decimal?", a: `About ${c(1, "decimal", "katha")} katha.` },
      VARIES,
      PRIVACY,
    ],
    related: ["katha-to-square-feet", "bangladesh-land-converter", "west-bengal-land-converter", "land-area-converter"],
  },
  {
    slug: "bigha-to-square-feet",
    lang: "en",
    units: ["bigha", "np-bigha", "sqft", "sqm", "katha", "decimal", "acre", "hectare", "np-kattha"],
    from: "bigha",
    to: "sqft",
    value: "1",
    h1: "Bigha to Square Feet",
    title: "Bigha to Square Feet Converter (Bengal and Nepal)",
    description: "How many square feet is a bigha? 1 bigha is 14,400 sq ft in Bangladesh and West Bengal, and 72,900 sq ft in Nepal's Terai. Convert bigha to acre, katha and more.",
    summary: "Convert bigha to square feet, katha, decimal and acre.",
    intro: "Type a number of bigha to see it in square feet, katha, decimal and acres, for Bengal or Nepal.",
    keywords: ["bigha to square feet", "bigha to sq ft", "1 bigha in square feet", "bigha to acre", "bigha to katha", "bigha to decimal"],
    steps: AREA_STEPS,
    explanation: [
      "The bigha is not one fixed size. In Bangladesh and West Bengal it is 20 katha, which is 14,400 sq ft (about 1,338 sq m and 33 decimal). In Nepal's Terai it is 72,900 sq ft (about 6,772.63 sq m). In other parts of India it is different again.",
      "Both Bengal and Nepal values are listed here and marked, so pick the one that matches your land. For other regions, use the value in the local land record.",
    ],
    worked: () => [`1 bigha (Bangladesh, West Bengal) = ${c(1, "bigha", "sqft")} sq ft = ${c(1, "bigha", "decimal")} decimal.`, `1 acre = ${c(1, "acre", "bigha")} bigha (Bengal).`, `1 bigha (Nepal) = ${c(1, "np-bigha", "sqft")} sq ft = ${c(1, "np-bigha", "acre")} acre.`],
    tips: AREA_TIPS,
    faqs: [
      { q: "How many square feet is 1 bigha?", a: "14,400 square feet in Bangladesh and West Bengal, and 72,900 square feet in Nepal's Terai." },
      { q: "How many bigha are in an acre?", a: `About ${c(1, "acre", "bigha")} bigha of the Bengal size.` },
      VARIES,
      PRIVACY,
    ],
    related: ["katha-to-square-feet", "decimal-to-square-feet", "nepal-land-converter", "land-area-converter"],
  },
  {
    slug: "bangla-land-converter",
    lang: "bn",
    units: BD_UNITS,
    from: "decimal",
    to: "katha",
    value: "১০",
    h1: "জমির পরিমাপ কনভার্টার",
    title: "জমির পরিমাপ কনভার্টার: শতাংশ, কাঠা, বিঘা, একর",
    description: "শতাংশ, কাঠা, ছটাক, বিঘা, একর, হেক্টর ও বর্গফুটের মধ্যে জমির পরিমাপ রূপান্তর করুন। বাংলাদেশ ও পশ্চিমবঙ্গের মান। বিনামূল্যে।",
    summary: "শতাংশ, কাঠা, বিঘা, একর ও বর্গফুটে জমির পরিমাপ রূপান্তর।",
    intro: "শতাংশ, কাঠা, ছটাক, বিঘা, একর ও বর্গফুটের মধ্যে জমির পরিমাপ বদলে নিন।",
    keywords: ["জমির পরিমাপ", "শতাংশ থেকে কাঠা", "কাঠা থেকে বর্গফুট", "বিঘা থেকে কাঠা", "জমি পরিমাপ কনভার্টার", "land converter bangla"],
    steps: ["পরিমাণ লিখুন, বাংলা বা ইংরেজি অঙ্কে।", "যে এককে আছে এবং যে এককে চান তা বেছে নিন।", "ফল দেখুন। নিচের তালিকায় বাকি সব এককে একই জমি দেখানো আছে।"],
    explanation: [
      "বাংলাদেশ ও পশ্চিমবঙ্গে সাধারণ মান: ১ কাঠা = ৭২০ বর্গফুট, ১ বিঘা = ২০ কাঠা = ১৪,৪০০ বর্গফুট, ১ ছটাক = ৪৫ বর্গফুট (১ কাঠা = ১৬ ছটাক), ১ শতাংশ = ৪৩৫.৬ বর্গফুট, ১ একর = ১০০ শতাংশ।",
      "কাঠা ও বিঘার মাপ সব জায়গায় এক নয়, কিছু এলাকায় বিঘা ভিন্ন হয়। এখানে সাধারণ মান ধরা হয়েছে। দলিল বা জমির রেকর্ডে লেখা পরিমাপই চূড়ান্ত, তাই স্থানীয় ভূমি অফিস বা সার্ভেয়ারের কাছে মিলিয়ে নিন।",
    ],
    worked: () => [`${formatArea(10, true)} শতাংশ = ${formatArea(convertArea(10, "decimal", "katha"), true)} কাঠা = ${formatArea(10 * 435.6, true)} বর্গফুট।`, `১ বিঘা = ${formatArea(convertArea(1, "bigha", "decimal"), true)} শতাংশ।`, `১ একর = ${formatArea(convertArea(1, "acre", "bigha"), true)} বিঘা।`],
    tips: ["উল্টো দিকে রূপান্তরের জন্য ‘অদলবদল’ চাপুন।", "“৩ কাঠা ৮ ছটাক” মানে ৩ × ১৬ + ৮ = ৫৬ ছটাক।"],
    faqs: [
      { q: "১ কাঠা কত বর্গফুট?", a: "৭২০ বর্গফুট।" },
      { q: "১ বিঘা কত শতাংশ?", a: `প্রায় ${formatArea(convertArea(1, "bigha", "decimal"), true)} শতাংশ।` },
      { q: "১ শতাংশ কত বর্গফুট?", a: "৪৩৫.৬ বর্গফুট।" },
      { q: "আমার এলাকার কাঠা বা বিঘা কি আলাদা হতে পারে?", a: "হ্যাঁ। এই কনভার্টার সাধারণ মান ব্যবহার করে। দলিল বা আইনি কাজে দলিলের পরিমাপ দেখুন এবং স্থানীয় ভূমি অফিসে মিলিয়ে নিন।" },
      { q: "আমার দেওয়া সংখ্যা কি কোথাও পাঠানো হয়?", a: "না। হিসাব আপনার ব্রাউজারেই হয়।" },
    ],
    related: ["bangladesh-land-converter", "katha-to-square-feet", "decimal-to-square-feet", "bangla-date-converter"],
  },
];

export const landToolBySlug = new Map(landTools.map((t) => [t.slug, t]));
