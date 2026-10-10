import test from "node:test";
import assert from "node:assert/strict";
import { parseKb, encodeInRangeWith, kbToBytes, validateRange, rangeOutcome, MAX_ATTEMPTS } from "../src/lib/sizeRange.ts";

/** Deterministic fake encoder: size grows with quality. Returns the blobs it produced. */
function fake(sizeAt) {
  const made = [];
  const calls = [];
  const encode = async (q) => {
    calls.push(q);
    const b = new Blob([new Uint8Array(Math.round(sizeAt(q)))], { type: "image/jpeg" });
    made.push(b);
    return b;
  };
  return { encode, made, calls };
}
const MIN = kbToBytes(20);
const MAX = kbToBytes(30);

test("kb unit is 1024 bytes", () => assert.equal(kbToBytes(20), 20480));

test("achievable 20-30 KB range lands inside it", async () => {
  // 10 KB at q=0.1 up to 40 KB at q=1: 0.92 gives ~37 KB (too big), the window is mid-quality.
  const f = fake((q) => kbToBytes(10 + 30 * ((q - 0.1) / 0.9)));
  const r = await encodeInRangeWith(f.encode, false, MIN, MAX, 0.92);
  assert.ok(r.blob.size >= MIN && r.blob.size <= MAX, `size ${r.blob.size}`);
  assert.equal(r.belowMin, false);
  assert.equal(r.met, true);
  assert.equal(rangeOutcome(r.blob.size, MIN, MAX), "in-range");
  assert.ok(r.attempts <= MAX_ATTEMPTS);
});

test("narrow window that coarse 0.04 steps would skip is still found", async () => {
  // size jumps steeply: only q in ~[0.50,0.52] is inside 20-30 KB
  const f = fake((q) => kbToBytes(20 + (q - 0.5) * 500));
  const r = await encodeInRangeWith(f.encode, false, MIN, MAX, 0.92);
  assert.ok(r.blob.size >= MIN && r.blob.size <= MAX, `size ${r.blob.size}`);
});

test("stays below 20 KB after bounded attempts and is flagged", async () => {
  const f = fake(() => 5000); // size ignores quality, like a flat signature
  const r = await encodeInRangeWith(f.encode, false, MIN, MAX, 0.92);
  assert.equal(r.belowMin, true);
  assert.equal(rangeOutcome(r.blob.size, MIN, MAX), "below-min");
  assert.ok(f.calls.length <= MAX_ATTEMPTS);
  assert.equal(r.blob.size, 5000);
});

test("output above 30 KB at the lowest quality is flagged as over the limit", async () => {
  const f = fake(() => kbToBytes(80));
  const r = await encodeInRangeWith(f.encode, false, MIN, MAX, 0.92);
  assert.equal(r.met, false);
  assert.equal(rangeOutcome(r.blob.size, MIN, MAX), "above-max");
  assert.ok(f.calls.length <= MAX_ATTEMPTS);
});

test("minimum greater than maximum is rejected before any encoding", async () => {
  assert.match(validateRange(kbToBytes(40), kbToBytes(30)), /larger than the maximum/);
  const f = fake(() => 1000);
  await assert.rejects(() => encodeInRangeWith(f.encode, false, kbToBytes(40), kbToBytes(30)));
  assert.equal(f.calls.length, 0);
});

test("maximum-only behaviour is unchanged (first step that fits, no upward search)", async () => {
  const f = fake((q) => kbToBytes(60 * q));
  const r = await encodeInRangeWith(f.encode, false, null, MAX, 0.92);
  assert.equal(r.met, true);
  assert.ok(r.blob.size <= MAX);
  assert.deepEqual(f.calls, [0.92, 0.85, 0.78, 0.71, 0.64, 0.57, 0.5]);
  assert.equal(r.belowMin, false);
});

test("reported size is that of the very Blob returned for download", async () => {
  const f = fake((q) => kbToBytes(10 + 30 * ((q - 0.1) / 0.9)));
  const r = await encodeInRangeWith(f.encode, false, MIN, MAX, 0.92);
  assert.ok(f.made.includes(r.blob), "returned blob must be one that was encoded");
  assert.equal(rangeOutcome(r.blob.size, MIN, MAX), "in-range");
  assert.equal(r.belowMin, r.blob.size < MIN);
});

test("PNG (lossless) is never searched", async () => {
  const f = fake(() => 5000);
  const r = await encodeInRangeWith(f.encode, true, MIN, MAX, 0.92);
  assert.equal(f.calls.length, 1);
  assert.equal(r.belowMin, true);
});

test("parseKb accepts decimal KB and converts with 1 KB = 1024 bytes", () => {
  assert.deepEqual(parseKb("20.5", "minimum"), { bytes: 20992, error: "" });
  assert.deepEqual(parseKb("25.5", "maximum"), { bytes: 26112, error: "" });
  assert.deepEqual(parseKb(" 30.25 ", "maximum"), { bytes: 30976, error: "" });
  assert.deepEqual(parseKb("25", "maximum"), { bytes: 25600, error: "" });
});
test("parseKb treats empty as not set", () => {
  assert.deepEqual(parseKb("", "maximum"), { bytes: null, error: "" });
  assert.deepEqual(parseKb("   ", "minimum"), { bytes: null, error: "" });
});
test("parseKb rejects zero, negative, junk and excessive values with a message", () => {
  for (const v of ["0", "0.0", "-5", "-0.5", "abc", "1e3", "1,5", "25.5.1", "100000.5", "999999", "0.0001", "Infinity"]) {
    const r = parseKb(v, "maximum");
    assert.equal(r.bytes, null, v);
    assert.match(r.error, /maximum file size in KB greater than 0/, v);
  }
  assert.equal(parseKb("100000", "maximum").bytes, 100000 * 1024);
  assert.match(parseKb("x", "minimum").error, /minimum/);
});
test("decimal min greater than max is caught by validateRange", () => {
  assert.match(validateRange(parseKb("30.5", "minimum").bytes, parseKb("30.25", "maximum").bytes), /larger than the maximum/);
  assert.equal(validateRange(parseKb("20.5", "minimum").bytes, parseKb("25.5", "maximum").bytes), "");
});
