import { Bad, guard, money, num, plain, positive } from "./calcDefs.ts";
import type { CalcDef } from "./calcDefs.ts";

/* Everyday calculators used worldwide: discount, tip, sales tax or VAT, and fuel cost. Amounts have no currency symbol, so any currency works. */

export function discountResult(price: number, off1: number, off2: number) {
  const afterFirst = price * (1 - off1 / 100);
  const final = afterFirst * (1 - off2 / 100);
  return { final, saved: price - final, effective: price === 0 ? 0 : ((price - final) / price) * 100 };
}

export function tipResult(bill: number, tipPct: number, people: number) {
  const tip = (bill * tipPct) / 100;
  const total = bill + tip;
  return { tip, total, perPerson: total / people, tipPerPerson: tip / people };
}

/** mode "add": amount is before tax. mode "remove": amount already includes tax. */
export function taxResult(amount: number, ratePct: number, mode: string) {
  if (mode === "remove") {
    const net = amount / (1 + ratePct / 100);
    return { net, tax: amount - net, gross: amount };
  }
  const tax = (amount * ratePct) / 100;
  return { net: amount, tax, gross: amount + tax };
}

export const LITRES_PER_US_GAL = 3.785411784;
export const LITRES_PER_UK_GAL = 4.54609;
const KM_PER_MILE = 1.609344;

/** Litres used for a trip. Efficiency units: l100 (litres per 100 km), mpgus, mpguk, kpl (km per litre). */
export function fuelUsed(distance: number, distUnit: string, effUnit: string, efficiency: number): number {
  const km = distUnit === "mi" ? distance * KM_PER_MILE : distance;
  if (effUnit === "l100") return (km * efficiency) / 100;
  if (effUnit === "kpl") return km / efficiency;
  const gal = effUnit === "mpguk" ? LITRES_PER_UK_GAL : LITRES_PER_US_GAL;
  return (km / KM_PER_MILE / efficiency) * gal;
}

export const discount: CalcDef = {
  id: "discount",
  fields: [
    { id: "price", label: "Original price", kind: "number", default: "100", step: "any" },
    { id: "off", label: "Discount (%)", kind: "number", default: "20", step: "any" },
    { id: "off2", label: "Extra discount (%, optional)", kind: "number", default: "0", step: "any" },
  ],
  compute: (v) =>
    guard(() => {
      const price = positive(num(v, "price", "Original price"), "Original price");
      const off = num(v, "off", "Discount");
      const off2 = num(v, "off2", "Extra discount");
      if (off < 0 || off > 100 || off2 < 0 || off2 > 100) throw new Bad("Enter discounts from 0 to 100%.");
      const r = discountResult(price, off, off2);
      return {
        rows: [
          { label: "Final price", value: money(r.final), big: true },
          { label: "You save", value: money(r.saved) },
          { label: "Total discount", value: `${plain(r.effective, 2)}%` },
        ],
        notes: ["An extra discount is taken off the already reduced price, so two discounts of 20% and 10% give 28% off, not 30%."],
      };
    }),
};

export const tip: CalcDef = {
  id: "tip",
  fields: [
    { id: "bill", label: "Bill amount", kind: "number", default: "80", step: "any" },
    { id: "pct", label: "Tip (%)", kind: "number", default: "15", step: "any" },
    { id: "people", label: "Number of people", kind: "number", default: "1", step: "1" },
  ],
  compute: (v) =>
    guard(() => {
      const bill = positive(num(v, "bill", "Bill amount"), "Bill amount");
      const pct = num(v, "pct", "Tip");
      const people = Math.floor(num(v, "people", "Number of people"));
      if (pct < 0 || pct > 100) throw new Bad("Enter a tip from 0 to 100%.");
      if (people < 1 || people > 1000) throw new Bad("Enter a number of people from 1 to 1000.");
      const r = tipResult(bill, pct, people);
      return {
        rows: [
          { label: "Tip", value: money(r.tip), big: true },
          { label: "Total with tip", value: money(r.total) },
          ...(people > 1 ? [{ label: "Each person pays", value: money(r.perPerson) }, { label: "Tip per person", value: money(r.tipPerPerson) }] : []),
        ],
        notes: ["Tipping customs differ by country. Check whether a service charge is already on the bill."],
      };
    }),
};

export const salesTax: CalcDef = {
  id: "sales-tax",
  fields: [
    { id: "amount", label: "Amount", kind: "number", default: "100", step: "any" },
    { id: "rate", label: "Tax rate (%)", kind: "number", default: "20", step: "any" },
    { id: "mode", label: "The amount is", kind: "select", default: "add", options: [{ value: "add", label: "Before tax (add tax)" }, { value: "remove", label: "Including tax (remove tax)" }] },
  ],
  compute: (v) =>
    guard(() => {
      const amount = positive(num(v, "amount", "Amount"), "Amount");
      const rate = num(v, "rate", "Tax rate");
      if (rate < 0 || rate > 100) throw new Bad("Enter a tax rate from 0 to 100%.");
      const r = taxResult(amount, rate, v.mode);
      return {
        rows: [
          { label: v.mode === "remove" ? "Amount before tax" : "Total with tax", value: money(v.mode === "remove" ? r.net : r.gross), big: true },
          { label: "Tax", value: money(r.tax) },
          { label: "Amount before tax", value: money(r.net) },
          { label: "Amount with tax", value: money(r.gross) },
        ],
        notes: ["Enter the rate that applies where you are. Rates differ by country, state and product, and some items are exempt."],
      };
    }),
};

export const fuelCost: CalcDef = {
  id: "fuel-cost",
  fields: [
    { id: "dist", label: "Trip distance", kind: "number", default: "300", step: "any" },
    { id: "dunit", label: "Distance in", kind: "select", default: "km", options: [{ value: "km", label: "Kilometers" }, { value: "mi", label: "Miles" }] },
    { id: "eff", label: "Fuel economy", kind: "number", default: "7", step: "any" },
    { id: "eunit", label: "Fuel economy in", kind: "select", default: "l100", options: [{ value: "l100", label: "L/100 km" }, { value: "kpl", label: "km per liter" }, { value: "mpgus", label: "MPG (US)" }, { value: "mpguk", label: "MPG (UK)" }] },
    { id: "price", label: "Fuel price", kind: "number", default: "1.5", step: "any" },
    { id: "punit", label: "Price per", kind: "select", default: "l", options: [{ value: "l", label: "Liter" }, { value: "usgal", label: "US gallon" }, { value: "ukgal", label: "UK gallon" }] },
  ],
  compute: (v) =>
    guard(() => {
      const dist = positive(num(v, "dist", "Distance"), "Distance");
      const eff = positive(num(v, "eff", "Fuel economy"), "Fuel economy");
      const price = positive(num(v, "price", "Fuel price"), "Fuel price");
      const litres = fuelUsed(dist, v.dunit, v.eunit, eff);
      if (!Number.isFinite(litres) || litres > 1e7) throw new Bad("Those numbers are too large.");
      const perLitre = v.punit === "usgal" ? price / LITRES_PER_US_GAL : v.punit === "ukgal" ? price / LITRES_PER_UK_GAL : price;
      const km = v.dunit === "mi" ? dist * KM_PER_MILE : dist;
      const cost = litres * perLitre;
      return {
        rows: [
          { label: "Trip fuel cost", value: money(cost), big: true },
          { label: "Fuel used", value: `${plain(litres, 2)} liters (${plain(litres / LITRES_PER_US_GAL, 2)} US gal)` },
          { label: "Cost per km", value: money(cost / km) },
          { label: "Cost per mile", value: money((cost / km) * KM_PER_MILE) },
        ],
        notes: ["Real fuel use changes with speed, load, traffic and weather, so treat this as an estimate."],
      };
    }),
};

export const globalDefs: Record<string, CalcDef> = { discount, tip, "sales-tax": salesTax, "fuel-cost": fuelCost };
