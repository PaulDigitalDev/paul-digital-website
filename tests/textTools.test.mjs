import test from "node:test";
import assert from "node:assert/strict";
import { convertCase, countStats, formatDuration, keywordDensity, removeDuplicateLines, removeExtraSpaces, removeLineBreaks, repeatText, smsInfo } from "../src/lib/textTools.ts";

test("counts", () => {
  const s = countStats("Hello world. This is a test!\n\nSecond paragraph here.");
  assert.equal(s.words, 9);
  assert.equal(s.sentences, 3);
  assert.equal(s.paragraphs, 2);
  assert.equal(s.lines, 3);
  assert.equal(countStats("").words, 0);
  assert.equal(countStats("a b  c").words, 3);
  assert.equal(countStats("a a A b").uniqueWords, 2);
  assert.equal(countStats("héllo").bytes, 6);
});

test("characters vs graphemes: emoji and Bangla", () => {
  assert.equal(countStats("a😀").characters, 2);
  assert.equal(countStats("👨‍👩‍👧").graphemes, 1);
  const bn = countStats("বাংলা ভাষা");
  assert.equal(bn.words, 2);
  assert.ok(bn.graphemes < bn.characters);
  assert.equal(countStats("আমি ভালো আছি। তুমি কেমন আছো?").sentences, 2);
});

test("reading time", () => {
  assert.equal(formatDuration(238 / 238), "1 min");
  assert.equal(formatDuration(0.5), "30 sec");
  assert.equal(formatDuration(0), "0 sec");
  assert.equal(formatDuration(2.25), "2 min 15 sec");
});

test("keyword density ignores stop words", () => {
  const k = keywordDensity("Apple pie and apple tart and the apple cake");
  assert.equal(k[0].word, "apple");
  assert.equal(k[0].count, 3);
  assert.ok(!k.some((x) => x.word === "and"));
});

test("case conversions", () => {
  assert.equal(convertCase("hello WORLD", "upper"), "HELLO WORLD");
  assert.equal(convertCase("Hello World", "lower"), "hello world");
  assert.equal(convertCase("hello. how are you? fine", "sentence"), "Hello. How are you? Fine");
  assert.equal(convertCase("the lord of the rings", "title"), "The Lord of the Rings");
  assert.equal(convertCase("a tale of two cities", "capitalize"), "A Tale Of Two Cities");
  assert.equal(convertCase("hello world", "alternate"), "hElLo WoRlD");
  assert.equal(convertCase("Hello", "toggle"), "hELLO");
  assert.equal(convertCase("hello big world", "camel"), "helloBigWorld");
  assert.equal(convertCase("hello big world", "pascal"), "HelloBigWorld");
  assert.equal(convertCase("Hello Big-World", "snake"), "hello_big_world");
  assert.equal(convertCase("Hello Big World", "kebab"), "hello-big-world");
  assert.equal(convertCase("hello big world", "constant"), "HELLO_BIG_WORLD");
});

test("line breaks, spaces, repeats, duplicates", () => {
  assert.equal(removeLineBreaks("a\nb\r\nc", "space"), "a b c");
  assert.equal(removeLineBreaks("a\nb", "none"), "ab");
  assert.equal(removeLineBreaks("a\nb\n\nc\nd", "paragraphs"), "a b\n\nc d");
  assert.equal(removeExtraSpaces("  a   b  \n\n\n\n c ", { trimLines: true, collapse: true, blankLines: true }), "a b\n\nc");
  assert.deepEqual(repeatText("ab", 3, "-"), { text: "ab-ab-ab", truncated: false });
  assert.equal(repeatText("x", 5_000_000, "").truncated, true);
  assert.equal(repeatText("", 5, "").text, "");
  const d = removeDuplicateLines("a\nA\nb\na\n\n\nc", { caseSensitive: false, trim: true, dropEmpty: true });
  assert.equal(d.text, "a\nb\nc");
  assert.equal(d.removed, 4);
  assert.equal(removeDuplicateLines("a\nA", { caseSensitive: true, trim: true, dropEmpty: false }).text, "a\nA");
});

test("SMS: GSM-7, extension characters and Unicode", () => {
  assert.deepEqual(smsInfo("Hello"), { encoding: "GSM-7", units: 5, segments: 1, perSegment: 160, remaining: 155 });
  assert.equal(smsInfo("a".repeat(160)).segments, 1);
  assert.equal(smsInfo("a".repeat(161)).segments, 2);
  assert.equal(smsInfo("a".repeat(161)).perSegment, 153);
  assert.equal(smsInfo("€").units, 2);
  const u = smsInfo("হ্যালো");
  assert.equal(u.encoding, "Unicode (UCS-2)");
  assert.equal(smsInfo("আ".repeat(70)).segments, 1);
  assert.equal(smsInfo("আ".repeat(71)).segments, 2);
  assert.equal(smsInfo("").segments, 0);
  assert.equal(smsInfo("Hi 😀").encoding, "Unicode (UCS-2)");
});
