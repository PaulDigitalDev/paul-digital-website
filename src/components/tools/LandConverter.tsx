import { useMemo, useState } from "react";
import { convertArea, formatArea, parseNumber, unitById } from "../../lib/landUnits";
import type { UnitId } from "../../lib/landUnits";

/* Land area converter. Runs in the browser; nothing is sent anywhere. */

interface Props {
  units: UnitId[];
  from: UnitId;
  to: UnitId;
  value: string;
  lang: "en" | "bn";
}

export default function LandConverter({ units, from: f0, to: t0, value: v0, lang }: Props) {
  const bn = lang === "bn";
  const [value, setValue] = useState(v0);
  const [from, setFrom] = useState<UnitId>(f0);
  const [to, setTo] = useState<UnitId>(t0);
  const label = (id: UnitId) => (bn ? unitById.get(id)!.bn : unitById.get(id)!.name);
  const n = parseNumber(value);
  const result = useMemo(() => (n === null || n < 0 ? null : convertArea(n, from, to)), [n, from, to]);
  const rows = useMemo(() => (n === null || n < 0 ? [] : units.filter((u) => u !== from).map((u) => ({ id: u, value: convertArea(n, from, u) }))), [n, from, units]);

  return (
    <div className="calc land">
      <form className="calc-card" onSubmit={(e) => e.preventDefault()} aria-label={bn ? "জমির পরিমাপ" : "Land area inputs"}>
        <h2 className="calc-bar">{bn ? "পরিমাপ লিখুন" : "Enter the area"}</h2>
        <div className="calc-form">
          <div className="ic-field calc-row">
            <label htmlFor="land-v">{bn ? "পরিমাণ" : "Amount"}</label>
            <input id="land-v" type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="ic-field calc-row">
            <label htmlFor="land-f">{bn ? "যা থেকে" : "From"}</label>
            <select id="land-f" value={from} onChange={(e) => setFrom(e.target.value as UnitId)}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {label(u)}
                </option>
              ))}
            </select>
          </div>
          <div className="ic-field calc-row">
            <label htmlFor="land-t">{bn ? "যাতে" : "To"}</label>
            <select id="land-t" value={to} onChange={(e) => setTo(e.target.value as UnitId)}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {label(u)}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="pt-secondary calc-reset" onClick={() => { setFrom(to); setTo(from); }}>
            {bn ? "অদলবদল" : "Swap units"}
          </button>
        </div>
      </form>

      <section className="calc-card" aria-live="polite" aria-label={bn ? "ফলাফল" : "Result"}>
        <h2 className="calc-bar calc-bar-result">{bn ? "ফলাফল" : "Result"}</h2>
        {result === null ? (
          <p className="calc-error" role="alert">
            {bn ? "একটি সংখ্যা লিখুন।" : "Enter a number that is zero or more."}
          </p>
        ) : (
          <div className="calc-big">
            <div className="calc-label">
              {formatArea(n!, bn)} {label(from)} =
            </div>
            <div className="calc-value land-value">
              {formatArea(result, bn)} {label(to)}
            </div>
          </div>
        )}
      </section>

      {rows.length > 0 && (
        <section className="calc-card calc-table-wrap">
          <table className="calc-table">
            <caption>{bn ? `${formatArea(n!, true)} ${label(from)} অন্য এককে` : `${formatArea(n!)} ${label(from)} in other units`}</caption>
            <thead>
              <tr>
                <th scope="col">{bn ? "একক" : "Unit"}</th>
                <th scope="col">{bn ? "মান" : "Value"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{label(r.id)}</td>
                  <td>{formatArea(r.value, bn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
