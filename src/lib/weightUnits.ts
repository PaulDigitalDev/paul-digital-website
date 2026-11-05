/* Weight units, including the traditional gold units used in Bangladesh, India and Pakistan. Every unit is stored in grams. */

export type WeightId = "gram" | "kg" | "mg" | "vori" | "tola" | "ana" | "roti" | "masha" | "troy-oz" | "oz" | "lb";

export interface WeightUnit {
  id: WeightId;
  name: string;
  bn: string;
  /** Grams in one of this unit. */
  factor: number;
}

/** 1 vori = 1 tola = 11.664 g, the figure used for gold in Bangladesh, India and Pakistan. */
export const VORI_GRAMS = 11.664;

export const WEIGHT_UNITS: WeightUnit[] = [
  { id: "gram", name: "Gram (g)", bn: "গ্রাম", factor: 1 },
  { id: "kg", name: "Kilogram (kg)", bn: "কেজি", factor: 1000 },
  { id: "mg", name: "Milligram (mg)", bn: "মিলিগ্রাম", factor: 0.001 },
  { id: "vori", name: "Vori / Bhori (ভরি)", bn: "ভরি", factor: VORI_GRAMS },
  { id: "tola", name: "Tola", bn: "তোলা", factor: VORI_GRAMS },
  { id: "ana", name: "Ana (1/16 vori)", bn: "আনা", factor: VORI_GRAMS / 16 },
  { id: "roti", name: "Roti / Ratti (1/96 vori)", bn: "রতি", factor: VORI_GRAMS / 96 },
  { id: "masha", name: "Masha (1/12 tola)", bn: "মাশা", factor: VORI_GRAMS / 12 },
  { id: "troy-oz", name: "Troy ounce (oz t)", bn: "ট্রয় আউন্স", factor: 31.1034768 },
  { id: "oz", name: "Ounce (oz)", bn: "আউন্স", factor: 28.349523125 },
  { id: "lb", name: "Pound (lb)", bn: "পাউন্ড", factor: 453.59237 },
];

export const weightById = new Map(WEIGHT_UNITS.map((u) => [u.id, u]));

export function convertWeight(value: number, from: WeightId, to: WeightId): number {
  return (value * weightById.get(from)!.factor) / weightById.get(to)!.factor;
}

/** Splits grams into whole vori, ana and roti, with the remainder in roti. */
export function toVoriAnaRoti(grams: number): { vori: number; ana: number; roti: number } {
  const totalRoti = grams / (VORI_GRAMS / 96);
  const roundedRoti = Math.round(totalRoti * 100) / 100;
  const vori = Math.floor(roundedRoti / 96);
  const left = roundedRoti - vori * 96;
  const ana = Math.floor(left / 6);
  return { vori, ana, roti: Math.round((left - ana * 6) * 100) / 100 };
}
