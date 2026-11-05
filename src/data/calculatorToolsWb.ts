import type { CalculatorTool } from "./calculatorTools.ts";
import { iso } from "../lib/dateCalc.ts";
import { basicPension, commutation, deathGratuity, halfYearsToText, incrementSchedule, leaveSalary, qualifyingHalfYears, retiringGratuity, serviceLength, superannuationDate } from "../lib/wbRules.ts";

const PRIVACY = { q: "Are my details saved or sent anywhere?", a: "No. The calculation runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const SOURCE = "The retirement-benefit rules and rates come from the Finance Department (Pension Branch) notification 535-F dated 01.10.2019, as summarised on WBXPress. Paul Digital is not connected with the Government of West Bengal.";
const CHECK_FAQ = { q: "Is this result official?", a: "No. It is an estimate from the published rules. The sanctioned amount is decided by your Pension Sanctioning Authority and the Accountant General (A&E), West Bengal, so check the figures with your office." };
const rs = (n: number) => `Rs ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const wbCalculatorTools: CalculatorTool[] = [
  {
    slug: "superannuation-date-calculator",
    calc: "wb-superannuation",
    h1: "Superannuation Date Calculator",
    title: "Superannuation Date Calculator (West Bengal Govt. Employees)",
    description: "Find the date of superannuation from a date of birth and retirement age, using the last-day-of-the-month rule used by West Bengal government service. Free and private.",
    summary: "Find the retirement date from a date of birth and retirement age.",
    intro: "Enter a date of birth and the retirement age to see the date of superannuation and the day the pension starts.",
    keywords: ["superannuation date calculator", "retirement date calculator", "west bengal retirement date", "date of retirement"],
    steps: ["Pick your date of birth.", "Check the retirement age, which is 60 unless your service group has a different age.", "Read the date of superannuation and the date the pension starts."],
    explanation: [
      "Under the usual West Bengal Service Rules, an employee retires on the afternoon of the last day of the month in which the retirement age is reached. A person born on 15 May 1966 therefore retires on 31 May 2026.",
      "There is one well-known exception. An employee born on the first day of a month retires on the last day of the month before, because the age is reached at the very start of the birth month. Someone born on 1 May 1966 retires on 30 April 2026.",
      "Some groups of employees have a different retirement age, so the age box can be changed. This calculator gives an estimate for planning, and your office decides the official date.",
    ],
    formula: ["Retirement date = last day of the month in which the retirement age is reached. If the birth date is the 1st, use the last day of the previous month.", "Pension starts on the day after the date of superannuation."],
    worked: () => {
      const a = superannuationDate({ y: 1966, m: 5, d: 15 }, 60);
      const b = superannuationDate({ y: 1966, m: 5, d: 1 }, 60);
      return [`Born 15 May 1966, retiring at 60: ${iso(a)}.`, `Born 1 May 1966, retiring at 60: ${iso(b)}, the month before.`];
    },
    tips: ["Check your service group's retirement age before you rely on the result.", "Use the Service Length Calculator next to see your qualifying service on that date.", "Keep your date of birth as it is entered in your service book."],
    faqs: [
      { q: "When does a West Bengal government employee retire?", a: "On the last day of the month in which they reach the retirement age, normally 60." },
      { q: "What if I was born on the 1st of the month?", a: "The retirement date is the last day of the previous month." },
      { q: "Can I change the retirement age?", a: "Yes. Type the age that applies to your group in the age box." },
      CHECK_FAQ,
      PRIVACY,
    ],
    related: ["service-length-calculator", "pension-calculator-ropa-2019", "gratuity-calculator", "age-calculator"],
  },
  {
    slug: "service-length-calculator",
    calc: "wb-service",
    h1: "Service Length Calculator",
    title: "Service Length Calculator: Qualifying Service for Pension",
    description: "Work out length of service in years, months and days between joining and retirement, less earned leave or suspension, and the qualifying service used for pension.",
    summary: "Work out length of service and the qualifying service for pension.",
    intro: "Enter the date of joining and the date of retirement to see the length of service and the qualifying service used for pension and gratuity.",
    keywords: ["service length calculator", "qualifying service calculator", "length of service", "pension qualifying service"],
    steps: ["Enter the date of joining and the date of retirement or leaving.", "Enter any days that do not count, such as earned leave or suspension.", "Choose whether both dates are counted.", "Read the length of service and the rounded qualifying service."],
    explanation: [
      "Qualifying service is the time from joining to retirement, less periods that do not count, such as earned leave taken and suspension. It decides whether a pension is payable at all and how large it is.",
      "The notification rounds qualifying service to six-month periods. A part of three months or more counts as another half year, and a part under three months is ignored. So 23 years 7 months 11 days is taken as 23 years 6 months, and 23 years 9 months is taken as 24 years.",
      SOURCE,
    ],
    formula: ["Net service = days from joining to end (plus one if both dates count) minus days that do not count.", "Completed six-month periods = whole months ÷ 6, plus one more if the remainder is 3 months or more."],
    worked: () => {
      const s = serviceLength({ y: 1996, m: 6, d: 10 }, { y: 2026, m: 5, d: 31 }, 0, true)!;
      return [`Joining 10 June 1996 and retiring 31 May 2026 gives ${s.years} years, ${s.months} months and ${s.days} days, which rounds to ${halfYearsToText(s.halfYears)} of qualifying service.`, `A service of 23 years 9 months is ${halfYearsToText(qualifyingHalfYears(23 * 12 + 9))} after rounding.`];
    },
    tips: ["Add up all earned leave and suspension periods that do not count before you enter them.", "Use the rounded figure in the Pension and Gratuity calculators.", "Match the dates to your service book."],
    faqs: [
      { q: "What is qualifying service?", a: "The service that counts for pension, after leaving out periods such as earned leave and suspension, rounded to six-month periods." },
      { q: "How is a part of a year rounded?", a: "Three months or more counts as another six months. Under three months is ignored." },
      { q: "How much service gives a full pension?", a: "Twenty years or more of qualifying service gives the full pension under the 2019 rules." },
      CHECK_FAQ,
      PRIVACY,
    ],
    related: ["superannuation-date-calculator", "pension-calculator-ropa-2019", "gratuity-calculator", "date-calculator"],
  },
  {
    slug: "salary-increment-calculator",
    calc: "wb-increment",
    h1: "Salary Increment Calculator",
    title: "Salary Increment Calculator: Basic Pay After Yearly Increments",
    description: "See basic pay after one or more yearly increments of a percentage, with optional rounding up to the next Rs 10 or Rs 100, and a year-by-year table.",
    summary: "See basic pay after yearly increments, year by year.",
    intro: "Enter a basic pay, the yearly increment and the number of years to see the pay after each increment.",
    keywords: ["salary increment calculator", "annual increment calculator", "basic pay increment", "yearly increment"],
    steps: ["Enter your current basic pay.", "Enter the yearly increment percentage and the number of increments.", "Choose whether each increment is rounded up.", "Read the final basic pay and the year-by-year table."],
    explanation: [
      "A yearly increment raises basic pay by a set percentage. Each increment is worked out on the pay after the previous one, so the amounts grow a little each year.",
      "Many pay systems round the increment up to a convenient amount, so there is a rounding choice. Pay matrices work differently: the increment moves you to the next cell in the matrix, so the exact figure comes from your matrix.",
      "This is a simple planning model, useful for seeing the effect of several increments. It does not include dearness allowance or promotions.",
    ],
    formula: ["Increment = pay × percentage ÷ 100, rounded up if you chose rounding.", "New pay = pay + increment, repeated for each year."],
    worked: () => {
      const r = incrementSchedule(50000, 3, 5, 100);
      return [`Basic pay of 50,000 with a 3% increment rounded up to Rs 100 gives ${rs(r[0].basic)} after one year and ${rs(r[4].basic)} after five.`];
    },
    tips: ["Check your pay matrix for the exact next cell.", "Use the percentage without rounding to see the plain effect.", "To compare a one-off raise, use the Salary Increase Calculator."],
    faqs: [
      { q: "How is an annual increment calculated?", a: "A percentage of the current basic pay is added each year, after any rounding." },
      { q: "Is DA included?", a: "No. The calculator works on basic pay only." },
      { q: "Does it match a pay matrix?", a: "Not exactly. A pay matrix moves you to the next cell, so use it as an estimate." },
      PRIVACY,
    ],
    related: ["salary-increase-calculator", "leave-salary-encashment-calculator", "hourly-to-salary-calculator", "percentage-calculator"],
  },
  {
    slug: "leave-salary-encashment-calculator",
    calc: "wb-leave",
    h1: "Leave Salary Encashment Calculator",
    title: "Leave Salary Encashment Calculator: Pay for Unused Leave",
    description: "Work out leave salary for encashed leave from basic pay, dearness allowance and the number of days, using pay plus DA divided by 30 per day.",
    summary: "Work out pay for encashed leave from basic pay, DA and days.",
    intro: "Enter basic pay, dearness allowance and the days of leave to see the leave salary.",
    keywords: ["leave salary encashment calculator", "earned leave encashment", "leave encashment calculator", "leave salary"],
    steps: ["Enter basic pay and dearness allowance.", "Enter the number of days of leave to encash.", "Read the leave salary and the amount per day."],
    explanation: [
      "Leave salary pays for leave that is encashed instead of taken. The day rate is the monthly basic pay plus dearness allowance divided by 30, multiplied by the days of leave.",
      "The number of days you can encash is set by the leave rules and often by the situation, such as retirement. This calculator does not limit the days, so check your entitlement before using the result.",
      "Allowances other than dearness allowance are not included.",
    ],
    formula: ["Leave salary = (basic pay + dearness allowance) ÷ 30 × days of leave."],
    worked: () => [`Basic pay 40,000 and DA 20,000 for 300 days of leave: ${rs(leaveSalary(40000, 20000, 300))}.`, `Basic pay 30,000 and DA 6,000 for 30 days: ${rs(leaveSalary(30000, 6000, 30))}.`],
    tips: ["Use the pay and DA rates that apply on the date of encashment.", "Check your maximum days of encashment first.", "Pair it with the Gratuity Calculator when planning retirement benefits."],
    faqs: [
      { q: "How is leave salary calculated?", a: "Basic pay plus dearness allowance, divided by 30, multiplied by the days of leave." },
      { q: "How many days can I encash?", a: "That depends on the leave rules that apply to you. The calculator does not set a limit." },
      { q: "Is DA included?", a: "Yes. Enter the dearness allowance in its own box." },
      CHECK_FAQ,
      PRIVACY,
    ],
    related: ["gratuity-calculator", "salary-increment-calculator", "pension-calculator-ropa-2019", "superannuation-date-calculator"],
  },
  {
    slug: "gratuity-calculator",
    calc: "wb-gratuity",
    h1: "Gratuity Calculator (Retiring and Death Gratuity)",
    title: "Gratuity Calculator: Retiring and Death Gratuity",
    description: "Estimate retiring gratuity and death gratuity for West Bengal government employees from last pay, DA and qualifying service, with the Rs 12 lakh ceiling.",
    summary: "Estimate retiring and death gratuity from pay, DA and service.",
    intro: "Enter the last basic pay, dearness allowance and qualifying service to estimate the retiring gratuity and the death gratuity.",
    keywords: ["gratuity calculator", "retiring gratuity calculator", "death gratuity calculator", "west bengal gratuity"],
    steps: ["Enter the last basic pay and dearness allowance.", "Enter the qualifying service in years and months.", "Check the maximum gratuity amount.", "Read the retiring gratuity and the death gratuity."],
    explanation: [
      "Retiring gratuity is one quarter of the emoluments (basic pay plus dearness allowance) for each completed six-month period of qualifying service, up to 16½ times the emoluments. Twenty years of service is 40 periods, so the gratuity is 10 times the emoluments.",
      "Death gratuity, payable if an employee dies in service, depends on the length of service: 2 times the emoluments under 1 year, 6 times from 1 to under 5 years, 12 times from 5 to under 11 years, 20 times from 11 to under 20 years, and from 20 years half a month's emoluments for each six-month period, up to 33 times.",
      `Both are limited to a maximum, which is Rs 12,00,000 for those retiring after 01.01.2016. ${SOURCE}`,
    ],
    formula: ["Retiring gratuity = ¼ × emoluments × six-month periods, up to 16.5 × emoluments and the maximum.", "Death gratuity = the multiple for the length of service × emoluments, up to the maximum."],
    worked: () => {
      const h = 40;
      return [`Basic pay 15,000 and DA 3,000 (emoluments 18,000) with 20 years of service: retiring gratuity ${rs(retiringGratuity(18000, h))} and death gratuity ${rs(deathGratuity(18000, h))}.`, `A very large pay is limited by the ceiling: emoluments of 1,00,000 for 40 years give ${rs(retiringGratuity(100000, 80))}.`];
    },
    tips: ["Use the rounded qualifying service from the Service Length Calculator.", "Change the maximum if a different ceiling applies to you.", "Use the pay and DA in force on the last day of service."],
    faqs: [
      { q: "How is gratuity calculated?", a: "One quarter of the emoluments for each completed six-month period of qualifying service, up to 16½ times the emoluments." },
      { q: "What is the maximum gratuity?", a: "Rs 12,00,000 for those retiring after 01.01.2016 under the 2019 notification. Older ceilings were lower." },
      { q: "What is death gratuity?", a: "A payment if an employee dies in service, worked out by a table of multiples that depends on the length of service." },
      CHECK_FAQ,
      PRIVACY,
    ],
    related: ["pension-calculator-ropa-2019", "service-length-calculator", "leave-salary-encashment-calculator", "commuted-value-of-pension-calculator"],
  },
  {
    slug: "pension-calculator-ropa-2019",
    calc: "wb-pension",
    h1: "Pension Calculator (ROPA 2019)",
    title: "Pension Calculator as per ROPA 2019 (West Bengal)",
    description: "Estimate the basic monthly pension of a West Bengal government employee from last basic pay and qualifying service under the ROPA 2019 rules.",
    summary: "Estimate monthly basic pension from last basic pay and qualifying service.",
    intro: "Enter the last basic pay and the qualifying service to estimate the monthly basic pension under the ROPA 2019 rules.",
    keywords: ["pension calculator ropa 2019", "west bengal pension calculator", "basic pension calculator", "ropa 2019 pension"],
    steps: ["Enter the last basic pay from the pay matrix.", "Enter the qualifying service in years and months.", "Read the basic pension and the pension after commuting 40%."],
    explanation: [
      "For those who retire after 01.01.2016, the full pension is half of the last basic pay for 20 years or more of qualifying service. Between 10 and 20 years it is paid in proportion to 20 years, and under 10 years no pension is due. So 15 years on a last basic pay of 30,000 gives 15 ÷ 20 of 15,000, which is 11,250.",
      "The pension is limited to Rs 1,00,500 a month, and the full pension is not lower than Rs 8,500. Dearness relief and additional pension for old age are extra and are not included here.",
      SOURCE,
    ],
    formula: ["Full pension = 50% of last basic pay (20 years or more).", "Pension for 10 to under 20 years = 50% of last basic pay × years ÷ 20.", "Limited to Rs 1,00,500 a month."],
    worked: () => [`Last basic pay 30,000 and 33 years: ${rs(basicPension(30000, 66).pension)}.`, `Last basic pay 30,000 and 15 years: ${rs(basicPension(30000, 30).pension)}.`, `Last basic pay 30,000 and 8 years: no pension, as service is under 10 years.`],
    tips: ["Get the qualifying service from the Service Length Calculator.", "Use the commuted value calculator to see the lump sum if you commute.", "Dearness relief is added to the pension separately."],
    faqs: [
      { q: "How is pension calculated under ROPA 2019?", a: "Half of the last basic pay for 20 years or more of qualifying service, in proportion between 10 and 20 years." },
      { q: "What are the minimum and maximum pension?", a: "Rs 8,500 minimum for the full pension and Rs 1,00,500 maximum a month." },
      { q: "Is dearness relief included?", a: "No. It is paid in addition to the basic pension." },
      CHECK_FAQ,
      PRIVACY,
    ],
    related: ["commuted-value-of-pension-calculator", "gratuity-calculator", "service-length-calculator", "superannuation-date-calculator"],
  },
  {
    slug: "commuted-value-of-pension-calculator",
    calc: "wb-commutation",
    h1: "Commuted Value of Pension Calculator",
    title: "Commuted Value of Pension Calculator (West Bengal)",
    description: "Work out the lump sum for commuting up to 40% of a pension using the age-wise commutation factor, and the reduced monthly pension afterwards.",
    summary: "Work out the lump sum for commuting part of a pension.",
    intro: "Enter the basic pension, the share to commute and the age at next birthday to see the lump sum and the reduced pension.",
    keywords: ["commuted value of pension calculator", "pension commutation calculator", "commutation of pension", "commuted pension lump sum"],
    steps: ["Enter the basic monthly pension.", "Enter the share to commute, up to 40%.", "Enter your age at next birthday.", "Read the lump sum and the reduced monthly pension."],
    explanation: [
      "Commutation lets a pensioner take part of the pension as a lump sum. Up to 40% of the pension can be commuted, and the pension is reduced by that amount, usually until the commuted portion is restored.",
      "The lump sum is the commuted monthly amount multiplied by a factor for the age at next birthday, and by 12. The factors come from the Finance Department table, which is based on LIC (94-96) Ultimate mortality and 8% interest. At age 61 the factor is 8.194, so commuting 6,000 a month gives 6,000 × 8.194 × 12 = Rs 5,89,968.",
      SOURCE,
    ],
    formula: ["Commuted amount = pension × share ÷ 100.", "Lump sum = commuted amount × factor for the age at next birthday × 12.", "Reduced pension = pension − commuted amount."],
    worked: () => {
      const c = commutation(15000, 40, 61)!;
      const d = commutation(15000, 40, 60)!;
      return [`Pension 15,000, 40% commuted at age 61: lump sum ${rs(c.lumpSum)}, reduced pension ${rs(c.reducedPension)}.`, `The same pension at age 60 uses a factor of ${d.factor}, giving ${rs(d.lumpSum)}.`];
    },
    tips: ["Age is counted at the next birthday, not the current age.", "Commute less than 40% by entering a smaller share.", "Get the basic pension from the Pension Calculator."],
    faqs: [
      { q: "How much pension can be commuted?", a: "Up to 40% of the pension." },
      { q: "How is the commuted value calculated?", a: "The commuted monthly amount × the age factor × 12." },
      { q: "Which age is used?", a: "Age at next birthday." },
      CHECK_FAQ,
      PRIVACY,
    ],
    related: ["pension-calculator-ropa-2019", "gratuity-calculator", "superannuation-date-calculator", "service-length-calculator"],
  },
];
