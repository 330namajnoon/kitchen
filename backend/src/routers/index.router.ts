import type { RouterDefinition } from "sm-express-server";

import { genericProductRouter } from "@/routers/generic-product.router";
import { healthRouter } from "@/routers/health.router";
import { productRouter } from "@/routers/product.router";
import { productDetectRouter } from "@/routers/product-detect.router";
import { productLookupRouter } from "@/routers/product-lookup.router";
import { recipeRouter } from "@/routers/recipe.router";
import { shoppingListRouter } from "@/routers/shopping-list.router";

export const routers: RouterDefinition[] = [
  healthRouter,
  productLookupRouter,
  productDetectRouter,
  productRouter,
  genericProductRouter,
  recipeRouter,
  shoppingListRouter,
];
