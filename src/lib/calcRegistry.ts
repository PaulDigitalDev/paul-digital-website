import { baseDefs } from "./calcDefs.ts";
import { moreDefs } from "./calcDefsMore.ts";
import { wbDefs } from "./calcDefsWb.ts";
import type { CalcDef } from "./calcDefs.ts";

export const calcDefs: Record<string, CalcDef> = { ...baseDefs, ...moreDefs, ...wbDefs };
