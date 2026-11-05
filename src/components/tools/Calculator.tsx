import { useEffect, useMemo, useState } from "react";
import { defaultsFor } from "../../lib/calcDefs";
import { calcDefs } from "../../lib/calcRegistry";
import type { Values } from "../../lib/calcDefs";

/* Live calculator: results update as you type. Nothing is sent anywhere. */

export default function Calculator({ calc, preset }: { calc: string; preset?: Record<string, string> }) {
  const def = calcDefs[calc];
  const [values, setValues] = useState<Values>(() => ({ ...defaultsFor(def), ...(preset ?? {}) }));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const out = useMemo(() => (def.volatile && !mounted ? { rows: [] } : def.compute(values)), [def, values, mounted]);
  const set = (id: string, value: string) => setValues((current) => ({ ...current, [id]: value }));
  const big = out.rows?.find((row) => row.big);
  const rest = out.rows?.filter((row) => !row.big) ?? [];

  return (
    <div className="calc">
      <form className="calc-card" onSubmit={(event) => event.preventDefault()} aria-label="Calculator inputs">
        <h2 className="calc-bar">Enter your values</h2>
        <div className="calc-form">
          {def.fields
            .filter((field) => !field.show || field.show(values))
            .map((field) => {
              const id = `calc-${calc}-${field.id}`;
              return (
                <div className="ic-field calc-row" key={field.id}>
                  <label htmlFor={id}>{field.label}</label>
                  {field.kind === "select" ? (
                    <select id={id} value={values[field.id]} onChange={(event) => set(field.id, event.target.value)}>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.kind === "textarea" ? (
                    <textarea id={id} rows={6} value={values[field.id]} placeholder={field.placeholder} onChange={(event) => set(field.id, event.target.value)} />
                  ) : field.kind === "number" ? (
                    <input id={id} type="number" inputMode="decimal" step={field.step ?? "any"} value={values[field.id]} onChange={(event) => set(field.id, event.target.value)} />
                  ) : (
                    <input id={id} type={field.kind} value={values[field.id]} onChange={(event) => set(field.id, event.target.value)} />
                  )}
                  {field.hint && <p className="calc-hint">{field.hint}</p>}
                </div>
              );
            })}
        </div>
        <button type="button" className="pt-secondary calc-reset" onClick={() => setValues(defaultsFor(def))}>
          Clear and reset
        </button>
      </form>

      <section className="calc-card" aria-live="polite" aria-label="Result">
        <h2 className="calc-bar calc-bar-result">Result</h2>
        {out.error ? (
          <p className="calc-error" role="alert">
            {out.error}
          </p>
        ) : (
          <>
            {big && (
              <div className="calc-big">
                <div className="calc-label">{big.label}</div>
                <div className="calc-value">{big.value}</div>
              </div>
            )}
            {rest.length > 0 && (
              <dl className="calc-rows">
                {rest.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {out.notes && (
              <ul className="calc-notes">
                {out.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {!out.error && out.table && (
        <section className="calc-card calc-table-wrap">
          <table className="calc-table">
            <caption>{out.table.caption}</caption>
            <thead>
              <tr>
                {out.table.head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {out.table.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
