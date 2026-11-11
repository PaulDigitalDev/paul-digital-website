import type { Faq } from "./formatTools";
import { DEFAULT_OPTIONS, moneyToWords, numberToWords } from "../lib/numberWords.ts";
import type { CurrencyId, LangId, System } from "../lib/numberWords.ts";

export interface NumberWordTool {
  slug: string;
  mode: "number" | "money" | "cheque" | "bulk";
  lang: LangId;
  currency?: CurrencyId;
  system?: System;
  sample?: string;
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
const CHECK: Faq = { q: "Can I rely on this for cheques and legal documents?", a: "It follows the standard way of writing numbers, but you are responsible for what you write. Always read the words back against the figures before you sign or submit anything." };

const word = (raw: string, o: Partial<typeof DEFAULT_OPTIONS> = {}) => {
  const r = numberToWords(raw, { ...DEFAULT_OPTIONS, ...o });
  return r.ok ? r.words : r.error;
};
const money = (raw: string, currency: CurrencyId, o: Partial<typeof DEFAULT_OPTIONS> = {}) => {
  const r = moneyToWords(raw, { ...DEFAULT_OPTIONS, ...o, currency, only: true });
  return r.ok ? r.words : r.error;
};

const NUMBER_STEPS = ["Type or paste a number.", "Choose the letter style and number system if you need to.", "Read the words, then press Copy words."];
const MONEY_STEPS = ["Type the amount.", "Pick the currency and the language of the words.", "Copy the words with “Only” on the end, ready for a cheque or form."];
const NUMBER_TIPS = ["Commas, spaces and a decimal point are fine, so you can paste a figure straight from a sheet.", "Switch the letter style to match your form: Title Case, lower case or UPPER CASE.", "Numbers in Bangla or Hindi digits are understood too."];
const MONEY_TIPS = ["Amounts are rounded to two decimal places, as on a cheque.", "Check that the words and the figures match before you sign.", "Turn off “Only” if your form does not use it."];

interface CurrencyPage {
  slug: string;
  id: CurrencyId;
  h1: string;
  title: string;
  name: string;
  lead: string;
  example: string;
  explanation: string[];
  extraFaq: Faq;
  keywords: string[];
  related: string[];
}

function currencyPage(c: CurrencyPage): NumberWordTool {
  return {
    slug: c.slug,
    mode: "money",
    lang: "en",
    currency: c.id,
    sample: c.example,
    h1: c.h1,
    title: c.title,
    description: `${c.lead} Free, in your browser, nothing uploaded.`,
    summary: c.lead,
    intro: c.lead,
    keywords: c.keywords,
    steps: MONEY_STEPS,
    explanation: c.explanation,
    worked: () => [`${c.example} ${c.id} is written “${money(c.example, c.id)}”.`, `${money("1", c.id)}.`, `${money("0.99", c.id)}.`],
    tips: MONEY_TIPS,
    faqs: [c.extraFaq, { q: `How do I write ${c.name} amounts in words?`, a: `Write the whole amount in words, then the currency, then any minor units, and finish with “Only” if your form asks for it. For example: ${money(c.example, c.id)}.` }, CHECK, PRIVACY],
    related: c.related,
  };
}

const MONEY_RELATED = ["rupees-in-words", "cheque-amount-in-words", "number-to-words", "bulk-number-to-words"];

const LANG_MORE: Record<string, { more: string; faq: Faq }> = {
  "number-to-words-in-spanish": {
    more: "Numbers from 16 to 29 are single words (dieciséis, veintiuno), and from 31 upward the tens and units are joined with y: treinta y uno. Hundreds agree in gender with the noun, so 200 is doscientos for masculine and doscientas for feminine nouns. Millón takes de before a noun (un millón de euros), and Spanish uses the long scale, where mil millones is 10⁹ and billón is 10¹².",
    faq: { q: "Is a billón in Spanish the same as a billion?", a: "No. In Spanish a billón is 10¹², a million million. The English billion (10⁹) is mil millones." },
  },
  "number-to-words-in-french": {
    more: "Belgium and Switzerland use septante (70) and nonante (90) instead of soixante-dix and quatre-vingt-dix, and some Swiss cantons use huitante for 80. The 1990 spelling reform recommends hyphens throughout compound numbers, such as soixante-et-onze, while traditional usage keeps spaces. Million is a noun and takes de before a noun (deux millions de personnes), and milliard means 10⁹.",
    faq: { q: "Why do Belgian and Swiss French use septante and nonante?", a: "They keep the older, regular forms for 70 and 90 (septante, nonante), while France builds them from sixty and eighty (soixante-dix, quatre-vingt-dix). This page uses the standard French of France." },
  },
  "number-to-words-in-german": {
    more: "German writes numbers below one million as a single word, such as zweihundertvierunddreißig, and the number one is ein before a noun but eins when it stands alone. Million is a noun written separately (eine Million, zwei Millionen). Beware that Billion in German is 10¹², not the English billion: the English billion is Milliarde. Cheques in German-speaking countries show the amount as In Worten.",
    faq: { q: "Is a Billion in German the same as a billion in English?", a: "No. A German Billion is 10¹², a million million. The English billion (10⁹) is a Milliarde." },
  },
  "number-to-words-in-portuguese": {
    more: "Brazilian and European Portuguese differ in spelling and in large numbers: Brazil writes dezesseis and dezessete, Portugal writes dezasseis and dezassete, and Brazil uses bilhão for 10⁹ while Portugal uses mil milhões and reserves bilião for 10¹². The conjunction e joins the parts of a number, as in cento e vinte e três, and 1,001 is mil e um.",
    faq: { q: "Is a bilhão the same in Brazil and Portugal?", a: "No. A Brazilian bilhão is 10⁹. In Portugal 10⁹ is mil milhões, and a bilião is 10¹²." },
  },
  "number-to-words-in-turkish": {
    more: "Turkish numbers are written as separate words with spaces, with the tens before the units: 23 is yirmi üç and 125 is yüz yirmi beş. There is no grammatical gender and the words do not change form with the noun. Milyar means 10⁹ and trilyon means 10¹².",
    faq: { q: "How is 1,000 written in Turkish?", a: "1,000 is bin, without bir in front. Bir is only added for larger units, as in bir milyon." },
  },
  "number-to-words-in-indonesian": {
    more: "On invoices, receipts and forms in Indonesia the amount in words is introduced by the word terbilang, usually followed by rupiah. Tens use puluh (dua puluh is 20), teens use belas (dua belas is 12), and ten, eleven, one hundred and one thousand take se- (sepuluh, sebelas, seratus, seribu). Miliar is 10⁹ and triliun is 10¹².",
    faq: { q: "What does terbilang mean on an invoice?", a: "Terbilang means “in words”. It introduces the amount written out in words, normally followed by rupiah." },
  },
};

export const numberWordTools: NumberWordTool[] = [
  {
    slug: "number-to-words",
    mode: "number",
    lang: "en",
    system: "international",
    sample: "1234567",
    h1: "Number to Words Converter",
    title: "Number to Words Converter: Numbers to English Words",
    description: "Convert any number to words in English, up to 36 digits, with Indian (lakh, crore) and international (million, billion) systems. Free, in your browser.",
    summary: "Turn a number into English words, in the Indian or international system.",
    intro: "Type a number and read it in words straight away. Choose the Indian system (lakh, crore) or the international one (million, billion).",
    keywords: ["number to words", "convert number to words", "numbers in words", "number to text", "digits to words"],
    steps: NUMBER_STEPS,
    explanation: [
      "This converter writes any whole number up to 36 digits in English words, and reads a decimal part digit by digit, so 12.34 becomes twelve point three four.",
      "The Indian system groups digits as thousand, lakh and crore; the international system uses thousand, million and billion. The same figure has different groupings in each, so pick the one your document uses. Letters can be Title Case, lower case or UPPER CASE.",
    ],
    worked: () => [`1234567 reads “${word("1234567", { caseStyle: "lower" })}” in the international system.`, `The same number reads “${word("1234567", { caseStyle: "lower", system: "indian" })}” in the Indian system.`, `105 reads “${word("105", { caseStyle: "lower", useAnd: true })}” with the British “and”.`],
    tips: NUMBER_TIPS,
    faqs: [
      { q: "How do I convert a number to words?", a: "Type the number in the box. The words appear as you type, and you can copy them with one tap." },
      { q: "What is the largest number it can handle?", a: "In English it handles up to 36 digits in the international system and up to 19 digits in the Indian system." },
      { q: "What is the difference between the Indian and international systems?", a: "The international system counts thousands, millions and billions. The Indian system counts thousands, lakhs and crores. One lakh is 100,000 and one crore is 10,000,000." },
      PRIVACY,
    ],
    related: ["number-to-words-in-lakhs-and-crores", "rupees-in-words", "cheque-amount-in-words", "bulk-number-to-words"],
  },
  {
    slug: "number-to-words-in-lakhs-and-crores",
    mode: "number",
    lang: "en",
    system: "indian",
    sample: "12345678",
    h1: "Number to Words in Lakhs and Crores",
    title: "Number to Words in Lakhs and Crores (Indian System)",
    description: "Write any number in words using the Indian system: thousand, lakh, crore, arab and beyond, up to 19 digits. Free, in your browser.",
    summary: "Numbers in words with lakh, crore and arab, the Indian way.",
    intro: "See any figure written the Indian way, with lakh, crore and arab, and the matching 12,34,567 digit grouping.",
    keywords: ["number to words in lakhs and crores", "indian number system words", "lakh crore in words", "crore in words"],
    steps: NUMBER_STEPS,
    explanation: [
      "In the Indian system the first group has three digits, and every group after that has two: thousand, lakh, crore, arab, kharab, neel, padma and shankh. So 12345678 is written 1,23,45,678.",
      "This page handles up to 19 digits. For longer numbers use the main Number to Words Converter, which supports 36 digits with the international names.",
    ],
    worked: () => [`12345678 is “${word("12345678", { caseStyle: "lower", system: "indian" })}”.`, `100000 is “${word("100000", { caseStyle: "lower", system: "indian" })}”.`, `1000000000 is “${word("1000000000", { caseStyle: "lower", system: "indian" })}”.`],
    tips: NUMBER_TIPS,
    faqs: [
      { q: "How much is one crore?", a: "One crore is 10,000,000 (ten million), or 100 lakh." },
      { q: "How much is one lakh?", a: "One lakh is 100,000 (one hundred thousand)." },
      { q: "What comes after crore?", a: "Arab (100 crore, 1,000,000,000), then kharab, neel, padma and shankh." },
      PRIVACY,
    ],
    related: ["number-to-words", "rupees-in-words", "number-to-words-in-hindi", "million-to-crore-converter"],
  },
  {
    slug: "rupees-in-words",
    mode: "money",
    lang: "en",
    currency: "INR",
    sample: "125000.50",
    h1: "Rupees in Words",
    title: "Rupees in Words: Convert Amount to Words in Rupees",
    description: "Write an amount in words in Indian rupees and paise, in English, Hindi or Bangla, with “Only” for cheques and forms. Free, in your browser.",
    summary: "Write rupee amounts in words, with paise and “Only”, in English, Hindi or Bangla.",
    intro: "Type an amount to see it in words with rupees and paise. Copy it with “Only” on the end for a cheque, invoice or form.",
    keywords: ["rupees in words", "amount in words", "rupees in words converter", "figure to words rupees", "inr in words"],
    steps: MONEY_STEPS,
    explanation: [
      "Indian rupee amounts are written with the lakh and crore names: One Lakh Twenty-Five Thousand Rupees and Fifty Paise Only. Paise are the hundredth part of a rupee.",
      "The words can also be shown in Hindi or Bangla. Amounts with more than two decimal places are rounded to the nearest paisa.",
    ],
    worked: () => [`125000.50 is “${money("125000.50", "INR")}”.`, `${money("1", "INR")} for one rupee.`, `${money("99999999.99", "INR")}.`],
    tips: MONEY_TIPS,
    faqs: [
      { q: "How do I write an amount in words in rupees?", a: "Write the amount in words, then Rupees, then “and” and the paise in words if there are any, then Only. For example: " + money("1250.50", "INR") + "." },
      { q: "Is “Only” needed?", a: "Banks usually expect it on cheques so nothing can be added after the amount. The tick box lets you leave it out." },
      CHECK,
      PRIVACY,
    ],
    related: ["cheque-amount-in-words", "number-to-words-in-lakhs-and-crores", "number-to-words-in-hindi", "bulk-number-to-words"],
  },
  {
    slug: "cheque-amount-in-words",
    mode: "cheque",
    lang: "en",
    currency: "INR",
    sample: "45250",
    h1: "Cheque Amount in Words",
    title: "Cheque Amount in Words: Write Cheque Amounts Correctly",
    description: "Write the amount in words for a cheque in rupees, taka, dollars, pounds and more. Includes a cheque preview and “Only”. Free, in your browser.",
    summary: "Amount in words for a cheque, with a preview and “Only” on the end.",
    intro: "Enter the amount from your cheque and copy the words to write on the “Amount in words” line. A small preview shows how it will look.",
    keywords: ["cheque amount in words", "cheque writer", "check amount in words", "cheque writing", "how to write cheque amount in words"],
    steps: MONEY_STEPS,
    explanation: [
      "On a cheque the amount in words must match the figures. The words go on the line below the payee, and writing “Only” after them stops anyone adding to the amount.",
      "Start the words at the far left of the line and draw a line through any space that is left. Pick your currency above, and switch the words to Hindi or Bangla if your bank form uses them.",
    ],
    worked: () => [`45250 in rupees is “${money("45250", "INR")}”.`, `1500.75 in dollars is “${money("1500.75", "USD")}”.`, `2000000 in taka is “${money("2000000", "BDT")}”.`],
    tips: ["Leave no space before the first word or after the last one on the line.", "If the words and the figures differ, banks usually follow the words, so check both.", ...MONEY_TIPS.slice(0, 1)],
    faqs: [
      { q: "How do I write the amount in words on a cheque?", a: "Write the amount in words, the currency name and “Only”. This page builds all three for you." },
      { q: "Which is correct if the words and figures differ?", a: "Rules vary by country and bank, and many banks treat the words as the amount. Always make them match." },
      CHECK,
      PRIVACY,
    ],
    related: ["rupees-in-words", "taka-in-words", "dollars-in-words", "bulk-number-to-words"],
  },
  {
    slug: "taka-in-words",
    mode: "money",
    lang: "en",
    currency: "BDT",
    sample: "150000",
    h1: "Taka in Words",
    title: "Taka in Words: Convert Taka to English and Bangla Words",
    description: "Write Bangladeshi taka and poisha in words, in English or in Bangla (টাকা কথায়), with “Only”/“মাত্র” for cheques. Free, in your browser.",
    summary: "Write taka amounts in words in English or Bangla, with poisha and “Only”.",
    intro: "Enter a taka amount and get it in English words or in Bangla (কথায়), with poisha and “Only”. Switch “Words in” to Bangla for the Bangla version.",
    keywords: ["taka in words", "taka in bangla words", "টাকা কথায়", "amount in words bdt", "taka to words converter", "টাকার অংক কথায়"],
    steps: MONEY_STEPS,
    explanation: [
      "Bangladeshi taka uses the lakh and crore names. Choose “Words in: Bangla” to see the amount as, for example, পঞ্চাশ হাজার টাকা মাত্র.",
      "Poisha, the hundredth part of a taka, are added after the taka when the amount has decimals. The Bangla number names are written out in full, so check spelling on formal documents.",
    ],
    worked: () => [`150000 is “${money("150000", "BDT")}” in English.`, `The same amount in Bangla is “${money("150000", "BDT", { lang: "bn" })}”.`, `${money("2500.50", "BDT", { lang: "bn" })}.`],
    tips: MONEY_TIPS,
    faqs: [
      { q: "How do I write taka in words in Bangla?", a: "Set “Words in” to Bangla. For example 50000 becomes " + money("50000", "BDT", { lang: "bn" }) + "." },
      { q: "What are poisha?", a: "Poisha are the hundredth part of a taka, like paise for rupees." },
      CHECK,
      PRIVACY,
    ],
    related: ["number-to-words-in-bangla", "cheque-amount-in-words", "bangla-date-converter", "rupees-in-words"],
  },
  {
    slug: "number-to-words-in-bangla",
    mode: "number",
    lang: "bn",
    sample: "1234567",
    h1: "Number to Words in Bangla",
    title: "Number to Words in Bangla: সংখ্যা থেকে বাংলা কথায়",
    description: "Write any number in Bangla words (সংখ্যা কথায়) with লক্ষ and কোটি. Understands Bangla digits too. Free, in your browser.",
    summary: "Numbers in Bangla words, with লক্ষ and কোটি.",
    intro: "Type a number to see it in Bangla words. Bangla digits such as ১২৩৪ work as well.",
    keywords: ["number to words in bangla", "সংখ্যা কথায়", "bangla number to words", "বাংলায় সংখ্যা", "bengali number to words"],
    steps: NUMBER_STEPS,
    explanation: [
      "Bangla has a different word for every number from 1 to 99, so they cannot be built from tens and units. This page uses the standard forms, such as একুশ, উনত্রিশ and নিরানব্বই.",
      "Larger numbers use শো, হাজার, লক্ষ and কোটি. Above a crore the page repeats কোটি, so 100 crore reads একশো কোটি.",
    ],
    worked: () => [`1234567 is “${word("1234567", { lang: "bn" })}”.`, `21 is “${word("21", { lang: "bn" })}” and 99 is “${word("99", { lang: "bn" })}”.`, `১২৩ is “${word("১২৩", { lang: "bn" })}”.`],
    tips: ["Some words have more than one accepted spelling. The page uses one standard form.", "For money, use Taka in Words, which adds টাকা and মাত্র.", ...NUMBER_TIPS.slice(2)],
    faqs: [
      { q: "How do I write a number in Bangla words?", a: "Type the number. It appears in Bangla words straight away, and you can copy it." },
      { q: "Does it accept Bangla digits?", a: "Yes. You can type ১২৩ or 123." },
      { q: "Is লক্ষ the same as লাখ?", a: "Yes. This page writes লক্ষ, which is the form usually used on bank forms." },
      PRIVACY,
    ],
    related: ["taka-in-words", "number-to-words-in-hindi", "number-to-words", "bangla-date-converter"],
  },
  {
    slug: "number-to-words-in-hindi",
    mode: "number",
    lang: "hi",
    sample: "1234567",
    h1: "Number to Words in Hindi",
    title: "Number to Words in Hindi: अंकों को शब्दों में",
    description: "Write any number in Hindi words (अंकों को शब्दों में) with लाख, करोड़ and अरब, up to 19 digits. Free, in your browser.",
    summary: "Numbers in Hindi words, with लाख, करोड़ and अरब.",
    intro: "Type a number to read it in Hindi words, written the Indian way with हज़ार, लाख and करोड़.",
    keywords: ["number to words in hindi", "अंकों को शब्दों में", "hindi number to words", "संख्या शब्दों में", "numbers in hindi words"],
    steps: NUMBER_STEPS,
    explanation: [
      "Hindi has a separate word for every number from 1 to 99, so 21 is इक्कीस and 99 is निन्यानवे. This page uses the standard written forms.",
      "Larger numbers use सौ, हज़ार, लाख, करोड़, अरब, खरब, नील, पद्म and शंख. The page handles up to 19 digits and accepts Devanagari digits like १२३.",
    ],
    worked: () => [`1234567 is “${word("1234567", { lang: "hi" })}”.`, `21 is “${word("21", { lang: "hi" })}”.`, `१०० is “${word("१००", { lang: "hi" })}”.`],
    tips: ["For rupee amounts with रुपये and केवल, use Rupees in Words and set the words to Hindi.", ...NUMBER_TIPS.slice(0, 1)],
    faqs: [
      { q: "How do I write a number in Hindi words?", a: "Type the number in the box. The Hindi words appear immediately." },
      { q: "Can I type in Devanagari digits?", a: "Yes. १२३ and 123 both work." },
      { q: "How do I write rupees in Hindi words?", a: "Use the Rupees in Words page and set “Words in” to Hindi." },
      PRIVACY,
    ],
    related: ["rupees-in-words", "number-to-words-in-lakhs-and-crores", "number-to-words-in-bangla", "number-to-words"],
  },
  {
    slug: "bulk-number-to-words",
    mode: "bulk",
    lang: "en",
    sample: "1250\n99999.50\n1500000",
    h1: "Bulk Number to Words",
    title: "Bulk Number to Words: Convert a List of Numbers",
    description: "Paste a list of numbers, one per line, and get each one in words, as plain numbers or as money. Copy the result tab separated for a sheet.",
    summary: "Convert a whole list of numbers to words at once.",
    intro: "Paste numbers, one per line, and read all of them in words. Copy the result back into a spreadsheet.",
    keywords: ["bulk number to words", "excel number to words", "list of numbers to words", "convert multiple numbers to words", "spreadsheet amount in words"],
    steps: ["Paste your numbers, one on each line.", "Choose plain numbers or a currency, and the language of the words.", "Press Copy all and paste into your sheet. Number and words are separated by a tab."],
    explanation: [
      "Paste a column from a spreadsheet and each line is converted separately. Lines that are not numbers show a short message instead of words.",
      "Up to 500 lines are converted at a time. The result is tab separated, so it drops straight into two spreadsheet columns.",
    ],
    worked: () => [`1250 becomes “${word("1250", { caseStyle: "lower" })}”.`, `99999.50 as rupees becomes “${money("99999.50", "INR")}”.`],
    tips: ["Pick a currency in “Convert as” to get cheque-style words for every line.", "Remove blank lines or headers before you paste for a cleaner result."],
    faqs: [
      { q: "How do I convert a column of numbers to words?", a: "Copy the column from your sheet, paste it into the box, then press Copy all and paste the result back." },
      { q: "How many numbers can I convert at once?", a: "Up to 500 lines." },
      PRIVACY,
    ],
    related: ["number-to-words", "rupees-in-words", "cheque-amount-in-words", "number-to-words-in-lakhs-and-crores"],
  },

  currencyPage({
    slug: "dollars-in-words",
    id: "USD",
    h1: "Dollars in Words",
    title: "Dollars in Words: Convert USD Amount to Words",
    name: "US dollar",
    lead: "Write a US dollar amount in words, with cents and “Only”, for checks and forms.",
    example: "1234.56",
    explanation: ["US checks need the amount in words as well as figures. Dollars come after the number, with cents added after “and”: One Thousand Two Hundred Thirty-Four Dollars and Fifty-Six Cents Only.", "Amounts are rounded to the nearest cent. Use lower case or UPPER CASE letters if your form prefers them."],
    extraFaq: { q: "How do I write a check amount in words?", a: "Write the dollars in words, then “and”, then the cents in words (or as a fraction like 56/100 if your bank prefers it). This page writes the cents in words." },
    keywords: ["dollars in words", "usd in words", "check amount in words", "write dollars in words", "dollar amount to words"],
    related: ["cheque-amount-in-words", "pounds-in-words", "euros-in-words", "number-to-words"],
  }),
  currencyPage({
    slug: "pounds-in-words",
    id: "GBP",
    h1: "Pounds in Words",
    title: "Pounds in Words: Convert GBP Amount to Words",
    name: "British pound",
    lead: "Write a pound sterling amount in words, with pence and “Only”, for cheques and forms.",
    example: "2750.25",
    explanation: ["UK cheques need the amount in words. Pounds come after the number and pence after “and”: Two Thousand Seven Hundred Fifty Pounds and Twenty-Five Pence Only.", "Turn on “Use and” on the number page if you want the British “and” inside a number, as in one hundred and five."],
    extraFaq: { q: "How do I write pounds and pence in words?", a: "Write the pounds in words, then “and”, then the pence in words, then “Only”." },
    keywords: ["pounds in words", "gbp in words", "pounds sterling in words", "cheque amount in words uk"],
    related: ["cheque-amount-in-words", "dollars-in-words", "euros-in-words", "number-to-words"],
  }),
  currencyPage({
    slug: "euros-in-words",
    id: "EUR",
    h1: "Euros in Words",
    title: "Euros in Words: Convert EUR Amount to Words",
    name: "euro",
    lead: "Write a euro amount in words, with cents and “Only”, for cheques, invoices and forms.",
    example: "3500.80",
    explanation: ["Euro amounts are written with the number first, then Euros, then Cents: Three Thousand Five Hundred Euros and Eighty Cents Only.", "These are English words for euro amounts. For the number itself in French, German, Spanish or Portuguese, see the language pages."],
    extraFaq: { q: "How do I write euros in words?", a: "Write the whole euros in words, then “Euros”, then “and” and the cents in words, then “Only”." },
    keywords: ["euros in words", "eur in words", "euro amount in words", "write euros in words"],
    related: ["cheque-amount-in-words", "dollars-in-words", "pounds-in-words", "number-to-words-in-german"],
  }),
  currencyPage({
    slug: "australian-dollars-in-words",
    id: "AUD",
    h1: "Australian Dollars in Words",
    title: "Australian Dollars in Words: Convert AUD to Words",
    name: "Australian dollar",
    lead: "Write an Australian dollar amount in words, with cents and “Only”, for cheques and forms.",
    example: "8450.10",
    explanation: ["The currency is named in full so it cannot be mistaken for another dollar: Eight Thousand Four Hundred Fifty Australian Dollars and Ten Cents Only. Several countries, including Australia, New Zealand and Canada, use the dollar sign, so the word Australian removes any doubt about which currency is meant.", "Australian dollars are divided into 100 cents. The 1 and 2 cent coins were withdrawn in 1992, so cash payments are rounded to the nearest 5 cents, but cheques, invoices and bank transfers keep the exact cents. In Australian law, as in most common-law countries, the amount in words generally takes priority over the figures if they differ, so write the words carefully and check them with your bank.", "Use the plain Dollars in Words page if your form just says dollars, and the Canadian page for Canadian dollars."],
    extraFaq: { q: "How do I write an Australian dollar amount in words?", a: "Write the whole dollars in words, then “Australian Dollars”, then “and” and the cents in words, then “Only”. For $8,450.10 that is Eight Thousand Four Hundred Fifty Australian Dollars and Ten Cents Only." },
    keywords: ["australian dollars in words", "aud in words", "aud amount in words", "cheque amount in words australia"],
    related: ["dollars-in-words", "canadian-dollars-in-words", "cheque-amount-in-words", "number-to-words"],
  }),
  currencyPage({
    slug: "canadian-dollars-in-words",
    id: "CAD",
    h1: "Canadian Dollars in Words",
    title: "Canadian Dollars in Words: Convert CAD to Words",
    name: "Canadian dollar",
    lead: "Write a Canadian dollar amount in words, with cents and “Only”, for cheques and forms.",
    example: "6120.45",
    explanation: ["The currency is named in full: Six Thousand One Hundred Twenty Canadian Dollars and Forty-Five Cents Only. This avoids confusion with the US dollar, which uses the same dollar sign and is common in cross-border trade.", "Canada withdrew the one cent coin in 2012, and cash totals are rounded to the nearest 5 cents, but cheques and electronic payments keep exact cents. The one dollar coin is nicknamed the loonie and the two dollar coin the toonie, but on a cheque you write the full amount in dollars.", "Canadian cheques may be written in English or French, and in most common-law provinces the amount in words generally takes priority over the figures if the two differ. Always check the words against the figures before you sign."],
    extraFaq: { q: "How do I write a Canadian cheque amount in words?", a: "Write the dollars in words, then “Canadian Dollars”, then “and” and the cents in words, then “Only”. For $6,120.45 that is Six Thousand One Hundred Twenty Canadian Dollars and Forty-Five Cents Only." },
    keywords: ["canadian dollars in words", "cad in words", "cad amount in words", "cheque amount in words canada"],
    related: ["dollars-in-words", "australian-dollars-in-words", "cheque-amount-in-words", "number-to-words"],
  }),
  currencyPage({
    slug: "pakistani-rupees-in-words",
    id: "PKR",
    h1: "Pakistani Rupees in Words",
    title: "Pakistani Rupees in Words: Convert PKR to Words",
    name: "Pakistani rupee",
    lead: "Write a Pakistani rupee amount in words, with lakh and crore, paisas and “Only”.",
    example: "275000",
    explanation: ["Pakistani rupees use the lakh and crore names, like Indian rupees: Two Lakh Seventy-Five Thousand Rupees Only.", "Paisas are the hundredth part of a rupee and are added when the amount has decimals."],
    extraFaq: { q: "How do I write rupees in words in Pakistan?", a: "Write the amount in words with lakh and crore, then Rupees, then Only." },
    keywords: ["pakistani rupees in words", "pkr in words", "rupees in words pakistan", "amount in words pkr"],
    related: ["rupees-in-words", "cheque-amount-in-words", "number-to-words-in-lakhs-and-crores", "taka-in-words"],
  }),

  ...(
    [
      { slug: "number-to-words-in-spanish", lang: "es" as const, name: "Spanish", title: "Number to Words in Spanish: Números a Letras", sample: "1234567", note: ["Spanish writes uno as un before a noun and veintiuno as veintiún (veintiún mil). 100 is cien on its own and ciento before more (ciento uno). A thousand million is mil millones.", "This page handles up to 12 digits."], tip: "cien, ciento", keywords: ["number to words in spanish", "números a letras", "numeros en letras", "spanish numbers in words"], examples: ["21000", "100", "1001000000"] },
      { slug: "number-to-words-in-french", lang: "fr" as const, name: "French", title: "Number to Words in French: Nombres en Lettres", sample: "1234567", note: ["French builds 70 to 99 from twenty: soixante-dix (70), quatre-vingts (80), quatre-vingt-dix (90). Quatre-vingts and cents take an s only when nothing follows them.", "Mille never takes an s, and 21, 31, 41, 51, 61 and 71 use “et un”. This page handles up to 12 digits."], tip: "soixante et onze", keywords: ["number to words in french", "nombres en lettres", "chiffres en lettres", "french numbers in words"], examples: ["71", "80", "200000"] },
      { slug: "number-to-words-in-german", lang: "de" as const, name: "German", title: "Number to Words in German: Zahlen in Worten", sample: "1234567", note: ["German writes numbers up to 999,999 as one long word and puts the units before the tens: einundzwanzig is “one and twenty”. Million and Milliarde are separate words.", "This page handles up to 12 digits."], tip: "einundzwanzig", keywords: ["number to words in german", "zahlen in worten", "zahl in buchstaben", "german numbers in words"], examples: ["21", "1101", "1234567"] },
      { slug: "number-to-words-in-portuguese", lang: "pt" as const, name: "Portuguese", title: "Number to Words in Portuguese: Números por Extenso", sample: "1234567", note: ["This page uses Brazilian spelling, for example dezesseis and dezessete. Parts of a number are joined with “e”, and 100 is cem alone but cento before more.", "This page handles up to 12 digits."], tip: "cem, cento", keywords: ["number to words in portuguese", "números por extenso", "numero por extenso", "portuguese numbers in words"], examples: ["1001", "1230000", "100"] },
      { slug: "number-to-words-in-turkish", lang: "tr" as const, name: "Turkish", title: "Number to Words in Turkish: Sayıyı Yazıya Çevir", sample: "1234567", note: ["Turkish leaves out bir before yüz (hundred) and bin (thousand), so 100 is yüz and 1,000 is bin, but one million is bir milyon.", "This page handles up to 12 digits."], tip: "yüz, bin", keywords: ["number to words in turkish", "sayıyı yazıya çevir", "rakamı yazıya çevir", "turkish numbers in words"], examples: ["1000", "100", "1234567"] },
      { slug: "number-to-words-in-indonesian", lang: "id" as const, name: "Indonesian", title: "Number to Words in Indonesian: Angka ke Kata", sample: "1234567", note: ["Indonesian uses se- instead of satu for ten to twelve and for hundreds and thousands: sepuluh, sebelas, seratus, seribu. Teens use belas, as in dua belas.", "This page handles up to 12 digits."], tip: "seratus, seribu", keywords: ["number to words in indonesian", "angka ke kata", "terbilang", "indonesian numbers in words"], examples: ["11", "2000", "1234567"] },
    ] as const
  ).map(
    (l): NumberWordTool => ({
      slug: l.slug,
      mode: "number",
      lang: l.lang,
      sample: l.sample,
      h1: `Number to Words in ${l.name}`,
      title: l.title,
      description: `Write any number in ${l.name} words, up to 12 digits, instantly as you type. Free, private, runs in your browser and nothing is uploaded.`,
      summary: `Numbers written out in ${l.name} words.`,
      intro: `Type a number to read it in ${l.name} words.`,
      keywords: [...l.keywords],
      steps: ["Type or paste a number.", `Read the ${l.name} words.`, "Press Copy words."],
      explanation: [...l.note, LANG_MORE[l.slug].more],
      worked: () => l.examples.map((n) => `${n} is “${word(n, { lang: l.lang })}”.`),
      tips: ["Spelling and wording follow the standard written form. Check formal documents with a fluent speaker.", NUMBER_TIPS[0]],
      faqs: [
        { q: `How do I write a number in ${l.name} words?`, a: `Type the number in the box and the ${l.name} words appear straight away.` },
        { q: "How large a number can it handle?", a: "Up to 12 digits, which is hundreds of billions." },
        LANG_MORE[l.slug].faq,
        { q: "Is this checked by a native speaker?", a: "The words follow the standard rules for the language, but treat them as a helper and check formal or legal documents with a fluent speaker." },
        PRIVACY,
      ],
      related: ["number-to-words", "number-to-words-in-hindi", "number-to-words-in-bangla", "bulk-number-to-words"],
    }),
  ),
];

export const numberWordToolBySlug = new Map(numberWordTools.map((tool) => [tool.slug, tool]));
