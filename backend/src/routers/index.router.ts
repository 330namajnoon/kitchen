import type { RouterDefinition } from "sm-express-server";

import { healthRouter } from "@/routers/health.router";

export const routers: RouterDefinition[] = [healthRouter];
