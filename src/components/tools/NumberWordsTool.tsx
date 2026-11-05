import { useMemo, useState } from "react";
import { CURRENCIES, DEFAULT_OPTIONS, currencyById, moneyToWords, numberToWords } from "../../lib/numberWords";
import type { CaseStyle, CurrencyId, LangId, System, WordOptions } from "../../lib/numberWords";

/* Number to words: plain numbers, money, cheque amounts and a bulk converter. Runs in the browser; nothing is sent anywhere. */

type Mode = "number" | "money" | "cheque" | "bulk";

interface Props {
  mode: Mode;
  lang: LangId;
  currency?: CurrencyId;
  system?: System;
  sample?: string;
}

const MONEY_LANGS: { value: LangId; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "bn", label: "বাংলা (Bangla)" },
];

function useCopy() {
  const [done, setDone] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      setDone(false);
    }
  };
  return { done, copy };
}

export default function NumberWordsTool({ mode, lang: initialLang, currency: initialCurrency = "INR", system: initialSystem, sample }: Props) {
  const [text, setText] = useState(sample ?? (mode === "bulk" ? "1250\n99999.50\n1500000" : "125000"));
  const [lang, setLang] = useState<LangId>(initialLang);
  const [currency, setCurrency] = useState<CurrencyId>(initialCurrency);
  const [system, setSystem] = useState<System>(initialSystem ?? (currencyById.get(initialCurrency)?.system === "indian" && mode !== "number" ? "indian" : "international"));
  const [caseStyle, setCaseStyle] = useState<CaseStyle>("title");
  const [useAnd, setUseAnd] = useState(false);
  const [hyphen, setHyphen] = useState(true);
  const [only, setOnly] = useState(true);
  const [bulkKind, setBulkKind] = useState<"plain" | CurrencyId>("plain");
  const { done, copy } = useCopy();

  const money = mode === "money" || mode === "cheque";
  const english = lang === "en";
  const base: WordOptions = { ...DEFAULT_OPTIONS, lang, system, caseStyle, useAnd, hyphen };

  const convert = (raw: string) => {
    if (money) return moneyToWords(raw, { ...base, currency, only });
    if (mode === "bulk" && bulkKind !== "plain") return moneyToWords(raw, { ...base, currency: bulkKind, only });
    return numberToWords(raw, base);
  };

  const single = useMemo(() => (mode === "bulk" ? null : convert(text)), [text, mode, lang, currency, system, caseStyle, useAnd, hyphen, only]);
  const rows = useMemo(
    () =>
      mode === "bulk"
        ? text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 500)
            .map((line) => ({ line, result: convert(line) }))
        : [],
    [text, mode, lang, bulkKind, system, caseStyle, useAnd, hyphen, only],
  );

  const idBase = `nw-${mode}`;

  return (
    <div className="calc nw">
      <form className="calc-card" onSubmit={(event) => event.preventDefault()} aria-label="Number to words inputs">
        <h2 className="calc-bar">{mode === "bulk" ? "Paste your numbers, one per line" : money ? "Enter the amount" : "Enter a number"}</h2>
        <div className="calc-form">
          <div className="ic-field calc-row">
            <label htmlFor={`${idBase}-in`}>{mode === "bulk" ? "Numbers" : money ? "Amount" : "Number"}</label>
            {mode === "bulk" ? (
              <textarea id={`${idBase}-in`} rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder={"1250\n99999.50\n1500000"} />
            ) : (
              <input id={`${idBase}-in`} type="text" inputMode="decimal" autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} placeholder="For example 1234567.89" />
            )}
            {mode === "bulk" && <p className="calc-hint">Up to 500 lines. Commas and decimals are fine.</p>}
          </div>

          {money && (
            <div className="ic-field calc-row">
              <label htmlFor={`${idBase}-cur`}>Currency</label>
              <select id={`${idBase}-cur`} value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyId)}>
                {CURRENCIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>
          )}
          {mode === "bulk" && (
            <div className="ic-field calc-row">
              <label htmlFor={`${idBase}-kind`}>Convert as</label>
              <select id={`${idBase}-kind`} value={bulkKind} onChange={(e) => setBulkKind(e.target.value as "plain" | CurrencyId)}>
                <option value="plain">Plain numbers</option>
                {CURRENCIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>
          )}
          {(money || mode === "bulk") && (
            <div className="ic-field calc-row">
              <label htmlFor={`${idBase}-lang`}>Words in</label>
              <select id={`${idBase}-lang`} value={lang} onChange={(e) => setLang(e.target.value as LangId)}>
                {MONEY_LANGS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {english && mode !== "money" && mode !== "cheque" && (
            <div className="ic-field calc-row">
              <label htmlFor={`${idBase}-sys`}>Number system</label>
              <select id={`${idBase}-sys`} value={system} onChange={(e) => setSystem(e.target.value as System)}>
                <option value="international">International (million, billion)</option>
                <option value="indian">Indian (lakh, crore)</option>
              </select>
            </div>
          )}
          {english && (
            <div className="ic-field calc-row">
              <label htmlFor={`${idBase}-case`}>Letters</label>
              <select id={`${idBase}-case`} value={caseStyle} onChange={(e) => setCaseStyle(e.target.value as CaseStyle)}>
                <option value="title">Title Case</option>
                <option value="sentence">Sentence case</option>
                <option value="lower">lower case</option>
                <option value="upper">UPPER CASE</option>
              </select>
            </div>
          )}
          {english && (
            <div className="nw-checks">
              <label>
                <input type="checkbox" checked={useAnd} onChange={(e) => setUseAnd(e.target.checked)} /> Use “and” (one hundred and five)
              </label>
              <label>
                <input type="checkbox" checked={hyphen} onChange={(e) => setHyphen(e.target.checked)} /> Hyphenate (twenty-one)
              </label>
            </div>
          )}
          {(money || (mode === "bulk" && bulkKind !== "plain")) && (
            <div className="nw-checks">
              <label>
                <input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Add “Only” at the end
              </label>
            </div>
          )}
        </div>
      </form>

      <section className="calc-card" aria-live="polite" aria-label="Result">
        <h2 className="calc-bar calc-bar-result">{mode === "bulk" ? "Words" : "In words"}</h2>
        {mode !== "bulk" && single && (
          single.ok ? (
            <>
              <div className="calc-big">
                <div className="calc-label">{single.digits}</div>
                <div className="calc-value nw-words" lang={lang === "en" ? "en" : lang}>
                  {single.words}
                </div>
              </div>
              {mode === "cheque" && (
                <div className="nw-cheque" aria-label="Cheque preview">
                  <div className="nw-cheque-row">
                    <span>Pay</span>
                    <i />
                  </div>
                  <div className="nw-cheque-row">
                    <span>{lang === "en" ? "Amount in words" : lang === "hi" ? "रुपये (शब्दों में)" : "কথায়"}</span>
                    <b lang={lang}>{single.words}</b>
                  </div>
                  <div className="nw-cheque-amount">{single.digits}</div>
                </div>
              )}
              <button type="button" className="pt-primary nw-copy" onClick={() => copy(single.words)}>
                {done ? "Copied" : "Copy words"}
              </button>
            </>
          ) : (
            <p className="calc-error" role="alert">
              {single.error}
            </p>
          )
        )}
        {mode === "bulk" && (
          <>
            {rows.length === 0 && <p className="calc-hint">Type or paste numbers on the left.</p>}
            {rows.length > 0 && (
              <ul className="nw-bulk">
                {rows.map((row, i) => (
                  <li key={i}>
                    <span className="nw-bulk-num">{row.result.ok ? row.result.digits : row.line}</span>
                    <span lang={lang}>{row.result.ok ? row.result.words : row.result.error}</span>
                  </li>
                ))}
              </ul>
            )}
            {rows.length > 0 && (
              <button type="button" className="pt-primary nw-copy" onClick={() => copy(rows.map((r) => `${r.line}\t${r.result.ok ? r.result.words : r.result.error}`).join("\n"))}>
                {done ? "Copied" : "Copy all (tab separated)"}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
