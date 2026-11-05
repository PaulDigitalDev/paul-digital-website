import test from "node:test";
import assert from "node:assert/strict";
import { parseInBase, toBase, group, toRoman, fromRoman } from "../src/lib/numberBases.ts";

test("binary and hex", () => {
  assert.equal(parseInBase("1010", 2), 10n);
  assert.equal(parseInBase("0b1111_1111", 2), 255n);
  assert.equal(parseInBase("ff", 16), 255n);
  assert.equal(parseInBase("0xFF", 16), 255n);
  assert.equal(parseInBase("-1A", 16), -26n);
  assert.equal(parseInBase("102", 2), null);
  assert.equal(parseInBase("", 10), null);
  assert.equal(toBase(255n, 2), "11111111");
  assert.equal(toBase(255n, 16), "FF");
  assert.equal(toBase(-10n, 2), "-1010");
});
test("large values stay exact", () => {
  const big = parseInBase("123456789012345678901234567890", 10);
  assert.equal(toBase(big, 10), "123456789012345678901234567890");
  assert.equal(parseInBase(toBase(big, 16), 16), big);
});
test("grouping", () => {
  assert.equal(group("1010", 2), "1010");
  assert.equal(group("101", 2), "0101");
  assert.equal(group("11111111", 2), "1111 1111");
});
test("roman numerals", () => {
  assert.equal(toRoman(4), "IV");
  assert.equal(toRoman(1994), "MCMXCIV");
  assert.equal(toRoman(3999), "MMMCMXCIX");
  assert.equal(toRoman(0), null);
  assert.equal(toRoman(4000), null);
  assert.equal(fromRoman("mcmxciv"), 1994);
  assert.equal(fromRoman("IIII"), null);
  assert.equal(fromRoman("IC"), null);
  assert.equal(fromRoman("ABC"), null);
});
