/* Small pure helpers behind the percentage, pay, grade, GPA and BMI calculators. */

export type PercentMode = "of" | "whatpct" | "change" | "total" | "up" | "down";

/** The six everyday percentage questions. `a` and `b` are the two numbers typed in. */
export function percentage(mode: PercentMode, a: number, b: number): number {
  switch (mode) {
    case "of": // a% of b
      return (a / 100) * b;
    case "whatpct": // a is what % of b
      return (a / b) * 100;
    case "change": // % change from a to b
      return ((b - a) / Math.abs(a)) * 100;
    case "total": // a is b% of what number
      return a / (b / 100);
    case "up": // a increased by b%
      return a * (1 + b / 100);
    case "down": // a decreased by b%
      return a * (1 - b / 100);
  }
}

export function hourlyToAnnual(hourly: number, hoursPerWeek: number, weeksPerYear: number) {
  const annual = hourly * hoursPerWeek * weeksPerYear;
  return { annual, monthly: annual / 12, biweekly: annual / 26, weekly: annual / weeksPerYear, daily: (hourly * hoursPerWeek) / 5 };
}

/** Weighted average of scores (percentages). Weights are relative, so 30 and 70 behave like 3 and 7. */
export function weightedAverage(items: { score: number; weight: number }[]): number {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  return items.reduce((sum, i) => sum + i.score * i.weight, 0) / total;
}

/** Score needed on a final worth `finalWeightPct` percent of the course to finish on `target`, given the current grade on the rest. */
export function neededOnFinal(current: number, finalWeightPct: number, target: number): number {
  const w = finalWeightPct / 100;
  return (target - current * (1 - w)) / w;
}

/** A typical US letter scale. Schools differ, so the result is labelled as typical. */
export function letterFor(percent: number): string {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

/** Standard unweighted 4.0 points for a letter grade, or null for something that is not a letter. */
export function gradePoints(grade: string): number | null {
  const table: Record<string, number> = { "A+": 4, A: 4, "A-": 3.7, "B+": 3.3, B: 3, "B-": 2.7, "C+": 2.3, C: 2, "C-": 1.7, "D+": 1.3, D: 1, "D-": 0.7, F: 0 };
  const hit = table[grade.trim().toUpperCase()];
  return hit === undefined ? null : hit;
}

export function gpa(items: { points: number; credits: number }[]) {
  const credits = items.reduce((s, i) => s + i.credits, 0);
  const quality = items.reduce((s, i) => s + i.points * i.credits, 0);
  return { gpa: quality / credits, credits, quality };
}

export function bmi(kg: number, meters: number): number {
  return kg / (meters * meters);
}

/** WHO adult categories. They apply to adults only. */
export function bmiCategory(value: number): string {
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Healthy weight range";
  if (value < 30) return "Overweight";
  return "Obesity range";
}

export const LB_PER_KG = 2.2046226218;
export const CM_PER_IN = 2.54;
