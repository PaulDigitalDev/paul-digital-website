import type { Faq } from "./formatTools";
import { WEIGHT_UNITS, VORI_GRAMS, convertWeight, toVoriAnaRoti } from "../lib/weightUnits.ts";
import type { WeightId } from "../lib/weightUnits.ts";
import { formatArea } from "../lib/landUnits.ts";

export interface WeightTool {
  slug: string;
  lang: "en" | "bn";
  units: WeightId[];
  from: WeightId;
  to: WeightId;
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
const SAME: Faq = { q: "Are vori and tola the same?", a: "Yes. Vori (also spelled bhori) is the Bangladeshi name and tola is the name used in India and Pakistan. Both are taken as 11.664 grams here." };
const PURITY: Faq = { q: "Does the weight change with the carat or karat?", a: "No. A vori of 22K gold and a vori of 18K gold both weigh 11.664 grams. Only the price changes, because the share of pure gold is different." };
const STEPS = ["Type the weight.", "Choose the unit you have, and the unit you want.", "Read the result. The table shows the same weight in all the other units."];
const TIPS = ["Use Swap units to convert the other way.", "Jewellers may round slightly. Check the weight on the shop's scale and the bill."];

const c = (v: number, a: WeightId, b: WeightId) => formatArea(convertWeight(v, a, b));
const ALL: WeightId[] = ["vori", "tola", "ana", "roti", "masha", "gram", "kg", "mg", "troy-oz", "oz", "lb"];
const GOLD: WeightId[] = ["vori", "tola", "ana", "roti", "masha", "gram", "kg", "troy-oz"];

const gold = (slug: string, o: Partial<WeightTool> & Pick<WeightTool, "from" | "to" | "value" | "h1" | "title" | "description" | "summary" | "intro" | "keywords" | "explanation" | "worked" | "faqs" | "related">): WeightTool => ({
  slug,
  lang: "en",
  units: GOLD,
  steps: STEPS,
  tips: TIPS,
  ...o,
});

export const weightTools: WeightTool[] = [
  gold("gold-weight-converter", {
    units: ALL,
    from: "vori",
    to: "gram",
    value: "1",
    h1: "Gold Weight Converter",
    title: "Gold Weight Converter: Vori, Tola, Ana, Gram, Ounce",
    description: "Convert gold weight between vori, tola, ana, roti, masha, gram, kilogram and ounce. 1 vori is 11.664 grams. Free, in your browser.",
    summary: "Convert vori, tola, ana, roti, gram and ounce for gold.",
    intro: "Convert gold and silver weight between vori, tola, ana, roti, masha, grams and ounces.",
    keywords: ["gold weight converter", "vori to gram", "tola to gram", "ana to gram", "vori ana roti", "gold vori calculator"],
    explanation: [
      "Gold in Bangladesh, India and Pakistan is weighed in the old tola system. One vori (tola) is 11.664 grams and is split into 16 ana, 12 masha or 96 roti (ratti). So 1 ana is 0.729 grams and 1 roti is about 0.1215 grams.",
      "The weight of a vori is the same for every purity of gold. A vori of 22K gold and a vori of 18K gold weigh the same, but they cost different amounts. Use the Gold Price Calculator to turn a weight into a price.",
    ],
    worked: () => [`1 vori = ${c(1, "vori", "gram")} g = ${c(1, "vori", "ana")} ana = ${c(1, "vori", "roti")} roti.`, `10 grams = ${c(10, "gram", "vori")} vori.`, `1 troy ounce = ${c(1, "troy-oz", "vori")} vori.`],
    faqs: [
      { q: "How many grams is 1 vori?", a: "11.664 grams." },
      { q: "How many ana are in 1 vori?", a: "16 ana, and 1 ana is 0.729 grams." },
      { q: "How many roti are in 1 vori?", a: "96 roti (also written ratti)." },
      SAME,
      PURITY,
      PRIVACY,
    ],
    related: ["vori-to-gram", "gram-to-vori", "gold-price-calculator", "bangla-gold-weight-converter"],
  }),
  gold("vori-to-gram", {
    from: "vori",
    to: "gram",
    value: "1",
    h1: "Vori to Gram",
    title: "Vori to Gram Converter: 1 Vori = 11.664 Grams",
    description: "How many grams is a vori (bhori)? 1 vori is 11.664 grams. Convert vori to grams, ana, roti and ounce. Free, in your browser.",
    summary: "Convert vori (bhori) to grams, ana, roti and ounces.",
    intro: "Type a number of vori to see its weight in grams, ana, roti and ounces.",
    keywords: ["vori to gram", "bhori to gram", "1 vori koto gram", "vori to gram converter", "ভরি থেকে গ্রাম"],
    explanation: [
      "To convert vori to grams, multiply by 11.664. So 5 vori is 58.32 grams. A vori is also 16 ana, so each ana is 0.729 grams.",
      "The vori is the traditional Bangladeshi unit for gold and silver. It is the same weight as the tola used in India and Pakistan.",
    ],
    worked: () => [`1 vori = ${c(1, "vori", "gram")} g.`, `5 vori = ${c(5, "vori", "gram")} g.`, `2 vori 8 ana = ${c(2.5, "vori", "gram")} g.`],
    faqs: [{ q: "1 vori koto gram?", a: "1 vori is 11.664 grams." }, { q: "How many grams is half a vori?", a: "5.832 grams, which is 8 ana." }, SAME, PURITY, PRIVACY],
    related: ["gram-to-vori", "tola-to-gram", "gold-weight-converter", "gold-price-calculator"],
  }),
  gold("gram-to-vori", {
    from: "gram",
    to: "vori",
    value: "10",
    h1: "Gram to Vori",
    title: "Gram to Vori Converter: Grams to Vori, Ana and Roti",
    description: "Convert grams to vori (bhori), ana and roti. 10 grams is about 0.857 vori. Free, in your browser.",
    summary: "Convert grams to vori, ana and roti for gold.",
    intro: "Type a weight in grams to see it in vori, ana and roti.",
    keywords: ["gram to vori", "gram to bhori", "10 gram gold koto vori", "gram to vori converter", "গ্রাম থেকে ভরি"],
    explanation: [
      "To convert grams to vori, divide by 11.664. So 10 grams is 0.857 vori, and 100 grams is 8.573 vori.",
      "To show the result as vori, ana and roti, take the whole vori first, then turn what is left into ana (0.729 g each) and roti (0.1215 g each).",
    ],
    worked: () => {
      const v = toVoriAnaRoti(10);
      return [`10 g = ${c(10, "gram", "vori")} vori.`, `100 g = ${c(100, "gram", "vori")} vori.`, `10 g is ${v.vori} vori ${v.ana} ana ${v.roti} roti.`];
    },
    faqs: [{ q: "How many vori is 10 grams of gold?", a: "About 0.857 vori, which is 13 ana and 8 roti." }, { q: "How do I convert grams to vori?", a: "Divide the grams by 11.664." }, SAME, PURITY, PRIVACY],
    related: ["vori-to-gram", "tola-to-gram", "gold-weight-converter", "gold-price-calculator"],
  }),
  gold("tola-to-gram", {
    from: "tola",
    to: "gram",
    value: "1",
    h1: "Tola to Gram",
    title: "Tola to Gram Converter: 1 Tola = 11.664 Grams",
    description: "How many grams is a tola? 1 tola of gold is 11.664 grams. Convert tola to grams, vori, ana and ounce. Free, in your browser.",
    summary: "Convert tola to grams, vori, ana and ounces.",
    intro: "Type a number of tola to see its weight in grams, vori, ana and ounces.",
    keywords: ["tola to gram", "1 tola in grams", "tola to gram converter", "gold tola to grams", "tola to vori"],
    explanation: [
      "A tola is 11.664 grams in the system used for gold in India and Pakistan. The more exact historical value is 11.6638 grams, and the difference is far too small to matter for a normal purchase.",
      "A tola is the same weight as a Bangladeshi vori. It is divided into 12 masha, 16 ana or 96 ratti. For 10 grams, divide by 11.664 to get 0.857 tola.",
    ],
    worked: () => [`1 tola = ${c(1, "tola", "gram")} g.`, `10 tola = ${c(10, "tola", "gram")} g.`, `1 tola = ${c(1, "tola", "masha")} masha.`],
    faqs: [{ q: "How many grams is 1 tola of gold?", a: "11.664 grams." }, { q: "How many tola is 100 grams?", a: `About ${c(100, "gram", "tola")} tola.` }, SAME, PURITY, PRIVACY],
    related: ["vori-to-gram", "gram-to-vori", "gold-weight-converter", "gold-price-calculator"],
  }),
  gold("ana-to-gram", {
    from: "ana",
    to: "gram",
    value: "1",
    h1: "Ana to Gram",
    title: "Ana to Gram Converter: 1 Ana = 0.729 Grams (Gold)",
    description: "How many grams is an ana of gold? 1 ana is 0.729 grams, one sixteenth of a vori. Convert ana to grams, vori and roti. Free, in your browser.",
    summary: "Convert ana to grams, vori and roti for gold.",
    intro: "Type a number of ana to see its weight in grams, vori and roti.",
    keywords: ["ana to gram", "1 ana gold in gram", "ana to vori", "ana to roti", "আনা থেকে গ্রাম"],
    explanation: [
      "An ana is one sixteenth of a vori (tola), so it is 11.664 ÷ 16 = 0.729 grams. Six roti make one ana, so a roti is about 0.1215 grams.",
      "This ana is the gold-weight ana. It is not the old coin or the length unit of the same name.",
    ],
    worked: () => [`1 ana = ${c(1, "ana", "gram")} g.`, `8 ana = ${c(8, "ana", "gram")} g = ${c(8, "ana", "vori")} vori.`, `1 ana = ${c(1, "ana", "roti")} roti.`],
    faqs: [{ q: "How many grams is 1 ana of gold?", a: "0.729 grams." }, { q: "How many ana make a vori?", a: "16 ana make 1 vori." }, SAME, PURITY, PRIVACY],
    related: ["vori-to-gram", "gram-to-vori", "gold-weight-converter", "gold-price-calculator"],
  }),
  {
    slug: "bangla-gold-weight-converter",
    lang: "bn",
    units: ["vori", "ana", "roti", "masha", "tola", "gram", "kg", "troy-oz"],
    from: "vori",
    to: "gram",
    value: "১",
    h1: "ভরি, আনা, গ্রাম কনভার্টার",
    title: "ভরি থেকে গ্রাম কনভার্টার: ভরি, আনা, রতি, তোলা",
    description: "ভরি, আনা, রতি, তোলা, গ্রাম ও আউন্সের মধ্যে সোনার ওজন রূপান্তর করুন। ১ ভরি = ১১.৬৬৪ গ্রাম। বিনামূল্যে।",
    summary: "ভরি, আনা, রতি ও গ্রামে সোনার ওজন রূপান্তর।",
    intro: "ভরি, আনা, রতি, তোলা ও গ্রামের মধ্যে সোনা বা রুপার ওজন বদলে নিন।",
    keywords: ["ভরি থেকে গ্রাম", "গ্রাম থেকে ভরি", "আনা থেকে গ্রাম", "সোনার ওজন", "১ ভরি কত গ্রাম", "vori to gram bangla"],
    steps: ["ওজন লিখুন, বাংলা বা ইংরেজি অঙ্কে।", "যে এককে আছে এবং যে এককে চান তা বেছে নিন।", "ফল দেখুন। নিচের তালিকায় বাকি সব এককে একই ওজন দেখানো আছে।"],
    explanation: [
      "সোনা ও রুপা সাধারণত ভরিতে মাপা হয়। ১ ভরি = ১১.৬৬৪ গ্রাম = ১৬ আনা = ৯৬ রতি = ১২ মাশা। ১ আনা = ০.৭২৯ গ্রাম। ভারতে ও পাকিস্তানে একই ওজনকে তোলা বলা হয়।",
      "ক্যারেট যত-ই হোক, এক ভরির ওজন একই থাকে, দাম আলাদা হয়। ২২ ক্যারেট ও ১৮ ক্যারেট সোনার এক ভরি সমান ওজনের।",
    ],
    worked: () => [`১ ভরি = ${formatArea(VORI_GRAMS, true)} গ্রাম।`, `১০ গ্রাম = ${formatArea(convertWeight(10, "gram", "vori"), true)} ভরি।`, `১ আনা = ${formatArea(convertWeight(1, "ana", "gram"), true)} গ্রাম।`],
    tips: ["উল্টো দিকে রূপান্তরের জন্য ‘অদলবদল’ চাপুন।", "দোকানের নিক্তি ও রসিদের ওজন মিলিয়ে নিন, কারণ গয়নার ওজন সামান্য ভিন্ন হতে পারে।"],
    faqs: [
      { q: "১ ভরি কত গ্রাম?", a: "১১.৬৬৪ গ্রাম।" },
      { q: "১ আনা কত গ্রাম?", a: "০.৭২৯ গ্রাম। ১৬ আনায় ১ ভরি।" },
      { q: "১০ গ্রাম সোনা কত ভরি?", a: `প্রায় ${formatArea(convertWeight(10, "gram", "vori"), true)} ভরি।` },
      { q: "আমার দেওয়া সংখ্যা কি কোথাও পাঠানো হয়?", a: "না। সব হিসাব আপনার ব্রাউজারেই হয়।" },
    ],
    related: ["gold-weight-converter", "vori-to-gram", "gram-to-vori", "gold-price-calculator"],
  },
];

export const weightToolBySlug = new Map(weightTools.map((t) => [t.slug, t]));
export const weightUnitDefs = WEIGHT_UNITS;
