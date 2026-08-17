import { createRouter } from "sm-express-server";

import {
  addCookedMeals,
  editCookedMealRating,
  getCookedMeal,
  listCookedMeals,
  removeCookedMeal,
} from "@/controllers/cooked-meal.controller";

export const cookedMealRouter = createRouter("/cooked-meals", (router) => {
  router.get("/", listCookedMeals);
  router.get("/:id", getCookedMeal);
  router.post("/", addCookedMeals);
  router.put("/:id", editCookedMealRating);
  router.delete("/:id", removeCookedMeal);
});
