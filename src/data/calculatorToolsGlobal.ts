import type { CalculatorTool } from "./calculatorTools.ts";
import { discountResult, fuelUsed, taxResult, tipResult } from "../lib/calcDefsGlobal.ts";

const m = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PRIVACY = { q: "Are my numbers saved or sent anywhere?", a: "No. The calculation runs in your browser on your own device. Nothing you type is sent to Paul Digital or any other server." };

export const globalCalculatorTools: CalculatorTool[] = [
  {
    slug: "discount-calculator",
    calc: "discount",
    h1: "Discount Calculator",
    title: "Discount Calculator: Sale Price and Savings, With Extra Discount",
    description: "Work out the sale price and how much you save from the original price and discount percentage. Handles a second discount too. Free and private.",
    summary: "Work out the sale price and savings from a percentage discount.",
    intro: "Enter the original price and the discount to see the final price and how much you save.",
    keywords: ["discount calculator", "sale price calculator", "percent off calculator", "how to calculate discount", "double discount calculator"],
    steps: ["Enter the original price.", "Enter the discount percentage.", "Add an extra discount if there is one.", "Read the final price and your savings."],
    explanation: [
      "A percentage discount takes that share off the original price. A 20% discount on 100 leaves 80, so you save 20.",
      "When a second discount is applied after the first, it comes off the already reduced price. So 20% off followed by 10% off is a total of 28% off, not 30%.",
    ],
    formula: ["Final price = original price × (1 − discount ÷ 100).", "With two discounts: final = original × (1 − d1 ÷ 100) × (1 − d2 ÷ 100).", "You save = original price − final price."],
    worked: () => {
      const a = discountResult(100, 20, 0);
      const b = discountResult(100, 20, 10);
      const c = discountResult(250, 35, 0);
      return [`20% off 100: final ${m(a.final)}, you save ${m(a.saved)}.`, `20% then 10% off 100: final ${m(b.final)}, total discount ${b.effective}%.`, `35% off 250: final ${m(c.final)}.`];
    },
    tips: ["Compare the final price, not just the percentage, when two offers differ.", "Check whether tax is added after the discount."],
    faqs: [
      { q: "How do I calculate a percentage discount?", a: "Multiply the price by the discount percentage divided by 100 to get the saving, then subtract it from the price." },
      { q: "Is 20% plus 10% the same as 30% off?", a: "No. The second discount applies to the reduced price, so the total is 28%." },
      { q: "Does this work for any currency?", a: "Yes. Amounts have no currency symbol, so use any currency." },
      PRIVACY,
    ],
    related: ["percentage-calculator", "sales-tax-calculator", "tip-calculator", "fuel-cost-calculator"],
  },
  {
    slug: "tip-calculator",
    calc: "tip",
    h1: "Tip Calculator",
    title: "Tip Calculator: Tip, Total and Split the Bill",
    description: "Work out the tip and total from the bill and tip percentage, and split the cost between any number of people. Free and private.",
    summary: "Work out the tip and total, and split the bill between people.",
    intro: "Enter the bill, choose a tip percentage and the number of people to see the tip and what each person pays.",
    keywords: ["tip calculator", "gratuity calculator", "bill splitter", "restaurant tip calculator", "split the bill"],
    steps: ["Enter the bill amount.", "Enter the tip percentage.", "Enter how many people are sharing the bill.", "Read the tip, the total and each person's share."],
    explanation: [
      "The tip is a percentage of the bill. A 15% tip on 80 is 12, which makes a total of 92. Splitting between four people gives 23 each.",
      "Tipping customs differ widely. In some countries a service charge is already on the bill, and in others tipping is not expected, so check before you add one.",
    ],
    formula: ["Tip = bill × tip % ÷ 100.", "Total = bill + tip.", "Each person pays = total ÷ number of people."],
    worked: () => {
      const a = tipResult(80, 15, 1);
      const b = tipResult(120, 18, 4);
      return [`80 with a 15% tip: tip ${m(a.tip)}, total ${m(a.total)}.`, `120 with an 18% tip split four ways: ${m(b.perPerson)} each.`];
    },
    tips: ["Check whether a service charge is already included.", "Round the total up to a convenient amount if you wish."],
    faqs: [
      { q: "How much should I tip?", a: "It depends on the country and the service. Common ranges are 10% to 20% where tipping is customary." },
      { q: "How do I split a bill with a tip?", a: "Add the tip to the bill, then divide the total by the number of people." },
      PRIVACY,
    ],
    related: ["discount-calculator", "percentage-calculator", "sales-tax-calculator", "fuel-cost-calculator"],
  },
  {
    slug: "sales-tax-calculator",
    calc: "sales-tax",
    h1: "Sales Tax and VAT Calculator",
    title: "Sales Tax and VAT Calculator: Add or Remove Tax",
    description: "Add sales tax, VAT or GST to a price, or remove it from a total, for any tax rate. Shows the tax amount and the net and gross prices. Free and private.",
    summary: "Add or remove sales tax, VAT or GST from an amount.",
    intro: "Enter an amount and a tax rate, then choose whether to add tax or take it out of a total.",
    keywords: ["sales tax calculator", "vat calculator", "gst calculator", "add vat", "remove vat from price", "reverse vat calculator"],
    steps: ["Enter the amount.", "Enter the tax rate that applies where you are.", "Choose whether the amount is before tax or already includes it.", "Read the tax and the net and gross prices."],
    explanation: [
      "To add tax, multiply the price by the rate and add it. 20% VAT on 100 is 20, giving 120. To take tax out of a total, divide by one plus the rate: 120 ÷ 1.20 is 100.",
      "The same method works for sales tax, VAT and GST. Rates differ by country, state and product, and some goods are exempt, so enter the rate that applies to your purchase.",
    ],
    formula: ["Adding tax: total = price × (1 + rate ÷ 100).", "Removing tax: price = total ÷ (1 + rate ÷ 100).", "Tax = total − price."],
    worked: () => {
      const a = taxResult(100, 20, "add");
      const b = taxResult(120, 20, "remove");
      const c = taxResult(50, 8.25, "add");
      return [`100 plus 20% tax: tax ${m(a.tax)}, total ${m(a.gross)}.`, `120 including 20% tax: price before tax ${m(b.net)}, tax ${m(b.tax)}.`, `50 plus 8.25% tax: total ${m(c.gross)}.`];
    },
    tips: ["To remove tax, divide by 1 plus the rate. Do not just subtract the rate from the total.", "Check your local tax authority for the current rate."],
    faqs: [
      { q: "How do I remove VAT from a price?", a: "Divide the price including VAT by 1 plus the rate. For 20% VAT, divide by 1.2." },
      { q: "Is VAT the same as sales tax?", a: "They work alike on the shopper's receipt, but VAT is charged at each stage of production while sales tax is charged at the final sale." },
      { q: "Does this give legal tax advice?", a: "No. It is a simple calculator. Check the rate and rules with your tax authority." },
      PRIVACY,
    ],
    related: ["discount-calculator", "percentage-calculator", "tip-calculator", "fuel-cost-calculator"],
  },
  {
    slug: "fuel-cost-calculator",
    calc: "fuel-cost",
    h1: "Fuel Cost Calculator",
    title: "Fuel Cost Calculator: Trip Cost in L/100 km, MPG or km per L",
    description: "Estimate the fuel cost of a trip from the distance, your fuel economy (L/100 km, MPG or km/L) and the fuel price. Works in km or miles. Free and private.",
    summary: "Estimate the fuel cost of a trip from distance, economy and price.",
    intro: "Enter the distance, your fuel economy and the fuel price to estimate the cost of the trip.",
    keywords: ["fuel cost calculator", "trip cost calculator", "gas mileage calculator", "mpg calculator", "petrol cost calculator", "l/100km calculator"],
    steps: ["Enter the trip distance and choose km or miles.", "Enter your fuel economy and its unit.", "Enter the fuel price and whether it is per liter or gallon.", "Read the trip cost, fuel used and cost per distance."],
    explanation: [
      "Fuel economy is shown differently around the world: liters per 100 km in much of Europe and Asia, miles per gallon in the US and UK, and km per liter in some other countries. The calculator converts them for you.",
      "Note that a US gallon (3.785 liters) is smaller than a UK gallon (4.546 liters), so MPG figures are not directly comparable between the two.",
    ],
    formula: ["Liters used = distance (km) × L/100 km ÷ 100.", "Cost = liters used × price per liter.", "L/100 km = 235.215 ÷ MPG (US)."],
    worked: () => {
      const a = fuelUsed(300, "km", "l100", 7);
      const b = fuelUsed(100, "mi", "mpgus", 30);
      return [`300 km at 7 L/100 km: ${a.toFixed(1)} liters. At 1.50 per liter that is ${m(a * 1.5)}.`, `100 miles at 30 MPG (US): ${b.toFixed(2)} liters.`];
    },
    tips: ["Real fuel use depends on speed, load, traffic and weather.", "Use your car's average trip figure for the most realistic economy."],
    faqs: [
      { q: "How do I calculate the fuel cost of a trip?", a: "Divide the distance by the fuel economy to find the fuel used, then multiply by the fuel price." },
      { q: "How do I convert MPG to L/100 km?", a: "Divide 235.215 by the MPG (US) figure. For 30 MPG that is about 7.8 L/100 km." },
      PRIVACY,
    ],
    related: ["liters-to-gallons", "miles-to-km", "km-to-miles", "discount-calculator"],
  },
];
