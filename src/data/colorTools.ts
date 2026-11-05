import type { Faq } from "./formatTools";
import { hslCss, parseHex, rgbCss, rgbToHsl } from "../lib/colorConvert.ts";

export interface ColorTool {
  slug: string;
  hex: string;
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

const PRIVACY: Faq = { q: "Are my colors saved or sent anywhere?", a: "No. The conversion runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };
const STEPS = ["Type a color in HEX, RGB or HSL, or use the color picker.", "The other formats update as you type.", "Copy the format you need from the result."];
const SAMPLES = ["#FF0000", "#FF8800", "#00A86B", "#1E90FF", "#FFFFFF", "#000000"];
const hx = (h: string) => { const c = parseHex(h)!; return `${h} = ${rgbCss(c)} = ${hslCss(rgbToHsl(c))}`; };

const BASE_FORMULA = ["HEX #RRGGBB: each pair of digits is a number from 0 to 255 in base 16 (hexadecimal).", "RGB: red, green and blue values from 0 to 255.", "HSL: hue 0 to 360 degrees, saturation and lightness 0 to 100%."];
const BASE_TIPS = ["A 3-digit HEX such as #F80 is shorthand for #FF8800.", "Use HSL when you want to make a color lighter or darker: change only the lightness.", "Check text and background contrast before you use a color pair on a page."];

export const colorTools: ColorTool[] = [
  {
    slug: "color-converter",
    hex: "#FF8800",
    h1: "Color Converter (HEX, RGB, HSL)",
    title: "Color Converter: HEX, RGB and HSL With Color Picker",
    description: "Convert colors between HEX, RGB and HSL. Type any format or use the color picker and get the others instantly. Free, private, runs in your browser.",
    summary: "Convert colors between HEX, RGB and HSL.",
    intro: "Type a color in HEX, RGB or HSL, or pick one, and get the same color in the other formats.",
    keywords: ["color converter", "hex to rgb", "rgb to hex", "hex to hsl", "color code converter", "color picker"],
    steps: STEPS,
    explanation: [
      "Web colors can be written in several formats. HEX is a compact code such as #FF8800. RGB gives the amounts of red, green and blue from 0 to 255. HSL describes a color by hue (the position on the color wheel), saturation (how vivid) and lightness (how light or dark).",
      "All three describe the same colors, so converting between them does not change how the color looks. Designers often use HEX or RGB in code and HSL when adjusting shades.",
    ],
    formula: BASE_FORMULA,
    worked: () => SAMPLES.map(hx),
    tips: BASE_TIPS,
    faqs: [
      { q: "What is a HEX color code?", a: "A six-digit code that gives red, green and blue in hexadecimal, such as #FF8800 for orange." },
      { q: "How do I convert HEX to RGB?", a: "Split the code into three pairs and convert each pair from hexadecimal to a number from 0 to 255." },
      { q: "What is HSL?", a: "Hue, saturation and lightness: a way to describe a color that is easier to adjust by eye than RGB." },
      PRIVACY,
    ],
    related: ["hex-to-rgb", "rgb-to-hex", "hex-to-hsl", "hex-to-decimal"],
  },
  {
    slug: "hex-to-rgb",
    hex: "#1E90FF",
    h1: "HEX to RGB Converter",
    title: "HEX to RGB Converter: Color Code to RGB Values",
    description: "Convert a HEX color code to RGB values instantly. For example #FF8800 is rgb(255, 136, 0). Includes HSL and a color preview. Free and private.",
    summary: "Convert a HEX color code to RGB.",
    intro: "Type a HEX color code to get its RGB values, plus the HSL form and a preview.",
    keywords: ["hex to rgb", "hex to rgb converter", "hex color to rgb", "hex code to rgb", "html color code to rgb"],
    steps: STEPS,
    explanation: [
      "A HEX code has three pairs of hexadecimal digits for red, green and blue. To get RGB, convert each pair to decimal: in #1E90FF, 1E is 30, 90 is 144 and FF is 255, so the color is rgb(30, 144, 255).",
      "A three-digit code is shorthand where each digit is doubled, so #F80 means #FF8800. The # sign is optional here.",
    ],
    formula: ["R = first pair, G = second pair, B = third pair, each converted from base 16 to base 10.", "Example: #FF8800 → R = FF = 255, G = 88 = 136, B = 00 = 0."],
    worked: () => ["#FF0000", "#FF8800", "#1E90FF", "#00A86B"].map(hx),
    tips: BASE_TIPS,
    faqs: [
      { q: "How do I convert #FF8800 to RGB?", a: "FF is 255, 88 is 136 and 00 is 0, so it is rgb(255, 136, 0)." },
      { q: "Does it accept 3-digit HEX codes?", a: "Yes. #F80 is read as #FF8800." },
      PRIVACY,
    ],
    related: ["rgb-to-hex", "color-converter", "hex-to-hsl", "hex-to-decimal"],
  },
  {
    slug: "rgb-to-hex",
    hex: "#00A86B",
    h1: "RGB to HEX Converter",
    title: "RGB to HEX Converter: RGB Values to Color Code",
    description: "Convert RGB values to a HEX color code instantly. For example rgb(255, 136, 0) is #FF8800. Includes HSL and a color preview. Free and private.",
    summary: "Convert RGB values to a HEX color code.",
    intro: "Type RGB values such as rgb(255, 136, 0) to get the HEX code, plus the HSL form and a preview.",
    keywords: ["rgb to hex", "rgb to hex converter", "rgb to hex color", "rgb to html color code", "rgb to hexadecimal"],
    steps: ["Type the RGB values in the RGB box, for example 255, 136, 0.", "The HEX code and HSL update as you type.", "Copy the HEX code from the result."],
    explanation: [
      "To convert RGB to HEX, turn each of the red, green and blue values (0 to 255) into a two-digit hexadecimal number and join them after a #. For rgb(255, 136, 0): 255 is FF, 136 is 88 and 0 is 00, giving #FF8800.",
      "Values must be whole numbers from 0 to 255. Single-digit hex results are padded with a zero, so 10 becomes 0A.",
    ],
    formula: ["HEX = # + hex(R) + hex(G) + hex(B), each padded to two digits.", "Example: rgb(0, 168, 107) → 00 + A8 + 6B = #00A86B."],
    worked: () => ["#FF0000", "#FF8800", "#00A86B", "#1E90FF"].map(hx),
    tips: BASE_TIPS,
    faqs: [
      { q: "How do I convert RGB to HEX?", a: "Convert each of R, G and B to a two-digit hexadecimal number and put them together after #." },
      { q: "What is rgb(0, 0, 0) in HEX?", a: "#000000, which is black. rgb(255, 255, 255) is #FFFFFF, white." },
      PRIVACY,
    ],
    related: ["hex-to-rgb", "color-converter", "hex-to-hsl", "decimal-to-hex"],
  },
  {
    slug: "hex-to-hsl",
    hex: "#FF8800",
    h1: "HEX to HSL Converter",
    title: "HEX to HSL Converter: Color Code to Hue, Saturation, Lightness",
    description: "Convert a HEX color code to HSL (hue, saturation, lightness). For example #FF8800 is hsl(32, 100%, 50%). Includes RGB and a preview. Free and private.",
    summary: "Convert a HEX color code to HSL.",
    intro: "Type a HEX color code to get its HSL values, plus RGB and a preview.",
    keywords: ["hex to hsl", "hex to hsl converter", "hex color to hsl", "rgb to hsl", "hsl to hex"],
    steps: STEPS,
    explanation: [
      "HSL describes a color as hue (an angle from 0 to 360 degrees around the color wheel, where 0 is red, 120 is green and 240 is blue), saturation (0% is gray, 100% is vivid) and lightness (0% is black, 100% is white).",
      "The converter first reads the HEX code as RGB, then works out hue, saturation and lightness from the largest and smallest of the three values. To make a color lighter or darker, change only the L value and convert back.",
    ],
    formula: ["Lightness = (max + min) ÷ 2 of R, G, B scaled to 0–1.", "Saturation = (max − min) ÷ (1 − |2L − 1|). Hue depends on which of R, G or B is largest."],
    worked: () => ["#FF0000", "#FF8800", "#00A86B", "#1E90FF"].map(hx),
    tips: ["Type HSL in the HSL box to convert HSL to HEX the other way.", ...BASE_TIPS.slice(1)],
    faqs: [
      { q: "What is #FF8800 in HSL?", a: `${hslCss(rgbToHsl(parseHex("#FF8800")!))}.` },
      { q: "How do I convert HSL to HEX?", a: "Type the HSL value into the HSL box. The HEX code appears in the result." },
      PRIVACY,
    ],
    related: ["color-converter", "hex-to-rgb", "rgb-to-hex", "binary-to-hex"],
  },
];

export const colorToolBySlug = new Map(colorTools.map((t) => [t.slug, t]));
