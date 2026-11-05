import type { CalculatorTool } from "./calculatorTools.ts";
import { average, fracOp, gcd, lcm, mixed, stats } from "../lib/calcDefsMath.ts";

const PRIVACY = { q: "Are my numbers saved or sent anywhere?", a: "No. The calculation runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const avgOf = (s: string) => average.compute({ items: s }).rows![0].value;

export const mathCalculatorTools: CalculatorTool[] = [
  {
    slug: "fraction-calculator",
    calc: "fraction",
    h1: "Fraction Calculator",
    title: "Fraction Calculator: Add, Subtract, Multiply, Divide Fractions",
    description: "Add, subtract, multiply and divide fractions. Get the answer in lowest terms, as a mixed number and as a decimal. Free and private.",
    summary: "Add, subtract, multiply and divide two fractions.",
    intro: "Enter two fractions and choose an operation to get the answer in lowest terms, as a mixed number and as a decimal.",
    keywords: ["fraction calculator", "add fractions", "subtract fractions", "multiply fractions", "divide fractions", "simplify fractions"],
    steps: ["Enter the top and bottom of the first fraction.", "Choose add, subtract, multiply or divide.", "Enter the second fraction.", "Read the answer in lowest terms, as a mixed number and as a decimal."],
    explanation: [
      "To add or subtract fractions, give them the same denominator first: 1/2 + 1/3 becomes 3/6 + 2/6 = 5/6. To multiply, multiply the tops and the bottoms. To divide, flip the second fraction and multiply.",
      "The answer is reduced by dividing the top and bottom by their greatest common factor. A top larger than the bottom can also be shown as a mixed number: 7/3 is 2 1/3.",
    ],
    formula: ["a/b + c/d = (ad + cb) ÷ bd", "a/b × c/d = ac ÷ bd", "a/b ÷ c/d = ad ÷ bc"],
    worked: () => {
      const f = (n: number, d: number) => ({ n, d });
      const r = (a: [number, number], b: [number, number], op: string) => {
        const x = fracOp(f(...a), f(...b), op);
        return `${x.n}/${x.d}${x.d === 1 ? "" : ` (${mixed(x)})`}`;
      };
      return [`1/2 + 1/3 = ${r([1, 2], [1, 3], "+")}`, `3/4 − 1/4 = ${r([3, 4], [1, 4], "-")}`, `2/3 × 3/4 = ${r([2, 3], [3, 4], "*")}`, `1/2 ÷ 1/4 = ${r([1, 2], [1, 4], "/")}`];
    },
    tips: ["Enter a negative sign on the top number for negative fractions.", "The denominator cannot be zero.", "Use whole numbers only for the top and bottom."],
    faqs: [
      { q: "How do you add fractions with different denominators?", a: "Rewrite both with a common denominator, add the tops, then simplify." },
      { q: "How do you simplify a fraction?", a: "Divide the top and bottom by their greatest common factor." },
      { q: "How do you divide fractions?", a: "Flip the second fraction (swap its top and bottom) and multiply." },
      PRIVACY,
    ],
    related: ["gcf-lcm-calculator", "percentage-calculator", "ratio-calculator", "average-calculator"],
  },
  {
    slug: "average-calculator",
    calc: "average",
    h1: "Average Calculator",
    title: "Average Calculator: Mean, Median, Mode and Range",
    description: "Find the average (mean), median, mode, sum, range, smallest and largest of a list of numbers. Free and private, runs in your browser.",
    summary: "Find the mean, median, mode and range of a list of numbers.",
    intro: "Paste or type a list of numbers to get the mean, median, mode, sum and range.",
    keywords: ["average calculator", "mean median mode calculator", "mean calculator", "median calculator", "mode calculator", "range calculator"],
    steps: ["Type or paste your numbers, separated by commas, spaces or new lines.", "Read the average (mean), median and mode.", "Check the sum, count, smallest, largest and range."],
    explanation: [
      "The mean (usual average) is the sum divided by the count. The median is the middle value when the numbers are sorted, or the average of the two middle values. The mode is the value that appears most often.",
      "The range is the largest value minus the smallest. If no value repeats, there is no mode.",
    ],
    formula: ["Mean = sum ÷ count.", "Median = middle value of the sorted list.", "Range = largest − smallest."],
    worked: () => {
      const s = stats([12, 15, 18, 15, 20]);
      return [`12, 15, 18, 15, 20: mean ${avgOf("12, 15, 18, 15, 20")}, median ${s.median}, mode ${s.modes.join(", ")}, range ${s.range}.`, `1, 2, 3, 4: mean ${avgOf("1,2,3,4")}, median 2.5.`];
    },
    tips: ["A few very large or small values pull the mean, but not the median.", "You can paste a column from a spreadsheet."],
    faqs: [
      { q: "How do you calculate the average?", a: "Add all the numbers and divide by how many there are." },
      { q: "What is the difference between mean and median?", a: "The mean is the sum divided by the count. The median is the middle value of the sorted list." },
      { q: "Can there be more than one mode?", a: "Yes. If several values tie for the most frequent, all of them are modes." },
      PRIVACY,
    ],
    related: ["standard-deviation-calculator", "percentage-calculator", "grade-calculator", "fraction-calculator"],
  },
  {
    slug: "ratio-calculator",
    calc: "ratio",
    h1: "Ratio Calculator",
    title: "Ratio Calculator: Simplify Ratios and Solve A : B = C : D",
    description: "Simplify a ratio to its lowest terms and solve for the missing number in A : B = C : D. Free and private, runs in your browser.",
    summary: "Simplify a ratio and solve for the missing value.",
    intro: "Enter A, B and C to find D so that A : B = C : D, and see the ratio in its simplest form.",
    keywords: ["ratio calculator", "simplify ratio", "ratio solver", "proportion calculator", "a:b = c:d"],
    steps: ["Enter A and B, the ratio you know.", "Enter C, the number that matches A.", "Read D, the missing number, and the simplified ratio."],
    explanation: [
      "A ratio compares two amounts. 3 : 4 means 3 parts to 4 parts. Two ratios are equal if they simplify to the same form, so 3 : 4 = 9 : 12.",
      "To find the missing number in A : B = C : D, multiply B by C and divide by A. For 3 : 4 = 9 : D, D = 4 × 9 ÷ 3 = 12.",
    ],
    formula: ["D = B × C ÷ A.", "Simplify by dividing A and B by their greatest common factor."],
    worked: () => ["3 : 4 = 9 : 12", `12 : 18 simplifies to ${12 / gcd(12, 18)} : ${18 / gcd(12, 18)}.`, "5 : 2 = 20 : 8"],
    tips: ["Use the same units on both sides, such as both in cm.", "To scale a recipe, set A and B to the old and new amounts."],
    faqs: [
      { q: "How do you simplify a ratio?", a: "Divide both numbers by their greatest common factor." },
      { q: "How do you solve a proportion?", a: "Cross-multiply: for A : B = C : D, D = B × C ÷ A." },
      PRIVACY,
    ],
    related: ["fraction-calculator", "percentage-calculator", "gcf-lcm-calculator", "average-calculator"],
  },
  {
    slug: "percentage-change-calculator",
    calc: "percent-change",
    h1: "Percentage Change Calculator",
    title: "Percentage Change Calculator: Percent Increase or Decrease",
    description: "Work out the percentage increase or decrease between two values. Shows the change and the signed percentage. Free and private.",
    summary: "Work out the percentage increase or decrease between two values.",
    intro: "Enter a starting value and a new value to see the percentage increase or decrease.",
    keywords: ["percentage change calculator", "percent increase calculator", "percent decrease calculator", "percent difference", "percentage increase"],
    steps: ["Enter the starting value.", "Enter the new value.", "Read the percentage increase or decrease."],
    explanation: [
      "Percentage change shows how much a value moved compared with where it started. From 80 to 100 is a rise of 20, which is 25% of 80.",
      "The starting value cannot be zero, because a percentage change from zero is not defined. A fall from 100 to 75 is a 25% decrease, but a rise from 75 back to 100 is about 33.3%, because the starting value is different.",
    ],
    formula: ["Percentage change = (new − old) ÷ |old| × 100."],
    worked: () => ["80 to 100: +25%", "100 to 75: −25%", "75 to 100: +33.3333%"],
    tips: ["A percentage increase and the matching decrease are not equal.", "For a difference between two peers, with neither as the base, use a different formula."],
    faqs: [
      { q: "How do you calculate percentage increase?", a: "Subtract the old value from the new, divide by the old value, and multiply by 100." },
      { q: "Why is a 25% fall not undone by a 25% rise?", a: "The second percentage applies to the smaller number, so it adds back less." },
      PRIVACY,
    ],
    related: ["percentage-calculator", "discount-calculator", "average-calculator", "roi-calculator"],
  },
  {
    slug: "scientific-notation-converter",
    calc: "scientific-notation",
    h1: "Scientific Notation Converter",
    title: "Scientific Notation Converter: E-Notation and Engineering",
    description: "Convert any number to scientific notation, e-notation and engineering notation. Handles very large and very small numbers. Free and private.",
    summary: "Convert a number to scientific, e- and engineering notation.",
    intro: "Type a number to see it in scientific notation, e-notation and engineering notation.",
    keywords: ["scientific notation converter", "scientific notation calculator", "standard form calculator", "e notation", "engineering notation"],
    steps: ["Type a number, or e-notation such as 1.5e-7.", "Read the scientific, e- and engineering notation."],
    explanation: [
      "Scientific notation writes a number as a value between 1 and 10 times a power of ten. 123,456 becomes 1.23456 × 10⁵, and 0.00042 becomes 4.2 × 10⁻⁴.",
      "E-notation is the same idea as used by calculators and spreadsheets: 1.23456e+5. Engineering notation uses powers of ten that are multiples of three, such as 123.456 × 10³, to match prefixes like kilo and mega. Outside the UK this is often called scientific notation, and in the UK it may be called standard form.",
    ],
    formula: ["N = m × 10ⁿ, where 1 ≤ |m| < 10 and n is a whole number."],
    worked: () => ["123,456 = 1.23456 × 10⁵", "0.00042 = 4.2 × 10⁻⁴", "6,022,000,000 = 6.022 × 10⁹"],
    tips: ["Large exponents work: type 1e30.", "Move the decimal point left for a positive exponent on large numbers."],
    faqs: [
      { q: "How do you write a number in scientific notation?", a: "Move the decimal point until one non-zero digit is left of it, and count the moves as the power of ten." },
      { q: "What is e notation?", a: "A text form of scientific notation, where e+5 means × 10⁵." },
      PRIVACY,
    ],
    related: ["percentage-calculator", "fraction-calculator", "binary-to-decimal", "average-calculator"],
  },
  {
    slug: "gcf-lcm-calculator",
    calc: "gcf-lcm",
    h1: "GCF and LCM Calculator",
    title: "GCF and LCM Calculator: Find the HCF and Least Common Multiple",
    description: "Find the greatest common factor (GCF, HCF, GCD) and the least common multiple (LCM) of two to ten numbers. Free and private.",
    summary: "Find the GCF (HCF) and LCM of up to ten numbers.",
    intro: "Enter two to ten whole numbers to find their greatest common factor and least common multiple.",
    keywords: ["gcf calculator", "lcm calculator", "hcf calculator", "gcd calculator", "greatest common factor", "least common multiple"],
    steps: ["Type two to ten whole numbers, separated by commas or spaces.", "Read the GCF (HCF) and the LCM."],
    explanation: [
      "The greatest common factor is the largest number that divides every number in the list. The least common multiple is the smallest number that every number in the list divides into.",
      "The GCF is used to simplify fractions, and the LCM to find a common denominator when adding fractions. For two numbers, GCF × LCM equals their product.",
    ],
    formula: ["GCF by the Euclidean algorithm: gcd(a, b) = gcd(b, a mod b).", "LCM(a, b) = a × b ÷ GCF(a, b)."],
    worked: () => [`12, 18, 30: GCF ${[12, 18, 30].reduce(gcd)}, LCM ${[12, 18, 30].reduce(lcm)}.`, `4, 6: GCF ${gcd(4, 6)}, LCM ${lcm(4, 6)}.`],
    tips: ["Use the GCF to simplify a fraction.", "Use the LCM as the common denominator when adding fractions."],
    faqs: [
      { q: "Are GCF, HCF and GCD the same?", a: "Yes. They are different names for the greatest common factor." },
      { q: "How do you find the LCM?", a: "Divide the product of two numbers by their GCF. For more numbers, repeat for each one in turn." },
      PRIVACY,
    ],
    related: ["fraction-calculator", "ratio-calculator", "average-calculator", "percentage-calculator"],
  },
  {
    slug: "standard-deviation-calculator",
    calc: "std-dev",
    h1: "Standard Deviation Calculator",
    title: "Standard Deviation Calculator: Sample, Population and Variance",
    description: "Find the standard deviation and variance of a list of numbers, for a sample or a whole population. Shows the mean and count. Free and private.",
    summary: "Find the standard deviation and variance of a list of numbers.",
    intro: "Paste a list of numbers and choose sample or population to get the standard deviation and variance.",
    keywords: ["standard deviation calculator", "variance calculator", "sample standard deviation", "population standard deviation", "std dev calculator"],
    steps: ["Type or paste your numbers.", "Choose whether the data is a sample or the whole population.", "Read the standard deviation, variance and mean."],
    explanation: [
      "Standard deviation measures how spread out numbers are around their mean. A small value means the numbers sit close to the mean. A large one means they are widely spread.",
      "Use the sample version when your numbers are a sample from a larger group, which divides by n − 1. Use the population version when you have every value, which divides by n.",
    ],
    formula: ["Population: σ = √(Σ(x − mean)² ÷ n).", "Sample: s = √(Σ(x − mean)² ÷ (n − 1))."],
    worked: () => ["2, 4, 4, 4, 5, 5, 7, 9 (population): standard deviation 2, mean 5.", "4, 8, 6, 5, 3, 7 (sample): standard deviation 1.870829, mean 5.5."],
    tips: ["When unsure, sample is the usual choice.", "Variance is the square of the standard deviation."],
    faqs: [
      { q: "What is the difference between sample and population standard deviation?", a: "The sample version divides by n − 1 to correct for a sample being less spread than the whole group. The population version divides by n." },
      { q: "What does a high standard deviation mean?", a: "The values are spread widely around the mean." },
      PRIVACY,
    ],
    related: ["average-calculator", "percentage-change-calculator", "fraction-calculator", "gpa-calculator"],
  },
];
