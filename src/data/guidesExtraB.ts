import type { Guide } from "./guides";

/**
 * Guides on calculators, units, number systems and the Bangla calendar. Same format as guidesMore.ts.
 * Section bodies are trusted HTML (paragraphs, lists, tables and internal links only). Every worked
 * example here was checked by calculation before it was written.
 */
export const extraGuidesB: Guide[] = [
  {
    slug: "compound-interest-explained",
    title: "Compound interest explained: the formula, a worked table and the Rule of 72",
    metaTitle: "Compound Interest Explained: Formula and Examples",
    description:
      "How compound interest works: the formula, a 30-year table at 5%, annual versus monthly compounding, the Rule of 72, and the mistakes that cost savers money.",
    summary:
      "Compound interest means you earn interest on your earlier interest. This guide shows the formula, a worked table, why the rate matters more than the compounding frequency, and a quick way to estimate doubling time.",
    category: "Calculators and maths",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Simple interest and compound interest",
        html: `<p><strong>Simple interest</strong> is paid only on the amount you first put in, called the principal. If you deposit 10,000 at 5% simple interest, you earn 500 every year, and after ten years you have 15,000. The interest never earns anything itself.</p>
<p><strong>Compound interest</strong> adds each period's interest to the balance, so the next period's interest is calculated on a bigger number. The same 10,000 at 5% compounded yearly earns 500 in the first year, then 525 in the second (5% of 10,500), then 551.25 in the third, and so on. The gap between the two methods is small at first and grows every year, which is why the length of time matters so much.</p>`,
      },
      {
        heading: "The compound interest formula",
        html: `<p>The standard formula for a single lump sum is:</p>
<p><strong>A = P × (1 + r / n) ^ (n × t)</strong></p>
<ul>
<li><strong>A</strong> is the final amount, principal plus interest.</li>
<li><strong>P</strong> is the starting principal.</li>
<li><strong>r</strong> is the annual interest rate as a decimal (5% is 0.05).</li>
<li><strong>n</strong> is how many times a year interest is added.</li>
<li><strong>t</strong> is the number of years.</li>
</ul>
<p>Worked example: 10,000 at 5% compounded yearly for 10 years. Here n = 1, so A = 10,000 × (1.05)^10 = 10,000 × 1.62889 = <strong>16,288.95</strong>. The interest earned is 6,288.95, compared with 5,000 under simple interest. You can check any case in the <a href="/compound-interest-calculator/">compound interest calculator</a>.</p>`,
      },
      {
        heading: "A worked table: 10,000 at 5%",
        html: `<p>This table uses the same 10,000 at 5% a year and compares interest added once a year with interest added every month.</p>
<table>
<thead><tr><th>Years</th><th>Compounded yearly</th><th>Compounded monthly</th></tr></thead>
<tbody>
<tr><td>1</td><td>10,500.00</td><td>10,511.62</td></tr>
<tr><td>5</td><td>12,762.82</td><td>12,833.59</td></tr>
<tr><td>10</td><td>16,288.95</td><td>16,470.09</td></tr>
<tr><td>20</td><td>26,532.98</td><td>27,126.40</td></tr>
<tr><td>30</td><td>43,219.42</td><td>44,677.44</td></tr>
</tbody>
</table>
<p>Notice that the balance does not grow in a straight line. Between years 20 and 30 the yearly column gains about 16,686, while between years 0 and 10 it gains only 6,289. The same rate on a larger balance produces more interest, and that is the whole effect.</p>`,
      },
      {
        heading: "Does compounding frequency matter?",
        html: `<p>Less than most people expect. Moving from yearly to monthly compounding at 5% adds 1,458 over 30 years on a 10,000 deposit (44,677 against 43,219). Raising the rate by even one percentage point matters far more.</p>
<p>The reason is that a nominal rate of 5% compounded monthly is really a slightly higher <strong>effective annual rate</strong>. Each month earns 5% ÷ 12 = 0.4167%, and (1 + 0.05 / 12)^12 = 1.05116, so the true yearly gain is about 5.116%. Banks in some countries quote this effective figure (often called AER or APY), which lets you compare accounts that compound at different frequencies. If two accounts show the same effective rate, they grow identically whatever their compounding schedule.</p>`,
      },
      {
        heading: "The Rule of 72",
        html: `<p>To estimate how long money takes to double, divide 72 by the annual rate as a whole number. At 6% the answer is 72 ÷ 6 = 12 years. The exact figure is 11.9 years, so the shortcut is close. At 8% it gives 9 years, and at 3% it gives 24 years.</p>
<p>The rule works best for rates between roughly 4% and 12%. It is only an estimate, so use the <a href="/future-value-calculator/">future value calculator</a> when you need a precise figure, especially if you will add money every month.</p>`,
      },
      {
        heading: "Mistakes that make compound interest work against you",
        html: `<ul>
<li><strong>Ignoring costs.</strong> A fund charge of 1% a year is taken from the balance every year and compounds against you in the same way growth compounds for you.</li>
<li><strong>Forgetting inflation.</strong> If prices rise 3% a year and your account pays 3%, your buying power is flat even though the balance grows.</li>
<li><strong>Assuming a fixed rate.</strong> Savings rates change, and investment returns are not guaranteed. A table like the one above shows what a given rate would do, not what will happen.</li>
<li><strong>Starting late.</strong> Because growth is back-loaded, ten extra years at the start is worth more than ten extra years of larger deposits at the end.</li>
<li><strong>Forgetting that debt compounds too.</strong> Credit card balances compound against you, which is why paying down high-rate debt is often a good guaranteed return.</li>
</ul>
<p>This guide explains how the arithmetic works and is not financial advice. Check the terms of any real account or loan before you decide.</p>`,
      },
    ],
    faqs: [
      {
        q: "What is the difference between compound and simple interest?",
        a: "Simple interest is calculated only on the original amount. Compound interest is calculated on the original amount plus all interest already added, so it grows faster over time.",
      },
      {
        q: "How do I calculate compound interest by hand?",
        a: "Use A = P × (1 + r / n) ^ (n × t). For 10,000 at 5% compounded yearly for 10 years, A = 10,000 × 1.05^10 = 16,288.95. Subtract the principal to get the interest, 6,288.95.",
      },
      {
        q: "Is monthly compounding much better than yearly?",
        a: "Only slightly. At 5% over 30 years, monthly compounding gives about 3% more money than yearly compounding. The interest rate and the time you leave the money invested matter much more.",
      },
      {
        q: "What does the Rule of 72 tell me?",
        a: "It estimates the years to double your money: divide 72 by the annual rate. At 6% that is about 12 years. It is a quick approximation, not an exact result.",
      },
    ],
    tools: [
      { href: "/compound-interest-calculator/", label: "Compound Interest Calculator" },
      { href: "/future-value-calculator/", label: "Future Value Calculator" },
      { href: "/tvm-calculator/", label: "TVM Calculator" },
    ],
  },
  {
    slug: "how-to-calculate-gpa",
    title: "How to calculate GPA: weighted, unweighted and the 4.0 scale",
    metaTitle: "How to Calculate GPA: Weighted and Unweighted",
    description:
      "Step-by-step GPA calculation on the 4.0 scale: letter grade points, credit hours, a full worked example, how weighted GPA differs, and common mistakes.",
    summary:
      "GPA is a credit-weighted average of your grade points. This guide walks through the method with a worked five-course example, then shows how weighted GPA changes the result.",
    category: "Calculators and maths",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "What GPA measures",
        html: `<p>Grade point average, or GPA, turns your letter grades into one number. Each grade is converted into points, each course is weighted by its credit hours, and the total is divided by the total credits. A course worth 4 credits therefore counts twice as much as a course worth 2.</p>
<p>The most common scale in the United States is 4.0, where an A is 4.0 and an F is 0. Other countries and schools use different scales (for example 10 points, or percentage-based systems), so always check which scale your school or the receiving institution expects.</p>`,
      },
      {
        heading: "Common grade points on the 4.0 scale",
        html: `<table>
<thead><tr><th>Letter grade</th><th>Grade points</th></tr></thead>
<tbody>
<tr><td>A</td><td>4.0</td></tr>
<tr><td>A-</td><td>3.7</td></tr>
<tr><td>B+</td><td>3.3</td></tr>
<tr><td>B</td><td>3.0</td></tr>
<tr><td>B-</td><td>2.7</td></tr>
<tr><td>C+</td><td>2.3</td></tr>
<tr><td>C</td><td>2.0</td></tr>
<tr><td>C-</td><td>1.7</td></tr>
<tr><td>D</td><td>1.0</td></tr>
<tr><td>F</td><td>0.0</td></tr>
</tbody>
</table>
<p>These are widely used values, but schools set their own. Some do not use plus and minus grades at all, and some give an A+ a value of 4.3 or leave it at 4.0. Use the table printed by your own school when it differs.</p>`,
      },
      {
        heading: "Step-by-step: a worked five-course example",
        html: `<p>Suppose a semester looks like this:</p>
<table>
<thead><tr><th>Course</th><th>Grade</th><th>Points</th><th>Credits</th><th>Quality points</th></tr></thead>
<tbody>
<tr><td>Maths</td><td>A</td><td>4.0</td><td>4</td><td>16.0</td></tr>
<tr><td>English</td><td>A-</td><td>3.7</td><td>3</td><td>11.1</td></tr>
<tr><td>Biology</td><td>B</td><td>3.0</td><td>4</td><td>12.0</td></tr>
<tr><td>History</td><td>A</td><td>4.0</td><td>3</td><td>12.0</td></tr>
<tr><td>Art</td><td>B+</td><td>3.3</td><td>2</td><td>6.6</td></tr>
</tbody>
</table>
<ol>
<li>Multiply each course's points by its credits to get <strong>quality points</strong> (last column).</li>
<li>Add the quality points: 16.0 + 11.1 + 12.0 + 12.0 + 6.6 = 57.7.</li>
<li>Add the credits: 4 + 3 + 4 + 3 + 2 = 16.</li>
<li>Divide: 57.7 ÷ 16 = 3.606, which is normally reported as <strong>3.61</strong>.</li>
</ol>
<p>The <a href="/gpa-calculator/">GPA calculator</a> does these steps for any number of courses.</p>`,
      },
      {
        heading: "Weighted and unweighted GPA",
        html: `<p>An <strong>unweighted</strong> GPA, like the example above, treats every course the same and never exceeds 4.0. A <strong>weighted</strong> GPA adds extra points for harder courses such as honours, AP or IB classes, so it can go above 4.0.</p>
<p>The bonus is set by each school. A common pattern is +0.5 for honours and +1.0 for AP or IB, but this is not universal. If the Maths course above were an AP class worth 5.0 for an A, and Biology were honours worth 3.5 for a B, the quality points become 20.0 for Maths and 14.0 for Biology. The total is 20.0 + 11.1 + 14.0 + 12.0 + 6.6 = 63.7, and 63.7 ÷ 16 = <strong>3.98</strong>. Same grades, but a higher number because the course difficulty is counted.</p>
<p>When an application asks for GPA, check whether it wants weighted or unweighted. Reporting the wrong one is a common mistake.</p>`,
      },
      {
        heading: "Cumulative GPA and how a new term changes it",
        html: `<p>Your cumulative GPA covers every term. Do not average the term GPAs, because terms may have different credit loads. Instead, add all quality points and all credits from every term and divide once.</p>
<p>For example, with 60 credits and 210 quality points so far (a 3.50 GPA), a new term of 16 credits and 57.7 quality points gives (210 + 57.7) ÷ (60 + 16) = 267.7 ÷ 76 = 3.52. The older the record, the less a single term moves the total, which is why early terms count for so much. To see what grades you need in the rest of a course, the <a href="/grade-calculator/">grade calculator</a> works on the weights inside one course.</p>`,
      },
      {
        heading: "Common GPA mistakes",
        html: `<ul>
<li>Averaging letter grades without credits, which treats a 1-credit lab like a 5-credit course.</li>
<li>Including pass/fail courses. These usually give credit but are left out of GPA.</li>
<li>Using the wrong scale. A 4.0 number and a 10-point number are not interchangeable.</li>
<li>Rounding each course before adding. Keep full values and round once at the end.</li>
<li>Ignoring repeat-course rules. Some schools replace the old grade, others average both.</li>
</ul>`,
      },
    ],
    faqs: [
      {
        q: "How do I calculate GPA from letter grades?",
        a: "Convert each grade to points, multiply by the course credits, add those quality points, and divide by total credits. In the worked example, 57.7 quality points over 16 credits gives a 3.61 GPA.",
      },
      {
        q: "What is a good GPA?",
        a: "It depends on the school, programme and goal. A 3.0 is a B average and a 3.5 is between B+ and A-. Scholarships and graduate programmes publish their own minimums, so check those directly.",
      },
      {
        q: "Can a GPA be higher than 4.0?",
        a: "Only a weighted GPA can, because honours or AP courses add bonus points. A standard unweighted GPA on the 4.0 scale cannot exceed 4.0.",
      },
      {
        q: "Do I average my semester GPAs to get my cumulative GPA?",
        a: "No. Add all quality points and all credits across every term, then divide once. Averaging term GPAs gives the wrong answer when terms have different credit loads.",
      },
    ],
    tools: [
      { href: "/gpa-calculator/", label: "GPA Calculator" },
      { href: "/grade-calculator/", label: "Grade Calculator" },
      { href: "/average-calculator/", label: "Average Calculator" },
    ],
  },
  {
    slug: "bmi-what-it-measures-and-its-limits",
    title: "BMI: what it measures, how to calculate it and where it falls short",
    metaTitle: "BMI Explained: Formula, Ranges and Limits",
    description:
      "How BMI is calculated in metric and imperial units, the widely published WHO adult ranges, a worked example, and why BMI is only a screening number.",
    summary:
      "Body mass index compares weight with height. This guide shows the formula, the standard adult ranges and a worked example, and explains honestly what BMI cannot tell you.",
    category: "Calculators and maths",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "What BMI is",
        html: `<p>Body mass index (BMI) is a single number that relates weight to height. It was designed as a quick way to group adults by body size across large populations, not to diagnose anything about one person. Health professionals use it as a first screening step and then look at other measures.</p>
<p>This guide explains how the arithmetic works. It is general information and not medical advice. For questions about your own health, weight or diet, speak to a doctor or another qualified professional.</p>`,
      },
      {
        heading: "The formula in metric and imperial units",
        html: `<p>In metric units, BMI is weight in kilograms divided by height in metres squared:</p>
<p><strong>BMI = weight (kg) ÷ height (m)²</strong></p>
<p>In imperial units the formula uses a conversion factor:</p>
<p><strong>BMI = 703 × weight (lb) ÷ height (in)²</strong></p>
<p>Worked example in metric: a person who weighs 70 kg and is 1.75 m tall has a height squared of 1.75 × 1.75 = 3.0625. Then 70 ÷ 3.0625 = <strong>22.9</strong>. The same person in imperial units is about 154 lb and 69 in, which gives 703 × 154 ÷ 4,761 = 22.7. The small difference comes from rounding the height and weight when converting. The <a href="/bmi-calculator/">BMI calculator</a> takes either set of units.</p>`,
      },
      {
        heading: "The standard adult ranges",
        html: `<p>The categories most widely published for adults, including by the World Health Organization, are:</p>
<table>
<thead><tr><th>BMI</th><th>Category</th></tr></thead>
<tbody>
<tr><td>Below 18.5</td><td>Underweight</td></tr>
<tr><td>18.5 to 24.9</td><td>Normal range</td></tr>
<tr><td>25.0 to 29.9</td><td>Overweight</td></tr>
<tr><td>30.0 and above</td><td>Obesity</td></tr>
</tbody>
</table>
<p>You can work backwards from a height to see what weights fall in the normal range. At 1.75 m, a BMI of 18.5 corresponds to about 56.7 kg and a BMI of 24.9 corresponds to about 76.3 kg. Some health bodies use lower cut-offs for people of South Asian and some other backgrounds, because health risks can appear at lower BMI values in those groups. If that applies to you, ask your doctor which thresholds are relevant.</p>`,
      },
      {
        heading: "What BMI cannot tell you",
        html: `<p>BMI uses only two numbers, so it misses a lot:</p>
<ul>
<li><strong>It cannot tell muscle from fat.</strong> A muscular person can have a high BMI with low body fat, while someone with little muscle can sit in the normal range with a high fat percentage.</li>
<li><strong>It ignores where fat is stored.</strong> Fat around the waist carries different risks from fat elsewhere, and BMI does not show it.</li>
<li><strong>It does not adjust for age or sex.</strong> Body composition shifts with age, and women and men typically carry different amounts of body fat at the same BMI.</li>
<li><strong>The standard ranges are for adults.</strong> Children and teenagers are assessed with growth charts that compare them with others of the same age and sex.</li>
<li><strong>It says nothing about fitness, diet, blood pressure or blood tests.</strong></li>
</ul>
<p>For these reasons BMI works best as a starting point for a conversation with a professional, alongside measures such as waist size and a full health check.</p>`,
      },
      {
        heading: "Other measures that give a fuller picture",
        html: `<p>Because BMI has the limits above, professionals often add other checks. Waist circumference is one: it reflects fat stored around the middle, which BMI cannot see. Some guidelines also suggest a simple waist-to-height ratio, where the waist stays below half of a person's height. For someone 175 cm tall, that would be a waist under 87.5 cm.</p>
<p>A fuller assessment may also include blood pressure, blood tests, family history, physical activity and diet. None of these can be judged from a calculator, which is why a BMI result is best seen as a prompt to look further, not a conclusion.</p>`,
      },
      {
        heading: "Using BMI sensibly",
        html: `<ol>
<li>Measure height without shoes and weight at a similar time of day, so readings can be compared.</li>
<li>Treat the result as a range, not an exact verdict. A change of 0.3 means very little.</li>
<li>Look at the trend over months rather than a single reading.</li>
<li>If your result is outside the normal range, or you are pregnant, an older adult, an athlete or under 18, ask a professional how to interpret it.</li>
<li>Do not set weight goals from BMI alone, and never use it to judge someone else's body.</li>
</ol>`,
      },
    ],
    faqs: [
      {
        q: "How do I calculate my BMI?",
        a: "Divide your weight in kilograms by your height in metres squared. For 70 kg and 1.75 m, that is 70 ÷ 3.0625 = 22.9. In pounds and inches, multiply weight by 703 and divide by height squared.",
      },
      {
        q: "What is a normal BMI for adults?",
        a: "The widely published normal range is 18.5 to 24.9. Below 18.5 is classed as underweight, 25 to 29.9 as overweight, and 30 or more as obesity.",
      },
      {
        q: "Is BMI accurate for athletes?",
        a: "Not always. BMI cannot separate muscle from fat, so very muscular people can score as overweight even with low body fat.",
      },
      {
        q: "Does a normal BMI mean I am healthy?",
        a: "Not necessarily. BMI is a screening number and does not measure fitness, diet, fat distribution or medical conditions. A doctor can give you a proper assessment.",
      },
    ],
    tools: [
      { href: "/bmi-calculator/", label: "BMI Calculator" },
      { href: "/percentage-calculator/", label: "Percentage Calculator" },
    ],
  },
  {
    slug: "mortgage-payments-explained",
    title: "Mortgage payments explained: how the monthly figure is worked out",
    metaTitle: "Mortgage Payments Explained: Formula and Examples",
    description:
      "How a repayment mortgage payment is calculated, with a 200,000 worked example, comparisons of rate and term, and how interest and principal split each month.",
    summary:
      "A repayment mortgage has one fixed payment that covers interest and part of the loan each month. This guide shows the formula, the effect of rate and term, and what the first payment actually pays off.",
    category: "Money and tax",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "How a repayment mortgage works",
        html: `<p>On a standard <strong>repayment</strong> mortgage (also called a capital-and-interest mortgage), you pay the same amount every month for the whole term, assuming the rate stays fixed. Each payment covers the interest that has built up that month, and whatever is left reduces the amount you owe. Because the balance falls over time, the interest part gets smaller and the part that pays off the loan gets bigger.</p>
<p>An <strong>interest-only</strong> mortgage is different: you pay only the interest each month and still owe the full loan at the end. The rest of this guide covers repayment loans.</p>`,
      },
      {
        heading: "The payment formula",
        html: `<p>The monthly payment on a fixed-rate repayment loan is:</p>
<p><strong>M = P × i ÷ (1 − (1 + i)^(−n))</strong></p>
<ul>
<li><strong>P</strong> is the amount borrowed.</li>
<li><strong>i</strong> is the monthly interest rate: the annual rate divided by 12.</li>
<li><strong>n</strong> is the number of monthly payments: years × 12.</li>
</ul>
<p>Worked example: borrow £200,000 at 5% over 25 years. Then i = 0.05 ÷ 12 = 0.0041667 and n = 300. The formula gives a payment of <strong>£1,169.18</strong> a month. Over 300 months you pay £350,754 in total, so the interest cost is about £150,754. You can test your own figures in the <a href="/uk-mortgage-calculator/">UK mortgage calculator</a> or the general <a href="/mortgage-calculator/">mortgage calculator</a>.</p>`,
      },
      {
        heading: "How the rate changes the payment",
        html: `<p>Same £200,000 and 25-year term, different rates:</p>
<table>
<thead><tr><th>Annual rate</th><th>Monthly payment</th><th>Total interest</th></tr></thead>
<tbody>
<tr><td>4%</td><td>£1,055.67</td><td>£116,702</td></tr>
<tr><td>5%</td><td>£1,169.18</td><td>£150,754</td></tr>
<tr><td>6%</td><td>£1,288.60</td><td>£186,581</td></tr>
</tbody>
</table>
<p>One percentage point changes the monthly payment by roughly £114 to £119 here, and the total interest by more than £30,000. This is why lenders show repayments at several rates, and why many people test what happens if the rate rises when a fixed deal ends.</p>`,
      },
      {
        heading: "How the term changes the payment",
        html: `<p>A longer term lowers the monthly payment but raises the total interest, because you owe money for more years. Same £200,000 at 5%:</p>
<table>
<thead><tr><th>Term</th><th>Monthly payment</th><th>Total interest</th></tr></thead>
<tbody>
<tr><td>20 years</td><td>£1,319.91</td><td>£116,779</td></tr>
<tr><td>25 years</td><td>£1,169.18</td><td>£150,754</td></tr>
<tr><td>30 years</td><td>£1,073.64</td><td>£186,512</td></tr>
</tbody>
</table>
<p>Moving from 25 to 30 years cuts the payment by about £95 a month but adds roughly £35,758 of interest. Shortening the term has the opposite effect: a higher payment, much less interest overall. Many lenders let you make extra payments, which has a similar effect, but check the terms for early repayment charges first.</p>`,
      },
      {
        heading: "What your first payment pays off",
        html: `<p>In the £200,000 example at 5%, the first month's interest is £200,000 × 0.05 ÷ 12 = £833.33. The payment is £1,169.18, so only £335.85 goes towards the loan. Early in the term most of each payment is interest. Near the end the proportions reverse.</p>
<p>The <a href="/amortization-calculator/">amortization calculator</a> shows this month by month, so you can see the balance after any number of years. This explains why overpaying early has a larger effect than overpaying late: the money reduces the balance that interest is charged on for the longest time.</p>`,
      },
      {
        heading: "What happens when a fixed rate ends",
        html: `<p>Many mortgages have a fixed or discounted rate for a few years, after which the rate resets. The new payment is worked out from the balance still owed and the years remaining, not from the original loan.</p>
<p>Using the same example, after five years of payments at 5% the balance on the £200,000 loan has fallen to about £177,160, with 20 years left. If the rate then moves to 7%, the payment becomes about <strong>£1,373.52</strong>, roughly £204 a month more than before. If the rate stayed at 5%, the payment would still be £1,169.18. Testing a higher rate before you sign gives you a realistic picture of what you could face, and the <a href="/amortization-calculator/">amortization calculator</a> lets you enter the remaining balance and term to check it.</p>`,
      },
      {
        heading: "What the formula leaves out",
        html: `<ul>
<li><strong>Fees.</strong> Arrangement, valuation and legal costs are not part of the monthly payment.</li>
<li><strong>Rate changes.</strong> After a fixed or introductory period, the rate may change, and so will the payment.</li>
<li><strong>Taxes and insurance.</strong> Property tax, buildings insurance and similar costs are separate. In some countries the lender collects them with the payment.</li>
<li><strong>Lender rounding.</strong> A lender's quote may differ by a few pence because of how interest is calculated day by day.</li>
</ul>
<p>Use these figures to compare options. Your lender's official illustration is the figure that counts, and this guide is not financial advice.</p>`,
      },
    ],
    faqs: [
      {
        q: "How do I calculate a monthly mortgage payment?",
        a: "Use M = P × i ÷ (1 − (1 + i)^(−n)), where i is the annual rate divided by 12 and n is the number of months. For £200,000 at 5% over 25 years, the payment is £1,169.18.",
      },
      {
        q: "Is it better to choose a shorter mortgage term?",
        a: "A shorter term means a higher monthly payment but much less total interest. A longer term eases the monthly budget but costs more overall. The right balance depends on what you can afford each month.",
      },
      {
        q: "Why does so much of my early payment go to interest?",
        a: "Interest is charged on the outstanding balance, which is largest at the start. As the balance falls, the interest part shrinks and more of each payment reduces the loan.",
      },
      {
        q: "Does this formula include taxes, insurance and fees?",
        a: "No. It gives only the capital-and-interest payment. Property taxes, insurance, arrangement fees and similar costs are separate, so add them when planning your budget.",
      },
    ],
    tools: [
      { href: "/mortgage-calculator/", label: "Mortgage Calculator" },
      { href: "/uk-mortgage-calculator/", label: "UK Mortgage Calculator" },
      { href: "/amortization-calculator/", label: "Amortization Calculator" },
      { href: "/loan-calculator/", label: "Loan Calculator" },
    ],
  },
  {
    slug: "discount-sales-tax-and-tip-calculations",
    title: "Discounts, sales tax and tips: how to calculate them correctly",
    metaTitle: "Discount, Sales Tax and Tip Calculations Explained",
    description:
      "Work out a sale price, find the original price from a discount, add or remove sales tax, stack discounts, and split a tip, with checked examples for each.",
    summary:
      "Percentage shopping maths is simple once you know which number the percentage applies to. This guide covers sale prices, reverse discounts, tax in and out, stacked offers and tips.",
    category: "Calculators and maths",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Find the sale price from a percentage discount",
        html: `<p>A discount of 20% means you pay 80% of the price. Multiply the original price by the share you pay:</p>
<p><strong>Sale price = original price × (1 − discount ÷ 100)</strong></p>
<p>For an item priced at $80 with 20% off: 80 × 0.80 = <strong>$64</strong>, a saving of $16. A quick way to do it in your head is to find 10% by moving the decimal point (8), double it for 20% (16), and subtract (80 − 16 = 64). The <a href="/discount-calculator/">discount calculator</a> shows the sale price and the saving together.</p>`,
      },
      {
        heading: "Find the original price from the sale price",
        html: `<p>This is where people most often go wrong. If something costs $60 after 25% off, the original price is not $60 + 25%. The $60 is 75% of the original, so you divide:</p>
<p><strong>Original price = sale price ÷ (1 − discount ÷ 100)</strong></p>
<p>60 ÷ 0.75 = <strong>$80</strong>. Adding 25% to 60 would give $75, which is wrong because the 25% was taken from the larger original number.</p>
<p>You can also find the discount percentage from two prices. A coat that was $120 and is now $90 has dropped by $30, and 30 ÷ 120 = 25%. The same logic explains why a 20% rise followed by a 20% fall does not return you to the start: 100 × 1.20 × 0.80 = 96. Use the <a href="/percentage-calculator/">percentage calculator</a> for these reverse checks.</p>`,
      },
      {
        heading: "Stacked discounts do not simply add up",
        html: `<p>If a shop takes 20% off and then gives a further 10% off the reduced price, the total saving is not 30%. The second discount applies to the already lower price:</p>
<p>100 × 0.80 = 80, then 80 × 0.90 = 72. The final price is 72, so the combined discount is <strong>28%</strong>, not 30%.</p>
<p>The general rule is to multiply the "share you pay" factors together: 0.80 × 0.90 = 0.72. The order does not change the result. When an offer says "up to 50% off", only some items get the maximum, so check the price of the exact item.</p>`,
      },
      {
        heading: "Adding and removing sales tax",
        html: `<p>To add sales tax, multiply by 1 plus the tax rate. A $49.99 item with 8% tax costs 49.99 × 1.08 = $53.99 (53.9892 rounded to the nearest cent). The tax itself is $4.00.</p>
<p>To remove tax from a price that already includes it, divide instead. If a receipt shows 48.00 including 20% tax (as with VAT in the UK), the price before tax is 48 ÷ 1.20 = <strong>40.00</strong>. Taking 20% off 48 would give 38.40, which is wrong. The <a href="/sales-tax-calculator/">sales tax calculator</a> handles both directions.</p>
<p>Discount and tax are both percentages of the same price, so a $80 item with 20% off and 8% tax costs 64 × 1.08 = $69.12 whichever you apply first. Rules about which price the tax is charged on can differ by place and by type of coupon, so the receipt is the final authority.</p>`,
      },
      {
        heading: "Tipping and splitting the bill",
        html: `<p>A tip is a percentage of the bill. For 18% on a $54.00 bill: 54 × 0.18 = $9.72, so the total is $63.72. Split four ways, each person pays 63.72 ÷ 4 = $15.93.</p>
<p>Mental shortcuts help at the table. For 10%, move the decimal point (5.40). For 20%, double that (10.80). For 15%, take 10% and add half of it (5.40 + 2.70 = 8.10). Tipping customs differ widely between countries and venues, and in some places service is already included, so check the bill first. The <a href="/tip-calculator/">tip calculator</a> splits the total for any number of people.</p>`,
      },
      {
        heading: "Quick checklist before you buy",
        html: `<ol>
<li>Convert the discount to a "share you pay" factor (25% off means 0.75).</li>
<li>Multiply for a sale price and divide to go backwards.</li>
<li>Multiply factors together for stacked offers.</li>
<li>Add tax by multiplying by 1 plus the rate, and remove it by dividing.</li>
<li>Round only at the end, to the nearest cent or penny.</li>
</ol>`,
      },
    ],
    faqs: [
      {
        q: "How do I calculate 20% off a price?",
        a: "Multiply the price by 0.80. For $80, that is $64. You can also find 20% of the price (16) and subtract it.",
      },
      {
        q: "How do I find the original price before a discount?",
        a: "Divide the sale price by 1 minus the discount as a decimal. If $60 is after 25% off, 60 ÷ 0.75 = $80.",
      },
      {
        q: "What is 20% off followed by 10% off?",
        a: "It is a combined 28% discount, not 30%, because the second discount applies to the reduced price. A price of 100 becomes 80, then 72.",
      },
      {
        q: "How do I remove tax from a total?",
        a: "Divide the total by 1 plus the tax rate. A total of 48 with 20% tax included was 40 before tax.",
      },
    ],
    tools: [
      { href: "/discount-calculator/", label: "Discount Calculator" },
      { href: "/sales-tax-calculator/", label: "Sales Tax Calculator" },
      { href: "/tip-calculator/", label: "Tip Calculator" },
      { href: "/percentage-calculator/", label: "Percentage Calculator" },
    ],
  },
  {
    slug: "binary-decimal-hex-octal-explained",
    title: "Binary, decimal, hex and octal explained: converting by hand",
    metaTitle: "Binary, Decimal, Hex and Octal: How to Convert",
    description:
      "How number bases work, with step-by-step hand conversions between binary, decimal, hexadecimal and octal, worked examples, and where each system is used.",
    summary:
      "Every number system is place value with a different base. This guide shows how to convert by hand between binary, decimal, hex and octal, and why computers use them.",
    category: "Calculators and maths",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Place value and the idea of a base",
        html: `<p>The decimal system uses base 10: ten digits (0 to 9), and each place is worth ten times the one to its right. The number 345 means 3 × 100 + 4 × 10 + 5 × 1.</p>
<p>Other bases work the same way with a different multiplier:</p>
<ul>
<li><strong>Binary (base 2)</strong> uses only 0 and 1. Places are worth 1, 2, 4, 8, 16, 32 and so on.</li>
<li><strong>Octal (base 8)</strong> uses digits 0 to 7. Places are worth 1, 8, 64 and so on.</li>
<li><strong>Hexadecimal (base 16)</strong> uses 0 to 9 and then A to F for the values 10 to 15. Places are worth 1, 16, 256 and so on.</li>
</ul>
<p>Computers store everything as on and off states, which is why binary is the native system. The others are shorthand: one hex digit stands for exactly four binary digits, and one octal digit stands for exactly three.</p>`,
      },
      {
        heading: "Binary to decimal",
        html: `<p>Write the place values under each bit and add up those where the bit is 1. For binary 101101:</p>
<table>
<thead><tr><th>Place value</th><th>32</th><th>16</th><th>8</th><th>4</th><th>2</th><th>1</th></tr></thead>
<tbody><tr><td>Bit</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr></tbody>
</table>
<p>32 + 8 + 4 + 1 = <strong>45</strong>. The <a href="/binary-to-decimal/">binary to decimal converter</a> does the same for longer numbers.</p>`,
      },
      {
        heading: "Decimal to binary by repeated division",
        html: `<p>Divide by 2 repeatedly and record each remainder. Then read the remainders from the last one back to the first. For 45:</p>
<ol>
<li>45 ÷ 2 = 22, remainder 1</li>
<li>22 ÷ 2 = 11, remainder 0</li>
<li>11 ÷ 2 = 5, remainder 1</li>
<li>5 ÷ 2 = 2, remainder 1</li>
<li>2 ÷ 2 = 1, remainder 0</li>
<li>1 ÷ 2 = 0, remainder 1</li>
</ol>
<p>Reading the remainders upwards gives <strong>101101</strong>, matching the result above. The same method works for any base: divide by 16 for hex or 8 for octal. The <a href="/decimal-to-binary/">decimal to binary converter</a> is handy for checking your work.</p>`,
      },
      {
        heading: "Hexadecimal",
        html: `<p>Hex digits after 9 are letters: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15. To convert hex 2F to decimal, multiply each digit by its place value: 2 × 16 + 15 × 1 = <strong>47</strong>. Hex FF is 15 × 16 + 15 = 255, the largest value that fits in one byte (8 bits).</p>
<p>To go from decimal to hex, divide by 16. For 200: 200 ÷ 16 = 12 remainder 8, and 12 is C, so 200 is <strong>C8</strong>. Try it with the <a href="/hex-to-decimal/">hex to decimal converter</a>.</p>
<p>Hex is common in web colours. A colour such as #FF8800 is three bytes, one each for red, green and blue: FF is 255 red, 88 is 136 green and 00 is 0 blue.</p>`,
      },
      {
        heading: "Shortcuts between binary, hex and octal",
        html: `<p>Because 16 and 8 are powers of two, you can convert by grouping bits instead of doing arithmetic.</p>
<ul>
<li><strong>Binary to hex:</strong> group bits in fours from the right. 11001000 becomes 1100 and 1000, which are C and 8, so <strong>C8</strong>.</li>
<li><strong>Binary to octal:</strong> group bits in threes from the right. 11001000 padded to 011 001 000 gives 3, 1, 0, so <strong>310</strong>.</li>
<li><strong>Hex to binary:</strong> replace each digit with its four bits. 2F is 0010 1111.</li>
</ul>
<p>Decimal 200 is therefore 11001000 in binary, C8 in hex and 310 in octal. Octal is less common today, but it still appears in Unix file permissions. The permission value 755 is 7 × 64 + 5 × 8 + 5 = 493 in decimal, and each octal digit maps to three read, write and execute bits. The <a href="/octal-to-decimal/">octal to decimal converter</a> covers these values.</p>`,
      },
      {
        heading: "Common mistakes",
        html: `<ul>
<li>Reading remainders in the wrong order when dividing. They must be read bottom to top.</li>
<li>Treating hex letters as plain text. B means 11, not a word.</li>
<li>Forgetting that places count from the right, starting at zero.</li>
<li>Mixing up digits that do not exist in a base, for example the digit 8 in octal or 2 in binary.</li>
<li>Dropping leading zeros when grouping bits, which shifts the groups.</li>
</ul>`,
      },
    ],
    faqs: [
      {
        q: "How do I convert binary to decimal?",
        a: "Add the place values (1, 2, 4, 8 and so on from the right) wherever the bit is 1. Binary 101101 is 32 + 8 + 4 + 1 = 45.",
      },
      {
        q: "How do I convert decimal to binary?",
        a: "Divide by 2 repeatedly, note each remainder, and read the remainders from last to first. For 45 that gives 101101.",
      },
      {
        q: "Why do programmers use hexadecimal?",
        a: "One hex digit equals exactly four bits, so long binary values become short and easy to read. Two hex digits describe one byte, which is why colours, memory addresses and byte values are often written in hex.",
      },
      {
        q: "What is FF in decimal?",
        a: "255. It is 15 × 16 + 15, the largest value that fits in one byte.",
      },
    ],
    tools: [
      { href: "/binary-to-decimal/", label: "Binary to Decimal" },
      { href: "/decimal-to-binary/", label: "Decimal to Binary" },
      { href: "/hex-to-decimal/", label: "Hex to Decimal" },
      { href: "/octal-to-decimal/", label: "Octal to Decimal" },
    ],
  },
  {
    slug: "celsius-fahrenheit-and-kelvin-explained",
    title: "Celsius, Fahrenheit and Kelvin: formulas, reference points and shortcuts",
    metaTitle: "Celsius, Fahrenheit and Kelvin: How to Convert",
    description:
      "Convert between Celsius, Fahrenheit and Kelvin with exact formulas, key reference temperatures, a mental shortcut that is exact, and mistakes to avoid.",
    summary:
      "Three temperature scales, three simple formulas. This guide gives the exact conversions, the temperatures worth memorising, and a mental trick that does not lose accuracy.",
    category: "Units and measures",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "The three scales",
        html: `<p><strong>Celsius (°C)</strong> sets 0 at the freezing point of water and 100 at its boiling point, at standard atmospheric pressure. It is used for everyday temperatures in most of the world.</p>
<p><strong>Fahrenheit (°F)</strong> puts those same two points at 32 and 212, so there are 180 degrees between them instead of 100. It is the everyday scale in the United States and a few other places.</p>
<p><strong>Kelvin (K)</strong> is the scientific scale. A kelvin is the same size as a degree Celsius, but 0 K is absolute zero, the lowest possible temperature. Kelvin is written without a degree sign.</p>`,
      },
      {
        heading: "The exact formulas",
        html: `<ul>
<li>Celsius to Fahrenheit: <strong>°F = °C × 9 ÷ 5 + 32</strong> (the same as °C × 1.8 + 32)</li>
<li>Fahrenheit to Celsius: <strong>°C = (°F − 32) × 5 ÷ 9</strong></li>
<li>Celsius to Kelvin: <strong>K = °C + 273.15</strong></li>
<li>Kelvin to Celsius: <strong>°C = K − 273.15</strong></li>
</ul>
<p>Worked examples: 37 °C × 1.8 = 66.6, plus 32 gives <strong>98.6 °F</strong>. Going back, (98.6 − 32) × 5 ÷ 9 = 37.0 °C. And 300 K − 273.15 = <strong>26.85 °C</strong>. The <a href="/celsius-to-fahrenheit/">Celsius to Fahrenheit</a> and <a href="/fahrenheit-to-celsius/">Fahrenheit to Celsius</a> converters check any value instantly.</p>`,
      },
      {
        heading: "Reference temperatures worth memorising",
        html: `<table>
<thead><tr><th>Situation</th><th>°C</th><th>°F</th></tr></thead>
<tbody>
<tr><td>Water freezes</td><td>0</td><td>32</td></tr>
<tr><td>Cool room or spring day</td><td>10</td><td>50</td></tr>
<tr><td>Comfortable room</td><td>20</td><td>68</td></tr>
<tr><td>Warm day</td><td>30</td><td>86</td></tr>
<tr><td>Normal body temperature (about)</td><td>37</td><td>98.6</td></tr>
<tr><td>Water boils (sea level)</td><td>100</td><td>212</td></tr>
</tbody>
</table>
<p>The two scales agree at one point: −40 °C is exactly −40 °F. Check: −40 × 1.8 + 32 = −72 + 32 = −40. Absolute zero is 0 K, which is −273.15 °C or −459.67 °F.</p>`,
      },
      {
        heading: "A mental shortcut that stays exact",
        html: `<p>A popular trick is "double it and add 30". It is fast but drifts: for 20 °C it gives 70 °F when the true value is 68, and for 30 °C it gives 90 when the true value is 86.</p>
<p>A better method keeps the same effort but is exact. To convert Celsius to Fahrenheit, <strong>double the number, take off 10% of that doubled number, then add 32</strong>. For 25 °C: double is 50, minus 5 is 45, plus 32 is <strong>77 °F</strong>. This works because doubling and then removing 10% is multiplying by 1.8.</p>
<p>For Fahrenheit to Celsius, subtract 32, divide by 9, and multiply by 5. For 68 °F: 36 ÷ 9 = 4, and 4 × 5 = <strong>20 °C</strong>. For quick weather estimates, "subtract 30 and halve" is close near normal temperatures (68 gives 19) but not exact.</p>`,
      },
      {
        heading: "Where you meet each scale",
        html: `<p>Weather forecasts, ovens and thermostats use Celsius or Fahrenheit depending on the country. A refrigerator is usually kept at about 4 °C (39.2 °F), and a freezer at −18 °C (−0.4 °F). A body temperature of 38 °C (100.4 °F) or higher is commonly treated as a fever; for health questions, follow a doctor's advice and not a conversion table.</p>
<p>Kelvin appears in physics, chemistry and engineering because it starts at absolute zero, so ratios and gas laws work directly. Room temperature of 20 °C is 293.15 K. Lighting also uses kelvin for colour temperature, where lower values such as 2700 K look warm and higher values look cooler. Conversions between the scales are always the same, so what changes is only the number you read off.</p>`,
      },
      {
        heading: "Mistakes to avoid",
        html: `<ul>
<li><strong>Converting a temperature difference like a temperature.</strong> A rise of 10 °C is a rise of 18 °F. You multiply by 1.8 but do not add 32, because the 32 only fixes the zero point.</li>
<li><strong>Forgetting the order of operations.</strong> In Fahrenheit to Celsius, subtract 32 first and then multiply, not the other way round.</li>
<li><strong>Using 273 instead of 273.15 when precision matters.</strong> The shorter value is fine for rough work.</li>
<li><strong>Writing "degrees Kelvin".</strong> The correct form is simply kelvin, with the symbol K.</li>
</ul>
<p>For cooking, see the oven table in <a href="/guides/oven-temperatures-celsius-fahrenheit-gas-mark/">oven temperatures: Celsius, Fahrenheit and gas mark</a>, which also covers fan ovens.</p>`,
      },
    ],
    faqs: [
      {
        q: "How do I convert Celsius to Fahrenheit?",
        a: "Multiply by 1.8 and add 32. For 25 °C, 25 × 1.8 = 45, plus 32 is 77 °F.",
      },
      {
        q: "How do I convert Fahrenheit to Celsius?",
        a: "Subtract 32, then multiply by 5 and divide by 9. For 98.6 °F, 66.6 × 5 ÷ 9 = 37 °C.",
      },
      {
        q: "At what temperature are Celsius and Fahrenheit equal?",
        a: "At −40. Both scales show −40 at that point.",
      },
      {
        q: "What is 0 Kelvin in Celsius?",
        a: "Absolute zero, which is −273.15 °C. To convert Celsius to Kelvin, add 273.15.",
      },
    ],
    tools: [
      { href: "/celsius-to-fahrenheit/", label: "Celsius to Fahrenheit" },
      { href: "/fahrenheit-to-celsius/", label: "Fahrenheit to Celsius" },
    ],
  },
  {
    slug: "centimeters-inches-and-feet-converting-heights",
    title: "Centimeters, inches and feet: converting heights and lengths by hand",
    metaTitle: "Centimeters, Inches and Feet: Converting Heights",
    description:
      "Convert cm to inches and feet and back with the exact 2.54 factor, a height table, feet-and-inches steps, mental estimates and common slips to avoid.",
    summary:
      "One inch is exactly 2.54 centimeters, which makes every other conversion easy to check. This guide covers heights in feet and inches, a reference table, quick estimates and the usual mistakes.",
    category: "Units and measures",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "The exact relationship",
        html: `<p>Since the international yard and pound agreement of 1959, one inch has been defined as exactly <strong>2.54 centimeters</strong>. That is not a rounded figure, so conversions between the metric and imperial length systems have no hidden error. From it everything else follows:</p>
<ul>
<li>1 inch = 2.54 cm = 25.4 mm</li>
<li>1 foot = 12 inches = 30.48 cm</li>
<li>1 yard = 3 feet = 91.44 cm</li>
</ul>
<p>To go from inches to centimeters, multiply by 2.54. To go from centimeters to inches, divide by 2.54. The <a href="/cm-to-inches/">cm to inches</a> and <a href="/inches-to-cm/">inches to cm</a> converters do this for any value.</p>`,
      },
      {
        heading: "Feet and inches to centimeters",
        html: `<p>Heights are usually written in feet and inches, such as 5 ft 10 in. Convert everything to inches first, then multiply by 2.54:</p>
<ol>
<li>5 ft 10 in is 5 × 12 + 10 = 70 inches.</li>
<li>70 × 2.54 = <strong>177.8 cm</strong>.</li>
</ol>
<p>A reference table for common heights:</p>
<table>
<thead><tr><th>Feet and inches</th><th>Total inches</th><th>Centimeters</th></tr></thead>
<tbody>
<tr><td>5 ft 0 in</td><td>60</td><td>152.40</td></tr>
<tr><td>5 ft 4 in</td><td>64</td><td>162.56</td></tr>
<tr><td>5 ft 8 in</td><td>68</td><td>172.72</td></tr>
<tr><td>5 ft 10 in</td><td>70</td><td>177.80</td></tr>
<tr><td>6 ft 0 in</td><td>72</td><td>182.88</td></tr>
<tr><td>6 ft 4 in</td><td>76</td><td>193.04</td></tr>
</tbody>
</table>`,
      },
      {
        heading: "Centimeters to feet and inches",
        html: `<p>Divide by 2.54 to get total inches, then split into feet and the remainder. For 170 cm:</p>
<ol>
<li>170 ÷ 2.54 = 66.93 inches.</li>
<li>66.93 ÷ 12 = 5.58, so the whole number of feet is 5 (60 inches).</li>
<li>66.93 − 60 = 6.93 inches left over.</li>
</ol>
<p>So 170 cm is 5 ft 6.93 in, usually rounded to 5 ft 7 in. The same method gives these heights:</p>
<table>
<thead><tr><th>Centimeters</th><th>Inches</th><th>Feet and inches</th></tr></thead>
<tbody>
<tr><td>150</td><td>59.06</td><td>4 ft 11.06 in</td></tr>
<tr><td>160</td><td>62.99</td><td>5 ft 2.99 in</td></tr>
<tr><td>170</td><td>66.93</td><td>5 ft 6.93 in</td></tr>
<tr><td>180</td><td>70.87</td><td>5 ft 10.87 in</td></tr>
<tr><td>190</td><td>74.80</td><td>6 ft 2.80 in</td></tr>
</tbody>
</table>
<p>The <a href="/feet-to-cm/">feet to cm</a> converter accepts feet and inches directly if you prefer not to do the splitting yourself.</p>`,
      },
      {
        heading: "Mental estimates",
        html: `<p>For a rough figure, treat an inch as 2.5 cm. Divide centimeters by 2.5 to get inches, or multiply inches by 2.5 to get centimeters. For 170 cm that gives 68 inches, against the exact 66.93, an error of about 1.6%. For measuring furniture or checking a rough size, that is usually good enough. For forms, printing or anything with a limit, use the exact factor or a converter.</p>
<p>Another useful anchor: 30 cm is almost exactly one foot (the true figure is 30.48). A 90 cm door width is therefore just under 3 feet, and a 2 m ceiling is about 6 ft 7 in.</p>`,
      },
      {
        heading: "Everyday sizes in both units",
        html: `<p>Some sizes are always quoted in one system, so it helps to know their equivalents. A 27 inch monitor is 27 × 2.54 = 68.58 cm measured diagonally. A sheet of A4 paper is 210 × 297 mm, which is 8.27 × 11.69 inches. One meter is 39.37 inches, or 3.28 feet, so a 2.5 m shelf is about 8 ft 2.4 in.</p>
<p>When you are ordering something that must fit, such as a frame, a mattress or a photo print, check which unit the supplier uses and convert your measurements, not the other way round. Measuring twice in the supplier's unit avoids rounding mistakes.</p>`,
      },
      {
        heading: "Mistakes people make",
        html: `<ul>
<li><strong>Reading 5.10 as 5 ft 10 in.</strong> A value written as 5.10 feet is 5 feet plus 0.10 × 12 = 1.2 inches. Feet-and-inches notation is not decimal.</li>
<li><strong>Using 2.5 for precise work.</strong> The small error adds up on longer lengths.</li>
<li><strong>Rounding too early.</strong> Keep two decimals until the final step, then round once.</li>
<li><strong>Mixing up millimeters and centimeters.</strong> One inch is 25.4 mm. Photo and print sizes are often given in millimeters.</li>
<li><strong>Forgetting the remainder.</strong> When converting to feet and inches, the decimal part of the feet must be turned back into inches, not left as a decimal.</li>
</ul>`,
      },
    ],
    faqs: [
      {
        q: "How many centimeters are in an inch?",
        a: "Exactly 2.54. This is a defined value, not a rounded one.",
      },
      {
        q: "How do I convert cm to inches?",
        a: "Divide the centimeters by 2.54. For 170 cm, 170 ÷ 2.54 = 66.93 inches.",
      },
      {
        q: "How tall is 180 cm in feet and inches?",
        a: "180 cm is 70.87 inches, which is 5 ft 10.87 in, usually written as about 5 ft 11 in.",
      },
      {
        q: "How many centimeters is 5 feet 10 inches?",
        a: "5 ft 10 in is 70 inches, and 70 × 2.54 = 177.8 cm.",
      },
    ],
    tools: [
      { href: "/cm-to-inches/", label: "CM to Inches" },
      { href: "/inches-to-cm/", label: "Inches to CM" },
      { href: "/feet-to-cm/", label: "Feet to CM" },
      { href: "/cm-to-feet/", label: "CM to Feet" },
    ],
  },
  {
    slug: "vori-tola-ana-gram-gold-weight-units",
    title: "Vori, tola, ana and gram: gold weight units explained",
    metaTitle: "Vori, Tola, Ana and Gram: Gold Weight Units",
    description:
      "How vori, tola, ana, roti and masha relate to grams, with the 11.664 g standard, worked conversions, purity versus weight, and mistakes when buying gold.",
    summary:
      "Gold in Bangladesh, India and Pakistan is still weighed in the traditional vori or tola. This guide gives the exact relationships to grams, worked conversions and what weight does and does not tell you.",
    category: "Units and measures",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "What a vori or tola is",
        html: `<p>The <strong>vori</strong> (also spelled bhori) in Bangladesh and the <strong>tola</strong> in India and Pakistan are the same traditional unit for weighing gold and silver. The converters on this site take both as <strong>11.664 grams</strong>. Some sources round it to 11.66 g, and older references give about 11.6638 g, so a shop's own figures may differ by a hair. The difference is tiny, but ask which value your jeweller uses if a large purchase depends on it.</p>
<p>The vori is divided into smaller parts:</p>
<table>
<thead><tr><th>Unit</th><th>Share of a vori</th><th>Grams</th></tr></thead>
<tbody>
<tr><td>1 vori (tola)</td><td>1</td><td>11.664</td></tr>
<tr><td>1 masha</td><td>1/12</td><td>0.972</td></tr>
<tr><td>1 ana</td><td>1/16</td><td>0.729</td></tr>
<tr><td>1 roti (ratti)</td><td>1/96</td><td>0.1215</td></tr>
</tbody>
</table>
<p>So 1 vori = 12 masha = 16 ana = 96 roti. One masha is 8 roti, and one ana is 6 roti.</p>`,
      },
      {
        heading: "Vori to grams and back",
        html: `<p>To convert vori to grams, multiply by 11.664. To convert grams to vori, divide by 11.664.</p>
<ul>
<li>5 vori = 5 × 11.664 = <strong>58.32 g</strong>.</li>
<li>2.5 vori = 29.16 g.</li>
<li>10 g = 10 ÷ 11.664 = <strong>0.857 vori</strong>.</li>
<li>100 g = 8.573 vori.</li>
</ul>
<p>The <a href="/vori-to-gram/">vori to gram</a>, <a href="/gram-to-vori/">gram to vori</a> and <a href="/tola-to-gram/">tola to gram</a> converters give the result along with ana and roti, so you do not need to work them out by hand.</p>`,
      },
      {
        heading: "Writing a weight as vori, ana and roti",
        html: `<p>Jewellers often quote a weight as "vori, ana, roti". To convert 25 grams:</p>
<ol>
<li>25 ÷ 11.664 = 2.1433 vori, so there are <strong>2 whole vori</strong> (23.328 g).</li>
<li>The remaining 1.672 g is 1.672 ÷ 0.729 = 2.29 ana, so <strong>2 whole ana</strong> (1.458 g).</li>
<li>What is left is 0.214 g, which is 0.214 ÷ 0.1215 = 1.76 roti.</li>
</ol>
<p>So 25 g is 2 vori, 2 ana and about 1.76 roti. Check: 23.328 + 1.458 + 0.214 = 25.000. The <a href="/gold-weight-converter/">gold weight converter</a> also converts between all these units and troy ounces.</p>`,
      },
      {
        heading: "Troy ounces and international gold prices",
        html: `<p>International gold prices are quoted per <strong>troy ounce</strong>, which is exactly 31.1034768 grams. That is different from the ordinary (avoirdupois) ounce of 28.3495 grams used for food and general goods. One troy ounce is 31.1034768 ÷ 11.664 = about <strong>2.667 vori</strong>.</p>
<p>To estimate a local price from an international one you need the price per gram: divide the per-ounce price by 31.1035, then multiply by 11.664 for a vori. Exchange rates, duties and shop margins then change the final figure, so the <a href="/gold-price-calculator/">gold price calculator</a> is better for working out the cost of a specific weight at a given per-gram or per-vori price.</p>`,
      },
      {
        heading: "A worked example: checking a jewellery bill",
        html: `<p>Suppose a necklace weighs 2 vori and 5 ana. In grams that is 2 × 11.664 + 5 × 0.729 = 23.328 + 3.645 = <strong>26.973 g</strong>. If the shop quotes a price of 9,000 per gram for that purity (an illustrative number, not a real rate), the gold value is 26.973 × 9,000 = 242,757. Making charges, taxes and any stone weight come on top and vary by shop.</p>
<p>If the quote is per vori instead, divide it by 11.664 to see the per-gram price, so you can compare two shops on the same basis. The bill should list the weight, the purity and the rate separately. If a figure looks wrong, convert it back to grams and recalculate before you pay.</p>`,
      },
      {
        heading: "Weight is not purity",
        html: `<p>A vori of 22 carat gold and a vori of 18 carat gold weigh exactly the same, 11.664 grams. Purity changes how much of that weight is gold. Pure gold is 24 carat, so 22 carat is 22 ÷ 24 = 91.7% gold, and 18 carat is 75%. That is why a vori of 22 carat gold costs more than a vori of 18 carat.</p>
<p>When you compare quotes, compare the same purity and the same unit. Ask whether the price includes making charges and whether the weight is of the finished item with stones. Gemstones and enamel add weight that is not gold. Always check the weight on the shop's scale against the bill.</p>`,
      },
      {
        heading: "Common mistakes",
        html: `<ul>
<li>Assuming a vori and a tola differ. They are treated as equal here.</li>
<li>Mixing the gold ana with the old coin or the length unit of the same name.</li>
<li>Using an ordinary ounce instead of a troy ounce when working with international prices.</li>
<li>Comparing prices of different purities as though they were the same product.</li>
<li>Rounding ana and roti too early. Convert to grams, do the sums, then convert back.</li>
</ul>`,
      },
    ],
    faqs: [
      {
        q: "How many grams is 1 vori?",
        a: "1 vori is 11.664 grams. A tola is the same weight.",
      },
      {
        q: "How many ana are in a vori?",
        a: "16 ana make 1 vori, and 1 ana is 0.729 grams. There are also 96 roti in 1 vori.",
      },
      {
        q: "How many vori is 10 grams of gold?",
        a: "10 grams is about 0.857 vori, which is 10 ÷ 11.664.",
      },
      {
        q: "Does the carat change the weight of a vori?",
        a: "No. A vori weighs 11.664 grams at any purity. Only the share of pure gold, and therefore the price, changes.",
      },
    ],
    tools: [
      { href: "/gold-weight-converter/", label: "Gold Weight Converter" },
      { href: "/vori-to-gram/", label: "Vori to Gram" },
      { href: "/tola-to-gram/", label: "Tola to Gram" },
      { href: "/gold-price-calculator/", label: "Gold Price Calculator" },
    ],
  },
  {
    slug: "bangla-calendar-bangladesh-vs-west-bengal",
    title: "The Bangla calendar: how the Bangladesh and West Bengal versions differ",
    metaTitle: "Bangla Calendar: Bangladesh vs West Bengal",
    description:
      "Why the Bangla date can differ by a day or two between Bangladesh and West Bengal: fixed versus Surya Siddhanta months, month lengths, and worked date examples.",
    summary:
      "Both Bangladesh and West Bengal use a Bangla solar calendar, but they set month starts differently. This guide explains the two rules, the month tables and how to convert a date correctly.",
    category: "Numbers and words",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "One calendar, two traditions",
        html: `<p>The Bangla calendar (Bangabda) is a solar calendar with twelve months, from Boishakh to Chaitra. The year begins in mid-April. The numbering runs 593 years behind the Gregorian year after the new year and 594 years behind before it: 14 April 2026 is the first day of Boishakh 1433, and the days before it in early 2026 still belong to 1432.</p>
<p>Bangladesh and West Bengal each follow their own rules for when months start. The Bangla date for the same day can therefore be different, even though both calendars use the same month names and the same year numbers. The converters on this site, the <a href="/bangla-date-converter/">Bangla date converter</a>, <a href="/bangla-date-today/">today's Bangla date</a> and the <a href="/bangla-calendar/">Bangla calendar</a>, include both.</p>`,
      },
      {
        heading: "Bangladesh: the revised calendar with fixed months",
        html: `<p>Bangladesh uses a revised calendar in which month starts are fixed against the Gregorian calendar. The new year, Pohela Boishakh, is always 14 April. The implementation here follows the revised month lengths: Boishakh to Ashwin have 31 days, Kartik, Agrahayan, Poush, Magh and Chaitra have 30, and Falgun has 29 days, or 30 in a Gregorian leap year.</p>
<table>
<thead><tr><th>Month</th><th>Starts on</th><th>Days</th></tr></thead>
<tbody>
<tr><td>Boishakh</td><td>14 April</td><td>31</td></tr>
<tr><td>Joistho</td><td>15 May</td><td>31</td></tr>
<tr><td>Asharh</td><td>15 June</td><td>31</td></tr>
<tr><td>Srabon</td><td>16 July</td><td>31</td></tr>
<tr><td>Bhadro</td><td>16 August</td><td>31</td></tr>
<tr><td>Ashwin</td><td>16 September</td><td>31</td></tr>
<tr><td>Kartik</td><td>17 October</td><td>30</td></tr>
<tr><td>Agrahayan</td><td>16 November</td><td>30</td></tr>
<tr><td>Poush</td><td>16 December</td><td>30</td></tr>
<tr><td>Magh</td><td>15 January</td><td>30</td></tr>
<tr><td>Falgun</td><td>14 February</td><td>29 (30 in leap years)</td></tr>
<tr><td>Chaitra</td><td>15 March</td><td>30</td></tr>
</tbody>
</table>
<p>Because the starts are fixed, a Bangladesh Bangla date can be worked out by simple counting from these dates.</p>`,
      },
      {
        heading: "West Bengal: the traditional solar calendar",
        html: `<p>West Bengal follows the traditional solar calendar, with months worked out from the Sun's entry into each zodiac sign using the Surya Siddhanta. In the method used here, a month starts the day after the Sun enters the sign, and one day later if that happens after midnight. Month starts therefore move from year to year, and months can have anywhere from 29 to 32 days.</p>
<p>For year 1433 the month starts in our calculation match published panjika dates: Boishakh on 15 April 2026, Joistho on 16 May, Asharh on 16 June, Srabon on 18 July, Bhadro on 19 August, Ashwin on 19 September and Kartik on 19 October. Printed panjikas are compiled by different almanac makers, and they can occasionally differ from one another and from the calculation by a day, so for religious observances rely on the panjika your family or community follows. Festival dates also depend on the lunar day (tithi), which this calendar does not show.</p>`,
      },
      {
        heading: "The same day, two dates",
        html: `<p>Here are checked examples for the two traditions:</p>
<table>
<thead><tr><th>Gregorian date</th><th>Bangladesh</th><th>West Bengal</th></tr></thead>
<tbody>
<tr><td>14 April 2026</td><td>Boishakh 1, 1433</td><td>Chaitra 30, 1432</td></tr>
<tr><td>15 April 2026</td><td>Boishakh 2, 1433</td><td>Boishakh 1, 1433</td></tr>
<tr><td>4 November 2026</td><td>Kartik 19, 1433</td><td>Kartik 17, 1433</td></tr>
<tr><td>14 April 2027</td><td>Boishakh 1, 1434</td><td>Chaitra 30, 1433</td></tr>
</tbody>
</table>
<p>The gap is one day at the new year and two days on 4 November 2026. It can change through the year, since the West Bengal months shift while Bangladesh's stay fixed.</p>`,
      },
      {
        heading: "Seasons and how to use the right calendar",
        html: `<p>The Bangla year is divided into six seasons of two months each: Grishmo (Boishakh and Joistho), Borsha (Asharh and Srabon), Shorot (Bhadro and Ashwin), Hemonto (Kartik and Agrahayan), Sheet (Poush and Magh) and Boshonto (Falgun and Chaitra).</p>
<p>To convert a date correctly:</p>
<ol>
<li>Decide which tradition the date belongs to. A Bangladeshi document or event uses the Bangladesh calendar, and a West Bengal almanac uses the West Bengal one.</li>
<li>Enter the Gregorian date in the <a href="/bangla-date-converter/">converter</a> and select that calendar.</li>
<li>For anything official or religious, confirm with the document, institution or panjika, because they have the final say.</li>
<li>For a Bangla date back to Gregorian, make sure the month has that many days. Falgun, for example, has only 29 days in most Bangladesh years.</li>
</ol>`,
      },
    ],
    faqs: [
      {
        q: "Why is the Bangla date different in Bangladesh and West Bengal?",
        a: "Bangladesh uses a revised calendar with fixed month starts, while West Bengal uses the traditional Surya Siddhanta solar calculation. Their month starts can differ by one or two days.",
      },
      {
        q: "When does the Bangla new year start?",
        a: "In Bangladesh, on 14 April every year. In West Bengal it is usually 14 or 15 April, depending on the calculation, and 15 April in 2026.",
      },
      {
        q: "How do I find the Bangla year from the English year?",
        a: "From mid-April onwards, subtract 593 from the Gregorian year. Before that, subtract 594. For example, November 2026 is Bangla year 1433.",
      },
      {
        q: "Will the West Bengal date match my printed panjika?",
        a: "Almost always, but not guaranteed. Printed panjikas can differ from one another and from the calculation by a day, so check the one you follow for religious dates.",
      },
    ],
    tools: [
      { href: "/bangla-date-converter/", label: "Bangla Date Converter" },
      { href: "/bangla-date-today/", label: "Today's Bangla Date" },
      { href: "/bangla-calendar/", label: "Bangla Calendar" },
    ],
  },
];
