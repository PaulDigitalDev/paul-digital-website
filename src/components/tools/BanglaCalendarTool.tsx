import { useEffect, useState } from "react";
import { BANGLA_MONTHS, BANGLA_SEASONS, GREG_MONTHS_BN, WEEKDAYS_BN, bn, diffDays, formatBangla, formatGregorian, monthLength, monthStart, parseIso, toBangla, toGregorian, todayLocal, toIso, weekdayIndex } from "../../lib/banglaCalendarUi";
import type { BanglaDate, Tradition, YMD } from "../../lib/banglaCalendarUi";

/* Bangla date tools: converter, today's date and a month calendar, for the Bangladesh and West Bengal calendars. Runs in the browser. */

type Mode = "converter" | "today" | "calendar";

const TRADITIONS: { value: Tradition; label: string }[] = [
  { value: "bd", label: "বাংলাদেশ" },
  { value: "wb", label: "পশ্চিমবঙ্গ" },
];

function Switch({ value, onChange }: { value: Tradition; onChange: (t: Tradition) => void }) {
  return (
    <div className="bc-switch" role="group" aria-label="ক্যালেন্ডার বেছে নিন">
      {TRADITIONS.map((t) => (
        <button key={t.value} type="button" aria-pressed={value === t.value} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Result({ title, big, lines }: { title: string; big: string; lines: string[] }) {
  return (
    <div className="bc-result">
      <div className="bc-result-title">{title}</div>
      <div className="bc-result-big">{big}</div>
      {lines.map((l) => (
        <div className="bc-result-line" key={l}>
          {l}
        </div>
      ))}
    </div>
  );
}

const describe = (p: YMD, b: BanglaDate) => [`${WEEKDAYS_BN[weekdayIndex(p)]}, ঋতু: ${BANGLA_SEASONS[b.month]}`];

function Converter({ t, today }: { t: Tradition; today: YMD }) {
  const [date, setDate] = useState(toIso(today));
  const [year, setYear] = useState(String(toBangla(today, t).year));
  const [month, setMonth] = useState(String(toBangla(today, t).month));
  const [day, setDay] = useState(String(toBangla(today, t).day));

  const p = parseIso(date);
  const forward = p && p.y > 1000 && p.y < 3000 ? toBangla(p, t) : null;

  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  let backward: YMD | null = null;
  let backwardError = "";
  if (!Number.isInteger(y) || y < 400 || y > 2400) backwardError = "বঙ্গাব্দের বছর লিখুন (যেমন ১৪৩৩)।";
  else if (!Number.isInteger(d) || d < 1) backwardError = "দিন লিখুন।";
  else {
    backward = toGregorian({ year: y, month: m, day: d }, t);
    if (!backward) backwardError = `এই মাসে ${bn(monthLength(y, m, t))} দিন আছে। দিনটি ঠিক করুন।`;
  }

  return (
    <div className="bc-grid">
      <section className="calc-card">
        <h2 className="calc-bar">ইংরেজি থেকে বাংলা তারিখ</h2>
        <div className="calc-form">
          <div className="ic-field">
            <label htmlFor="bc-date">ইংরেজি তারিখ</label>
            <input id="bc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        {forward && p ? <Result title="বাংলা তারিখ" big={formatBangla(forward)} lines={describe(p, forward)} /> : <p className="calc-error" role="alert">একটি সঠিক তারিখ দিন।</p>}
      </section>
      <section className="calc-card">
        <h2 className="calc-bar calc-bar-result">বাংলা থেকে ইংরেজি তারিখ</h2>
        <div className="calc-form">
          <div className="ic-field">
            <label htmlFor="bc-day">দিন</label>
            <input id="bc-day" type="number" inputMode="numeric" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
          <div className="ic-field">
            <label htmlFor="bc-month">মাস</label>
            <select id="bc-month" value={month} onChange={(e) => setMonth(e.target.value)}>
              {BANGLA_MONTHS.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="ic-field">
            <label htmlFor="bc-year">বঙ্গাব্দ</label>
            <input id="bc-year" type="number" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
        </div>
        {backward ? (
          <Result title="ইংরেজি তারিখ" big={formatGregorian(backward)} lines={[`${WEEKDAYS_BN[weekdayIndex(backward)]}`]} />
        ) : (
          <p className="calc-error" role="alert">
            {backwardError}
          </p>
        )}
      </section>
    </div>
  );
}

function Today({ today }: { today: YMD }) {
  return (
    <div className="bc-grid">
      {TRADITIONS.map((tr) => {
        const b = toBangla(today, tr.value);
        return (
          <section className="calc-card" key={tr.value}>
            <h2 className={tr.value === "bd" ? "calc-bar calc-bar-result" : "calc-bar"}>{tr.label}</h2>
            <Result title="আজকের বাংলা তারিখ" big={formatBangla(b)} lines={[`${WEEKDAYS_BN[weekdayIndex(today)]}, ঋতু: ${BANGLA_SEASONS[b.month]}`, `ইংরেজি: ${formatGregorian(today)}`]} />
          </section>
        );
      })}
    </div>
  );
}

function MonthCalendar({ t, today }: { t: Tradition; today: YMD }) {
  const start = toBangla(today, t);
  const [view, setView] = useState({ year: start.year, month: start.month });
  const { year, month } = view;
  const length = monthLength(year, month, t);
  const first = monthStart(year, month, t);
  const lead = weekdayIndex(first);
  const move = (delta: number) => {
    let mm = month + delta;
    let yy = year;
    if (mm < 0) {
      mm = 11;
      yy -= 1;
    } else if (mm > 11) {
      mm = 0;
      yy += 1;
    }
    setView({ year: yy, month: mm });
  };
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const lastDay = new Date(Date.UTC(first.y, first.m - 1, first.d + length - 1));
  const range = `${GREG_MONTHS_BN[first.m - 1]} ${bn(first.y)} – ${GREG_MONTHS_BN[lastDay.getUTCMonth()]} ${bn(lastDay.getUTCFullYear())}`;
  const isToday = (day: number) => diffDays(today, { y: first.y, m: first.m, d: first.d + day - 1 }) === 0;

  return (
    <section className="calc-card bc-cal">
      <h2 className="calc-bar">
        {BANGLA_MONTHS[month]} {bn(year)} বঙ্গাব্দ
      </h2>
      <div className="bc-nav">
        <button type="button" onClick={() => setView({ year: year - 1, month })} aria-label="আগের বছর">« বছর</button>
        <button type="button" onClick={() => move(-1)} aria-label="আগের মাস">‹ আগের মাস</button>
        <button type="button" onClick={() => setView({ year: start.year, month: start.month })}>এ মাস</button>
        <button type="button" onClick={() => move(1)} aria-label="পরের মাস">পরের মাস ›</button>
        <button type="button" onClick={() => setView({ year: year + 1, month })} aria-label="পরের বছর">বছর »</button>
      </div>
      <p className="bc-range">
        {bn(length)} দিন · {range} · ঋতু: {BANGLA_SEASONS[month]}
      </p>
      <div className="bc-table" role="grid" aria-label="মাসের ক্যালেন্ডার">
        {WEEKDAYS_BN.map((w) => (
          <div className="bc-head" role="columnheader" key={w}>
            {w.replace("বার", "")}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div className="bc-cell bc-empty" key={`e${i}`} role="gridcell" />;
          const g = new Date(Date.UTC(first.y, first.m - 1, first.d + day - 1));
          return (
            <div className={`bc-cell${isToday(day) ? " bc-today" : ""}`} key={day} role="gridcell">
              <span className="bc-day">{bn(day)}</span>
              <span className="bc-eng">{bn(g.getUTCDate())}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function BanglaCalendarTool({ mode }: { mode: Mode }) {
  const [today, setToday] = useState<YMD | null>(null);
  const [tradition, setTradition] = useState<Tradition>("bd");
  useEffect(() => setToday(todayLocal()), []);
  if (!today) return <div className="bc-loading" aria-busy="true">লোড হচ্ছে…</div>;
  return (
    <div className="bc">
      {mode !== "today" && <Switch value={tradition} onChange={setTradition} />}
      {mode === "converter" && <Converter key={tradition} t={tradition} today={today} />}
      {mode === "today" && <Today today={today} />}
      {mode === "calendar" && <MonthCalendar key={tradition} t={tradition} today={today} />}
      {mode !== "today" && (
        <p className="bc-note">
          {tradition === "bd" ? "বাংলাদেশের সংশোধিত বাংলা পঞ্জিকা (বাংলা একাডেমি, ২০১৯ সংশোধন) অনুযায়ী হিসাব।" : "পশ্চিমবঙ্গের সূর্যসিদ্ধান্ত-ভিত্তিক গণনা। আপনার স্থানীয় পঞ্জিকার সঙ্গে ১ দিনের পার্থক্য হতে পারে।"}
        </p>
      )}
    </div>
  );
}
