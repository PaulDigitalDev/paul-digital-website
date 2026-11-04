import type { CalculatorTool } from "./calculatorTools.ts";
import { addDays, addMonths, ageAt, daysBetween, fromSeconds, iso, minutesBetween, parseClock, parseDate, toSeconds, weekday, ymdDiff } from "../lib/dateCalc.ts";
import { amortize } from "../lib/finance.ts";
import { bmi, bmiCategory, gpa, hourlyToAnnual, neededOnFinal, percentage, weightedAverage } from "../lib/calcMisc.ts";
import { money, pct } from "../lib/calcDefs.ts";

const D = (s: string) => parseDate(s)!;
const PRIVACY = { q: "Are my numbers saved or sent anywhere?", a: "No. The calculation runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };

export const moreCalculatorTools: CalculatorTool[] = [
  {
    slug: "age-calculator",
    calc: "age",
    h1: "Age Calculator",
    title: "Age Calculator: Exact Age in Years, Months and Days",
    description: "Work out exact age from a date of birth in years, months, weeks and days, plus the days until the next birthday. Free, in your browser, nothing uploaded.",
    summary: "Work out exact age in years, months and days from a date of birth.",
    intro: "Enter a date of birth to see the exact age in years, months and days, the total days lived and how long until the next birthday.",
    keywords: ["age calculator", "calculate age", "how old am i", "date of birth calculator"],
    steps: [
      "Pick your date of birth.",
      "Leave the second date empty to measure to today, or choose another date to find the age on that day.",
      "Read your age in years, months and days, plus total months, weeks and days.",
      "Check the next birthday line to see the weekday and how many days away it is.",
    ],
    explanation: [
      "Age is the time from a date of birth to another date, counted in whole years first, then whole months and then the days left over. A person born on 15 May 1990 is exactly 34 years old on 15 May 2024, and the day before they are 33 years, 11 months and some days.",
      "The calculator counts whole months from the birth date and then the remaining days. When a month is shorter than the birth day, the last day of that month is used. Someone born on 31 January reaches one month of age on 28 February, or 29 February in a leap year. The total days figure is the exact number of calendar days between the two dates.",
      "A birthday on 29 February happens only in leap years. In other years this calculator counts it on 28 February. Different countries and laws treat this differently, so for legal purposes check the rule that applies to you.",
    ],
    formula: [
      "Years and months come from counting whole calendar months from the date of birth to the chosen date and dividing by 12. Days are counted from the last whole month to the chosen date.",
      "Total days = the number of calendar days between the two dates. Total weeks = total days ÷ 7, rounded down.",
    ],
    worked: () => {
      const a = ageAt(D("1990-05-15"), D("2024-05-14"));
      const b = ageAt(D("2000-01-01"), D("2024-01-01"));
      return [
        `Born on 15 May 1990, on 14 May 2024 the age is ${a.years} years, ${a.months} months and ${a.days} days. That is ${a.totalDays.toLocaleString("en-US")} days, one day short of the 34th birthday.`,
        `Born on 1 January 2000, on 1 January 2024 the age is exactly ${b.years} years, which is ${b.totalDays.toLocaleString("en-US")} days.`,
      ];
    },
    tips: [
      "Use the second date to find an age on a past or future date, such as the age on the first day of a school year.",
      "For forms, enter the date exactly as on your documents, then compare the age with the rule that applies.",
      "The next-birthday line also shows which day of the week it falls on, which helps with planning.",
    ],
    faqs: [
      { q: "How is age calculated exactly?", a: "By counting whole years and months from the date of birth, then the remaining days. The calculator also gives the total number of days." },
      { q: "How do I find my age on a particular date?", a: "Enter your date of birth and fill in the second date with the day you want. The age is worked out for that day." },
      { q: "What about a 29 February birthday?", a: "In years that are not leap years it is counted on 28 February." },
      { q: "Does time zone matter?", a: "No. The calculator uses calendar dates only, with no time of day." },
      PRIVACY,
    ],
    related: ["date-calculator", "time-calculator", "bmi-calculator", "percentage-calculator"],
  },
  {
    slug: "date-calculator",
    calc: "date",
    h1: "Date Calculator (Days Between Dates, Add or Subtract)",
    title: "Date Calculator: Days Between Dates, Add or Subtract Days",
    description: "Count the days between two dates, add or subtract days, months and years from a date, or find the date a number of days from today. Free, in your browser.",
    summary: "Count days between dates, or add and subtract days, months and years.",
    intro: "Find how many days lie between two dates, or add and subtract days, months and years. There is also a quick mode for days from today.",
    keywords: ["date calculator", "days between dates", "add days to date", "days from today"],
    steps: [
      "Choose what to do: days between two dates, add to a date, subtract from a date or days from today.",
      "Enter the dates and, for adding or subtracting, the years, months and days.",
      "For days between, choose whether to count the end date as well.",
      "Read the result with its weekday, and the same gap in weeks and days.",
    ],
    explanation: [
      "Counting days between dates is subtraction on a calendar: the number of midnights you cross. From 1 January to 31 December 2024 is 365 days, because 2024 is a leap year with 366 days, and the gap is one less than the length of the year. Some uses, such as counting nights or inclusive deadlines, ask you to count the end date too, which adds one day.",
      "Adding months works differently from adding days. Months have different lengths, so adding one month to 31 January gives the last day of February, 28 or 29, not a date in March. In add mode the calculator applies years and months first and then the days, so the order is always the same.",
      "The days-from-today mode starts from your device's date, so the answer is for the day you open the page. Business days, holidays and time of day are not included.",
    ],
    formula: [
      "Days between = the difference of the two dates counted in whole days. Add one to include the end date.",
      "Adding months moves the calendar month and keeps the day of the month where it exists. If it does not exist, the last day of that month is used.",
    ],
    worked: () => {
      const a = daysBetween(D("2024-01-01"), D("2024-12-31"));
      const b = addDays(addMonths(D("2024-01-31"), 1), 0);
      const c = addDays(D("2024-03-01"), 60);
      return [
        `From 1 January 2024 to 31 December 2024 there are ${a} days, which is ${Math.floor(a / 7)} weeks and ${a % 7} day.`,
        `One month after 31 January 2024 is ${iso(b)}, a ${weekday(b)}, because February 2024 has 29 days.`,
        `60 days after 1 March 2024 is ${iso(c)}, a ${weekday(c)}.`,
      ];
    },
    tips: [
      "Check whether your deadline counts the first day, the last day, or both, and tick the box to match.",
      "To plan in weeks, use the weeks and days line under the result.",
      "For ages, use the Age Calculator, which gives years, months and days.",
    ],
    faqs: [
      { q: "How many days between two dates?", a: "Enter both dates in days-between mode. The result is the number of days from the earlier date to the later one." },
      { q: "Is the end date counted?", a: "Not by default. Choose to count it if you want both the first and last day included." },
      { q: "What is 90 days from today?", a: "Use the days from today mode, enter 90 and choose days after today." },
      { q: "Does it skip weekends or holidays?", a: "No. It counts every calendar day." },
      PRIVACY,
    ],
    related: ["age-calculator", "time-calculator", "hours-calculator", "percentage-calculator"],
  },
  {
    slug: "time-calculator",
    calc: "time",
    h1: "Time Calculator (Add and Subtract Time)",
    title: "Time Calculator: Add or Subtract Hours, Minutes and Seconds",
    description: "Add or subtract two lengths of time in days, hours, minutes and seconds and see the total in hours and minutes. Free, in your browser.",
    summary: "Add or subtract two lengths of time in days, hours, minutes and seconds.",
    intro: "Add or subtract two lengths of time and get the result in days, hours, minutes and seconds, plus the total in hours.",
    keywords: ["time calculator", "add time", "subtract time", "hours and minutes calculator"],
    steps: [
      "Choose whether to add the two times or subtract the second from the first.",
      "Enter the first time as days, hours, minutes and seconds.",
      "Enter the second time in the same way.",
      "Read the result and its total in hours, minutes and seconds.",
    ],
    explanation: [
      "Time does not work in tens, so adding it by hand is awkward. Sixty seconds make a minute, sixty minutes make an hour and twenty-four hours make a day. This calculator converts both times to seconds, adds or subtracts them and then converts back, so carrying between the units is done for you.",
      "It is handy for adding up the length of several videos, workouts or tasks, working out how much of a time budget is left, or finding the difference between two durations. The decimal hours line is useful for timesheets and billing, where 5 hours 45 minutes is written 5.75.",
      "These are lengths of time, not clock times. To find how long a shift lasts between a start and end clock time, use the Hours Calculator instead.",
    ],
    formula: [
      "Each time is converted to seconds: days × 86,400 + hours × 3,600 + minutes × 60 + seconds.",
      "The two values are added or subtracted, then the total is turned back into days, hours, minutes and seconds.",
    ],
    worked: () => {
      const a = fromSeconds(toSeconds(0, 5, 45, 0) + toSeconds(0, 3, 30, 0));
      const b = fromSeconds(toSeconds(1, 2, 0, 0) - toSeconds(0, 8, 15, 30));
      return [
        `5 hours 45 minutes plus 3 hours 30 minutes is ${a.d ? `${a.d} day ` : ""}${a.h} hours ${a.m} minutes, which is 9.25 hours.`,
        `1 day 2 hours minus 8 hours 15 minutes 30 seconds is ${b.d} days ${b.h} hours ${b.m} minutes ${b.s} seconds.`,
      ];
    },
    tips: [
      "Add as many times as you need by running the result back into the first row.",
      "Use the decimal hours figure when a form asks for hours as a decimal number.",
      "Enter whole numbers in each box. A value such as 90 minutes is fine and is carried into hours for you.",
    ],
    faqs: [
      { q: "How do I add hours and minutes?", a: "Enter both times and choose add. The calculator carries minutes into hours and hours into days." },
      { q: "How do I convert minutes to decimal hours?", a: "Divide the minutes by 60. For example 45 minutes is 0.75 hours. The total hours line does this for you." },
      { q: "Can the result be negative?", a: "Yes, if you subtract a longer time from a shorter one. The result then has a minus sign." },
      { q: "Is this for clock times like 9:00 am?", a: "No. For start and end clock times, use the Hours Calculator." },
      PRIVACY,
    ],
    related: ["hours-calculator", "date-calculator", "age-calculator", "hourly-to-salary-calculator"],
  },
  {
    slug: "hours-calculator",
    calc: "hours",
    h1: "Hours Calculator (Work Hours Between Times)",
    title: "Hours Calculator: Hours Worked Between Two Times",
    description: "Work out hours worked between a start and end time, minus an unpaid break, with decimal hours and weekly totals. Handles night shifts. Free, in your browser.",
    summary: "Work out hours worked between a start and end time, minus breaks.",
    intro: "Enter a start time, an end time and an unpaid break to see the hours worked as hours and minutes and as decimal hours, with weekly totals and pay.",
    keywords: ["hours calculator", "work hours calculator", "time card calculator", "hours worked"],
    steps: [
      "Enter the start and end time of the shift.",
      "Enter the unpaid break in minutes, or 0.",
      "Enter how many days a week you work, and an hourly rate if you want pay figures.",
      "Read the hours worked, the decimal hours, and the weekly and monthly totals.",
    ],
    explanation: [
      "The hours worked are the time from the start to the end, minus any unpaid break. A shift from 9:00 to 17:30 with a 30 minute break is 8 hours of work. Payroll often uses decimal hours, where 8 hours 15 minutes is 8.25, so the calculator shows both forms.",
      "If the end time is not later than the start time, the end is taken to be on the next day, which is how night shifts such as 22:00 to 06:00 work. A shift cannot be longer than 24 hours in this calculator.",
      "The weekly and monthly figures multiply a single shift by your days a week. The monthly figure uses 52 weeks divided by 12, which is 4.33 weeks a month. Pay figures are before tax and ignore overtime rates and rounding rules your employer may use.",
    ],
    formula: [
      "Minutes worked = end time − start time (plus 24 hours if the end is not later than the start) − unpaid break.",
      "Decimal hours = minutes worked ÷ 60.",
    ],
    worked: () => {
      const m = minutesBetween(parseClock("09:00")!, parseClock("17:30")!) - 30;
      const n = minutesBetween(parseClock("22:00")!, parseClock("06:00")!);
      return [
        `9:00 to 17:30 with a 30 minute break is ${m / 60} hours, or ${m / 60} × 5 = ${(m / 60) * 5} hours over a five day week.`,
        `A night shift from 22:00 to 06:00 is ${n / 60} hours with no break.`,
      ];
    },
    tips: [
      "Enter breaks that are unpaid only. A paid break is part of the working time.",
      "Check your employer's rounding rules, since some round to the nearest 5 or 15 minutes.",
      "Use the Time Calculator to add up several shifts or tasks.",
    ],
    faqs: [
      { q: "How do I calculate hours worked?", a: "Subtract the start time from the end time, then subtract unpaid breaks. This calculator does the steps for you." },
      { q: "How do I convert 8 hours 15 minutes to decimal?", a: "Divide the minutes by 60 and add the hours: 15 ÷ 60 = 0.25, so 8.25 hours." },
      { q: "Does it work for overnight shifts?", a: "Yes. If the end time is not later than the start time, it counts to the next day." },
      { q: "Does it work out overtime?", a: "No. It gives straight hours and pay at one rate." },
      PRIVACY,
    ],
    related: ["time-calculator", "hourly-to-salary-calculator", "date-calculator", "salary-increase-calculator"],
  },
  {
    slug: "percentage-calculator",
    calc: "percentage",
    h1: "Percentage Calculator",
    title: "Percentage Calculator: % of, % Change, Increase and Decrease",
    description: "Work out X% of Y, what percent one number is of another, percentage change, and increase or decrease a number by a percentage. Free, in your browser.",
    summary: "Solve the six everyday percentage questions in one place.",
    intro: "Pick the question you have, enter two numbers and get the answer: a percentage of a number, a percentage change, an increase or a decrease.",
    keywords: ["percentage calculator", "percent change calculator", "what is x percent of y", "percentage increase"],
    steps: [
      "Choose the question that matches yours, such as X% of Y or percentage change.",
      "Enter the two numbers. The labels change to match the question.",
      "Read the answer, which updates as you type.",
    ],
    explanation: [
      "A percentage is a fraction out of 100, so 15% is 15 out of every 100, or 0.15. Nearly every percentage question is one of six: a percentage of a number, what percentage one number is of another, the percentage change between two values, the whole when you know a part and its percentage, and increasing or decreasing a number by a percentage.",
      "Percentage change is calculated against the starting value. Going from 50 to 75 is a 50% rise. Going from 75 back to 50 is a fall of only 33.3%, because the starting value is now 75. This is why a rise and a fall of the same percentage do not cancel out.",
      "Increasing a number by a percentage multiplies it by 1 plus the percentage as a decimal, and decreasing it multiplies by 1 minus the percentage. A price of 200 with 10% added is 220, and with 25% taken off it is 150.",
    ],
    formula: [
      "X% of Y = X ÷ 100 × Y. X is what percent of Y = X ÷ Y × 100.",
      "Percentage change = (new − old) ÷ old × 100. Whole from a part = part ÷ (percent ÷ 100).",
      "Increase by P% = number × (1 + P ÷ 100). Decrease by P% = number × (1 − P ÷ 100).",
    ],
    worked: () => [
      `15% of 200 is ${percentage("of", 15, 200)}.`,
      `30 is ${pct(percentage("whatpct", 30, 200), 2)} of 200.`,
      `From 50 to 75 is a ${pct(percentage("change", 50, 75), 1)} rise, but from 75 to 50 is a ${pct(percentage("change", 75, 50), 1)} change.`,
      `200 increased by 10% is ${+percentage("up", 200, 10).toFixed(2)}, and decreased by 25% is ${percentage("down", 200, 25)}.`,
    ],
    tips: [
      "For a discount, use decrease by a percentage. For tax on top of a price, use increase.",
      "When comparing two values, say which one is the starting value before you work out the percentage change.",
      "Two percentage changes in a row are not the same as adding them. Apply one after the other.",
    ],
    faqs: [
      { q: "How do I calculate a percentage of a number?", a: "Divide the percentage by 100 and multiply by the number. For 15% of 200 that is 0.15 × 200 = 30." },
      { q: "How do I calculate percentage change?", a: "Subtract the old value from the new value, divide by the old value and multiply by 100." },
      { q: "Why is a 50% rise followed by a 50% fall not back to the start?", a: "The fall is taken from the higher value. 100 up 50% is 150, and 150 down 50% is 75." },
      { q: "Can I find the original price before a discount?", a: "Yes. Use the question X is Y% of what number, with the discounted price as X and the percentage paid as Y." },
      PRIVACY,
    ],
    related: ["salary-increase-calculator", "roi-calculator", "grade-calculator", "date-calculator"],
  },
  {
    slug: "hourly-to-salary-calculator",
    calc: "hourly-to-salary",
    h1: "Hourly to Salary Calculator",
    title: "Hourly to Salary Calculator: Hourly Wage to Yearly Pay",
    description: "Convert an hourly wage to a yearly, monthly, biweekly and weekly salary, or a yearly salary to an hourly rate. Set hours and paid weeks. Free, in your browser.",
    summary: "Convert an hourly wage to a yearly salary, or the reverse.",
    intro: "Turn an hourly rate into yearly, monthly, biweekly, weekly and daily pay, or turn a yearly salary into an hourly rate.",
    keywords: ["hourly to salary calculator", "hourly wage to annual", "salary to hourly", "annual salary calculator"],
    steps: [
      "Choose whether you know the hourly pay or the yearly salary.",
      "Enter the amount, your hours per week and the paid weeks in a year.",
      "Read the yearly, monthly, biweekly, weekly and daily figures, or the hourly rate.",
    ],
    explanation: [
      "A yearly salary is the hourly rate multiplied by the hours you work in a year. A full-time worker at 40 hours a week for 52 weeks works 2,080 hours, so an hourly rate of 25 is 52,000 a year. To go the other way, divide the yearly pay by the same 2,080 hours.",
      "The paid weeks setting lets you account for unpaid time off. If you have two unpaid weeks a year, enter 50 and the yearly total drops by two weeks of pay. The hours per week setting lets you check part-time pay, so 25 hours at 20 an hour over 52 weeks is 26,000.",
      "Monthly pay is one twelfth of the year. Biweekly pay is one twenty-sixth, which is the usual pay run every two weeks. All figures are before tax and other deductions, and they ignore overtime and bonuses.",
    ],
    formula: [
      "Yearly pay = hourly rate × hours per week × paid weeks per year.",
      "Hourly rate = yearly pay ÷ (hours per week × paid weeks per year).",
      "Monthly = yearly ÷ 12. Biweekly = yearly ÷ 26. Weekly = hourly rate × hours per week.",
    ],
    worked: () => {
      const a = hourlyToAnnual(25, 40, 52);
      const b = hourlyToAnnual(20, 25, 52);
      const c = 60000 / (40 * 52);
      return [
        `At 25 an hour for 40 hours a week and 52 weeks, the yearly pay is ${money(a.annual)}, monthly ${money(a.monthly)} and biweekly ${money(a.biweekly)}.`,
        `Part time, 20 an hour for 25 hours a week gives ${money(b.annual)} a year.`,
        `A salary of 60,000 over 2,080 hours is ${money(c)} an hour.`,
      ];
    },
    tips: [
      "Use the paid weeks box for unpaid leave so the yearly figure matches what you will really receive.",
      "When comparing a salaried job with an hourly one, make sure both use the same hours per week.",
      "Remember that a salary often includes paid leave that an hourly figure does not.",
    ],
    faqs: [
      { q: "How do I convert hourly pay to an annual salary?", a: "Multiply the hourly rate by the hours you work per week and by 52." },
      { q: "How many working hours are in a year?", a: "A 40 hour week for 52 weeks is 2,080 hours." },
      { q: "Is the result before or after tax?", a: "Before tax and other deductions." },
      { q: "Can I convert a salary to an hourly rate?", a: "Yes. Choose yearly salary, enter the hours and weeks, and the hourly rate is shown." },
      PRIVACY,
    ],
    related: ["salary-increase-calculator", "hours-calculator", "percentage-calculator", "time-calculator"],
  },
  {
    slug: "grade-calculator",
    calc: "grade",
    h1: "Grade Calculator (Weighted Grade and Final Exam)",
    title: "Grade Calculator: Weighted Average and Score Needed on Final",
    description: "Work out a weighted course grade from scores and weights, or the score you need on a final exam to reach a target grade. Free, in your browser.",
    summary: "Work out a weighted grade, or the score needed on a final exam.",
    intro: "Enter your scores and their weights to see your overall grade, or find the score you need on the final exam to reach the grade you want.",
    keywords: ["grade calculator", "weighted grade calculator", "final grade calculator", "what do i need on my final"],
    steps: [
      "Choose weighted grade or the score needed on the final.",
      "For a weighted grade, type one line per item: the score as a percentage, a comma, then its weight.",
      "For the final, enter your current grade, how much the final is worth and the grade you want.",
      "Read your overall grade or the score you need.",
    ],
    explanation: [
      "Most courses weigh assignments differently: homework might count 20%, midterms 30% and the final 50%. A weighted grade multiplies each score by its weight, adds them up and divides by the total weight. The weights only need to be relative, so 20, 30 and 50 give the same result as 2, 3 and 5.",
      "The final exam mode works backwards. If your current grade covers the part of the course that is not the final, then the score you need is your target minus the part of the course already earned, divided by the weight of the final. Sometimes the answer is above 100%, which means the target cannot be reached without extra credit.",
      "Letter grade boundaries differ between schools and countries. The letter shown here uses the common 90, 80, 70 and 60 percent scale, so check your own school's scale and rounding rules.",
    ],
    formula: [
      "Weighted grade = (score₁ × weight₁ + score₂ × weight₂ + …) ÷ (weight₁ + weight₂ + …).",
      "Needed on final = (target − current × (1 − final weight)) ÷ final weight, with the final weight as a decimal.",
    ],
    worked: () => {
      const a = weightedAverage([{ score: 92, weight: 20 }, { score: 85, weight: 30 }, { score: 78, weight: 50 }]);
      const b = neededOnFinal(82, 30, 85);
      const c = neededOnFinal(80, 20, 85);
      return [
        `Scores of 92, 85 and 78 with weights 20, 30 and 50 give a weighted grade of ${pct(a, 2)}.`,
        `With a current grade of 82% and a final worth 30%, you need ${pct(b, 2)} on the final to finish on 85%.`,
        `With 80% and a final worth only 20%, reaching 85% would need ${pct(c, 0)}, which is more than 100, so it is out of reach.`,
      ];
    },
    tips: [
      "Enter every graded item you have so far, and use the final mode for what is left.",
      "Check whether your instructor drops the lowest score before you enter the list.",
      "Use scores as percentages. For 17 out of 20, enter 85.",
    ],
    faqs: [
      { q: "How is a weighted grade calculated?", a: "Multiply each score by its weight, add the results and divide by the total of the weights." },
      { q: "What do I need on my final to get an A?", a: "Use the final mode, enter your current grade, the weight of the final and 90 as the grade you want." },
      { q: "Do the weights have to add up to 100?", a: "No. They only need to be relative to each other." },
      { q: "Why is the needed score over 100%?", a: "Because the target is too high to reach with the weight that is left. Only extra credit could close the gap." },
      PRIVACY,
    ],
    related: ["gpa-calculator", "percentage-calculator", "age-calculator", "date-calculator"],
  },
  {
    slug: "gpa-calculator",
    calc: "gpa",
    h1: "GPA Calculator",
    title: "GPA Calculator: 4.0 Scale Grade Point Average | Paul Digital",
    description: "Calculate your grade point average on the 4.0 scale from letter grades and credits. Enter one course per line. Free, in your browser, nothing uploaded.",
    summary: "Calculate a grade point average on the 4.0 scale from grades and credits.",
    intro: "Enter your courses as a letter grade and credits, one per line, to see your GPA on the common 4.0 scale.",
    keywords: ["gpa calculator", "grade point average calculator", "college gpa calculator", "4.0 scale"],
    steps: [
      "Type one course per line: the letter grade, a comma and the credits, such as A, 3.",
      "You can also use grade points such as 3.5 instead of a letter.",
      "Leave the credits out if every course has the same weight.",
      "Read your GPA, the total credits and the quality points.",
    ],
    explanation: [
      "Grade point average turns letter grades into numbers and averages them, giving courses with more credits more weight. On the usual unweighted 4.0 scale an A is 4.0, an A− is 3.7, a B+ is 3.3, a B is 3.0 and so on down to F at 0. Each course contributes its grade points times its credits, and the GPA is the total divided by the total credits.",
      "This calculator uses that common scale. Schools differ. Some give an A+ extra points, some do not use plus and minus grades, and some weight honors or advanced courses higher. Others use a different scale altogether, so treat the result as a close estimate and check your school's own rules.",
      "To plan ahead, add courses with the grades you hope to get and see how the GPA would change. A grade in a course with more credits moves the GPA more than the same grade in a course with fewer.",
    ],
    formula: [
      "Quality points for a course = grade points × credits.",
      "GPA = total quality points ÷ total credits.",
    ],
    worked: () => {
      const g = gpa([{ points: 4, credits: 3 }, { points: 3.3, credits: 4 }, { points: 3.7, credits: 3 }, { points: 3, credits: 2 }]);
      return [
        `A (3 credits), B+ (4), A− (3) and B (2) give ${g.quality.toFixed(1)} quality points over ${g.credits} credits, a GPA of ${g.gpa.toFixed(2)}.`,
        "Two courses of 3 credits each, an A and a C, give a GPA of 3.00, because the grade points 4.0 and 2.0 average to 3.0.",
      ];
    },
    tips: [
      "Include the credits for every course. Without them each course counts the same.",
      "To find a cumulative GPA, enter all courses from every term, or work out the term GPA first.",
      "If your school uses a different scale, use numeric grade points in place of letters.",
    ],
    faqs: [
      { q: "How do I calculate my GPA?", a: "Convert each grade to points, multiply by its credits, add the results and divide by the total credits." },
      { q: "What are the grade points for each letter?", a: "On the common 4.0 scale: A is 4.0, A− is 3.7, B+ is 3.3, B is 3.0, B− is 2.7, C+ is 2.3, C is 2.0, C− is 1.7, D+ is 1.3, D is 1.0 and F is 0." },
      { q: "Is this a weighted or unweighted GPA?", a: "Unweighted. Honors and advanced courses are not given extra points." },
      { q: "Does it match my school's GPA?", a: "It may differ slightly, because schools set their own scales and rounding." },
      PRIVACY,
    ],
    related: ["grade-calculator", "percentage-calculator", "age-calculator", "date-calculator"],
  },
  {
    slug: "amortization-calculator",
    calc: "amortization",
    h1: "Amortization Calculator (with Extra Payments)",
    title: "Amortization Calculator with Extra Payments | Paul Digital",
    description: "See a loan's payment, total interest and year-by-year payoff, and how much interest and time an extra monthly payment saves. Free, in your browser.",
    summary: "See a loan's payoff schedule and what extra monthly payments save.",
    intro: "Enter a loan and an optional extra monthly payment to see the payment, the total interest, the payoff date and the interest and time you save.",
    keywords: ["amortization calculator", "extra payment calculator", "loan payoff calculator", "amortization schedule"],
    steps: [
      "Enter the loan amount, the yearly interest rate and the term in years.",
      "Enter an extra amount you could pay each month, or 0.",
      "Read the regular payment, the interest saved and the time saved by the extra payment.",
      "Use the yearly table to see how the balance falls.",
    ],
    explanation: [
      "Amortization means paying a loan off in regular instalments. Each month the interest is worked out on the balance that is left, and the rest of the payment reduces the balance. Early in a long loan most of each payment is interest, so the balance falls slowly at first.",
      "An extra payment goes straight to the balance, so the next month's interest is lower and a bigger share of the following regular payment goes to principal. That is why even a modest extra amount can cut years from a long loan. This calculator compares the loan with and without your extra amount, so you can see the interest and the time you would save.",
      "It assumes a fixed rate, monthly payments and no fees. Some lenders charge a penalty for paying early or apply extra payments in a different way, so check your loan terms. The result is an estimate and not an offer from a lender.",
    ],
    formula: [
      "Regular payment = P × r ÷ (1 − (1 + r)^−n), with r the monthly rate and n the number of months.",
      "Each month: interest = balance × r. Principal paid = payment + extra − interest. The new balance is the old balance minus the principal paid.",
    ],
    worked: () => {
      const base = amortize(250000, 6.5, 30, 0);
      const fast = amortize(250000, 6.5, 30, 200);
      const yrs = (m: number) => `${Math.floor(m / 12)} years ${m % 12} months`;
      return [
        `A 250,000 loan at 6.5% over 30 years has a regular payment of ${money(base.payment)} and costs ${money(base.totalInterest)} in interest.`,
        `Adding 200 a month pays it off in ${yrs(fast.months)} instead of 30 years and saves ${money(base.totalInterest - fast.totalInterest)} in interest.`,
      ];
    },
    tips: [
      "Early extra payments save the most, because they cut interest for the longest time.",
      "Check that your lender applies extra money to the principal and does not charge for early payment.",
      "For a loan with another payment pattern, such as weekly, use the Loan Calculator.",
    ],
    faqs: [
      { q: "What is an amortization schedule?", a: "A table showing, for each payment or year, how much goes to interest, how much to principal and what balance remains." },
      { q: "How do extra payments save money?", a: "They lower the balance sooner, so less interest is charged in every later month." },
      { q: "Does this include fees, insurance or tax?", a: "No. It covers principal and interest only." },
      { q: "Why is my lender's figure slightly different?", a: "Lenders may round each payment or count days differently, so small differences are normal." },
      PRIVACY,
    ],
    related: ["loan-calculator", "tvm-calculator", "compound-interest-calculator", "roi-calculator"],
  },
  {
    slug: "bmi-calculator",
    calc: "bmi",
    h1: "BMI Calculator",
    title: "BMI Calculator for Adults (Metric and US Units)",
    description: "Calculate body mass index from height and weight in metric or US units, see the adult category and the weight range for a BMI of 18.5 to 24.9. Free, private.",
    summary: "Calculate body mass index from height and weight, in metric or US units.",
    intro: "Enter your height and weight in metric or US units to see your body mass index (BMI), the adult category and the weight range for your height.",
    keywords: ["bmi calculator", "body mass index calculator", "bmi for adults", "healthy weight range"],
    steps: [
      "Choose metric (centimetres and kilograms) or US units (feet, inches and pounds).",
      "Enter your height and weight.",
      "Read your BMI and the adult category.",
      "See the weight range that gives a BMI from 18.5 to 24.9 at your height.",
    ],
    explanation: [
      "Body mass index is weight in kilograms divided by height in metres squared. A person who is 1.75 metres tall and weighs 70 kg has a BMI of 70 ÷ (1.75 × 1.75) = 22.9. The World Health Organization groups adult BMI as under 18.5 underweight, 18.5 to 24.9 healthy weight range, 25 to 29.9 overweight and 30 and above obesity range.",
      "BMI is a quick screening number, not a measure of health. It cannot tell muscle from fat, it does not show where weight is carried, and the categories do not fit everyone equally, for example very muscular people or older adults. It also applies to adults aged 20 and over. For children and teenagers, doctors compare BMI with percentile charts for their age and sex, which this calculator does not do.",
      "Use the result as a starting point for a conversation with a doctor or other health professional, who can look at your whole situation. This calculator gives general information and is not medical advice.",
    ],
    formula: [
      "BMI = weight (kg) ÷ height (m)². In pounds and inches, the same number is 703 × weight (lb) ÷ height (in)².",
      "The weight range uses the BMI limits 18.5 and 24.9 with your height.",
    ],
    worked: () => {
      const a = bmi(70, 1.75);
      const b = bmi(154 / 2.2046226218, (69 * 2.54) / 100);
      return [
        `70 kg at 175 cm gives a BMI of ${a.toFixed(1)}, which is in the ${bmiCategory(a).toLowerCase()}.`,
        `154 lb at 5 ft 9 in gives a BMI of ${b.toFixed(1)}, about the same as the first example.`,
      ];
    },
    tips: [
      "Measure height without shoes and weight at the same time of day for steadier numbers.",
      "Treat BMI as one number among several. Waist size, fitness and medical history matter too.",
      "If you are worried about your weight, speak to a doctor or other health professional.",
    ],
    faqs: [
      { q: "How is BMI calculated?", a: "Divide weight in kilograms by height in metres squared." },
      { q: "What is a healthy BMI?", a: "For most adults, the WHO healthy range is 18.5 to 24.9. It is a screening range, not a personal target." },
      { q: "Is BMI accurate for athletes?", a: "Often not. It does not separate muscle from fat, so a muscular person can have a high BMI without excess body fat." },
      { q: "Can I use it for a child?", a: "No. Children and teenagers are assessed with age and sex percentile charts." },
      PRIVACY,
    ],
    related: ["age-calculator", "percentage-calculator", "gpa-calculator", "date-calculator"],
  },
];
