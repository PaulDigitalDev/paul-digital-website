import type { Faq } from "./formatTools";
import { baseName, group, parseInBase, toBase, toRoman } from "../lib/numberBases.ts";

export interface MathTool {
  slug: string;
  kind: "base" | "roman";
  from: number;
  to: number;
  value: string;
  h1: string;
  title: string;
  description: string;
  summary: string;
  intro: string;
  keywords: string[];
  steps: string[];
  explanation: string[];
  formula: string[];
  worked: () => string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

const PRIVACY: Faq = { q: "Are my numbers saved or sent anywhere?", a: "No. The conversion runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const NAME: Record<number, string> = { 2: "binary", 8: "octal", 10: "decimal", 16: "hexadecimal" };
const SHORT: Record<number, string> = { 2: "Binary", 8: "Octal", 10: "Decimal", 16: "Hex" };
const conv = (v: string, a: number, b: number) => group(toBase(parseInBase(v, a)!, b), b);

interface Spec {
  slug: string;
  from: number;
  to: number;
  value: string;
  samples: string[];
  explanation: string[];
  formula: string[];
  tip: string;
  related: string[];
}

const SPECS: Spec[] = [
  {
    slug: "binary-to-decimal", from: 2, to: 10, value: "1010", samples: ["1", "1010", "11111111", "100000000"],
    explanation: ["Each binary digit is worth a power of two, counting from the right: 1, 2, 4, 8, 16 and so on. Add up the powers where there is a 1. For 1010 that is 8 + 2 = 10.", "Computers store everything in binary, so this conversion shows up in networking, programming and electronics classes."],
    formula: ["Decimal = sum of (digit × 2^position), counting positions from 0 on the right.", "Example: 1101 = 1×8 + 1×4 + 0×2 + 1×1 = 13."],
    tip: "Long binary numbers are easier to read in groups of four digits. Spaces are ignored.", related: ["decimal-to-binary", "binary-to-hex", "hex-to-decimal", "roman-numeral-converter"],
  },
  {
    slug: "decimal-to-binary", from: 10, to: 2, value: "255", samples: ["10", "42", "255", "1024"],
    explanation: ["To convert decimal to binary, divide the number by 2 again and again and write down the remainders. Read the remainders from last to first. For 10: 10÷2=5 r0, 5÷2=2 r1, 2÷2=1 r0, 1÷2=0 r1, which reads 1010.", "Each position in the answer is a power of two, so 255 is eight 1s in a row (128+64+32+16+8+4+2+1)."],
    formula: ["Divide by 2 repeatedly and collect the remainders from bottom to top."],
    tip: "The result is grouped in fours for readability. Remove the spaces if you need to paste it into code.", related: ["binary-to-decimal", "decimal-to-hex", "hex-to-binary", "binary-to-hex"],
  },
  {
    slug: "hex-to-decimal", from: 16, to: 10, value: "FF", samples: ["A", "FF", "1A3", "FFFF"],
    explanation: ["Hexadecimal uses 16 digits: 0 to 9 and then A to F for 10 to 15. Each position is worth a power of 16. So FF is 15×16 + 15 = 255, and 1A3 is 1×256 + 10×16 + 3 = 419.", "Hex is common in web colors (such as #FF8800), memory addresses and character codes."],
    formula: ["Decimal = sum of (digit × 16^position), counting positions from 0 on the right.", "A=10, B=11, C=12, D=13, E=14, F=15."],
    tip: "You can type lowercase or uppercase letters, and an optional 0x prefix is accepted.", related: ["decimal-to-hex", "hex-to-binary", "binary-to-hex", "binary-to-decimal"],
  },
  {
    slug: "decimal-to-hex", from: 10, to: 16, value: "255", samples: ["10", "255", "4095", "65535"],
    explanation: ["To convert decimal to hexadecimal, divide by 16 repeatedly and write the remainders, using A to F for 10 to 15. Read the remainders from last to first. For 255: 255÷16=15 r15, 15÷16=0 r15, which reads FF.", "Two hex digits cover one byte (0 to 255), which is why colors and byte values are written in hex."],
    formula: ["Divide by 16 repeatedly and collect the remainders from bottom to top, using A–F for 10–15."],
    tip: "For a web color, convert each of the red, green and blue values (0 to 255) to two hex digits.", related: ["hex-to-decimal", "decimal-to-binary", "hex-to-binary", "binary-to-hex"],
  },
  {
    slug: "binary-to-hex", from: 2, to: 16, value: "11111111", samples: ["1010", "11111111", "101010111100", "1111000011110000"],
    explanation: ["Binary converts to hexadecimal neatly because 16 is 2 to the fourth power. Split the binary number into groups of four digits from the right, and convert each group to one hex digit. For 1111 0000, that is F and 0, so F0.", "If the leftmost group has fewer than four digits, pad it with zeros on the left."],
    formula: ["Group the bits in fours from the right. Convert each group: 0000=0 … 1001=9, 1010=A … 1111=F."],
    tip: "This is the quickest base conversion to do by hand: no arithmetic is needed, only the 16 four-bit patterns.", related: ["hex-to-binary", "binary-to-decimal", "decimal-to-binary", "hex-to-decimal"],
  },
  {
    slug: "hex-to-binary", from: 16, to: 2, value: "2F", samples: ["A", "2F", "FF", "1A3"],
    explanation: ["Each hexadecimal digit becomes exactly four binary digits, so conversion is digit by digit. For 2F: 2 is 0010 and F is 1111, which gives 0010 1111.", "Leading zeros in the first group do not change the value."],
    formula: ["Replace each hex digit with its four-bit pattern: 0=0000, 1=0001 … 9=1001, A=1010 … F=1111."],
    tip: "To see the value in decimal as well, look at the table under the result.", related: ["binary-to-hex", "hex-to-decimal", "decimal-to-hex", "decimal-to-binary"],
  },
  {
    slug: "octal-to-decimal", from: 8, to: 10, value: "755", samples: ["7", "17", "755", "777"],
    explanation: ["Octal uses digits 0 to 7, and each position is a power of 8. So 755 is 7×64 + 5×8 + 5 = 493. Octal is best known for Unix file permissions such as 755 and 644.", "Each octal digit stands for three binary digits, so 7 is 111 and 5 is 101."],
    formula: ["Decimal = sum of (digit × 8^position), counting positions from 0 on the right."],
    tip: "In Unix permissions the digits mean read (4), write (2) and execute (1), added together for owner, group and others.", related: ["binary-to-decimal", "decimal-to-binary", "hex-to-decimal", "binary-to-hex"],
  },
];

function buildBase(s: Spec): MathTool {
  const a = NAME[s.from];
  const b = NAME[s.to];
  const h1 = `${SHORT[s.from]} to ${SHORT[s.to]}`;
  return {
    slug: s.slug,
    kind: "base",
    from: s.from,
    to: s.to,
    value: s.value,
    h1: `${h1} Converter`,
    title: `${h1} Converter: ${a[0].toUpperCase() + a.slice(1)} to ${b[0].toUpperCase() + b.slice(1)} With Steps`,
    description: `Convert ${a} numbers to ${b} instantly, with the method explained and worked examples. Handles very long numbers. Free, private, runs in your browser.`,
    summary: `Convert ${a} numbers to ${b}.`,
    intro: `Type a ${a} number to see it in ${b}, and in the other number bases.`,
    keywords: [`${a} to ${b}`, `${a} to ${b} converter`, `convert ${a} to ${b}`, `${SHORT[s.from].toLowerCase()} to ${SHORT[s.to].toLowerCase()} calculator`, `${a} to ${b} chart`],
    steps: ["Type the number (spaces and prefixes such as 0x are fine).", "Check the From and To bases, or change them.", "Read the result, and the same number in every base in the table."],
    explanation: s.explanation,
    formula: s.formula,
    worked: () => s.samples.map((v) => `${baseName(s.from).split(" ")[0]} ${v} = ${conv(v, s.from, s.to)} (${baseName(s.to).split(" ")[0].toLowerCase()})`),
    tips: [s.tip, "Very long numbers are handled exactly, up to 200 digits.", "Negative numbers are accepted with a minus sign."],
    faqs: [
      { q: `How do I convert ${a} to ${b}?`, a: s.formula[0] },
      { q: `What is ${s.samples[1]} in ${b}?`, a: `${s.samples[1]} in ${a} is ${conv(s.samples[1], s.from, s.to)} in ${b}.` },
      { q: "Can I use lowercase letters or a prefix?", a: "Yes. Lowercase letters work, and prefixes such as 0b, 0o and 0x are accepted." },
      PRIVACY,
    ],
    related: s.related,
  };
}

const roman: MathTool = {
  slug: "roman-numeral-converter",
  kind: "roman",
  from: 10,
  to: 10,
  value: "1994",
  h1: "Roman Numeral Converter",
  title: "Roman Numeral Converter: Numbers to Roman Numerals and Back",
  description: "Convert numbers to Roman numerals and Roman numerals to numbers, from 1 to 3999. Includes the rules and examples. Free, private, runs in your browser.",
  summary: "Convert numbers to Roman numerals, and Roman numerals to numbers.",
  intro: "Type a number from 1 to 3999 to get the Roman numeral, or type a Roman numeral to get the number.",
  keywords: ["roman numeral converter", "roman numerals", "number to roman numerals", "roman numerals to number", "roman numeral chart", "year in roman numerals"],
  steps: ["Type a number (1 to 3999) or a Roman numeral such as MCMXCIV.", "Read the converted value below."],
  explanation: [
    "Roman numerals use seven letters: I=1, V=5, X=10, L=50, C=100, D=500 and M=1000. Letters are added from largest to smallest, so VIII is 5+3=8. A smaller letter before a larger one is subtracted, so IV is 4 and IX is 9.",
    "Only I, X and C can be subtracted, and only from the next two larger letters. A letter is not repeated more than three times in a row, so 4 is IV and not IIII. The usual limit is 3999, because there is no standard symbol for 5000.",
  ],
  formula: ["Subtractive pairs: IV=4, IX=9, XL=40, XC=90, CD=400, CM=900.", "Example: 1994 = M (1000) + CM (900) + XC (90) + IV (4) = MCMXCIV."],
  worked: () => [1, 4, 9, 14, 40, 90, 400, 1994, 2024, 3999].map((n) => `${n} = ${toRoman(n)}`),
  tips: ["Years are common: 2026 is MMXXVI.", "Letters can be typed in lowercase.", "Non-standard forms such as IIII or IC are rejected, because they are not the standard way to write those numbers."],
  faqs: [
    { q: "How do you write 2026 in Roman numerals?", a: `2026 is ${toRoman(2026)}.` },
    { q: "What is the largest Roman numeral?", a: "In standard form the largest is MMMCMXCIX, which is 3999." },
    { q: "Is there a zero in Roman numerals?", a: "No. The Roman system had no symbol for zero." },
    PRIVACY,
  ],
  related: ["binary-to-decimal", "hex-to-decimal", "decimal-to-binary", "percentage-calculator"],
};

export const mathTools: MathTool[] = [...SPECS.map(buildBase), roman];
export const mathToolBySlug = new Map(mathTools.map((t) => [t.slug, t]));
