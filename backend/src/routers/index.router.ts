import type { RouterDefinition } from "sm-express-server";

import { fridgeProductRouter } from "@/routers/fridge-product.router";
import { healthRouter } from "@/routers/health.router";
import { productRouter } from "@/routers/product.router";

export const routers: RouterDefinition[] = [healthRouter, productRouter, fridgeProductRouter];
