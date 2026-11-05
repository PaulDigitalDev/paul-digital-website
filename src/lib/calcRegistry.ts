import { baseDefs } from "./calcDefs.ts";
import { moreDefs } from "./calcDefsMore.ts";
import { wbDefs } from "./calcDefsWb.ts";
import { inDefs } from "./calcDefsIn.ts";
import { mathDefs } from "./calcDefsMath.ts";
import { regionalDefs } from "./calcDefsRegional.ts";
import { taxDefs } from "./calcDefsTax.ts";
import { globalDefs } from "./calcDefsGlobal.ts";
import type { CalcDef } from "./calcDefs.ts";

export const calcDefs: Record<string, CalcDef> = { ...baseDefs, ...moreDefs, ...wbDefs, ...inDefs, ...globalDefs, ...mathDefs, ...taxDefs, ...regionalDefs };
