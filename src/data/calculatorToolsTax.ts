import type { CalculatorTool } from "./calculatorTools.ts";
import { gbp, mortgageUk, mortgageUs, sdlt, ukTakeHome, usd, usFederalTax, usFica } from "../lib/calcDefsTax.ts";
import { defaultsFor } from "../lib/calcDefs.ts";
import { loanSchedule } from "../lib/finance.ts";

const PRIVACY = { q: "Are my numbers saved or sent anywhere?", a: "No. The calculation runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const UK_NOTE = { q: "Is this exact?", a: "It is an estimate for the 2026/27 tax year using the standard tax code in England, Wales and Northern Ireland. Scottish rates, pension, student loan and other deductions are not included. Check your payslip or HMRC for your own figures. This is not tax advice." };

const UK_SALARIES = [25000, 30000, 35000, 40000, 45000, 50000, 60000, 75000, 100000];

const ukSalaryPage = (annual: number): CalculatorTool => {
  const r = ukTakeHome(annual);
  const label = gbp(annual, 0);
  const marginal = annual > 125140 ? 45 : annual > 50270 ? 40 : annual > 12570 ? 20 : 0;
  const slug = `${annual}-salary-after-tax-uk`;
  return {
    slug,
    calc: "uk-take-home",
    preset: { gross: String(annual), per: "year" },
    h1: `${label} Salary After Tax (UK)`,
    title: `${label} Salary After Tax UK 2026/27: Take-Home Pay`,
    description: `A ${label} salary in the UK leaves about ${gbp(r.net, 0)} a year (${gbp(r.net / 12, 0)} a month) after Income Tax and National Insurance in 2026/27. Free calculator.`,
    summary: `Take-home pay on a ${label} salary in the UK for 2026/27.`,
    intro: `See what ${label} a year is after Income Tax and National Insurance in 2026/27, per year, month and week. Change the salary to try other amounts.`,
    keywords: [`${annual} salary after tax uk`, `${label} after tax`, `${annual} take home pay`, `${label} take home pay uk`, `how much is ${label} after tax`],
    steps: ["The calculator starts with this salary. Change it to try another amount.", "Choose whether the salary is per year, month or week.", "Read the take-home pay and the tax and National Insurance deducted."],
    explanation: [
      `On a ${label} salary in 2026/27 you pay about ${gbp(r.tax, 0)} in Income Tax and ${gbp(r.ni, 0)} in National Insurance, which leaves about ${gbp(r.net, 0)} a year, or ${gbp(r.net / 12)} a month and ${gbp(r.net / 52)} a week. Together that is ${(((r.tax + r.ni) / annual) * 100).toFixed(1)}% of your pay.`,
      `The first £12,570 is tax-free (the Personal Allowance). ${marginal ? `Your highest slice of pay is taxed at ${marginal}%.` : "All of this salary is within the Personal Allowance."} Employee National Insurance is 8% between £12,570 and £50,270, and 2% above that.`,
    ],
    formula: ["Income Tax: 20% on taxable income up to £37,700, 40% to £125,140, 45% above, after the Personal Allowance of £12,570 (reduced for incomes over £100,000).", "National Insurance: 8% of earnings from £12,570 to £50,270, and 2% above £50,270."],
    worked: () => [`Salary ${label}: Income Tax ${gbp(r.tax, 0)}, National Insurance ${gbp(r.ni, 0)}.`, `Take-home pay: ${gbp(r.net, 0)} a year, ${gbp(r.net / 12)} a month, ${gbp(r.net / 52)} a week.`],
    tips: ["Pension contributions can lower your tax bill.", "A student loan or a different tax code changes the result.", "Scottish taxpayers pay different Income Tax rates."],
    faqs: [
      { q: `How much is ${label} after tax in the UK?`, a: `About ${gbp(r.net, 0)} a year, or ${gbp(r.net / 12)} a month, in 2026/27.` },
      { q: `How much National Insurance do I pay on ${label}?`, a: `About ${gbp(r.ni, 0)} a year.` },
      UK_NOTE,
      PRIVACY,
    ],
    related: ["uk-take-home-pay-calculator", "stamp-duty-calculator", "uk-mortgage-calculator", "percentage-calculator"],
  };
};

export const taxCalculatorTools: CalculatorTool[] = [
  {
    slug: "stamp-duty-calculator",
    calc: "stamp-duty",
    h1: "Stamp Duty Calculator",
    title: "Stamp Duty Calculator UK: SDLT for Movers and First-Time Buyers",
    description: "Work out Stamp Duty Land Tax (SDLT) in England and Northern Ireland for a home mover, first-time buyer or additional home, with a band-by-band table. Free and private.",
    summary: "Work out Stamp Duty (SDLT) on a home in England and Northern Ireland.",
    intro: "Enter the purchase price and the type of buyer to see the Stamp Duty you pay, band by band, using the rates in force since April 2025.",
    keywords: ["stamp duty calculator", "sdlt calculator", "stamp duty calculator uk", "first time buyer stamp duty", "stamp duty second home", "stamp duty 2026"],
    steps: ["Enter the purchase price.", "Choose home mover, first-time buyer or additional home.", "Say whether the buyer is not UK resident.", "Read the Stamp Duty and the band-by-band table."],
    explanation: [
      "Stamp Duty Land Tax (SDLT) is paid on property bought in England and Northern Ireland. It is charged in bands, so each rate applies only to the slice of the price in that band. For home movers the first £125,000 is at 0%, the next £125,000 at 2%, up to £925,000 at 5%, up to £1.5 million at 10%, and 12% above that.",
      "First-time buyers pay nothing up to £300,000 and 5% on the part from £300,001 to £500,000. Above £500,000 the relief is lost and standard rates apply to the whole price. Buying an additional home adds a 5% surcharge on the full price, and non-UK residents pay a further 2%. Scotland (LBTT) and Wales (LTT) have their own taxes.",
    ],
    formula: ["Home mover: 0% to £125,000; 2% to £250,000; 5% to £925,000; 10% to £1,500,000; 12% above.", "First-time buyer (price up to £500,000): 0% to £300,000; 5% on the rest.", "Additional home: standard rates plus 5% of the whole price. Non-UK resident: plus 2% of the whole price."],
    worked: () => {
      const a = sdlt(300000, "standard", false);
      const b = sdlt(450000, "first", false);
      const c = sdlt(300000, "additional", false);
      return [`Home mover, £300,000: ${gbp(a.total, 0)}.`, `First-time buyer, £450,000: ${gbp(b.total, 0)}.`, `Additional home, £300,000: ${gbp(c.total, 0)}.`];
    },
    tips: ["Check your solicitor's figure, as special cases such as shared ownership or lease premiums are not covered.", "The rates can change at a Budget, so check gov.uk for the latest.", "In Scotland and Wales use LBTT and LTT instead."],
    faqs: [
      { q: "How much is Stamp Duty on a £300,000 house?", a: `For a home mover, ${gbp(sdlt(300000, "standard", false).total, 0)}. A first-time buyer pays nothing.` },
      { q: "Do first-time buyers pay Stamp Duty?", a: "Not up to £300,000. They pay 5% on the part from £300,001 to £500,000, and the relief does not apply above £500,000." },
      { q: "What is the surcharge on a second home?", a: "5% of the whole price on top of the standard rates, for additional residential properties in England and Northern Ireland." },
      { q: "Is this exact?", a: "It is an estimate for standard purchases using the rates in force from 1 April 2025. Your solicitor will confirm the exact amount." },
      PRIVACY,
    ],
    related: ["uk-mortgage-calculator", "uk-take-home-pay-calculator", "30000-salary-after-tax-uk", "loan-calculator"],
  },
  {
    slug: "uk-take-home-pay-calculator",
    calc: "uk-take-home",
    h1: "UK Take-Home Pay Calculator",
    title: "UK Take-Home Pay Calculator 2026/27: Salary After Tax and NI",
    description: "Work out your UK take-home pay for 2026/27 after Income Tax and National Insurance, per year, month and week. Free and private.",
    summary: "Work out UK salary after Income Tax and National Insurance.",
    intro: "Enter your gross salary to see your take-home pay after Income Tax and National Insurance for the 2026/27 tax year.",
    keywords: ["take home pay calculator uk", "salary after tax uk", "uk tax calculator", "income tax calculator uk", "national insurance calculator", "net pay calculator uk"],
    steps: ["Enter your gross salary, before tax.", "Choose whether it is per year, month or week.", "Read your take-home pay and the Income Tax and National Insurance deducted."],
    explanation: [
      "Take-home pay is your salary minus Income Tax and employee National Insurance. In 2026/27 the first £12,570 is tax-free. The next £37,700 is taxed at 20%, income up to £125,140 at 40%, and anything above at 45%. The tax-free allowance shrinks by £1 for every £2 earned over £100,000.",
      "Employee National Insurance is 8% on earnings between £12,570 and £50,270, and 2% above £50,270. This calculator is for England, Wales and Northern Ireland with the standard tax code. Scottish Income Tax uses different bands, and pension, student loan and benefits are not included.",
    ],
    formula: ["Income Tax = 20% / 40% / 45% on income above the Personal Allowance, using the bands above.", "National Insurance = 8% × (earnings between £12,570 and £50,270) + 2% × (earnings above £50,270).", "Take-home = salary − Income Tax − National Insurance."],
    worked: () => UK_SALARIES.slice(1, 6).map((s) => { const r = ukTakeHome(s); return `${gbp(s, 0)}: take-home ${gbp(r.net, 0)} a year (${gbp(r.net / 12, 0)} a month).`; }),
    tips: ["Pension contributions through salary sacrifice reduce both tax and National Insurance.", "Your tax code on your payslip may differ from the standard one.", "Use the per-month option if your payslip shows a monthly gross."],
    faqs: [
      { q: "How much is £30,000 after tax in the UK?", a: `About ${gbp(ukTakeHome(30000).net, 0)} a year in 2026/27.` },
      { q: "What is the Personal Allowance?", a: "The amount you can earn tax-free each year: £12,570 in 2026/27." },
      { q: "Does this include Scottish tax?", a: "No. Scotland has its own Income Tax bands. This is for England, Wales and Northern Ireland." },
      UK_NOTE,
      PRIVACY,
    ],
    related: ["stamp-duty-calculator", "uk-mortgage-calculator", "30000-salary-after-tax-uk", "hourly-to-salary-calculator"],
  },
  ...UK_SALARIES.map(ukSalaryPage),
  {
    slug: "federal-income-tax-calculator",
    calc: "federal-income-tax",
    h1: "Federal Income Tax Calculator",
    title: "Federal Income Tax Calculator 2026: Brackets and Effective Rate",
    description: "Estimate your 2026 US federal income tax from your income and filing status, with a bracket-by-bracket table and your marginal and effective rate. Free and private.",
    summary: "Estimate US federal income tax for 2026 by filing status.",
    intro: "Enter your income and filing status to estimate your 2026 federal income tax, with the tax in each bracket.",
    keywords: ["federal income tax calculator", "tax bracket calculator", "2026 tax brackets", "income tax calculator us", "marginal tax rate calculator", "effective tax rate calculator"],
    steps: ["Enter your annual income before tax.", "Choose your filing status.", "Add any pre-tax deductions such as 401(k) contributions.", "Read your tax, marginal rate, effective rate and the bracket table."],
    explanation: [
      "US federal income tax is progressive: each rate applies only to the slice of taxable income inside its bracket. Taxable income is your income minus pre-tax deductions and the standard deduction. For 2026 the standard deduction is $16,100 for single filers, $32,200 for married couples filing jointly and $24,150 for heads of household.",
      "Your marginal rate is the rate on your last dollar of income, and your effective rate is your total tax divided by your income. The effective rate is always lower. This estimate ignores credits, itemized deductions, capital gains and state tax.",
    ],
    formula: ["Taxable income = income − pre-tax deductions − standard deduction.", "Single 2026: 10% to $12,400; 12% to $50,400; 22% to $105,700; 24% to $201,775; 32% to $256,225; 35% to $640,600; 37% above."],
    worked: () => {
      const s = usFederalTax(75000 - 16100, "single");
      const m = usFederalTax(120000 - 32200, "mfj");
      return [`$75,000, single: taxable $${(75000 - 16100).toLocaleString("en-US")}, federal tax ${usd(s.total, 0)}, marginal rate ${s.marginal}%.`, `$120,000, married filing jointly: taxable $${(120000 - 32200).toLocaleString("en-US")}, federal tax ${usd(m.total, 0)}.`];
    },
    tips: ["Contributing to a 401(k) or HSA lowers your taxable income.", "Tax credits, such as the child tax credit, reduce the final bill and are not included here.", "Use the paycheck calculator to see take-home pay."],
    faqs: [
      { q: "What are the 2026 federal tax brackets?", a: "Seven rates from 10% to 37%. For single filers the 10% bracket runs to $12,400 and the 37% bracket starts above $640,600 of taxable income." },
      { q: "What is the 2026 standard deduction?", a: "$16,100 for single filers, $32,200 for married filing jointly and $24,150 for head of household." },
      { q: "What is the difference between marginal and effective rate?", a: "The marginal rate is the rate on your last dollar. The effective rate is total tax divided by total income." },
      { q: "Is this tax advice?", a: "No. It is an estimate. Check the IRS or a tax professional for your own return." },
      PRIVACY,
    ],
    related: ["paycheck-calculator", "mortgage-calculator", "sales-tax-calculator", "percentage-calculator"],
  },
  {
    slug: "paycheck-calculator",
    calc: "paycheck",
    h1: "Paycheck Calculator",
    title: "Paycheck Calculator 2026: Take-Home Pay After Federal Tax and FICA",
    description: "Estimate your US take-home pay per paycheck after federal income tax, Social Security, Medicare and an estimated state tax. 2026 rules. Free and private.",
    summary: "Estimate US take-home pay per paycheck for 2026.",
    intro: "Enter your gross pay, how often you are paid and your filing status to estimate your take-home pay.",
    keywords: ["paycheck calculator", "take home pay calculator", "net pay calculator", "salary after tax us", "hourly paycheck calculator", "paycheck tax calculator"],
    steps: ["Enter your gross pay for one paycheck.", "Choose how often you are paid and your filing status.", "Add any retirement contribution and an estimated state tax rate.", "Read your estimated take-home pay and what was withheld."],
    explanation: [
      "A paycheck is your gross pay minus federal income tax, Social Security (6.2% up to $184,500 of wages in 2026), Medicare (1.45%, plus 0.9% on high earners) and state tax where it applies. Pre-tax retirement contributions lower the income tax but not Social Security or Medicare.",
      "This estimate annualizes your pay, applies the 2026 federal brackets and the standard deduction, and uses the flat state rate you enter. Credits, local taxes, health insurance and other deductions are not included, so your real paycheck will differ a little.",
    ],
    formula: ["Federal tax from the 2026 brackets on (annual pay − pre-tax contributions − standard deduction).", "Social Security = 6.2% of pay up to $184,500. Medicare = 1.45% of pay.", "Take-home = pay − pre-tax contribution − federal tax − Social Security − Medicare − state tax."],
    worked: () => {
      const annual = 2500 * 26;
      const taxable = annual - 16100;
      const fed = usFederalTax(taxable, "single").total;
      const fica = usFica(annual, "single");
      const net = annual - fed - fica.ss - fica.medicare;
      return [`$2,500 every two weeks (single, no state tax): about ${usd(net / 26)} per paycheck.`, `That is ${usd(fed / 26)} federal tax, ${usd(fica.ss / 26)} Social Security and ${usd(fica.medicare / 26)} Medicare per paycheck.`];
    },
    tips: ["Enter your state rate to include state tax; use 0 for states with no income tax.", "For an hourly wage, multiply the rate by the hours in a paycheck.", "Use the federal income tax calculator for a bracket breakdown."],
    faqs: [
      { q: "How is take-home pay calculated?", a: "Subtract federal income tax, Social Security, Medicare and any state tax, plus pre-tax deductions, from your gross pay." },
      { q: "What is the Social Security wage base for 2026?", a: "$184,500. Social Security tax of 6.2% applies only to wages up to that amount." },
      { q: "Why does my real paycheck differ?", a: "Employers withhold using your W-4 and may also deduct health insurance, local taxes or benefits that are not in this estimate." },
      PRIVACY,
    ],
    related: ["federal-income-tax-calculator", "hourly-to-salary-calculator", "mortgage-calculator", "sales-tax-calculator"],
  },
  {
    slug: "mortgage-calculator",
    calc: "mortgage-us",
    h1: "Mortgage Calculator",
    title: "Mortgage Calculator: Monthly Payment With Taxes, Insurance and PMI",
    description: "Estimate your monthly mortgage payment from the home price, down payment, rate and term, including property tax, insurance, PMI and HOA. Free and private.",
    summary: "Estimate a monthly mortgage payment with taxes and insurance.",
    intro: "Enter the home price, down payment, interest rate and term to see your estimated monthly payment and total interest.",
    keywords: ["mortgage calculator", "monthly mortgage payment calculator", "home loan calculator", "mortgage payment calculator with taxes and insurance", "pmi calculator", "how much house can i afford"],
    steps: ["Enter the home price and down payment percentage.", "Enter the interest rate and loan term.", "Add property tax, home insurance, mortgage insurance and any HOA fees.", "Read the monthly payment and the year-by-year table."],
    explanation: [
      "Your monthly mortgage payment is principal and interest, plus property tax, home insurance and, if you put down less than 20%, mortgage insurance (PMI). Many buyers call this PITI: principal, interest, taxes and insurance.",
      "Interest is worked out each month on the remaining balance, so early payments are mostly interest and later payments are mostly principal. A shorter term costs less interest overall but has a higher monthly payment.",
    ],
    formula: ["Payment = L × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where L is the loan, r the monthly rate and n the number of months.", "Monthly total = payment + property tax ÷ 12 + insurance ÷ 12 + PMI ÷ 12 + HOA."],
    worked: () => {
      const s = loanSchedule(320000, 6.5, 30, 12);
      const s15 = loanSchedule(320000, 6.5, 15, 12);
      return [`$400,000 home, 20% down, 6.5% for 30 years: principal and interest ${usd(s.payment)}, total interest ${usd(s.totalInterest, 0)}.`, `The same loan over 15 years: ${usd(s15.payment)} a month, total interest ${usd(s15.totalInterest, 0)}.`];
    },
    tips: ["A larger down payment lowers the payment and can remove mortgage insurance.", "Compare the total interest, not only the monthly payment, when choosing a term.", "Ask your lender for a Loan Estimate for exact numbers."],
    faqs: [
      { q: "How is a mortgage payment calculated?", a: "With the loan amount, monthly interest rate and number of payments in the standard amortization formula, then taxes and insurance are added." },
      { q: "What is PMI?", a: "Private mortgage insurance, which lenders usually require when your down payment is under 20%." },
      { q: "Does this include closing costs?", a: "No. Closing costs, points and lender fees are not included." },
      PRIVACY,
    ],
    related: ["uk-mortgage-calculator", "loan-calculator", "amortization-calculator", "paycheck-calculator"],
  },
  {
    slug: "uk-mortgage-calculator",
    calc: "mortgage-uk",
    h1: "UK Mortgage Calculator",
    title: "UK Mortgage Calculator: Monthly Repayments and Interest-Only",
    description: "Work out UK mortgage monthly repayments from the property price, deposit, interest rate and term, for repayment or interest-only. Free and private.",
    summary: "Work out UK mortgage repayments for repayment or interest-only loans.",
    intro: "Enter the property price, deposit, rate and term to see the monthly repayment, loan-to-value and total interest.",
    keywords: ["mortgage calculator uk", "uk mortgage repayment calculator", "monthly mortgage payment uk", "interest only mortgage calculator", "ltv calculator", "mortgage affordability"],
    steps: ["Enter the property price and your deposit.", "Enter the interest rate and the term in years.", "Choose repayment or interest-only.", "Read the monthly payment, LTV and total interest."],
    explanation: [
      "With a repayment mortgage each monthly payment covers the interest and part of the loan, so the debt is cleared by the end of the term. With interest-only you pay just the interest and still owe the whole loan at the end.",
      "Loan to value (LTV) is the loan as a percentage of the property price. A lower LTV usually gets a cheaper rate. Most UK mortgages have a fixed rate for two to five years and then move to a variable rate, so this single-rate figure is a guide only.",
    ],
    formula: ["Repayment: payment = L × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), with r the monthly rate and n the number of months.", "Interest-only: payment = L × annual rate ÷ 12.", "LTV = loan ÷ property price × 100."],
    worked: () => {
      const a = mortgageUk.compute(defaultsFor(mortgageUk));
      const io = mortgageUk.compute({ ...defaultsFor(mortgageUk), type: "io" });
      return [`£300,000 property, £30,000 deposit, 4.5% over 25 years (repayment): ${a.rows![0].value} a month.`, `The same loan interest-only: ${io.rows![0].value} a month, with £270,000 still owed at the end.`];
    },
    tips: ["Add Stamp Duty and fees to your budget.", "Check what happens to your payment when a fixed rate ends.", "A mortgage broker can tell you what you may be able to borrow."],
    faqs: [
      { q: "How much is a £200,000 mortgage a month?", a: "At 4.5% over 25 years the repayment is about £1,112 a month. Change the rate and term to compare." },
      { q: "What is LTV?", a: "Loan to value: the mortgage as a percentage of the property price." },
      { q: "Does this include Stamp Duty or fees?", a: "No. Use the Stamp Duty calculator for Stamp Duty. Arrangement and valuation fees are not included." },
      PRIVACY,
    ],
    related: ["stamp-duty-calculator", "uk-take-home-pay-calculator", "mortgage-calculator", "loan-calculator"],
  },
];
