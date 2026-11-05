/* Numbers to words. Pure functions, no browser APIs. Integers are handled as digit strings and BigInt, so long numbers stay exact. */

export type LangId = "en" | "hi" | "bn" | "es" | "fr" | "de" | "pt" | "tr" | "id";
export type System = "indian" | "international";
export type CaseStyle = "title" | "sentence" | "lower" | "upper";

export interface WordOptions {
  lang: LangId;
  /** Digit grouping used for English. Hindi always groups the Indian way. */
  system: System;
  caseStyle: CaseStyle;
  /** British "and": one hundred and five. */
  useAnd: boolean;
  /** twenty-one instead of twenty one. */
  hyphen: boolean;
}

export const DEFAULT_OPTIONS: WordOptions = { lang: "en", system: "international", caseStyle: "title", useAnd: false, hyphen: true };

export const MAX_DIGITS: Record<LangId, number> = { en: 36, hi: 19, bn: 36, es: 12, fr: 12, de: 12, pt: 12, tr: 12, id: 12 };
const MAX_INDIAN_EN = 19;

/* ---------- parsing ---------- */

const ZERO_DIGITS: [number, string][] = [
  [0x09e6, "bn"],
  [0x0966, "hi"],
];

/** Turns Bangla and Devanagari digits into 0-9. */
export function asciiDigits(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    let mapped = ch;
    for (const [zero] of ZERO_DIGITS) {
      if (code >= zero && code <= zero + 9) mapped = String(code - zero);
    }
    out += mapped;
  }
  return out;
}

export interface Amount {
  negative: boolean;
  int: string;
  frac: string;
}

export function parseAmount(raw: string): Amount | { error: string } {
  const text = asciiDigits(raw).replace(/[\s,_']/g, "").replace(/^[+]/, "");
  if (text === "") return { error: "Type a number." };
  const m = /^(-?)(\d*)(?:\.(\d*))?$/.exec(text);
  if (!m || (m[2] === "" && (m[3] ?? "") === "")) return { error: "Use digits only, with an optional decimal point." };
  const int = (m[2] || "0").replace(/^0+(?=\d)/, "");
  return { negative: m[1] === "-", int, frac: m[3] ?? "" };
}

/** Rounds the fraction to `digits` places (half up). Returns new integer and fraction strings. */
export function roundFraction(int: string, frac: string, digits: number): { int: string; frac: string } {
  if (frac.length <= digits) return { int, frac: frac.padEnd(digits, "0") };
  const kept = frac.slice(0, digits);
  const up = frac.charCodeAt(digits) - 48 >= 5;
  if (!up) return { int, frac: kept };
  const scale = 10n ** BigInt(digits);
  const total = BigInt(int) * scale + BigInt(kept || "0") + 1n;
  const nextInt = (total / scale).toString();
  const nextFrac = digits ? (total % scale).toString().padStart(digits, "0") : "";
  return { int: nextInt, frac: nextFrac };
}

export function groupDigits(int: string, system: System): string {
  if (int.length <= 3) return int;
  const low = int.slice(-3);
  let rest = int.slice(0, -3);
  const parts: string[] = [];
  const size = system === "indian" ? 2 : 3;
  while (rest.length > size) {
    parts.unshift(rest.slice(-size));
    rest = rest.slice(0, -size);
  }
  if (rest) parts.unshift(rest);
  return `${parts.join(",")},${low}`;
}

/* ---------- English ---------- */

const EN_ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const EN_INTL = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion", "undecillion"];
const EN_INDIAN = ["thousand", "lakh", "crore", "arab", "kharab", "neel", "padma", "shankh"];

function en99(n: number, hyphen: boolean): string {
  if (n < 20) return EN_ONES[n];
  const t = EN_TENS[Math.floor(n / 10)];
  const u = n % 10;
  return u ? `${t}${hyphen ? "-" : " "}${EN_ONES[u]}` : t;
}

function en999(n: number, o: WordOptions): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(EN_ONES[h], "hundred");
  if (r) {
    if (h && o.useAnd) parts.push("and");
    parts.push(en99(r, o.hyphen));
  }
  return parts.join(" ");
}

function englishInternational(int: string, o: WordOptions): string {
  const padded = int.padStart(Math.ceil(int.length / 3) * 3, "0");
  const groups: number[] = [];
  for (let i = 0; i < padded.length; i += 3) groups.push(Number(padded.slice(i, i + 3)));
  const parts: string[] = [];
  groups.forEach((g, i) => {
    if (!g) return;
    const scale = groups.length - 1 - i;
    const words = en999(g, o);
    const needAnd = o.useAnd && scale === 0 && g < 100 && parts.length > 0;
    parts.push(`${needAnd ? "and " : ""}${words}${scale ? ` ${EN_INTL[scale]}` : ""}`);
  });
  return parts.join(" ");
}

/** Splits into [last three digits, then two-digit groups] and returns them lowest first. */
function indianGroups(int: string): number[] {
  const groups = [Number(int.slice(-3))];
  let rest = int.slice(0, -3);
  while (rest.length > 0) {
    groups.push(Number(rest.slice(-2)));
    rest = rest.slice(0, -2);
  }
  return groups;
}

function englishIndian(int: string, o: WordOptions): string {
  const groups = indianGroups(int);
  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    const words = i === 0 ? en999(g, o) : en99(g, o.hyphen);
    const needAnd = o.useAnd && i === 0 && g < 100 && parts.length > 0;
    parts.push(`${needAnd ? "and " : ""}${words}${i ? ` ${EN_INDIAN[i - 1]}` : ""}`);
  }
  return parts.join(" ");
}

/* ---------- Hindi ---------- */

const HI_99 = "शून्य,एक,दो,तीन,चार,पाँच,छह,सात,आठ,नौ,दस,ग्यारह,बारह,तेरह,चौदह,पंद्रह,सोलह,सत्रह,अठारह,उन्नीस,बीस,इक्कीस,बाईस,तेईस,चौबीस,पच्चीस,छब्बीस,सत्ताईस,अट्ठाईस,उनतीस,तीस,इकतीस,बत्तीस,तैंतीस,चौंतीस,पैंतीस,छत्तीस,सैंतीस,अड़तीस,उनतालीस,चालीस,इकतालीस,बयालीस,तैंतालीस,चवालीस,पैंतालीस,छियालीस,सैंतालीस,अड़तालीस,उनचास,पचास,इक्यावन,बावन,तिरपन,चौवन,पचपन,छप्पन,सत्तावन,अट्ठावन,उनसठ,साठ,इकसठ,बासठ,तिरसठ,चौंसठ,पैंसठ,छियासठ,सड़सठ,अड़सठ,उनहत्तर,सत्तर,इकहत्तर,बहत्तर,तिहत्तर,चौहत्तर,पचहत्तर,छिहत्तर,सतहत्तर,अठहत्तर,उन्यासी,अस्सी,इक्यासी,बयासी,तिरासी,चौरासी,पचासी,छियासी,सत्तासी,अट्ठासी,नवासी,नब्बे,इक्यानवे,बानवे,तिरानवे,चौरानवे,पचानवे,छियानवे,सत्तानवे,अट्ठानवे,निन्यानवे".split(",");
const HI_SCALES = ["हज़ार", "लाख", "करोड़", "अरब", "खरब", "नील", "पद्म", "शंख"];

function hi999(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(HI_99[h], "सौ");
  if (r) parts.push(HI_99[r]);
  return parts.join(" ");
}

function hindi(int: string): string {
  const groups = indianGroups(int);
  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    parts.push(i === 0 ? hi999(g) : `${HI_99[g]} ${HI_SCALES[i - 1]}`);
  }
  return parts.join(" ");
}

/* ---------- Bangla ---------- */

const BN_99 = "শূন্য,এক,দুই,তিন,চার,পাঁচ,ছয়,সাত,আট,নয়,দশ,এগারো,বারো,তেরো,চৌদ্দ,পনেরো,ষোলো,সতেরো,আঠারো,উনিশ,বিশ,একুশ,বাইশ,তেইশ,চব্বিশ,পঁচিশ,ছাব্বিশ,সাতাশ,আঠাশ,ঊনত্রিশ,ত্রিশ,একত্রিশ,বত্রিশ,তেত্রিশ,চৌত্রিশ,পঁয়ত্রিশ,ছত্রিশ,সাঁইত্রিশ,আটত্রিশ,ঊনচল্লিশ,চল্লিশ,একচল্লিশ,বিয়াল্লিশ,তেতাল্লিশ,চুয়াল্লিশ,পঁয়তাল্লিশ,ছেচল্লিশ,সাতচল্লিশ,আটচল্লিশ,ঊনপঞ্চাশ,পঞ্চাশ,একান্ন,বাহান্ন,তিপ্পান্ন,চুয়ান্ন,পঞ্চান্ন,ছাপ্পান্ন,সাতান্ন,আটান্ন,ঊনষাট,ষাট,একষট্টি,বাষট্টি,তেষট্টি,চৌষট্টি,পঁয়ষট্টি,ছেষট্টি,সাতষট্টি,আটষট্টি,ঊনসত্তর,সত্তর,একাত্তর,বাহাত্তর,তিয়াত্তর,চুয়াত্তর,পঁচাত্তর,ছিয়াত্তর,সাতাত্তর,আটাত্তর,ঊনআশি,আশি,একাশি,বিরাশি,তিরাশি,চুরাশি,পঁচাশি,ছিয়াশি,সাতাশি,অষ্টাশি,ঊননব্বই,নব্বই,একানব্বই,বিরানব্বই,তিরানব্বই,চুরানব্বই,পঁচানব্বই,ছিয়ানব্বই,সাতানব্বই,আটানব্বই,নিরানব্বই".split(",");
const BN_HUNDREDS = ["", "একশো", "দুইশো", "তিনশো", "চারশো", "পাঁচশো", "ছয়শো", "সাতশো", "আটশো", "নয়শো"];

function bangla(n: bigint): string {
  const CRORE = 10_000_000n;
  if (n >= CRORE) {
    const rest = n % CRORE;
    return `${bangla(n / CRORE)} কোটি${rest ? ` ${bangla(rest)}` : ""}`;
  }
  const v = Number(n);
  const lakh = Math.floor(v / 100000);
  const thousand = Math.floor((v % 100000) / 1000);
  const low = v % 1000;
  const parts: string[] = [];
  if (lakh) parts.push(`${BN_99[lakh]} লক্ষ`);
  if (thousand) parts.push(`${BN_99[thousand]} হাজার`);
  if (Math.floor(low / 100)) parts.push(BN_HUNDREDS[Math.floor(low / 100)]);
  if (low % 100) parts.push(BN_99[low % 100]);
  return parts.join(" ");
}

/* ---------- Spanish ---------- */

const ES_UNITS = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
const ES_TENS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const ES_HUNDREDS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

function es999(n: number, apocope: boolean): string {
  if (n === 100) return "cien";
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(ES_HUNDREDS[h]);
  if (r) {
    let w: string;
    if (r < 30) w = ES_UNITS[r];
    else w = r % 10 ? `${ES_TENS[Math.floor(r / 10)]} y ${ES_UNITS[r % 10]}` : ES_TENS[Math.floor(r / 10)];
    if (apocope) w = w.replace(/veintiuno$/, "veintiún").replace(/(^|\s)uno$/, "$1un");
    parts.push(w);
  }
  return parts.join(" ");
}

function esBelowMillion(n: number, apocope: boolean): string {
  const t = Math.floor(n / 1000);
  const r = n % 1000;
  const parts: string[] = [];
  if (t) parts.push(t === 1 ? "mil" : `${es999(t, true)} mil`);
  if (r) parts.push(es999(r, apocope));
  return parts.join(" ");
}

function spanish(n: bigint): string {
  const millions = Number(n / 1_000_000n);
  const rest = Number(n % 1_000_000n);
  const parts: string[] = [];
  if (millions) parts.push(`${esBelowMillion(millions, true)} ${millions === 1 ? "millón" : "millones"}`);
  if (rest) parts.push(esBelowMillion(rest, false));
  return parts.join(" ");
}

/* ---------- French ---------- */

const FR_UNITS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const FR_TENS = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];

function fr99(n: number, final: boolean): string {
  if (n < 20) return FR_UNITS[n];
  if (n < 70) {
    const t = FR_TENS[Math.floor(n / 10)];
    const u = n % 10;
    if (!u) return t;
    return u === 1 ? `${t} et un` : `${t}-${FR_UNITS[u]}`;
  }
  if (n < 80) return n === 71 ? "soixante et onze" : `soixante-${FR_UNITS[n - 60]}`;
  if (n === 80) return final ? "quatre-vingts" : "quatre-vingt";
  return `quatre-vingt-${FR_UNITS[n - 80]}`;
}

function fr999(n: number, final: boolean): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (!h) return fr99(r, final);
  let head = h === 1 ? "cent" : `${FR_UNITS[h]} cent${!r && final ? "s" : ""}`;
  if (r) head += ` ${fr99(r, final)}`;
  return head;
}

function french(n: bigint): string {
  const billions = Number(n / 1_000_000_000n);
  const millions = Number((n / 1_000_000n) % 1000n);
  const thousands = Number((n / 1000n) % 1000n);
  const low = Number(n % 1000n);
  const parts: string[] = [];
  if (billions) parts.push(`${fr999(billions, true)} milliard${billions > 1 ? "s" : ""}`);
  if (millions) parts.push(`${fr999(millions, true)} million${millions > 1 ? "s" : ""}`);
  if (thousands) parts.push(thousands === 1 ? "mille" : `${fr999(thousands, false)} mille`);
  if (low) parts.push(fr999(low, true));
  return parts.join(" ");
}

/* ---------- German ---------- */

const DE_UNITS = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
const DE_TENS = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];

function de99(n: number, attributive: boolean): string {
  if (n < 20) return n === 1 && attributive ? "ein" : DE_UNITS[n];
  const u = n % 10;
  const t = DE_TENS[Math.floor(n / 10)];
  return u ? `${u === 1 ? "ein" : DE_UNITS[u]}und${t}` : t;
}

function de999(n: number, attributive: boolean): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let out = "";
  if (h) out += `${h === 1 ? "ein" : DE_UNITS[h]}hundert`;
  if (r) out += de99(r, attributive);
  return out;
}

function german(n: bigint): string {
  const billions = Number(n / 1_000_000_000n);
  const millions = Number((n / 1_000_000n) % 1000n);
  const thousands = Number((n / 1000n) % 1000n);
  const low = Number(n % 1000n);
  const parts: string[] = [];
  if (billions) parts.push(billions === 1 ? "eine Milliarde" : `${de999(billions, true)} Milliarden`);
  if (millions) parts.push(millions === 1 ? "eine Million" : `${de999(millions, true)} Millionen`);
  let tail = "";
  if (thousands) tail += `${de999(thousands, true)}tausend`;
  if (low) tail += de999(low, false);
  if (tail) parts.push(tail);
  return parts.join(" ");
}

/* ---------- Portuguese (Brazil) ---------- */

const PT_UNITS = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const PT_TENS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const PT_HUNDREDS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function pt999(n: number): string {
  if (n === 100) return "cem";
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(PT_HUNDREDS[h]);
  if (r) parts.push(r < 20 ? PT_UNITS[r] : r % 10 ? `${PT_TENS[Math.floor(r / 10)]} e ${PT_UNITS[r % 10]}` : PT_TENS[Math.floor(r / 10)]);
  return parts.join(" e ");
}

/** The tail takes "e" when it is a single group that is below 100 or a round hundred. */
function ptSimpleTail(rest: bigint): boolean {
  if (rest === 0n) return false;
  let r = rest;
  while (r % 1000n === 0n) r /= 1000n;
  const g = Number(r);
  return g < 1000 && (g < 100 || g % 100 === 0);
}

function portuguese(n: bigint): string {
  const scales: [bigint, string, string][] = [
    [1_000_000_000n, "bilhão", "bilhões"],
    [1_000_000n, "milhão", "milhões"],
    [1000n, "mil", "mil"],
  ];
  let rest = n;
  const parts: string[] = [];
  for (const [size, one, many] of scales) {
    const g = Number(rest / size);
    rest %= size;
    if (!g) continue;
    parts.push(size === 1000n && g === 1 ? "mil" : `${pt999(g)} ${g === 1 ? one : many}`);
    if (rest > 0n) parts.push(ptSimpleTail(rest) ? "e" : "");
  }
  if (rest > 0n) parts.push(pt999(Number(rest)));
  return parts.filter(Boolean).join(" ");
}

/* ---------- Turkish ---------- */

const TR_UNITS = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const TR_TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];

function tr999(n: number): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  const parts: string[] = [];
  if (h) parts.push(h === 1 ? "yüz" : `${TR_UNITS[h]} yüz`);
  if (t) parts.push(TR_TENS[t]);
  if (u) parts.push(TR_UNITS[u]);
  return parts.join(" ");
}

function turkish(n: bigint): string {
  const billions = Number(n / 1_000_000_000n);
  const millions = Number((n / 1_000_000n) % 1000n);
  const thousands = Number((n / 1000n) % 1000n);
  const low = Number(n % 1000n);
  const parts: string[] = [];
  if (billions) parts.push(`${tr999(billions)} milyar`);
  if (millions) parts.push(`${tr999(millions)} milyon`);
  if (thousands) parts.push(thousands === 1 ? "bin" : `${tr999(thousands)} bin`);
  if (low) parts.push(tr999(low));
  return parts.join(" ");
}

/* ---------- Indonesian ---------- */

const ID_UNITS = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];

function id999(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(h === 1 ? "seratus" : `${ID_UNITS[h]} ratus`);
  if (r) {
    if (r < 10) parts.push(ID_UNITS[r]);
    else if (r === 10) parts.push("sepuluh");
    else if (r === 11) parts.push("sebelas");
    else if (r < 20) parts.push(`${ID_UNITS[r - 10]} belas`);
    else parts.push(`${ID_UNITS[Math.floor(r / 10)]} puluh${r % 10 ? ` ${ID_UNITS[r % 10]}` : ""}`);
  }
  return parts.join(" ");
}

function indonesian(n: bigint): string {
  const billions = Number(n / 1_000_000_000n);
  const millions = Number((n / 1_000_000n) % 1000n);
  const thousands = Number((n / 1000n) % 1000n);
  const low = Number(n % 1000n);
  const parts: string[] = [];
  if (billions) parts.push(`${id999(billions)} miliar`);
  if (millions) parts.push(`${id999(millions)} juta`);
  if (thousands) parts.push(thousands === 1 ? "seribu" : `${id999(thousands)} ribu`);
  if (low) parts.push(id999(low));
  return parts.join(" ");
}

/* ---------- public API ---------- */

const ZERO_WORD: Record<LangId, string> = { en: "zero", hi: "शून्य", bn: "শূন্য", es: "cero", fr: "zéro", de: "null", pt: "zero", tr: "sıfır", id: "nol" };
const POINT_WORD: Record<LangId, string> = { en: "point", hi: "दशमलव", bn: "দশমিক", es: "coma", fr: "virgule", de: "Komma", pt: "vírgula", tr: "virgül", id: "koma" };
const MINUS_WORD: Record<LangId, string> = { en: "minus", hi: "ऋण", bn: "ঋণাত্মক", es: "menos", fr: "moins", de: "minus", pt: "menos", tr: "eksi", id: "minus" };

export function digitLimit(lang: LangId, system: System): number {
  return lang === "en" && system === "indian" ? MAX_INDIAN_EN : MAX_DIGITS[lang];
}

/** Whole number in words. `int` must be digits only. Returns null when it is too long for the language. */
export function integerToWords(int: string, o: WordOptions): string | null {
  const clean = int.replace(/^0+(?=\d)/, "");
  if (clean.length > digitLimit(o.lang, o.system)) return null;
  if (/^0*$/.test(clean)) return ZERO_WORD[o.lang];
  const n = BigInt(clean);
  switch (o.lang) {
    case "en":
      return o.system === "indian" ? englishIndian(clean, o) : englishInternational(clean, o);
    case "hi":
      return hindi(clean);
    case "bn":
      return bangla(n);
    case "es":
      return spanish(n);
    case "fr":
      return french(n);
    case "de":
      return german(n);
    case "pt":
      return portuguese(n);
    case "tr":
      return turkish(n);
    case "id":
      return indonesian(n);
  }
}

export function applyCase(text: string, style: CaseStyle): string {
  if (style === "lower") return text;
  if (style === "upper") return text.toUpperCase();
  if (style === "sentence") return text.charAt(0).toUpperCase() + text.slice(1);
  return text.replace(/(^|[\s-])([a-z]+)/g, (all, sep: string, word: string) => (word === "and" && sep ? all : sep + word.charAt(0).toUpperCase() + word.slice(1)));
}

const digitWord = (d: string, o: WordOptions) => integerToWords(d, { ...o, lang: o.lang })!;

export type WordResult = { ok: true; words: string; digits: string } | { ok: false; error: string };

/** Plain number to words. A decimal part is read digit by digit ("point three four"). */
export function numberToWords(raw: string, o: WordOptions): WordResult {
  const a = parseAmount(raw);
  if ("error" in a) return { ok: false, error: a.error };
  const limit = digitLimit(o.lang, o.system);
  if (a.int.length > limit) return { ok: false, error: `That number has ${a.int.length} digits. This page handles up to ${limit}.` };
  let words = integerToWords(a.int, o)!;
  if (a.frac) words += ` ${POINT_WORD[o.lang]} ${a.frac.split("").map((d) => digitWord(d, o)).join(" ")}`;
  if (a.negative && !/^0*$/.test(a.int + a.frac)) words = `${MINUS_WORD[o.lang]} ${words}`;
  const system: System = o.lang === "en" ? o.system : o.lang === "hi" || o.lang === "bn" ? "indian" : "international";
  const digits = `${a.negative ? "-" : ""}${groupDigits(a.int, system)}${a.frac ? `.${a.frac}` : ""}`;
  return { ok: true, words: o.lang === "en" ? applyCase(words, o.caseStyle) : words, digits };
}

/* ---------- currencies ---------- */

export type CurrencyId = "INR" | "BDT" | "PKR" | "NPR" | "USD" | "GBP" | "EUR" | "AUD" | "CAD" | "AED" | "SGD";

export interface Currency {
  id: CurrencyId;
  name: string;
  symbol: string;
  major: [string, string];
  minor: [string, string];
  system: System;
  hi?: { major: string; minor: string };
  bn?: { major: string; minor: string };
}

export const CURRENCIES: Currency[] = [
  { id: "INR", name: "Indian rupee", symbol: "₹", major: ["Rupee", "Rupees"], minor: ["Paisa", "Paise"], system: "indian", hi: { major: "रुपये", minor: "पैसे" }, bn: { major: "রুপি", minor: "পয়সা" } },
  { id: "BDT", name: "Bangladeshi taka", symbol: "৳", major: ["Taka", "Taka"], minor: ["Paisa", "Paisa"], system: "indian", hi: { major: "टका", minor: "पैसा" }, bn: { major: "টাকা", minor: "পয়সা" } },
  { id: "PKR", name: "Pakistani rupee", symbol: "Rs", major: ["Rupee", "Rupees"], minor: ["Paisa", "Paisas"], system: "indian" },
  { id: "NPR", name: "Nepalese rupee", symbol: "Rs", major: ["Rupee", "Rupees"], minor: ["Paisa", "Paisa"], system: "indian" },
  { id: "USD", name: "US dollar", symbol: "$", major: ["Dollar", "Dollars"], minor: ["Cent", "Cents"], system: "international" },
  { id: "GBP", name: "British pound", symbol: "£", major: ["Pound", "Pounds"], minor: ["Penny", "Pence"], system: "international" },
  { id: "EUR", name: "Euro", symbol: "€", major: ["Euro", "Euros"], minor: ["Cent", "Cents"], system: "international" },
  { id: "AUD", name: "Australian dollar", symbol: "A$", major: ["Australian Dollar", "Australian Dollars"], minor: ["Cent", "Cents"], system: "international" },
  { id: "CAD", name: "Canadian dollar", symbol: "C$", major: ["Canadian Dollar", "Canadian Dollars"], minor: ["Cent", "Cents"], system: "international" },
  { id: "AED", name: "UAE dirham", symbol: "AED", major: ["Dirham", "Dirhams"], minor: ["Fils", "Fils"], system: "international" },
  { id: "SGD", name: "Singapore dollar", symbol: "S$", major: ["Singapore Dollar", "Singapore Dollars"], minor: ["Cent", "Cents"], system: "international" },
];
export const currencyById = new Map(CURRENCIES.map((c) => [c.id, c]));

export interface MoneyOptions extends WordOptions {
  currency: CurrencyId;
  /** Add "Only" / "মাত্র" / "केवल" at the end, as on cheques. */
  only: boolean;
}

export type MoneyResult = { ok: true; words: string; digits: string } | { ok: false; error: string };

/** Amount in words with the currency after the words, for example "One Thousand Two Hundred Rupees and Fifty Paise Only". */
export function moneyToWords(raw: string, o: MoneyOptions): MoneyResult {
  const a = parseAmount(raw);
  if ("error" in a) return { ok: false, error: a.error };
  if (a.negative) return { ok: false, error: "Enter an amount that is not negative." };
  const cur = currencyById.get(o.currency)!;
  const system: System = o.lang === "en" ? cur.system : o.lang === "hi" || o.lang === "bn" ? "indian" : o.system;
  const opts: WordOptions = { ...o, system, caseStyle: "lower" };
  const rounded = roundFraction(a.int, a.frac, 2);
  const limit = digitLimit(o.lang, system);
  if (rounded.int.length > limit) return { ok: false, error: `That amount has ${rounded.int.length} digits. This page handles up to ${limit}.` };
  const minor = Number(rounded.frac || "0");
  const isOne = rounded.int === "1" || rounded.int === "01";
  const majorWords = integerToWords(rounded.int, opts)!;
  const minorWords = minor ? integerToWords(String(minor), opts)! : "";
  const grouped = groupDigits(rounded.int, system);
  const digits = `${cur.symbol}${grouped}.${rounded.frac}`;
  const wholeZero = /^0+$/.test(rounded.int);

  if (o.lang === "hi" || o.lang === "bn") {
    const names = (o.lang === "hi" ? cur.hi : cur.bn) ?? { major: cur.major[1], minor: cur.minor[1] };
    const parts: string[] = [];
    if (!wholeZero || !minor) parts.push(`${majorWords} ${names.major}`);
    if (minor) parts.push(`${minorWords} ${names.minor}`);
    const end = o.only ? (o.lang === "hi" ? " केवल" : " মাত্র") : "";
    return { ok: true, words: `${parts.join(" ")}${end}`, digits };
  }
  if (o.lang !== "en") return { ok: false, error: "Currency words are available in English, Hindi and Bangla." };

  const majorName = isOne ? cur.major[0] : cur.major[1];
  const minorName = minor === 1 ? cur.minor[0] : cur.minor[1];
  const pieces: string[] = [];
  if (!wholeZero || !minor) pieces.push(`${majorWords} ${majorName}`);
  if (minor) {
    if (pieces.length) pieces.push("and");
    pieces.push(`${minorWords} ${minorName}`);
  }
  if (o.only) pieces.push("only");
  return { ok: true, words: applyCase(pieces.join(" ").toLowerCase(), o.caseStyle), digits };
}
