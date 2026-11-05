import { useMemo, useState } from "react";
import { convertUnit, formatNumber, parseSigned, unitById } from "../../lib/unitData";

/* International unit converter. Runs in the browser; nothing is sent anywhere. */

interface Props {
  units: string[];
  from: string;
  to: string;
  value: string;
}

export default function GlobalUnitConverter({ units, from: f0, to: t0, value: v0 }: Props) {
  const [value, setValue] = useState(v0);
  const [from, setFrom] = useState(f0);
  const [to, setTo] = useState(t0);
  const temp = unitById.get(f0)!.group === "temperature";
  const n = parseSigned(value);
  const bad = n === null || (!temp && n < 0);
  const result = useMemo(() => (bad ? null : convertUnit(n!, from, to)), [n, from, to, bad]);
  const rows = useMemo(() => (bad ? [] : units.filter((u) => u !== from).map((u) => ({ id: u, value: convertUnit(n!, from, u) }))), [n, from, units, bad]);
  const sym = (id: string) => unitById.get(id)!.symbol;

  return (
    <div className="calc land unit">
      <form className="calc-card" onSubmit={(e) => e.preventDefault()} aria-label="Converter inputs">
        <h2 className="calc-bar">Enter the value</h2>
        <div className="calc-form">
          <div className="ic-field calc-row">
            <label htmlFor="gu-v">Amount</label>
            <input id="gu-v" type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="ic-field calc-row">
            <label htmlFor="gu-f">From</label>
            <select id="gu-f" value={from} onChange={(e) => setFrom(e.target.value)}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {unitById.get(u)!.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ic-field calc-row">
            <label htmlFor="gu-t">To</label>
            <select id="gu-t" value={to} onChange={(e) => setTo(e.target.value)}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {unitById.get(u)!.name}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="pt-secondary calc-reset" onClick={() => { setFrom(to); setTo(from); }}>
            Swap units
          </button>
        </div>
      </form>

      <section className="calc-card" aria-live="polite" aria-label="Result">
        <h2 className="calc-bar calc-bar-result">Result</h2>
        {result === null ? (
          <p className="calc-error" role="alert">
            {temp ? "Enter a number." : "Enter a number that is zero or more."}
          </p>
        ) : (
          <div className="calc-big">
            <div className="calc-label">
              {formatNumber(n!)} {sym(from)} =
            </div>
            <div className="calc-value land-value">
              {formatNumber(result)} {sym(to)}
            </div>
          </div>
        )}
      </section>

      {rows.length > 0 && (
        <section className="calc-card calc-table-wrap">
          <table className="calc-table">
            <caption>
              {formatNumber(n!)} {sym(from)} in other units
            </caption>
            <thead>
              <tr>
                <th scope="col">Unit</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{unitById.get(r.id)!.name}</td>
                  <td>{formatNumber(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
