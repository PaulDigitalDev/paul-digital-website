import { useMemo, useState } from "react";
import { SOCIAL_LIMITS, convertCase, countStats, formatDuration, keywordDensity, removeDuplicateLines, removeExtraSpaces, removeLineBreaks, repeatText, smsInfo } from "../../lib/textTools";
import type { BreakMode, CaseMode } from "../../lib/textTools";

/* Text tools in one component. Everything runs in the browser; the text is never sent anywhere. */

export type TextMode = "counter" | "words" | "reading" | "bangla" | "case" | "linebreaks" | "repeat" | "sms" | "dedupe" | "spaces";

const CASES: { value: CaseMode; label: string }[] = [
  { value: "sentence", label: "Sentence case" },
  { value: "lower", label: "lower case" },
  { value: "upper", label: "UPPER CASE" },
  { value: "capitalize", label: "Capitalized Case" },
  { value: "title", label: "Title Case" },
  { value: "alternate", label: "aLtErNaTe" },
  { value: "toggle", label: "tOGGLE" },
  { value: "camel", label: "camelCase" },
  { value: "pascal", label: "PascalCase" },
  { value: "snake", label: "snake_case" },
  { value: "kebab", label: "kebab-case" },
  { value: "constant", label: "CONSTANT_CASE" },
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

const num = (n: number) => n.toLocaleString("en-US");

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className={big ? "tt-stat tt-stat-big" : "tt-stat"}>
      <div className="tt-stat-value">{value}</div>
      <div className="tt-stat-label">{label}</div>
    </div>
  );
}

function Output({ text, label = "Result" }: { text: string; label?: string }) {
  const { done, copy } = useCopy();
  return (
    <section className="calc-card" aria-live="polite" aria-label={label}>
      <h2 className="calc-bar calc-bar-result">{label}</h2>
      <textarea className="tt-out" readOnly rows={8} value={text} aria-label={label} />
      <button type="button" className="pt-primary tt-copy" onClick={() => copy(text)} disabled={!text}>
        {done ? "Copied" : "Copy"}
      </button>
    </section>
  );
}

export default function TextTool({ mode, sample = "", lang = "en" }: { mode: TextMode; sample?: string; lang?: "en" | "bn" }) {
  const [text, setText] = useState(sample);
  const [caseMode, setCaseMode] = useState<CaseMode>("sentence");
  const [breakMode, setBreakMode] = useState<BreakMode>("space");
  const [times, setTimes] = useState("3");
  const [sep, setSep] = useState("newline");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trim, setTrim] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(true);
  const [collapse, setCollapse] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [blankLines, setBlankLines] = useState(true);

  const bn = lang === "bn" && mode === "bangla";
  const stats = useMemo(() => (["counter", "words", "reading", "bangla"].includes(mode) ? countStats(text) : null), [text, mode]);
  const density = useMemo(() => (mode === "counter" || mode === "words" ? keywordDensity(text) : []), [text, mode]);
  const sms = useMemo(() => (mode === "sms" ? smsInfo(text) : null), [text, mode]);

  let output = "";
  let note = "";
  if (mode === "case") output = convertCase(text, caseMode);
  if (mode === "linebreaks") output = removeLineBreaks(text, breakMode);
  if (mode === "spaces") output = removeExtraSpaces(text, { trimLines, collapse, blankLines });
  if (mode === "repeat") {
    const r = repeatText(text, Number(times) || 0, sep === "newline" ? "\n" : sep === "space" ? " " : sep === "comma" ? ", " : "");
    output = r.text;
    if (r.truncated) note = "The result was cut at 1,000,000 characters.";
  }
  if (mode === "dedupe") {
    const r = removeDuplicateLines(text, { caseSensitive, trim, dropEmpty });
    output = r.text;
    note = text ? `${r.removed} line${r.removed === 1 ? "" : "s"} removed.` : "";
  }

  const L = (en: string, b: string) => (bn ? b : en);
  const placeholders: Record<TextMode, string> = {
    counter: "Type or paste your text here",
    words: "Type or paste your text here",
    reading: "Paste an article, essay or script",
    bangla: "এখানে বাংলা লেখা লিখুন বা পেস্ট করুন",
    case: "Type or paste your text here",
    linebreaks: "Paste text with line breaks",
    repeat: "Text to repeat",
    sms: "Type your SMS here",
    dedupe: "Paste one item per line",
    spaces: "Paste text with extra spaces",
  };

  return (
    <div className="calc tt">
      <form className="calc-card" onSubmit={(e) => e.preventDefault()} aria-label={L("Text input", "লেখা")}>
        <h2 className="calc-bar">{L("Your text", "আপনার লেখা")}</h2>
        <div className="calc-form">
          <div className="ic-field calc-row">
            <label htmlFor="tt-in" className="tt-sr">
              {L("Your text", "আপনার লেখা")}
            </label>
            <textarea id="tt-in" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholders[mode]} spellCheck={false} />
            <button type="button" className="pt-secondary calc-reset" onClick={() => setText("")}>
              {L("Clear", "মুছুন")}
            </button>
          </div>

          {mode === "case" && (
            <div className="tt-chips" role="group" aria-label="Case">
              {CASES.map((c) => (
                <button key={c.value} type="button" aria-pressed={caseMode === c.value} onClick={() => setCaseMode(c.value)}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
          {mode === "linebreaks" && (
            <div className="ic-field calc-row">
              <label htmlFor="tt-br">Replace line breaks with</label>
              <select id="tt-br" value={breakMode} onChange={(e) => setBreakMode(e.target.value as BreakMode)}>
                <option value="space">A space</option>
                <option value="none">Nothing</option>
                <option value="paragraphs">A space, but keep paragraphs</option>
              </select>
            </div>
          )}
          {mode === "repeat" && (
            <>
              <div className="ic-field calc-row">
                <label htmlFor="tt-n">Repeat how many times</label>
                <input id="tt-n" type="number" min="0" inputMode="numeric" value={times} onChange={(e) => setTimes(e.target.value)} />
              </div>
              <div className="ic-field calc-row">
                <label htmlFor="tt-sep">Put between copies</label>
                <select id="tt-sep" value={sep} onChange={(e) => setSep(e.target.value)}>
                  <option value="newline">A new line</option>
                  <option value="space">A space</option>
                  <option value="comma">A comma and space</option>
                  <option value="none">Nothing</option>
                </select>
              </div>
            </>
          )}
          {mode === "dedupe" && (
            <div className="nw-checks">
              <label><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> Match case (A and a are different)</label>
              <label><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} /> Ignore spaces at the ends of lines</label>
              <label><input type="checkbox" checked={dropEmpty} onChange={(e) => setDropEmpty(e.target.checked)} /> Remove empty lines</label>
            </div>
          )}
          {mode === "spaces" && (
            <div className="nw-checks">
              <label><input type="checkbox" checked={collapse} onChange={(e) => setCollapse(e.target.checked)} /> Turn repeated spaces into one</label>
              <label><input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} /> Trim spaces at the start and end of each line</label>
              <label><input type="checkbox" checked={blankLines} onChange={(e) => setBlankLines(e.target.checked)} /> Reduce several blank lines to one</label>
            </div>
          )}
        </div>
      </form>

      {stats && (
        <section className="calc-card" aria-live="polite" aria-label={L("Counts", "গণনা")}>
          <h2 className="calc-bar calc-bar-result">{L("Counts", "গণনা")}</h2>
          <div className="tt-stats">
            {mode === "bangla" ? (
              <>
                <Stat big label="অক্ষর (দৃশ্যমান)" value={bnDigits(num(stats.graphemes))} />
                <Stat label="শব্দ" value={bnDigits(num(stats.words))} />
                <Stat label="বাক্য" value={bnDigits(num(stats.sentences))} />
                <Stat label="অনুচ্ছেদ" value={bnDigits(num(stats.paragraphs))} />
                <Stat label="ইউনিকোড কোড পয়েন্ট" value={bnDigits(num(stats.characters))} />
                <Stat label="পড়ার সময়" value={bnDigits(formatDuration(stats.readingMinutes).replace("min", "মি").replace("sec", "সে"))} />
              </>
            ) : mode === "reading" ? (
              <>
                <Stat big label="Reading time (238 wpm)" value={formatDuration(stats.readingMinutes)} />
                <Stat label="Speaking time (150 wpm)" value={formatDuration(stats.speakingMinutes)} />
                <Stat label="Words" value={num(stats.words)} />
                <Stat label="Sentences" value={num(stats.sentences)} />
                <Stat label="Paragraphs" value={num(stats.paragraphs)} />
              </>
            ) : (
              <>
                <Stat big label={mode === "words" ? "Words" : "Characters"} value={num(mode === "words" ? stats.words : stats.characters)} />
                <Stat label={mode === "words" ? "Characters" : "Words"} value={num(mode === "words" ? stats.characters : stats.words)} />
                <Stat label="Characters (no spaces)" value={num(stats.charactersNoSpaces)} />
                <Stat label="Sentences" value={num(stats.sentences)} />
                <Stat label="Paragraphs" value={num(stats.paragraphs)} />
                <Stat label="Unique words" value={num(stats.uniqueWords)} />
                <Stat label="Reading time" value={formatDuration(stats.readingMinutes)} />
                <Stat label="Bytes (UTF-8)" value={num(stats.bytes)} />
              </>
            )}
          </div>
        </section>
      )}

      {mode === "counter" && (
        <section className="calc-card" aria-label="Character limits">
          <h2 className="calc-bar">Character limits</h2>
          <ul className="tt-limits">
            {SOCIAL_LIMITS.map((l) => {
              const used = stats?.characters ?? 0;
              const left = l.limit - used;
              return (
                <li key={l.name} className={left < 0 ? "tt-over" : ""}>
                  <span>{l.name}</span>
                  <span>{left >= 0 ? `${num(left)} left of ${num(l.limit)}` : `${num(-left)} over ${num(l.limit)}`}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {(mode === "counter" || mode === "words") && density.length > 0 && (
        <section className="calc-card calc-table-wrap">
          <table className="calc-table">
            <caption>Most used words</caption>
            <thead>
              <tr><th scope="col">Word</th><th scope="col">Times</th><th scope="col">Share</th></tr>
            </thead>
            <tbody>
              {density.map((d) => (
                <tr key={d.word}><td>{d.word}</td><td>{d.count}</td><td>{d.percent.toFixed(1)}%</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {sms && (
        <section className="calc-card" aria-live="polite" aria-label="SMS length">
          <h2 className="calc-bar calc-bar-result">SMS length</h2>
          <div className="tt-stats">
            <Stat big label="Messages (segments)" value={String(sms.segments)} />
            <Stat label="Characters used" value={num(sms.units)} />
            <Stat label="Left in this message" value={num(sms.remaining)} />
            <Stat label="Encoding" value={sms.encoding} />
            <Stat label="Per message" value={`${sms.perSegment}${sms.segments > 1 ? " (joined)" : ""}`} />
          </div>
          <p className="calc-hint">GSM-7 fits 160 characters in one message, or 153 in each part of a longer one. Any character outside GSM-7, such as Bangla letters or emoji, switches the whole message to Unicode: 70 characters, or 67 per part.</p>
        </section>
      )}

      {["case", "linebreaks", "repeat", "dedupe", "spaces"].includes(mode) && (
        <>
          <Output text={output} />
          {note && <p className="calc-hint tt-note">{note}</p>}
        </>
      )}
    </div>
  );
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
function bnDigits(s: string): string {
  return s.replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}
