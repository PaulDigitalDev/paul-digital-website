import type { Faq } from "./formatTools";
import { growth, loanSchedule, roi, salaryFromPercent, solveFv, solvePmt } from "../lib/finance.ts";
import { money, pct } from "../lib/calcDefs.ts";
import { moreCalculatorTools } from "./calculatorToolsMore.ts";
import { wbCalculatorTools } from "./calculatorToolsWb.ts";
import { inCalculatorTools } from "./calculatorToolsIn.ts";
import { globalCalculatorTools } from "./calculatorToolsGlobal.ts";

export interface CalculatorTool {
  slug: string;
  calc: string;
  h1: string;
  title: string;
  description: string;
  summary: string;
  intro: string;
  keywords: string[];
  steps: string[];
  explanation: string[];
  formula: string[];
  /** Worked examples are computed with the same maths the calculator uses, so they cannot drift from it. */
  worked: () => string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

const PRIVACY: Faq = { q: "Are my numbers saved or sent anywhere?", a: "No. The calculation runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const NOT_ADVICE = "These results are estimates from the numbers you enter. They are not financial, tax or legal advice, and they are not a quote from any lender or bank.";

const coreCalculatorTools: CalculatorTool[] = [
  {
    slug: "tvm-calculator",
    calc: "tvm",
    h1: "TVM Calculator (Time Value of Money)",
    title: "TVM Calculator: Solve for FV, PV, PMT, N or Rate",
    description: "Free time value of money (TVM) calculator. Solve for future value, present value, payment, number of periods or interest rate. Runs in your browser.",
    summary: "Solve any one of N, interest rate, PV, PMT or FV from the other four.",
    intro: "Pick the value you want to find, fill in the other four and read the answer. It works like a financial calculator's TVM keys, with no download.",
    keywords: ["tvm calculator", "time value of money calculator", "fv pv pmt calculator", "financial calculator"],
    steps: [
      "Choose what to solve for: future value, present value, payment, number of periods or interest rate.",
      "Fill in the other fields. Use negative numbers for money you pay or invest and positive numbers for money you receive.",
      "Set periods per year, for example 12 when N counts months, and whether payments fall at the start or end of each period.",
      "Read the answer, which updates as you type.",
    ],
    explanation: [
      "The time value of money is the idea that a sum today is worth more than the same sum later, because today's money can earn interest. Almost every loan, saving plan and annuity is built on five linked numbers: the number of periods (N), the interest rate, the present value (PV), the regular payment (PMT) and the future value (FV). If you know any four, the fifth is fixed.",
      "This calculator solves for any one of them. The signs matter, as on a financial calculator: money that leaves your pocket, such as a deposit or a loan repayment, is entered as negative, and money you receive is positive. A starting deposit of -1,000 that grows to 1,628.89 is a positive future value.",
      "Interest is applied once per period. If N is a number of months, enter 12 periods per year so the annual rate is divided correctly. Payments at the end of each period are called an ordinary annuity, and payments at the start are called an annuity due, which earns one extra period of interest on each payment.",
    ],
    formula: [
      "With r as the rate per period, n as the number of periods and t as 0 for end-of-period or 1 for start-of-period payments, the five values satisfy PV × (1 + r)^n + PMT × (1 + r × t) × ((1 + r)^n − 1) ÷ r + FV = 0.",
      "FV, PV, PMT and N are rearranged directly. The interest rate has no direct formula, so the calculator finds it by narrowing down the range until the equation balances.",
    ],
    worked: () => {
      const fv = solveFv(10, 0.05, -1000, 0, 0);
      const pmt = solvePmt(120, 0.06 / 12, 0, 50000, 0);
      return [
        `Invest 1,000 for 10 years at 5% a year with no payments: the future value is ${money(fv)}.`,
        `To reach 50,000 in 10 years at 6% a year with monthly payments, enter N = 120, rate = 6, periods per year = 12 and FV = 50,000. The payment is ${money(pmt)}, shown negative because it is money you pay in.`,
      ];
    },
    tips: [
      "If the answer says no solution, check the signs. Money in and money out must have opposite signs.",
      "Keep N and the periods per year in step. Monthly payments over 5 years is N = 60 with 12 periods per year.",
      "Test an answer by putting it back in and solving for a different value. The result should match.",
    ],
    faqs: [
      { q: "What do N, I/Y, PV, PMT and FV mean?", a: "N is the number of periods, I/Y is the yearly interest rate, PV is the present value, PMT is the payment each period and FV is the future value." },
      { q: "Why is my payment negative?", a: "Money you pay out is negative by convention. The size of the number is what matters." },
      { q: "What is the difference between payments at the start and the end of a period?", a: "A payment at the start of a period earns interest for one extra period, so the future value is a little higher and the payment needed is a little lower." },
      { q: "Is this the same as a financial calculator?", a: "It uses the same standard equation, so with the same inputs and sign conventions it gives the same answers, apart from rounding." },
      PRIVACY,
    ],
    related: ["future-value-calculator", "compound-interest-calculator", "loan-calculator", "roi-calculator"],
  },
  {
    slug: "future-value-calculator",
    calc: "future-value",
    h1: "Future Value Calculator",
    title: "Future Value Calculator with Monthly Deposits | Paul Digital",
    description: "Work out what a starting amount plus monthly deposits will grow to. Choose the rate, years and compounding and see a year-by-year table. Free, in your browser.",
    summary: "See what a starting amount and regular deposits grow to over time.",
    intro: "Enter what you have now, what you add each month, the interest rate and the number of years. You get the future value and a year-by-year table.",
    keywords: ["future value calculator", "fv calculator", "savings growth calculator", "investment growth"],
    steps: [
      "Enter the starting amount and the amount you will add each month. Use 0 if you add nothing.",
      "Enter the annual interest rate and the number of years.",
      "Choose how often interest is compounded: annually, quarterly, monthly, daily or continuously.",
      "Read the future value, the total you put in and the interest earned. The table shows each year.",
    ],
    explanation: [
      "Future value is what money is worth at a later date if it earns interest. A starting amount grows because interest is added to it, and then that interest earns interest of its own. Regular deposits make the balance grow faster, since each one starts earning from the day it is added.",
      "This calculator adds deposits at the end of every month. The rate you enter is a yearly rate, and the compounding choice sets how often interest is added within the year. More frequent compounding gives a slightly higher result at the same rate, though the difference between monthly and daily compounding is small.",
      "The result is a projection from fixed inputs. A real savings account or investment will not earn exactly the same rate every year, and fees and tax are not included.",
    ],
    formula: [
      "For a lump sum, future value = starting amount × (1 + r)^n, where r is the rate per period and n is the number of periods.",
      "For regular deposits the calculator applies the monthly rate to the balance and adds each deposit month by month, which gives the same result as the annuity formula.",
    ],
    worked: () => {
      const a = growth(10000, 200, 6, 10, 12);
      const b = growth(1000, 0, 5, 10, 1);
      return [
        `Start with 10,000, add 200 a month for 10 years at 6% compounded monthly: the future value is ${money(a.final)}. You put in ${money(a.deposits)} and earned ${money(a.interest)} in interest.`,
        `A single 1,000 at 5% compounded yearly for 10 years grows to ${money(b.final)}.`,
      ];
    },
    tips: [
      "Try the same numbers with a 1% lower rate to see how sensitive the result is to the return you assume.",
      "Time matters as much as the rate. Try the same deposits over a few different numbers of years.",
      "Use the TVM Calculator if you need to solve for the payment or the time instead of the result.",
    ],
    faqs: [
      { q: "What is future value?", a: "It is the value that a sum of money, and any regular deposits, will have at a later date if it earns a given interest rate." },
      { q: "Does compounding frequency matter?", a: "A little. More frequent compounding gives a slightly higher balance at the same stated rate." },
      { q: "Are deposits added at the start or end of the month?", a: "At the end of each month. Deposits at the start would give a slightly higher result." },
      { q: "Does it include inflation or tax?", a: "No. The result is in the same money as your inputs, before tax and fees." },
      PRIVACY,
    ],
    related: ["compound-interest-calculator", "tvm-calculator", "roi-calculator", "loan-calculator"],
  },
  {
    slug: "compound-interest-calculator",
    calc: "compound-interest",
    h1: "Compound Interest Calculator",
    title: "Compound Interest Calculator with Contributions",
    description: "See how an investment grows with compound interest and monthly contributions. Shows total interest, share of growth and a yearly table. Free, in your browser.",
    summary: "See how much of an investment's growth comes from compound interest.",
    intro: "Enter an initial amount, a monthly contribution, a rate and a number of years to see the final balance and how much of it is interest.",
    keywords: ["compound interest calculator", "compound interest with monthly contributions", "interest on interest"],
    steps: [
      "Enter your initial investment and a monthly contribution, or 0 for none.",
      "Enter the annual interest rate and how many years the money will grow.",
      "Choose the compounding frequency.",
      "Read the final balance, the total interest and the share of the balance that came from interest.",
    ],
    explanation: [
      "Compound interest is interest earned on interest. Each time interest is added, the balance is bigger, so the next interest payment is bigger too. Over a short period the effect is small, but over decades it becomes the main source of growth.",
      "The calculator shows what share of the final balance is interest, which makes this effect visible. With a 20 year horizon, the interest share is often larger than the total you put in, though that depends on the rate and the contributions.",
      "The compounding frequency tells the calculator how often interest is added within a year. A stated rate of 12% compounded monthly is 1% a month, and it grows to slightly more than 12% over a year, which is why compounding is also described by an effective annual rate.",
    ],
    formula: [
      "Without contributions, final balance = P × (1 + r/m)^(m × t), where P is the initial amount, r is the annual rate as a decimal, m is the number of compounding periods per year and t is the number of years.",
      "With monthly contributions, the calculator uses the equivalent monthly rate and adds each contribution at the end of the month.",
    ],
    worked: () => {
      const g = growth(5000, 100, 7, 20, 12);
      const lump = growth(1000, 0, 12, 1, 12);
      return [
        `Start with 5,000 and add 100 a month for 20 years at 7% compounded monthly: the final balance is ${money(g.final)}. You contribute ${money(g.deposits)} in total, so ${money(g.interest)} is interest, or ${pct((g.interest / g.final) * 100, 1)} of the balance.`,
        `1,000 at 12% compounded monthly for one year ends at ${money(lump.final)}, which is 12.68% more than you started with, not exactly 12%.`,
      ];
    },
    tips: [
      "Make one contribution amount and one rate your baseline, then change a single input at a time.",
      "Compare an interest rate that is quoted as APY with one quoted as a nominal rate. They are not the same number.",
      "Remember that real returns vary, and a higher assumed rate is not a safer assumption.",
    ],
    faqs: [
      { q: "What is compound interest?", a: "It is interest calculated on both the original amount and the interest that has already been added." },
      { q: "How is it different from simple interest?", a: "Simple interest is calculated only on the original amount. Compound interest grows faster because earlier interest also earns interest." },
      { q: "Which compounding frequency should I choose?", a: "Use the one your account states. Monthly is common for savings, and the difference to daily is small." },
      { q: "Can I use it for a loan?", a: "Use the Loan Calculator for loans, because it works out repayments instead of growth." },
      PRIVACY,
    ],
    related: ["future-value-calculator", "tvm-calculator", "roi-calculator", "loan-calculator"],
  },
  {
    slug: "salary-increase-calculator",
    calc: "salary-increase",
    h1: "Salary Increase Calculator (Pay Raise)",
    title: "Salary Increase and Pay Raise Calculator | Paul Digital",
    description: "Work out your new pay after a raise, or the percentage raise from an old and new salary. Shows yearly, monthly, weekly and hourly figures. Free, in your browser.",
    summary: "Work out a new salary after a raise, or the percentage raise between two amounts.",
    intro: "Enter your current pay and either the raise percentage or the new amount. You see the increase per year, month, week and hour.",
    keywords: ["salary increase calculator", "pay increase calculator", "pay raise calculator", "percentage raise"],
    steps: [
      "Enter your current yearly pay.",
      "Choose whether you know the raise percentage or the new pay amount.",
      "Enter the percentage or the new amount, and your usual hours per week for hourly figures.",
      "Read the new pay or percentage, and the increase per year, month, week and hour.",
    ],
    explanation: [
      "A pay raise is usually quoted as a percentage. To find the new pay, multiply the current pay by 1 plus the percentage as a decimal, so a 4% raise multiplies pay by 1.04. If you only know the old and new amounts, divide the difference by the old pay to find the percentage.",
      "The calculator works in both directions. It also turns the yearly change into a monthly, weekly and hourly amount, which helps when you compare offers quoted in different units. Hourly figures assume 52 weeks a year and the hours per week that you enter, so unpaid leave and overtime are not included.",
      "All figures are before tax and other deductions, so your take-home increase will be smaller. Cost-of-living or inflation changes the real value of a raise, and a raise that matches inflation leaves your buying power about the same.",
    ],
    formula: [
      "New pay = current pay × (1 + raise ÷ 100).",
      "Raise percentage = (new pay − current pay) ÷ current pay × 100.",
      "Hourly pay = yearly pay ÷ (hours per week × 52).",
    ],
    worked: () => {
      const r = salaryFromPercent(50000, 4);
      const back = salaryFromPercent(36000, 3.5);
      return [
        `A 4% raise on 50,000 gives ${money(r.newSalary)}, an increase of ${money(r.increase)} a year, or about ${money(r.increase / 12)} a month.`,
        `A 3.5% raise on 36,000 gives ${money(back.newSalary)}.`,
      ];
    },
    tips: [
      "Compare the percentage with recent inflation to see whether the raise is a real increase.",
      "When comparing two offers, compare the hourly figure if the hours differ.",
      "Add up several small raises by applying them one after another, not by adding the percentages.",
    ],
    faqs: [
      { q: "How do I calculate a pay raise percentage?", a: "Subtract the old pay from the new pay, divide by the old pay and multiply by 100." },
      { q: "Is the result before or after tax?", a: "Before tax. Your take-home pay depends on your tax and deductions, which this calculator does not include." },
      { q: "Does it work for hourly pay?", a: "Yes. Convert your hourly rate to a yearly amount first, or use the hourly figures shown here to compare." },
      { q: "Are two 3% raises the same as a 6% raise?", a: "No. Two 3% raises in a row give about 6.09%, because the second raise applies to the already raised pay." },
      PRIVACY,
    ],
    related: ["roi-calculator", "tvm-calculator", "loan-calculator", "future-value-calculator"],
  },
  {
    slug: "loan-calculator",
    calc: "loan",
    h1: "Loan Calculator",
    title: "Loan Payment Calculator with Yearly Breakdown | Paul Digital",
    description: "Work out the payment, total interest and total cost of a loan. Choose monthly, weekly or other payments and see a year-by-year breakdown. Free, in your browser.",
    summary: "Work out the payment and total interest on a fixed-rate loan.",
    intro: "Enter the loan amount, the yearly interest rate and the term to see your payment, the total interest and a year-by-year breakdown.",
    keywords: ["loan calculator", "loan payment calculator", "monthly payment calculator", "loan interest calculator"],
    steps: [
      "Enter the loan amount, the annual interest rate and the term in years.",
      "Choose how often you pay: monthly, every two weeks, weekly, quarterly or yearly.",
      "Read the payment, the number of payments, the total paid and the total interest.",
      "Use the table to see how much principal and interest you pay each year and what is left.",
    ],
    explanation: [
      "A fixed-rate loan is repaid with equal payments. Each payment first covers the interest on the balance that is left, and whatever remains pays down the principal. Early on, most of each payment is interest, and over time the balance falls and more of each payment goes to principal.",
      "The table shows this shift year by year. It is also why paying extra early in the term saves more interest than paying extra near the end.",
      "This calculator assumes a constant interest rate and equal payments. It does not include fees, insurance, property tax or rate changes, and a lender's own schedule may round a little differently. For a variable-rate loan, treat the result as an estimate at today's rate.",
      NOT_ADVICE,
    ],
    formula: [
      "Payment = P × r ÷ (1 − (1 + r)^−n), where P is the loan amount, r is the interest rate per payment and n is the number of payments.",
      "If the interest rate is zero, the payment is simply the loan amount divided by the number of payments.",
    ],
    worked: () => {
      const s = loanSchedule(200000, 6, 30, 12);
      const short = loanSchedule(200000, 6, 15, 12);
      return [
        `A 200,000 loan at 6% over 30 years has a monthly payment of ${money(s.payment)}. Over the whole term you pay ${money(s.totalPaid)}, of which ${money(s.totalInterest)} is interest.`,
        `The same loan over 15 years costs ${money(short.payment)} a month but only ${money(short.totalInterest)} in interest.`,
      ];
    },
    tips: [
      "Compare terms. A longer term lowers the payment but raises the total interest.",
      "Run the calculator twice with different rates or terms and compare the total interest, not just the payment.",
      "Ask the lender for the annual percentage rate (APR) when comparing offers, because it includes fees.",
    ],
    faqs: [
      { q: "How is a loan payment calculated?", a: "With the standard formula for a fixed-rate loan: the amount times the rate per period, divided by one minus the discount factor for the number of payments." },
      { q: "Why is most of my early payment interest?", a: "Interest is charged on the balance. The balance is highest at the start, so interest is highest then." },
      { q: "Does this include fees or insurance?", a: "No. It covers principal and interest only." },
      { q: "Can I use it for a mortgage or car loan?", a: "Yes, for the principal and interest part of a fixed-rate mortgage or car loan." },
      PRIVACY,
    ],
    related: ["tvm-calculator", "compound-interest-calculator", "roi-calculator", "salary-increase-calculator"],
  },
  {
    slug: "roi-calculator",
    calc: "roi",
    h1: "ROI Calculator (Return on Investment)",
    title: "ROI Calculator: Return on Investment and Annualised ROI",
    description: "Calculate return on investment as a percentage and, if you add the years, the average yearly return. Free, private, in your browser.",
    summary: "Work out return on investment and the average yearly return.",
    intro: "Enter what you invested and what it is worth now. You get the return as a percentage, and an average yearly return if you add the years.",
    keywords: ["roi calculator", "return on investment calculator", "annualized return", "investment return"],
    steps: [
      "Enter the amount you invested.",
      "Enter the final value, which is what the investment is worth or what you received.",
      "Optionally enter the number of years you held it.",
      "Read the ROI, the gain or loss and the average yearly return.",
    ],
    explanation: [
      "Return on investment compares what you gained with what you put in. A gain of 500 on an investment of 1,000 is a 50% ROI. A loss gives a negative percentage.",
      "ROI alone ignores time. Making 50% in one year is a very different result from making 50% in ten years. If you enter the years held, the calculator also shows an annualised figure, which is the steady yearly rate that would produce the same final value. It is the compound annual growth rate (CAGR).",
      "Remember what ROI leaves out. It does not include fees, tax, inflation or the return you could have earned elsewhere, and it says nothing about risk. It is a simple way to compare results, not a forecast.",
    ],
    formula: [
      "ROI = (final value − amount invested) ÷ amount invested × 100.",
      "Annualised return = ((final value ÷ amount invested)^(1 ÷ years) − 1) × 100.",
    ],
    worked: () => {
      const a = roi(1000, 1500, 3);
      const b = roi(2000, 1700, 2);
      return [
        `Invest 1,000 and end with 1,500 after 3 years: the ROI is ${pct(a.roiPercent, 2)} and the average yearly return is ${pct(a.annualizedPercent ?? 0, 2)}, not 50% divided by 3.`,
        `Invest 2,000 and end with 1,700: the ROI is ${pct(b.roiPercent, 2)}, a loss of ${money(Math.abs(b.gain))}.`,
      ];
    },
    tips: [
      "Always include the time held when comparing two investments.",
      "Subtract fees and any tax from the final value before entering it, if you want the net return.",
      "A negative annualised return can only be worked out if the final value is above zero.",
    ],
    faqs: [
      { q: "How do I calculate ROI?", a: "Subtract the amount invested from the final value, divide by the amount invested and multiply by 100." },
      { q: "What is annualised ROI?", a: "It is the steady yearly rate that would grow your starting amount to the final value over the years held." },
      { q: "Why is the yearly return not just ROI divided by years?", a: "Because returns compound. A 50% total return over 3 years is about 14.47% a year, not 16.67%." },
      { q: "Is a high ROI always good?", a: "Not necessarily. ROI says nothing about risk or time, so compare it with the risk taken and the period." },
      PRIVACY,
    ],
    related: ["compound-interest-calculator", "future-value-calculator", "tvm-calculator", "salary-increase-calculator"],
  },
];

export const calculatorTools: CalculatorTool[] = [...coreCalculatorTools, ...moreCalculatorTools, ...wbCalculatorTools, ...inCalculatorTools, ...globalCalculatorTools];

export const calculatorToolBySlug = new Map(calculatorTools.map((tool) => [tool.slug, tool]));
