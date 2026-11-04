import { baseDefs } from "./calcDefs.ts";
import type { CalcDef } from "./calcDefs.ts";
import { moreDefs } from "./calcDefsMore.ts";

export const calcDefs: Record<string, CalcDef> = { ...baseDefs, ...moreDefs };
