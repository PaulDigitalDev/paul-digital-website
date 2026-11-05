import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_OPTIONS as D, groupDigits, moneyToWords, numberToWords, parseAmount, roundFraction } from "../src/lib/numberWords.ts";

const words = (raw, o = {}) => {
  const r = numberToWords(raw, { ...D, caseStyle: "lower", ...o });
  assert.ok(r.ok, r.error);
  return r.words;
};
const money = (raw, o = {}) => {
  const r = moneyToWords(raw, { ...D, currency: "INR", only: true, caseStyle: "title", ...o });
  assert.ok(r.ok, r.error);
  return r.words;
};

test("English, international and Indian grouping", () => {
  assert.equal(words("1234567"), "one million two hundred thirty-four thousand five hundred sixty-seven");
  assert.equal(words("1234567", { system: "indian" }), "twelve lakh thirty-four thousand five hundred sixty-seven");
  assert.equal(words("100000", { system: "indian" }), "one lakh");
  assert.equal(words("1000000000", { system: "indian" }), "one arab");
  assert.equal(words("0"), "zero");
  assert.equal(words("40"), "forty");
  assert.equal(words("1000000000000000000000"), "one sextillion");
});

test("English options: and, hyphens, case, decimals, negative", () => {
  assert.equal(words("105", { useAnd: true }), "one hundred and five");
  assert.equal(words("1005", { useAnd: true }), "one thousand and five");
  assert.equal(words("21", { hyphen: false }), "twenty one");
  assert.equal(words("12.34"), "twelve point three four");
  assert.equal(words("-5"), "minus five");
  assert.equal(words("1,25,000"), "one hundred twenty-five thousand");
  assert.equal(numberToWords("21", D).words, "Twenty-One");
  assert.equal(numberToWords("105", { ...D, useAnd: true }).words, "One Hundred and Five");
});

test("long numbers are exact and limited", () => {
  assert.equal(words("999999999999999999999999999999999999").split(" ").length > 20, true);
  const tooLong = numberToWords("1" + "0".repeat(36), D);
  assert.equal(tooLong.ok, false);
  assert.equal(numberToWords("1" + "0".repeat(19), { ...D, system: "indian" }).ok, false);
  assert.equal(numberToWords("9".repeat(19), { ...D, system: "indian" }).ok, true);
});

test("parsing: commas, spaces, Bangla and Hindi digits, junk", () => {
  assert.deepEqual(parseAmount("1,234.50"), { negative: false, int: "1234", frac: "50" });
  assert.equal(words("১২৩"), "one hundred twenty-three");
  assert.equal(words("१२३", { lang: "hi" }), "एक सौ तेईस");
  assert.ok("error" in parseAmount("12abc"));
  assert.ok("error" in parseAmount(""));
  assert.equal(groupDigits("1234567", "indian"), "12,34,567");
  assert.equal(groupDigits("1234567", "international"), "1,234,567");
});

test("rounding the fraction to two places, with carry", () => {
  assert.deepEqual(roundFraction("9", "999", 2), { int: "10", frac: "00" });
  assert.deepEqual(roundFraction("5", "5", 2), { int: "5", frac: "50" });
  assert.deepEqual(roundFraction("5", "124", 2), { int: "5", frac: "12" });
});

test("Hindi and Bangla", () => {
  assert.equal(words("1234567", { lang: "hi" }), "बारह लाख चौंतीस हज़ार पाँच सौ सड़सठ");
  assert.equal(words("99", { lang: "hi" }), "निन्यानवे");
  assert.equal(words("2500000", { lang: "bn" }), "পঁচিশ লক্ষ");
  assert.equal(words("1234567890", { lang: "bn" }), "একশো তেইশ কোটি পঁয়তাল্লিশ লক্ষ সাতষট্টি হাজার আটশো নব্বই");
  assert.equal(words("100", { lang: "bn" }), "একশো");
  // every number 0..99 has a distinct word in both languages
  for (const lang of ["hi", "bn"]) {
    const seen = new Set();
    for (let i = 0; i < 100; i++) seen.add(words(String(i), { lang }));
    assert.equal(seen.size, 100, lang);
  }
});

test("European languages", () => {
  assert.equal(words("21000", { lang: "es" }), "veintiún mil");
  assert.equal(words("1001000000", { lang: "es" }), "mil un millones");
  assert.equal(words("100", { lang: "es" }), "cien");
  assert.equal(words("101", { lang: "es" }), "ciento uno");
  assert.equal(words("71", { lang: "fr" }), "soixante et onze");
  assert.equal(words("80", { lang: "fr" }), "quatre-vingts");
  assert.equal(words("200000", { lang: "fr" }), "deux cent mille");
  assert.equal(words("2000000", { lang: "fr" }), "deux millions");
  assert.equal(words("21", { lang: "de" }), "einundzwanzig");
  assert.equal(words("1234567", { lang: "de" }), "eine Million zweihundertvierunddreißigtausendfünfhundertsiebenundsechzig");
  assert.equal(words("1001", { lang: "pt" }), "mil e um");
  assert.equal(words("1230000", { lang: "pt" }), "um milhão duzentos e trinta mil");
  assert.equal(words("1000", { lang: "tr" }), "bin");
  assert.equal(words("11", { lang: "id" }), "sebelas");
  assert.equal(words("1234567", { lang: "id" }), "satu juta dua ratus tiga puluh empat ribu lima ratus enam puluh tujuh");
});

test("currency name comes after the words, before Only", () => {
  assert.equal(money("275000", { caseStyle: "sentence" }), "Two lakh seventy-five thousand rupees only");
  assert.equal(money("275000", { currency: "PKR" }), "Two Lakh Seventy-Five Thousand Rupees Only");
});

test("currency wording", () => {
  assert.equal(money("1250.5"), "One Thousand Two Hundred Fifty Rupees and Fifty Paise Only");
  assert.equal(money("1"), "One Rupee Only");
  assert.equal(money("0.75"), "Seventy-Five Paise Only");
  assert.equal(money("1.01", { currency: "USD" }), "One Dollar and One Cent Only");
  assert.equal(money("1234.999", { currency: "USD" }), "One Thousand Two Hundred Thirty-Five Dollars Only");
  assert.equal(money("1500000", { currency: "BDT" }), "Fifteen Lakh Taka Only");
  assert.equal(money("2000000", { currency: "GBP" }), "Two Million Pounds Only");
  assert.equal(money("50000", { currency: "BDT", lang: "bn" }), "পঞ্চাশ হাজার টাকা মাত্র");
  assert.equal(money("1234.5", { lang: "hi" }), "एक हज़ार दो सौ चौंतीस रुपये पचास पैसे केवल");
  assert.equal(moneyToWords("-5", { ...D, currency: "INR", only: true }).ok, false);
});
