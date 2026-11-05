export * from "./banglaCalendar.ts";
import type { YMD } from "./banglaCalendar.ts";

export const toIso = (p: YMD) => `${String(p.y).padStart(4, "0")}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
export function parseIso(text: string): YMD | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) return null;
  const p = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  const q = new Date(Date.UTC(p.y, p.m - 1, p.d));
  return q.getUTCFullYear() === p.y && q.getUTCMonth() + 1 === p.m && q.getUTCDate() === p.d ? p : null;
}
