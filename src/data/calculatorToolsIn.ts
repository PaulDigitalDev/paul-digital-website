import type { CalculatorTool } from "./calculatorTools.ts";
import { loanSchedule } from "../lib/finance.ts";
import { fdMaturity, inr, ppfSchedule, rdMaturity } from "../lib/calcDefsIn.ts";

const PRIVACY = { q: "Are my numbers saved or sent anywhere?", a: "No. The calculation runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const NOT_ADVICE = { q: "Is this the figure my bank will give me?", a: "It is an estimate from the numbers you enter. Banks may use slightly different rounding, day counts, fees and taxes, so check the final figure with your bank. This is not financial advice." };

export const inCalculatorTools: CalculatorTool[] = [
  {
    slug: "emi-calculator",
    calc: "emi",
    h1: "EMI Calculator",
    title: "EMI Calculator: Monthly Loan EMI, Interest and Total",
    description: "Work out the monthly EMI for a home, car or personal loan from the amount, interest rate and tenure, with total interest and a year-by-year table. Free and private.",
    summary: "Work out the monthly EMI, total interest and total payment for a loan.",
    intro: "Enter the loan amount, interest rate and tenure to see the monthly EMI, the total interest and a year-by-year table.",
    keywords: ["emi calculator", "loan emi calculator", "home loan emi calculator", "car loan emi", "personal loan emi calculator"],
    steps: ["Enter the loan amount in rupees.", "Enter the yearly interest rate.", "Enter the tenure and choose years or months.", "Read the monthly EMI, total interest and the table."],
    explanation: [
      "EMI stands for equated monthly instalment: the fixed amount you pay every month until the loan is cleared. Each EMI is part interest and part principal. Early on most of it is interest, and later most of it is principal.",
      "Interest each month is charged on the balance still owed (the reducing balance method). A longer tenure lowers the EMI but raises the total interest, so the cheapest loan is usually the shortest one you can comfortably afford.",
    ],
    formula: ["EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where P is the loan amount, r is the monthly rate (yearly rate ÷ 12 ÷ 100) and n is the number of months."],
    worked: () => {
      const a = loanSchedule(1000000, 9, 5, 12);
      const b = loanSchedule(1000000, 9, 10, 12);
      return [`₹10,00,000 at 9% for 5 years: EMI ${inr(a.payment)}, total interest ${inr(a.totalInterest)}.`, `The same loan over 10 years: EMI ${inr(b.payment)}, total interest ${inr(b.totalInterest)}.`];
    },
    tips: ["Compare the total interest, not just the EMI, when choosing a tenure.", "Prepaying part of the loan early cuts the interest the most.", "Add processing fees and insurance separately; they are not in this figure."],
    faqs: [
      { q: "How is EMI calculated?", a: "With the formula EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where r is the monthly interest rate and n the number of monthly instalments." },
      { q: "Does a longer tenure lower the EMI?", a: "Yes, but you pay more interest overall." },
      { q: "Does this work for home, car and personal loans?", a: "Yes. Any loan repaid in equal monthly instalments on a reducing balance uses the same formula." },
      NOT_ADVICE,
      PRIVACY,
    ],
    related: ["loan-calculator", "amortization-calculator", "fd-calculator", "ppf-calculator"],
  },
  {
    slug: "fd-calculator",
    calc: "fd",
    h1: "FD Calculator (Fixed Deposit)",
    title: "FD Calculator: Fixed Deposit Maturity Amount and Interest",
    description: "Work out the maturity amount and interest on a fixed deposit with monthly, quarterly, half-yearly or yearly compounding. Free, private, in your browser.",
    summary: "Work out the maturity amount and interest earned on a fixed deposit.",
    intro: "Enter the deposit, interest rate and period to see the maturity amount and the interest earned.",
    keywords: ["fd calculator", "fixed deposit calculator", "fd maturity calculator", "fd interest calculator"],
    steps: ["Enter the deposit amount.", "Enter the yearly interest rate and the period in years.", "Choose how often interest is added.", "Read the maturity amount and interest earned."],
    explanation: [
      "A fixed deposit (FD) earns interest at a set rate for a set period. Most Indian banks add the interest to the deposit every quarter, so the interest itself starts earning interest. This is compounding.",
      "The more often interest is added, the higher the maturity amount for the same headline rate. The effective yearly return line shows the real yearly growth after compounding.",
    ],
    formula: ["Maturity = P × (1 + r ÷ n)^(n × t), where P is the deposit, r the yearly rate as a decimal, n the times interest is added each year and t the years."],
    worked: () => {
      const q = fdMaturity(100000, 7, 5, 4);
      const y = fdMaturity(100000, 7, 5, 1);
      return [`₹1,00,000 at 7% for 5 years, quarterly: ${inr(q)}.`, `The same deposit with yearly compounding: ${inr(y)}.`];
    },
    tips: ["Check how often your bank adds interest, because it changes the result.", "Interest on FDs can be taxable. This figure is before tax.", "Senior-citizen rates are usually higher, so enter the rate your bank offers you."],
    faqs: [
      { q: "How is FD maturity calculated?", a: "Maturity = deposit × (1 + rate ÷ n)^(n × years), where n is how many times a year interest is added." },
      { q: "Which compounding do banks use?", a: "Many Indian banks use quarterly compounding, but it varies, so pick the option your bank states." },
      NOT_ADVICE,
      PRIVACY,
    ],
    related: ["rd-calculator", "ppf-calculator", "compound-interest-calculator", "emi-calculator"],
  },
  {
    slug: "rd-calculator",
    calc: "rd",
    h1: "RD Calculator (Recurring Deposit)",
    title: "RD Calculator: Recurring Deposit Maturity and Interest",
    description: "Work out the maturity amount of a recurring deposit from the monthly deposit, interest rate and period, with quarterly compounding. Free and private.",
    summary: "Work out the maturity amount of a recurring deposit.",
    intro: "Enter the monthly deposit, interest rate and number of months to see the maturity amount and interest.",
    keywords: ["rd calculator", "recurring deposit calculator", "rd maturity calculator", "rd interest calculator"],
    steps: ["Enter the amount you will deposit each month.", "Enter the yearly interest rate.", "Enter the period in months.", "Read the maturity amount and interest earned."],
    explanation: [
      "A recurring deposit (RD) lets you save a fixed amount every month for a fixed period. Each monthly deposit earns interest for the months it stays in, and most banks add the interest every quarter.",
      "Because the first deposits stay longest, they earn the most. The calculator treats every deposit as made at the start of its month.",
    ],
    formula: ["Each deposit grows by (1 + r ÷ 4) raised to (months it stays ÷ 3), with r the yearly rate as a decimal. The maturity is the sum over all monthly deposits."],
    worked: () => {
      const m = rdMaturity(5000, 6.5, 60);
      return [`₹5,000 a month at 6.5% for 60 months: maturity ${inr(m)}, from ${inr(5000 * 60)} deposited.`, `For 12 months at the same rate: ${inr(rdMaturity(5000, 6.5, 12))}.`];
    },
    tips: ["Never miss a monthly deposit, as banks may charge a penalty.", "Compare the result with an FD if you have a lump sum instead.", "Interest may be taxable, and this figure is before tax."],
    faqs: [
      { q: "How is RD maturity calculated?", a: "Each monthly deposit is compounded quarterly for the months it stays in the account, and the totals are added up." },
      { q: "Can my bank's figure differ?", a: "Slightly. Banks round and count days a little differently." },
      NOT_ADVICE,
      PRIVACY,
    ],
    related: ["fd-calculator", "ppf-calculator", "compound-interest-calculator", "emi-calculator"],
  },
  {
    slug: "ppf-calculator",
    calc: "ppf",
    h1: "PPF Calculator (Public Provident Fund)",
    title: "PPF Calculator: Maturity Value and Interest by Year",
    description: "Work out the PPF maturity value from the yearly deposit, interest rate and years, with a year-by-year table. Free and private, runs in your browser.",
    summary: "Work out the maturity value of a PPF account, year by year.",
    intro: "Enter the yearly deposit, the current rate and the number of years to see the maturity value and a year-by-year table.",
    keywords: ["ppf calculator", "public provident fund calculator", "ppf maturity calculator", "ppf interest calculator"],
    steps: ["Enter the amount you deposit each year (₹500 to ₹1,50,000).", "Enter the current PPF interest rate.", "Enter the number of years, 15 for the standard term.", "Read the maturity value and the table."],
    explanation: [
      "The Public Provident Fund (PPF) is a government-backed long-term savings scheme with a standard term of 15 years. The interest rate is set by the government and can change every quarter.",
      "This calculator assumes the full yearly deposit is made at the start of each year and the rate stays the same. In practice the rate can change, so treat the result as an estimate and enter the latest rate.",
    ],
    formula: ["Each year: balance = (previous balance + deposit) × (1 + rate). The maturity value is the balance after the last year."],
    worked: () => {
      const r = ppfSchedule(150000, 7.1, 15);
      const last = r[r.length - 1];
      return [`₹1,50,000 a year at 7.1% for 15 years: maturity ${inr(last.balance)}, from ${inr(last.deposited)} deposited.`];
    },
    tips: ["Check the current rate on the official post office or bank site and enter it.", "Deposits made before the 5th of the month earn that month's interest, so time them.", "A PPF account can be extended after 15 years in blocks of 5 years."],
    faqs: [
      { q: "How is PPF calculated?", a: "Interest is added once a year on the balance, and the deposit for the year is added at the start in this estimate." },
      { q: "What is the maximum PPF deposit in a year?", a: "₹1,50,000. The minimum is ₹500. Check the latest rules with your bank or post office." },
      NOT_ADVICE,
      PRIVACY,
    ],
    related: ["fd-calculator", "rd-calculator", "compound-interest-calculator", "emi-calculator"],
  },
  {
    slug: "million-to-crore-converter",
    calc: "million-to-crore",
    h1: "Million to Crore Converter",
    title: "Million to Crore Converter: Million, Lakh, Crore, Billion",
    description: "Convert between thousand, lakh, million, crore and billion. For example 25 million is 2.5 crore. Free, in your browser.",
    summary: "Convert between million, billion, lakh and crore.",
    intro: "Type a number, pick its unit, and see it in crore, lakh, million, billion and thousand.",
    keywords: ["million to crore", "million to lakh", "billion to crore", "crore to million", "lakh to million converter"],
    steps: ["Type a number.", "Pick its unit: thousand, lakh, million, crore or billion.", "Read the same amount in the other units."],
    explanation: [
      "The Indian system counts in lakhs and crores and the international system in millions and billions. One lakh is 100,000, one million is 1,000,000 (10 lakh) and one crore is 10,000,000 (10 million).",
      "A billion is 1,000,000,000, which is 100 crore. The converter also shows the whole number with both digit groupings.",
    ],
    formula: ["1 crore = 10 million = 100 lakh = 10,000,000.", "1 billion = 100 crore = 1,000 million.", "To go from million to crore, divide by 10."],
    worked: () => ["25 million = 2.5 crore = 250 lakh.", "1 billion = 100 crore.", "5 crore = 50 million."],
    tips: ["Divide million by 10 to get crore, and multiply crore by 10 to get million.", "For a number written in words, use the Number to Words converter."],
    faqs: [
      { q: "How many crore is 1 million?", a: "One million is 0.1 crore, or 10 lakh." },
      { q: "How many lakh is 1 million?", a: "One million is 10 lakh." },
      { q: "How many crore is 1 billion?", a: "One billion is 100 crore." },
      PRIVACY,
    ],
    related: ["number-to-words-in-lakhs-and-crores", "number-to-words", "rupees-in-words", "percentage-calculator"],
  },
];
