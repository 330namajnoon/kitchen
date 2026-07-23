import type { RouterDefinition } from "sm-express-server";

import { fridgeProductRouter } from "@/routers/fridge-product.router";
import { genericProductRouter } from "@/routers/generic-product.router";
import { healthRouter } from "@/routers/health.router";
import { productRouter } from "@/routers/product.router";
import { recipeRouter } from "@/routers/recipe.router";

export const routers: RouterDefinition[] = [
  healthRouter,
  productRouter,
  fridgeProductRouter,
  genericProductRouter,
  recipeRouter,
];
