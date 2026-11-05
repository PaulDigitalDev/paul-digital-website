import test from "node:test";
import assert from "node:assert/strict";
import * as c from "../src/lib/banglaCalendar.ts";

const iso = (p) => `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;

test("Bangladesh: new year, year end and Falgun", () => {
  assert.deepEqual(c.toBangla({ y: 2026, m: 4, d: 14 }, "bd"), { year: 1433, month: 0, day: 1 });
  assert.deepEqual(c.toBangla({ y: 2026, m: 4, d: 13 }, "bd"), { year: 1432, month: 11, day: 30 });
  assert.deepEqual(c.toBangla({ y: 2027, m: 2, d: 14 }, "bd"), { year: 1433, month: 10, day: 1 });
  assert.deepEqual(c.toBangla({ y: 2026, m: 11, d: 4 }, "bd"), { year: 1433, month: 6, day: 19 });
});
test("Bangladesh: month lengths follow the 2019 revision", () => {
  const lens = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => c.bdMonthLength(1433, m));
  assert.deepEqual(lens, [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 29, 30]);
  assert.equal(c.bdMonthLength(1434, 10), 30); // Falgun in the leap year 2028
  assert.equal(c.bdMonthStart(1433, 6).d, 17);
});
test("Bangladesh and West Bengal: every day round-trips", () => {
  for (const t of ["bd", "wb"]) {
    let p = { y: 2019, m: 1, d: 1 };
    for (let i = 0; i < 3000; i++) {
      const b = c.toBangla(p, t);
      assert.ok(b.day >= 1 && b.day <= 32, `${t} ${iso(p)}`);
      assert.deepEqual(c.toGregorian(b, t), p, `${t} ${iso(p)}`);
      p = c.addDays(p, 1);
    }
  }
});
test("West Bengal: 1433 month starts match published panjika dates", () => {
  const s = c.wbMonthStarts(1433).map(iso);
  assert.equal(s[0], "2026-04-15");
  assert.equal(s[1], "2026-05-16");
  assert.equal(s[2], "2026-06-16");
  assert.equal(s[3], "2026-07-18");
  assert.equal(s[4], "2026-08-19");
  assert.equal(s[5], "2026-09-19");
  assert.equal(s[6], "2026-10-19");
  assert.equal(s[9], "2027-01-16");
  assert.equal(s[10], "2027-02-14");
  assert.equal(s[11], "2027-03-16");
});
test("West Bengal: months are 29 to 32 days and a year is 365 or 366 days", () => {
  for (let y = 1420; y < 1445; y++) {
    const s = c.wbMonthStarts(y);
    for (let i = 0; i < 12; i++) {
      const len = c.diffDays(s[i], s[i + 1]);
      assert.ok(len >= 29 && len <= 32, `${y} ${i} ${len}`);
    }
    const total = c.diffDays(s[0], s[12]);
    assert.ok(total === 365 || total === 366, `${y} ${total}`);
  }
});
test("conversion rejects days that do not exist", () => {
  assert.equal(c.toGregorian({ year: 1433, month: 10, day: 30 }, "bd"), null);
  assert.equal(c.bn(2026), "২০২৬");
});
