import type { Guide } from "./guides";

/**
 * More in-depth guides, covering money, units, numbers and land measurement. Written in the same
 * format as the guides in guides.ts and appended to the same list there. Section bodies are trusted
 * HTML (paragraphs, lists, tables and internal links only).
 */
export const moreGuides: Guide[] = [
  {
    slug: "uk-take-home-pay-explained",
    title: "UK take-home pay explained: Income Tax and National Insurance in 2026/27",
    metaTitle: "UK Take-Home Pay Explained: Tax and NI 2026/27",
    description:
      "How a UK salary becomes take-home pay: Personal Allowance, tax bands, National Insurance, the £100,000 taper, and a table from £25,000 to £100,000.",
    summary:
      "Your take-home pay is what is left after Income Tax and National Insurance. This guide shows how each is worked out, with a worked table and the points that surprise people.",
    category: "Money and tax",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Gross pay, net pay and take-home pay",
        html: `<p><strong>Gross pay</strong> is the salary in your contract before anything is taken off. <strong>Net pay</strong> or <strong>take-home pay</strong> is what reaches your bank account after Income Tax and employee National Insurance (NI), and after any pension, student loan or other deductions. The figures in this guide cover only Income Tax and NI for an employee in England, Wales or Northern Ireland on the standard tax code, so your own payslip may differ.</p>
<p>The rates used here are the ones in the <a href="/uk-take-home-pay-calculator/">UK take-home pay calculator</a> for the 2026/27 tax year. Rates and thresholds change, so check GOV.UK for the current year before you rely on a figure for a big decision.</p>`,
      },
      {
        heading: "How Income Tax is worked out",
        html: `<p>Income Tax is charged in slices, and each rate applies only to the part of your income inside that slice.</p>
<ul>
<li><strong>Personal Allowance:</strong> the first £12,570 of income is tax-free.</li>
<li><strong>Basic rate, 20%:</strong> on the next £37,700, so up to £50,270 of total income.</li>
<li><strong>Higher rate, 40%:</strong> on income from £50,270 up to £125,140.</li>
<li><strong>Additional rate, 45%:</strong> on income above £125,140.</li>
</ul>
<p>For a £30,000 salary the taxable income is £30,000 − £12,570 = £17,430, and 20% of that is £3,486. Nothing is taxed at 40% until the salary passes £50,270, and even then only the part above that figure is.</p>`,
      },
      {
        heading: "National Insurance",
        html: `<p>Employee NI is separate from Income Tax and is not reduced by the Personal Allowance in the same way. In 2026/27 it is 8% on earnings between £12,570 and £50,270 and 2% on earnings above £50,270. On £30,000 that is 8% of £17,430, which is £1,394. Together with the Income Tax, £30,000 leaves about £25,120 a year, or £2,093 a month.</p>
<p>NI is what funds entitlement to benefits such as the State Pension, so it is more than a tax: your record of NI contributions affects the pension you receive.</p>`,
      },
      {
        heading: "Take-home pay from £25,000 to £100,000",
        html: `<table>
<thead><tr><th>Salary</th><th>Income Tax</th><th>National Insurance</th><th>Take-home a year</th><th>Take-home a month</th></tr></thead>
<tbody>
<tr><td>£25,000</td><td>£2,486</td><td>£994</td><td>£21,520</td><td>£1,793</td></tr>
<tr><td>£30,000</td><td>£3,486</td><td>£1,394</td><td>£25,120</td><td>£2,093</td></tr>
<tr><td>£35,000</td><td>£4,486</td><td>£1,794</td><td>£28,720</td><td>£2,393</td></tr>
<tr><td>£40,000</td><td>£5,486</td><td>£2,194</td><td>£32,320</td><td>£2,693</td></tr>
<tr><td>£45,000</td><td>£6,486</td><td>£2,594</td><td>£35,920</td><td>£2,993</td></tr>
<tr><td>£50,000</td><td>£7,486</td><td>£2,994</td><td>£39,520</td><td>£3,293</td></tr>
<tr><td>£60,000</td><td>£11,432</td><td>£3,211</td><td>£45,357</td><td>£3,780</td></tr>
<tr><td>£75,000</td><td>£17,432</td><td>£3,511</td><td>£54,057</td><td>£4,505</td></tr>
<tr><td>£100,000</td><td>£27,432</td><td>£4,011</td><td>£68,557</td><td>£5,713</td></tr>
</tbody></table>
<p>Figures are rounded to the nearest pound and assume the standard tax code, no pension, no student loan and England, Wales or Northern Ireland. Type your own salary into the <a href="/uk-take-home-pay-calculator/">calculator</a> for an exact figure.</p>`,
      },
      {
        heading: "The £100,000 trap",
        html: `<p>For income above £100,000 the Personal Allowance is reduced by £1 for every £2 earned over that level, and it disappears completely at £125,140. In that band the extra £2 of income is taxed at 40% and also removes £1 of allowance, which costs a further 40% of that £1. The result is an effective Income Tax rate of about 60% on income between £100,000 and £125,140.</p>
<p>This is why a pension contribution or salary sacrifice that brings your income back under £100,000 can be worth much more than the headline rate suggests. Take advice for your own situation, because the benefit depends on how much you contribute and on your other income.</p>`,
      },
      {
        heading: "What can make your real pay different",
        html: `<ul>
<li><strong>Tax code:</strong> a code other than 1257L, for example because of a company car, untaxed income or tax underpaid in a previous year, changes the tax taken.</li>
<li><strong>Pension:</strong> contributions through salary sacrifice reduce both tax and NI; contributions taken after tax reduce only your net pay.</li>
<li><strong>Student loan:</strong> repayments are a percentage of income above a plan threshold and come out of your pay on top of tax and NI.</li>
<li><strong>Scotland:</strong> Scottish taxpayers have different Income Tax bands and rates.</li>
<li><strong>Pay frequency:</strong> weekly and monthly pay use the same annual rules, but the exact deduction in a given period depends on the tax code and cumulative pay.</li>
</ul>`,
      },
    ],
    faqs: [
      { q: "How much is £30,000 after tax in the UK?", a: "About £25,120 a year, or £2,093 a month, in 2026/27 after Income Tax and National Insurance on the standard tax code." },
      { q: "Is National Insurance charged on the Personal Allowance?", a: "NI has its own threshold of £12,570 for the main rate, so earnings below that level pay no employee NI. Above it, NI is charged on earnings as described in the guide." },
      { q: "Why does my payslip show a different figure?", a: "Your tax code, pension, student loan, benefits in kind and Scottish residence all change the result. This guide covers only standard Income Tax and NI." },
    ],
    tools: [
      { href: "/uk-take-home-pay-calculator/", label: "UK take-home pay calculator" },
      { href: "/stamp-duty-calculator/", label: "Stamp Duty calculator" },
      { href: "/uk-mortgage-calculator/", label: "UK mortgage calculator" },
      { href: "/hourly-to-salary-calculator/", label: "Hourly to salary calculator" },
    ],
  },
  {
    slug: "how-to-calculate-percentages",
    title: "How to calculate percentages: discounts, increases, tax and tips",
    metaTitle: "How to Calculate Percentages: Discount, Increase, Tax",
    description:
      "Clear methods for everyday percentage sums: a percentage of a number, discounts, increase and decrease, adding tax and working back to the original price.",
    summary:
      "Most percentage questions are one of five types. Learn the method for each, with worked examples and the mistakes that make answers wrong.",
    category: "Money and tax",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "What a percentage is",
        html: `<p>A percentage is a fraction with 100 as the denominator. 25% means 25 out of every 100, or 0.25. The quickest way into every percentage problem is to turn the percentage into a decimal by dividing by 100: 8% becomes 0.08, 20% becomes 0.2, and 150% becomes 1.5.</p>`,
      },
      {
        heading: "Finding a percentage of a number",
        html: `<p>Multiply the number by the decimal form. 15% of 240 is 240 × 0.15 = 36. Useful shortcuts: 10% is one tenth (move the decimal point one place left), 5% is half of 10%, and 1% is one hundredth. To find 15%, add 10% and 5%: 24 + 12 = 36.</p>`,
      },
      {
        heading: "Discounts and the price after a discount",
        html: `<p>To take a discount off a price, multiply the price by (1 − discount). A 30% discount on 80 gives 80 × 0.70 = 56, so you save 24. When there are two discounts in a row they do not add up: 20% off and then a further 10% off is 0.8 × 0.9 = 0.72 of the original price, a total discount of 28%, not 30%.</p>`,
      },
      {
        heading: "Percentage increase and decrease",
        html: `<p>The change is (new − old) ÷ old × 100. If a price rises from 50 to 65, the change is 15 ÷ 50 = 0.30, which is a 30% increase. If it falls from 65 back to 50, the change is −15 ÷ 65 = −0.23, a 23% decrease. The numbers are different because the percentage is always measured against the starting value, so a 30% rise is not undone by a 30% fall.</p>
<p>For a quick check, the <a href="/percentage-calculator/">percentage calculator</a> works out each of these types without you choosing the formula.</p>`,
      },
      {
        heading: "Adding tax, and working back to the price before tax",
        html: `<p>To add a tax rate, multiply by (1 + rate). A price of 200 plus 18% tax is 200 × 1.18 = 236. To go the other way and find the price before tax, divide by (1 + rate), not subtract the percentage: 236 ÷ 1.18 = 200. Subtracting 18% from 236 would give 193.5, which is wrong because the 18% was charged on the smaller starting price.</p>`,
      },
      {
        heading: "Common mistakes",
        html: `<ul>
<li>Adding two successive percentage changes instead of multiplying the factors.</li>
<li>Calculating the percentage of the wrong base, for example taking a discount off the already-reduced price.</li>
<li>Confusing percentage points with percent: a rate moving from 4% to 6% is a rise of 2 percentage points, or 50%.</li>
<li>Subtracting the tax percentage from a tax-inclusive price instead of dividing.</li>
</ul>`,
      },
    ],
    faqs: [
      { q: "How do I calculate 15% of a number quickly?", a: "Find 10% by moving the decimal point one place left, find half of that for 5%, and add the two. For 240, 10% is 24, 5% is 12, so 15% is 36." },
      { q: "Why is a 50% increase followed by a 50% decrease not back to the start?", a: "The decrease is measured on the larger number. 100 increased by 50% is 150, and 50% off 150 is 75, which is 25 below the start." },
      { q: "How do I find the original price from a price after a discount?", a: "Divide the sale price by (1 − discount). If a coat costs 56 after 30% off, the original price is 56 ÷ 0.70 = 80." },
    ],
    tools: [
      { href: "/percentage-calculator/", label: "Percentage calculator" },
      { href: "/loan-calculator/", label: "Loan calculator" },
      { href: "/age-calculator/", label: "Age calculator" },
    ],
  },
  {
    slug: "loan-emi-explained",
    title: "How a loan EMI is calculated, with a worked example",
    metaTitle: "How Loan EMI Is Calculated: Formula and Example",
    description:
      "The EMI formula explained step by step, with a worked 10 lakh loan example at 9%, what total interest looks like over 5, 10 and 20 years, and how to reduce it.",
    summary:
      "An EMI looks like a single number, but it hides a long calculation. See how the monthly payment, the interest and the balance fit together.",
    category: "Money and tax",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "What an EMI is",
        html: `<p>An EMI (equated monthly instalment) is a fixed payment you make each month on a loan. Every EMI is split into two parts: interest on the balance still owed, and a repayment of principal. In the first months most of the payment is interest. As the balance falls, interest falls too, so a larger part of the same EMI goes to principal.</p>`,
      },
      {
        heading: "The formula",
        html: `<p>EMI = P × r × (1 + r)<sup>n</sup> ÷ ((1 + r)<sup>n</sup> − 1)</p>
<ul>
<li><strong>P</strong> is the loan amount (principal).</li>
<li><strong>r</strong> is the monthly interest rate: the annual rate divided by 12 and by 100.</li>
<li><strong>n</strong> is the number of monthly payments.</li>
</ul>
<p>Rates quoted for home and personal loans are normally annual rates on the reducing balance, which is what this formula assumes. A flat-rate quote, where interest is charged on the original amount for the whole term, costs more than it appears to and gives a different EMI.</p>`,
      },
      {
        heading: "Worked example: 10 lakh at 9%",
        html: `<p>Take a loan of ₹10,00,000 at 9% a year for 10 years. The monthly rate is 9 ÷ 12 ÷ 100 = 0.0075 and there are 120 payments. The EMI works out to about ₹12,668 a month. Over 120 months you pay about ₹15,20,109, so the total interest is about ₹5,20,109.</p>
<p>You can check any combination of amount, rate and term in the <a href="/emi-calculator/">EMI calculator</a> and see the month-by-month split of interest and principal.</p>`,
      },
      {
        heading: "How the term changes the cost",
        html: `<table>
<thead><tr><th>Term</th><th>EMI</th><th>Total interest</th></tr></thead>
<tbody>
<tr><td>5 years</td><td>₹20,758</td><td>₹2,45,501</td></tr>
<tr><td>10 years</td><td>₹12,668</td><td>₹5,20,109</td></tr>
<tr><td>20 years</td><td>₹8,997</td><td>₹11,59,342</td></tr>
</tbody></table>
<p>Figures are for ₹10,00,000 at 9% on a reducing balance, rounded to the nearest rupee. Doubling the term from 10 to 20 years lowers the monthly payment by about a quarter but more than doubles the total interest.</p>`,
      },
      {
        heading: "Ways to pay less interest",
        html: `<ul>
<li><strong>Choose a shorter term</strong> if the higher EMI is affordable.</li>
<li><strong>Make part-prepayments.</strong> Prepaying principal reduces the balance on which interest is charged, and you can shorten the term or lower the EMI. Check whether your lender charges a prepayment fee for your type of loan.</li>
<li><strong>Compare the total cost,</strong> not only the EMI. Add processing fees and insurance when you compare offers.</li>
<li><strong>Negotiate or refinance</strong> if market rates fall well below your rate, after counting any switching charges.</li>
</ul>`,
      },
    ],
    faqs: [
      { q: "Is the EMI the same every month?", a: "For a fixed-rate loan, yes. For a floating-rate loan the lender may change the rate, which changes the EMI or the number of payments." },
      { q: "Why is most of my first EMI interest?", a: "Interest is charged on the full balance at the start, so the interest part is largest early and shrinks as you repay principal." },
      { q: "Does the EMI formula work for car and personal loans?", a: "Yes, for any loan with equal monthly payments on a reducing balance. Fees and insurance are extra and change the real cost." },
    ],
    tools: [
      { href: "/emi-calculator/", label: "EMI calculator" },
      { href: "/loan-calculator/", label: "Loan calculator" },
      { href: "/percentage-calculator/", label: "Percentage calculator" },
    ],
  },
  {
    slug: "metric-and-imperial-conversions-cheat-sheet",
    title: "Metric and imperial conversions: a practical cheat sheet",
    metaTitle: "Metric vs Imperial Conversions: Practical Cheat Sheet",
    description:
      "The conversions people use every day for height, weight, distance and speed, with exact factors, quick mental shortcuts and where each system is still used.",
    summary:
      "Centimeters to inches, kilograms to pounds, miles to kilometers: the factors that matter, how to estimate them in your head, and when to use the exact value.",
    category: "Units and measures",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Who uses which system",
        html: `<p>Most of the world uses the metric system (meters, grams, liters). The United States uses US customary units (inches, pounds, gallons), and the United Kingdom mixes the two: road distances and speed limits are in miles and miles per hour, drinks are measured in pints, body weight is often given in stone and pounds, while most other measurements are metric. This mixture is why conversions come up in travel, shopping, cooking and online forms.</p>`,
      },
      {
        heading: "Length and height",
        html: `<table>
<thead><tr><th>From</th><th>To</th><th>Factor</th><th>Quick estimate</th></tr></thead>
<tbody>
<tr><td>1 inch</td><td>centimeters</td><td>2.54 (exact)</td><td>× 2.5</td></tr>
<tr><td>1 foot</td><td>centimeters</td><td>30.48 (exact)</td><td>× 30</td></tr>
<tr><td>1 meter</td><td>feet</td><td>3.28084</td><td>× 3.3</td></tr>
<tr><td>1 mile</td><td>kilometers</td><td>1.609344 (exact)</td><td>× 1.6</td></tr>
<tr><td>1 kilometer</td><td>miles</td><td>0.621371</td><td>× 5 ÷ 8</td></tr>
</tbody></table>
<p>For a height, convert to inches first and split into feet and inches by dividing by 12. 175 cm is 68.9 inches, which is 5 feet 8.9 inches. Use the <a href="/cm-to-inches/">cm to inches</a> and <a href="/feet-to-cm/">feet to cm</a> converters when the exact value matters, such as on a form.</p>`,
      },
      {
        heading: "Weight and mass",
        html: `<table>
<thead><tr><th>From</th><th>To</th><th>Factor</th><th>Quick estimate</th></tr></thead>
<tbody>
<tr><td>1 kilogram</td><td>pounds</td><td>2.20462</td><td>× 2.2</td></tr>
<tr><td>1 pound</td><td>kilograms</td><td>0.45359237 (exact)</td><td>÷ 2.2</td></tr>
<tr><td>1 ounce</td><td>grams</td><td>28.3495</td><td>× 28</td></tr>
<tr><td>1 stone</td><td>pounds</td><td>14 (exact)</td><td>× 14</td></tr>
</tbody></table>
<p>A body weight of 70 kg is 154.3 pounds, or 11 stone 0.3 pounds. Gold and silver are weighed in troy ounces (31.1035 grams), which are not the same as the ounce used for food and mail, so do not mix them. Try the <a href="/kg-to-lbs/">kg to pounds</a> converter for exact results.</p>`,
      },
      {
        heading: "Speed and distance on the road",
        html: `<p>A speed in miles per hour times 1.609 gives kilometers per hour. Common limits translate as 30 mph = 48 km/h, 50 mph = 80 km/h, 60 mph = 97 km/h and 70 mph = 113 km/h. In the other direction, 100 km/h is 62 mph and 130 km/h is 81 mph. See <a href="/mph-to-kmh/">mph to km/h</a> for any value.</p>`,
      },
      {
        heading: "Volume and liquids",
        html: `<p>The US gallon is 3.785 liters, while the UK imperial gallon is 4.546 liters, about 20% larger. That is why fuel economy in miles per gallon is not directly comparable between the two countries. A US fluid ounce is 29.57 ml and a UK fluid ounce is 28.41 ml. The <a href="/cups-to-ml/">cups to ml</a> and <a href="/ml-to-oz/">ml to ounces</a> pages use the US measures.</p>`,
      },
      {
        heading: "When to estimate and when to be exact",
        html: `<ul>
<li><strong>Estimate</strong> for travel, shopping and general understanding: a mental factor is enough.</li>
<li><strong>Be exact</strong> for forms, medical and legal documents, engineering and anything that is checked against a limit.</li>
<li><strong>Round last.</strong> Convert with the full factor and round the final answer, not each step.</li>
<li><strong>Say the unit.</strong> A number without a unit is the source of most conversion mistakes.</li>
</ul>`,
      },
    ],
    faqs: [
      { q: "Is an inch exactly 2.54 cm?", a: "Yes. Since the international yard and pound agreement of 1959 the inch is defined as exactly 2.54 centimeters." },
      { q: "What is the easiest way to convert km to miles in my head?", a: "Multiply by 5 and divide by 8. 80 km is 400 ÷ 8 = 50 miles, close to the exact 49.7." },
      { q: "Are US and UK gallons the same?", a: "No. A US gallon is 3.785 liters and a UK imperial gallon is 4.546 liters." },
    ],
    tools: [
      { href: "/cm-to-inches/", label: "cm to inches" },
      { href: "/kg-to-lbs/", label: "kg to pounds" },
      { href: "/miles-to-km/", label: "miles to km" },
      { href: "/mph-to-kmh/", label: "mph to km/h" },
    ],
  },
  {
    slug: "kb-mb-gb-file-size-units-explained",
    title: "KB, MB, GB and TB: file size units explained",
    metaTitle: "KB, MB, GB and TB Explained: File Size Units",
    description:
      "What kilobytes, megabytes and gigabytes mean, why 1 GB can be 1,000 or 1,024 MB, why your drive shows less space than advertised, and how to estimate file sizes.",
    summary:
      "File sizes are quoted in different ways by different programs. Here is how the units relate, why the numbers sometimes disagree, and how to plan around a size limit.",
    category: "Units and measures",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Bits, bytes and the units above them",
        html: `<p>A bit is a single 0 or 1. A <strong>byte</strong> is eight bits and is the basic unit for file size. A text file with 1,000 characters is roughly 1,000 bytes. Larger units are built on top of the byte: kilobyte (KB), megabyte (MB), gigabyte (GB) and terabyte (TB). Internet speeds are usually quoted in <em>bits</em> per second (Mbps), which is eight times smaller than the same number of megabytes per second, so a 100 Mbps connection downloads at most about 12.5 MB each second.</p>`,
      },
      {
        heading: "Decimal and binary: why 1 GB is not always the same",
        html: `<p>There are two conventions.</p>
<ul>
<li><strong>Decimal (SI):</strong> 1 KB = 1,000 bytes, 1 MB = 1,000,000 bytes, 1 GB = 1,000,000,000 bytes. Storage makers, mobile networks and many websites use this.</li>
<li><strong>Binary:</strong> 1 KiB = 1,024 bytes, 1 MiB = 1,048,576 bytes, 1 GiB = 1,073,741,824 bytes. Memory chips and some operating systems work this way, and some of them still call these units KB, MB and GB.</li>
</ul>
<p>The two differ by about 2.4% at the KB level and about 7.4% at the GB level, which is why the same file can appear as 98 KB in one program and 100 KB in another. When a website sets a limit of 100 KB, aim for a few KB under to be safe. The <a href="/mb-to-gb/">MB to GB</a> and <a href="/gb-to-mb/">GB to MB</a> converters use the decimal standard.</p>`,
      },
      {
        heading: "Why your drive shows less space than advertised",
        html: `<p>A drive sold as 500 GB holds 500,000,000,000 bytes. Windows divides by 1,024 three times and reports about 465 GB, even though it still uses the label GB. Nothing is missing: the two programs are counting in different units. A 1 TB drive shows as about 931 GB for the same reason. Some formatting overhead and the operating system's own files take a little more space.</p>`,
      },
      {
        heading: "Typical file sizes",
        html: `<table>
<thead><tr><th>File</th><th>Typical size</th></tr></thead>
<tbody>
<tr><td>Plain text email</td><td>a few KB</td></tr>
<tr><td>Form photo (JPEG)</td><td>20 to 100 KB</td></tr>
<tr><td>Phone photo</td><td>2 to 6 MB</td></tr>
<tr><td>One minute of music (MP3, 128 kbps)</td><td>about 1 MB</td></tr>
<tr><td>One minute of HD video</td><td>roughly 50 to 150 MB, depending on compression</td></tr>
<tr><td>Short PDF of text</td><td>50 to 300 KB</td></tr>
</tbody></table>
<p>These are rough guides. Actual sizes depend on resolution, compression and content.</p>`,
      },
      {
        heading: "Planning around a limit",
        html: `<ol>
<li>Find out whether the limit is in KB or MB and whether it is a maximum, a minimum or both.</li>
<li>Check the size shown by the same program that will enforce the limit, if you can.</li>
<li>Leave a margin of about 5% under the limit to cover the decimal and binary difference.</li>
<li>If the file is too big, reduce what makes it big: image dimensions and quality for pictures, page count and scan resolution for PDFs.</li>
</ol>`,
      },
    ],
    faqs: [
      { q: "How many MB are in 1 GB?", a: "1,000 MB in the decimal standard that mobile carriers and storage makers use, and 1,024 MiB in the binary standard." },
      { q: "Why does my 1 TB drive show about 931 GB?", a: "The drive holds 1,000,000,000,000 bytes. Windows divides by 1,024³ and reports about 931, which is the same amount of storage expressed in binary units." },
      { q: "Is Mbps the same as MBps?", a: "No. Mbps is megabits per second and MBps is megabytes per second. One byte is eight bits, so divide Mbps by 8 for MBps." },
    ],
    tools: [
      { href: "/mb-to-gb/", label: "MB to GB" },
      { href: "/gb-to-mb/", label: "GB to MB" },
      { href: "/image-compressor/", label: "Image Compressor" },
    ],
  },
  {
    slug: "cooking-measurements-cups-grams-ml",
    title: "Cooking measurements: cups, grams, milliliters and ounces",
    metaTitle: "Cooking Measurements: Cups, Grams, ml and Ounces",
    description:
      "Convert recipe measurements with confidence: US and metric cups, spoons, ounces versus fluid ounces, and why a cup of flour and a cup of sugar weigh differently.",
    summary:
      "A cup is not the same everywhere, and an ounce can mean weight or volume. This guide sorts out the common recipe units and when weighing beats measuring.",
    category: "Units and measures",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Volume and weight are different things",
        html: `<p>Cups, tablespoons, teaspoons, milliliters and fluid ounces measure <strong>volume</strong>. Grams, kilograms, ounces and pounds measure <strong>weight</strong>. A conversion between the two depends on the ingredient: a cup of flour weighs much less than a cup of honey. That is why professional bakers weigh ingredients, and why recipes that only give cups are less precise.</p>`,
      },
      {
        heading: "How big is a cup?",
        html: `<table>
<thead><tr><th>Cup</th><th>Size</th></tr></thead>
<tbody>
<tr><td>US customary cup</td><td>236.6 ml (8 US fluid ounces)</td></tr>
<tr><td>US nutrition label cup</td><td>240 ml</td></tr>
<tr><td>Metric cup (Australia, New Zealand, many UK recipes)</td><td>250 ml</td></tr>
</tbody></table>
<p>The difference between a US and a metric cup is about 6%, which can change a bake. If a recipe does not say, use the cup standard of the country it comes from. The <a href="/cups-to-ml/">cups to ml</a> converter uses the US customary cup.</p>`,
      },
      {
        heading: "Spoons",
        html: `<p>A US tablespoon is about 14.8 ml and a US teaspoon about 4.9 ml, and recipes usually round them to 15 ml and 5 ml. In the United States 1 tablespoon is 3 teaspoons and 1 cup is 16 tablespoons. An Australian tablespoon is 20 ml, so a recipe written for Australian spoons uses about a third more per spoon than a US one.</p>`,
      },
      {
        heading: "Ounces and fluid ounces",
        html: `<p>An <strong>ounce</strong> (oz) is a unit of weight equal to 28.35 grams, and 16 ounces make a pound. A <strong>fluid ounce</strong> (fl oz) is a unit of volume equal to 29.57 ml in the US. For water they are close in size, but for other ingredients they are not: 8 fluid ounces of flour weighs much less than 8 ounces. Use <a href="/oz-to-grams/">ounces to grams</a> for weight and <a href="/ml-to-oz/">ml to ounces</a> for volume.</p>`,
      },
      {
        heading: "What a cup weighs",
        html: `<table>
<thead><tr><th>Ingredient (1 US cup)</th><th>Approximate weight</th></tr></thead>
<tbody>
<tr><td>Water or milk</td><td>about 237 g</td></tr>
<tr><td>Plain flour, spooned and levelled</td><td>about 120 to 125 g</td></tr>
<tr><td>Granulated sugar</td><td>about 200 g</td></tr>
<tr><td>Butter</td><td>227 g (two US sticks)</td></tr>
</tbody></table>
<p>These are typical values. Packing, humidity and brand change them, so a scale is more reliable than a cup for baking.</p>`,
      },
      {
        heading: "Tips for reliable results",
        html: `<ul>
<li>Check which country a recipe comes from before converting cups.</li>
<li>Spoon flour into the cup and level it instead of scooping, which packs it down and adds up to 20% more.</li>
<li>Weigh baking ingredients if you can, and use volume for liquids.</li>
<li>Convert the whole recipe with the same factor so the ratios stay right.</li>
<li>Oven temperatures also differ by country: see the guide on <a href="/guides/oven-temperatures-celsius-fahrenheit-gas-mark/">oven temperatures</a>.</li>
</ul>`,
      },
    ],
    faqs: [
      { q: "How many ml is a cup?", a: "A US customary cup is 236.6 ml, a US label cup is 240 ml and a metric cup is 250 ml." },
      { q: "Is an ounce the same as a fluid ounce?", a: "No. An ounce measures weight (28.35 g) and a fluid ounce measures volume (29.57 ml in the US). They are only close for water." },
      { q: "How many grams is a cup of flour?", a: "About 120 to 125 g when spooned and levelled. Scooped and packed flour can weigh noticeably more." },
    ],
    tools: [
      { href: "/cups-to-ml/", label: "Cups to ml" },
      { href: "/ml-to-oz/", label: "ml to ounces" },
      { href: "/oz-to-grams/", label: "Ounces to grams" },
      { href: "/celsius-to-fahrenheit/", label: "Celsius to Fahrenheit" },
    ],
  },
  {
    slug: "oven-temperatures-celsius-fahrenheit-gas-mark",
    title: "Oven temperatures: Celsius, Fahrenheit and gas mark",
    metaTitle: "Oven Temperatures: Celsius, Fahrenheit and Gas Mark",
    description:
      "A conversion table for oven temperatures in Celsius, Fahrenheit and UK gas mark, how fan ovens differ, and the formula for any other temperature.",
    summary:
      "Recipes use three different oven scales. Use this table to match them, and learn how fan ovens and the formula change the numbers.",
    category: "Units and measures",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Three scales for the same oven",
        html: `<p>US recipes use degrees Fahrenheit, most of the rest of the world uses degrees Celsius, and older British recipes use <strong>gas mark</strong>, a numbered scale from the dials on gas cookers. Modern UK ovens show Celsius, but gas marks still appear in recipe books and on packaging.</p>`,
      },
      {
        heading: "Conversion table",
        html: `<table>
<thead><tr><th>Gas mark</th><th>Celsius</th><th>Fahrenheit</th><th>Description</th></tr></thead>
<tbody>
<tr><td>1</td><td>140 °C</td><td>275 °F</td><td>very slow</td></tr>
<tr><td>2</td><td>150 °C</td><td>300 °F</td><td>slow</td></tr>
<tr><td>3</td><td>170 °C</td><td>325 °F</td><td>moderately slow</td></tr>
<tr><td>4</td><td>180 °C</td><td>350 °F</td><td>moderate</td></tr>
<tr><td>5</td><td>190 °C</td><td>375 °F</td><td>moderately hot</td></tr>
<tr><td>6</td><td>200 °C</td><td>400 °F</td><td>hot</td></tr>
<tr><td>7</td><td>220 °C</td><td>425 °F</td><td>hot</td></tr>
<tr><td>8</td><td>230 °C</td><td>450 °F</td><td>very hot</td></tr>
<tr><td>9</td><td>240 °C</td><td>475 °F</td><td>very hot</td></tr>
</tbody></table>
<p>These are the standard rounded pairs used in recipes. The exact conversion of 180 °C is 356 °F, and the table rounds it to 350 °F. Recipes work with the rounded pairs.</p>`,
      },
      {
        heading: "The formula for any temperature",
        html: `<p>To convert Celsius to Fahrenheit, multiply by 1.8 and add 32: 200 × 1.8 + 32 = 392 °F. To convert back, subtract 32 and divide by 1.8: (350 − 32) ÷ 1.8 = 176.7 °C. The <a href="/celsius-to-fahrenheit/">Celsius to Fahrenheit</a> and <a href="/fahrenheit-to-celsius/">Fahrenheit to Celsius</a> converters do the arithmetic for any value.</p>`,
      },
      {
        heading: "Fan ovens and conventional ovens",
        html: `<p>A fan (convection) oven circulates hot air, so food cooks faster and more evenly. The common rule is to reduce the temperature by about 20 °C (or 25 °F) from a recipe written for a conventional oven, or to shorten the time. Check the recipe: many modern UK and Australian recipes give both a conventional and a fan temperature.</p>`,
      },
      {
        heading: "Typical settings for common foods",
        html: `<table>
<thead><tr><th>Food</th><th>Usual range</th><th>Gas mark</th></tr></thead>
<tbody>
<tr><td>Cakes and sponges</td><td>160 to 180 °C (325 to 350 °F)</td><td>3 to 4</td></tr>
<tr><td>Biscuits and cookies</td><td>170 to 180 °C (325 to 350 °F)</td><td>3 to 4</td></tr>
<tr><td>Roast chicken</td><td>180 to 200 °C (350 to 400 °F)</td><td>4 to 6</td></tr>
<tr><td>Roast potatoes and vegetables</td><td>200 to 220 °C (400 to 425 °F)</td><td>6 to 7</td></tr>
<tr><td>Bread and pizza</td><td>220 to 240 °C (425 to 475 °F)</td><td>7 to 9</td></tr>
</tbody></table>
<p>These are typical ranges, not rules. Always follow the temperature and time in your own recipe, and cook meat until it reaches a safe internal temperature as shown on a food thermometer.</p>`,
      },
      {
        heading: "Ovens vary",
        html: `<p>Home ovens are often inaccurate by 10 to 20 degrees, and hot spots are common. An inexpensive oven thermometer shows the real temperature, and checking food a few minutes before the stated time prevents most disasters. Treat the recipe time as a guide and judge by colour, texture and a skewer or thermometer.</p>`,
      },
    ],
    faqs: [
      { q: "What is 180 °C in Fahrenheit?", a: "180 °C is exactly 356 °F, which recipes round to 350 °F (gas mark 4)." },
      { q: "What is gas mark 6 in Celsius?", a: "Gas mark 6 is 200 °C or 400 °F." },
      { q: "How much lower should a fan oven be?", a: "Usually about 20 °C lower than a conventional oven, or follow the fan setting given in the recipe." },
    ],
    tools: [
      { href: "/celsius-to-fahrenheit/", label: "Celsius to Fahrenheit" },
      { href: "/fahrenheit-to-celsius/", label: "Fahrenheit to Celsius" },
      { href: "/cups-to-ml/", label: "Cups to ml" },
    ],
  },
  {
    slug: "katha-bigha-decimal-land-measurement",
    title: "Katha, bigha and decimal: land measurement in Bangladesh and West Bengal",
    metaTitle: "Katha, Bigha and Decimal: Land Units Explained",
    description:
      "How land is measured in Bangladesh and West Bengal: square feet, katha, decimal, bigha and acre, how to find a plot's area, and why values differ by region.",
    summary:
      "Land records use units that do not match square feet or acres neatly. This guide explains each unit, gives the conversions used on this site, and shows how to check a plot.",
    category: "Land and property",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why so many units",
        html: `<p>Land in Bangladesh and West Bengal is described in traditional units such as katha, bigha and decimal, alongside square feet and acres. Buyers, sellers and land offices often mix them in a single document, so understanding how they relate saves mistakes in a deal.</p>`,
      },
      {
        heading: "The units and how they relate",
        html: `<p>The conversions used by the <a href="/bangladesh-land-converter/">land converter</a> on this site are:</p>
<table>
<thead><tr><th>Unit</th><th>Square feet</th></tr></thead>
<tbody>
<tr><td>1 katha</td><td>720 sq ft</td></tr>
<tr><td>1 decimal (shotok)</td><td>435.6 sq ft</td></tr>
<tr><td>1 bigha</td><td>20 katha, or 14,400 sq ft</td></tr>
<tr><td>1 acre</td><td>43,560 sq ft, or 100 decimal</td></tr>
</tbody></table>
<p>From this, 1 acre is about 60.5 katha and 1 katha is about 1.65 decimal. The decimal is exactly one hundredth of an acre, which is why it appears in land records as a convenient fraction.</p>`,
      },
      {
        heading: "Why the values can differ",
        html: `<p>Katha and bigha are not defined by a single national standard. Their size differs between districts and between countries, and some records treat a bigha as 33 decimal (about 14,375 sq ft), which is close to but not the same as 20 katha. A hat (cubit), used for measuring plots, is commonly taken as 1.5 feet, but local custom varies.</p>
<p>For any sale, registration or dispute, use the area written in the deed, the khatian or the survey record, and confirm the local value of the unit with the land office or a surveyor. The converters here give a standard estimate, not a legal measurement.</p>`,
      },
      {
        heading: "Finding the area of a plot",
        html: `<ol>
<li>Measure the length and width of each side in feet, meters or hat. Use the same unit for both.</li>
<li>For a rectangle, multiply length by width to get the area in square units.</li>
<li>Divide by 720 for katha or by 435.6 for decimal.</li>
</ol>
<p>A plot 60 ft by 40 ft has an area of 2,400 sq ft, which is about 3.33 katha or 5.51 decimal. The <a href="/plot-area-calculator/">plot area calculator</a> does the steps for you. For an irregular plot, split it into rectangles and triangles, calculate each and add the results. For a very irregular boundary, a licensed surveyor is the reliable option.</p>`,
      },
      {
        heading: "Checking a deal",
        html: `<ul>
<li>Ask which unit the quoted price per unit refers to, and convert to a single unit to compare offers.</li>
<li>Check the total area in the deed against the area you measured.</li>
<li>Be careful with phrases such as "3 katha" when the local katha may be 720 sq ft or a different value.</li>
<li>Keep a record of the measurements and the conversion used.</li>
</ul>`,
      },
    ],
    faqs: [
      { q: "How many square feet is 1 katha?", a: "This site uses 720 square feet per katha. Local values can differ, so check your deed." },
      { q: "How many decimals are in an acre?", a: "100. A decimal is one hundredth of an acre, or 435.6 square feet." },
      { q: "How many katha is 1 bigha?", a: "20 katha in the convention used here, which is 14,400 square feet. Some regions use a different value." },
    ],
    tools: [
      { href: "/bangladesh-land-converter/", label: "Bangladesh land converter" },
      { href: "/plot-area-calculator/", label: "Plot area calculator" },
      { href: "/square-feet-to-katha/", label: "Square feet to katha" },
      { href: "/square-feet-to-decimal/", label: "Square feet to decimal" },
    ],
  },
  {
    slug: "how-to-write-amount-in-words-on-a-cheque",
    title: "How to write an amount in words on a cheque",
    metaTitle: "How to Write an Amount in Words on a Cheque",
    description:
      "The rules for writing cheque amounts in words: dollars, pounds, rupees and euros, cents and paise, when to use Only, and mistakes that get cheques rejected.",
    summary:
      "The amount in words is the part of a cheque that banks treat as authoritative. Learn how to write it correctly and avoid the errors that cause delays or fraud.",
    category: "Numbers and words",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why the amount appears twice",
        html: `<p>A cheque shows the amount in figures and in words. The words make the amount harder to alter: it is easy to change 1,000 to 10,000 by adding a digit, but much harder to rewrite a sentence. If the two differ, banks in many countries treat the words as the amount to pay, or return the cheque for confirmation. Either way, a mismatch causes delay, so write both carefully.</p>`,
      },
      {
        heading: "The basic pattern",
        html: `<p>Write the whole units in words, then the currency name, then any smaller units, and finish with <strong>Only</strong> if your bank or country uses it. For example:</p>
<ul>
<li><strong>US dollars:</strong> One Thousand Two Hundred Thirty-Four Dollars and Fifty-Six Cents Only (or 56/100).</li>
<li><strong>British pounds:</strong> Two Thousand Seven Hundred Fifty Pounds and Twenty-Five Pence Only.</li>
<li><strong>Indian rupees:</strong> Rupees Two Lakh Seventy-Five Thousand Only, using lakh and crore.</li>
</ul>
<p>The <a href="/cheque-amount-in-words/">cheque amount in words</a> tool writes these for you in the right pattern, and there are pages for <a href="/rupees-in-words/">rupees</a>, <a href="/dollars-in-words/">dollars</a>, <a href="/pounds-in-words/">pounds</a> and <a href="/euros-in-words/">euros</a>.</p>`,
      },
      {
        heading: "Rules that prevent problems",
        html: `<ol>
<li><strong>Start at the far left</strong> of the words line and leave no gaps where words could be added.</li>
<li><strong>Draw a line</strong> through any unused space after the last word.</li>
<li><strong>Write the cents or pence</strong> in words or as a fraction (for example 56/100), and use "no cents" or "00/100" for whole amounts if your bank asks.</li>
<li><strong>Use hyphens</strong> in numbers from twenty-one to ninety-nine, such as Thirty-Four.</li>
<li><strong>Match the figures</strong> in the amount box exactly.</li>
<li><strong>Use ink</strong> that cannot be erased, and do not overwrite mistakes: ask for a new cheque.</li>
</ol>`,
      },
      {
        heading: "Common mistakes",
        html: `<ul>
<li>Writing "and" in the wrong place. In US style "and" separates dollars and cents only, so write One Hundred Five Dollars, not One Hundred and Five Dollars.</li>
<li>Mixing the Indian and international systems. 12,50,000 is Twelve Lakh Fifty Thousand, while 1,250,000 is One Million Two Hundred Fifty Thousand.</li>
<li>Forgetting the currency name, which matters when the same sign is used by several countries.</li>
<li>Leaving space after the words so more can be added.</li>
</ul>`,
      },
      {
        heading: "Bank-specific rules",
        html: `<p>Banks may have their own conventions, such as a required word at the end, a fraction for cents or a specific line for the amount in words. If you are unsure, check your bank's instructions or ask. A tool or a guide can write the words, but you are responsible for what you sign, so always read the words back against the figures.</p>`,
      },
    ],
    faqs: [
      { q: "Do I write Only after the amount?", a: "It is common in India, the UK and many other countries and optional in the US. Use it if your bank or the form asks for it." },
      { q: "What if the words and figures differ?", a: "The bank may pay the amount in words or return the cheque for clarification. Write a new cheque to avoid delay." },
      { q: "How do I write 105 in words?", a: "One Hundred Five in US style and One Hundred and Five in British style. Follow your local convention." },
    ],
    tools: [
      { href: "/cheque-amount-in-words/", label: "Cheque amount in words" },
      { href: "/rupees-in-words/", label: "Rupees in words" },
      { href: "/dollars-in-words/", label: "Dollars in words" },
      { href: "/number-to-words/", label: "Number to words" },
    ],
  },
  {
    slug: "indian-number-system-lakh-crore-million-billion",
    title: "Lakh, crore, million and billion: the Indian and international number systems",
    metaTitle: "Lakh, Crore, Million and Billion: Number Systems",
    description:
      "How the Indian system (lakh, crore, arab) and the international system (million, billion) group digits, with a conversion table and examples.",
    summary:
      "The same number is grouped differently in India and elsewhere. See how lakh and crore map to million and billion, and how to write each correctly.",
    category: "Numbers and words",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Two ways of grouping digits",
        html: `<p>The <strong>international system</strong> groups digits in threes: 1,000,000 is one million. The <strong>Indian system</strong> groups the last three digits and then every two digits after that: 10,00,000 is ten lakh. The commas move, and the names of the large units are different, but the value of the number is the same.</p>`,
      },
      {
        heading: "Names of large numbers",
        html: `<table>
<thead><tr><th>Number</th><th>Indian name</th><th>International name</th></tr></thead>
<tbody>
<tr><td>1,000</td><td>one thousand (hazaar)</td><td>one thousand</td></tr>
<tr><td>100,000</td><td>one lakh</td><td>one hundred thousand</td></tr>
<tr><td>1,000,000</td><td>ten lakh</td><td>one million</td></tr>
<tr><td>10,000,000</td><td>one crore</td><td>ten million</td></tr>
<tr><td>1,000,000,000</td><td>one hundred crore, or one arab</td><td>one billion</td></tr>
<tr><td>100,000,000,000</td><td>one kharab (100 arab)</td><td>one hundred billion</td></tr>
</tbody></table>
<p>So 1 lakh is 100,000, 1 crore is 100 lakh or 10 million, and 1 arab is 100 crore or 1 billion. The <a href="/million-to-crore-converter/">million to crore converter</a> does these conversions for any value.</p>`,
      },
      {
        heading: "Writing a number in the Indian format",
        html: `<p>Starting from the right, put a comma after the first three digits and then after every two. The number 12345678 is written 1,23,45,678 and read as one crore twenty-three lakh forty-five thousand six hundred seventy-eight. In international format the same number is 12,345,678: twelve million three hundred forty-five thousand six hundred seventy-eight.</p>
<p>To write a number in words in either system, use the <a href="/number-to-words/">number to words converter</a>, or the <a href="/number-to-words-in-lakhs-and-crores/">lakhs and crores</a> page for the Indian style.</p>`,
      },
      {
        heading: "Where each system is used",
        html: `<p>The Indian system is the standard in India, and it is also used in Pakistan, Bangladesh, Nepal and Sri Lanka, where lakh and crore are part of everyday speech, newspapers and banking. English-language business, science and most international publications use million and billion. In India, many reports show both, so it helps to convert quickly.</p>`,
      },
      {
        heading: "Worked conversions",
        html: `<table>
<thead><tr><th>Indian</th><th>Digits</th><th>International</th></tr></thead>
<tbody>
<tr><td>7.5 lakh</td><td>7,50,000</td><td>750,000 (seven hundred fifty thousand)</td></tr>
<tr><td>25 lakh</td><td>25,00,000</td><td>2.5 million</td></tr>
<tr><td>3.2 crore</td><td>3,20,00,000</td><td>32 million</td></tr>
<tr><td>25 crore</td><td>25,00,00,000</td><td>250 million</td></tr>
<tr><td>250 crore</td><td>2,50,00,00,000</td><td>2.5 billion</td></tr>
</tbody></table>
<p>The rule is easy to remember: multiply lakh by 0.1 to get millions, and multiply crore by 10 to get millions. So 25 lakh is 2.5 million and 25 crore is 250 million.</p>`,
      },
      {
        heading: "Avoiding mistakes",
        html: `<ul>
<li>Do not read 10,00,000 as ten thousand because of the commas: it is ten lakh, one million.</li>
<li>Check which system a document uses before comparing figures. 50 crore is 500 million, not 50 million.</li>
<li>Be careful with the word billion in older British texts. It once meant a million million, but modern usage means one thousand million.</li>
<li>Write the unit with the number in forms, for example Rs. 2.5 crore, to avoid ambiguity.</li>
</ul>`,
      },
    ],
    faqs: [
      { q: "How many lakh is a million?", a: "A million is 10 lakh." },
      { q: "How many crore is a billion?", a: "A billion (1,000,000,000) is 100 crore, also called one arab." },
      { q: "How do I write 1,50,000 in international format?", a: "150,000, which is one hundred fifty thousand or 1.5 lakh." },
    ],
    tools: [
      { href: "/million-to-crore-converter/", label: "Million to crore converter" },
      { href: "/number-to-words-in-lakhs-and-crores/", label: "Number to words in lakhs and crores" },
      { href: "/number-to-words/", label: "Number to words" },
      { href: "/rupees-in-words/", label: "Rupees in words" },
    ],
  },
];
