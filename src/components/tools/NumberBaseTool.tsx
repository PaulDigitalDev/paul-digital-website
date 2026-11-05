import { useMemo, useState } from "react";
import { BASES, baseName, fromRoman, group, parseInBase, toBase, toRoman } from "../../lib/numberBases";

/* Number base converter and Roman numeral converter. Runs in the browser; nothing is sent anywhere. */

interface Props {
  kind: "base" | "roman";
  from: number;
  to: number;
  value: string;
}

function BaseTool({ from: f0, to: t0, value: v0 }: Omit<Props, "kind">) {
  const [value, setValue] = useState(v0);
  const [from, setFrom] = useState(f0);
  const [to, setTo] = useState(t0);
  const n = useMemo(() => parseInBase(value, from), [value, from]);
  const out = (b: number) => (n === null ? "" : group(toBase(n, b), b));

  return (
    <div className="calc land unit">
      <form className="calc-card" onSubmit={(e) => e.preventDefault()} aria-label="Converter inputs">
        <h2 className="calc-bar">Enter the number</h2>
        <div className="calc-form">
          <div className="ic-field calc-row">
            <label htmlFor="nb-v">Number</label>
            <input id="nb-v" type="text" inputMode="text" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="ic-field calc-row">
            <label htmlFor="nb-f">From</label>
            <select id="nb-f" value={from} onChange={(e) => setFrom(Number(e.target.value))}>
              {BASES.map((b) => (
                <option key={b.base} value={b.base}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ic-field calc-row">
            <label htmlFor="nb-t">To</label>
            <select id="nb-t" value={to} onChange={(e) => setTo(Number(e.target.value))}>
              {BASES.map((b) => (
                <option key={b.base} value={b.base}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="pt-secondary calc-reset" onClick={() => { setFrom(to); setTo(from); }}>
            Swap
          </button>
        </div>
      </form>
      <section className="calc-card" aria-live="polite" aria-label="Result">
        <h2 className="calc-bar calc-bar-result">Result</h2>
        {n === null ? (
          <p className="calc-error" role="alert">
            Enter a whole number using only the digits allowed in {baseName(from)}, up to 200 digits.
          </p>
        ) : (
          <div className="calc-big">
            <div className="calc-label">{baseName(to)}</div>
            <div className="calc-value land-value" style={{ overflowWrap: "anywhere" }}>
              {out(to)}
            </div>
          </div>
        )}
      </section>
      {n !== null && (
        <section className="calc-card calc-table-wrap">
          <table className="calc-table">
            <caption>The same number in every base</caption>
            <thead>
              <tr>
                <th scope="col">Base</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {BASES.map((b) => (
                <tr key={b.base}>
                  <td>{b.name}</td>
                  <td style={{ overflowWrap: "anywhere" }}>{out(b.base)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function RomanTool({ value: v0 }: { value: string }) {
  const [value, setValue] = useState(v0);
  const t = value.trim();
  const isNum = /^\d+$/.test(t);
  const num = isNum ? Number(t) : null;
  const roman = num !== null ? toRoman(num) : null;
  const back = !isNum && t !== "" ? fromRoman(t) : null;
  const ok = roman !== null || back !== null;

  return (
    <div className="calc land unit">
      <form className="calc-card" onSubmit={(e) => e.preventDefault()} aria-label="Converter input">
        <h2 className="calc-bar">Enter a number or Roman numeral</h2>
        <div className="calc-form">
          <div className="ic-field calc-row">
            <label htmlFor="rn-v">Number or Roman numeral</label>
            <input id="rn-v" type="text" inputMode="text" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
        </div>
      </form>
      <section className="calc-card" aria-live="polite" aria-label="Result">
        <h2 className="calc-bar calc-bar-result">Result</h2>
        {!ok ? (
          <p className="calc-error" role="alert">
            Enter a whole number from 1 to 3999, or a Roman numeral in standard form such as MCMXCIV.
          </p>
        ) : (
          <div className="calc-big">
            <div className="calc-label">{roman !== null ? `${num} in Roman numerals` : `${t.toUpperCase()} as a number`}</div>
            <div className="calc-value land-value">{roman !== null ? roman : back}</div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function NumberBaseTool(props: Props) {
  return props.kind === "roman" ? <RomanTool value={props.value} /> : <BaseTool from={props.from} to={props.to} value={props.value} />;
}
