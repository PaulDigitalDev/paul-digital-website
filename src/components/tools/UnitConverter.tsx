import { useMemo, useState } from "react";
import { formatArea, parseNumber } from "../../lib/landUnits";

/* Generic unit converter (weight). Units are passed in with their size in a base unit. Runs in the browser; nothing is sent anywhere. */

export interface UnitDef {
  id: string;
  name: string;
  bn: string;
  factor: number;
}

interface Props {
  units: UnitDef[];
  from: string;
  to: string;
  value: string;
  lang: "en" | "bn";
}

export default function UnitConverter({ units, from: f0, to: t0, value: v0, lang }: Props) {
  const bn = lang === "bn";
  const [value, setValue] = useState(v0);
  const [from, setFrom] = useState(f0);
  const [to, setTo] = useState(t0);
  const byId = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const label = (id: string) => (bn ? byId.get(id)!.bn : byId.get(id)!.name);
  const convert = (v: number, a: string, b: string) => (v * byId.get(a)!.factor) / byId.get(b)!.factor;
  const n = parseNumber(value);
  const result = useMemo(() => (n === null || n < 0 ? null : convert(n, from, to)), [n, from, to, byId]);
  const rows = useMemo(() => (n === null || n < 0 ? [] : units.filter((u) => u.id !== from).map((u) => ({ id: u.id, value: convert(n, from, u.id) }))), [n, from, units, byId]);

  return (
    <div className="calc land unit">
      <form className="calc-card" onSubmit={(e) => e.preventDefault()} aria-label={bn ? "ওজন" : "Weight inputs"}>
        <h2 className="calc-bar">{bn ? "ওজন লিখুন" : "Enter the weight"}</h2>
        <div className="calc-form">
          <div className="ic-field calc-row">
            <label htmlFor="land-v">{bn ? "পরিমাণ" : "Amount"}</label>
            <input id="land-v" type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="ic-field calc-row">
            <label htmlFor="land-f">{bn ? "যা থেকে" : "From"}</label>
            <select id="land-f" value={from} onChange={(e) => setFrom(e.target.value)}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {bn ? u.bn : u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ic-field calc-row">
            <label htmlFor="land-t">{bn ? "যাতে" : "To"}</label>
            <select id="land-t" value={to} onChange={(e) => setTo(e.target.value)}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {bn ? u.bn : u.name}
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
