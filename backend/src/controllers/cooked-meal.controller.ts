import { createController } from "sm-express-server";

import {
  cookMeals,
  deleteCookedMeal,
  getCookedMealById,
  getCookedMeals,
  updateCookedMealRating,
  type CookedMealIngredientInput,
  type CookMealInput,
} from "@/services/cooked-meal.service";
import { logger } from "@/utils/logger";

const isNotFoundError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2025";

const parseIngredients = (input: unknown): CookedMealIngredientInput[] | null => {
  if (!Array.isArray(input) || input.length === 0) return null;

  const ingredients: CookedMealIngredientInput[] = [];
  for (const item of input) {
    if (typeof item !== "object" || item === null) return null;
    const { genericProductId, quantityAmount, quantityUnit } = item as Record<string, unknown>;

    if (
      genericProductId === undefined ||
      quantityAmount === undefined ||
      !["g", "ml", "u", "tsp", "tbsp", "pinch", "cup"].includes(quantityUnit as string)
    ) {
      return null;
    }

    const parsedGenericProductId = Number(genericProductId);
    const parsedQuantityAmount = Number(quantityAmount);
    if (!Number.isInteger(parsedGenericProductId) || !Number.isFinite(parsedQuantityAmount) || parsedQuantityAmount <= 0) {
      return null;
    }

    ingredients.push({
      genericProductId: parsedGenericProductId,
      quantityAmount: parsedQuantityAmount,
      quantityUnit: quantityUnit as "g" | "ml" | "u" | "tsp" | "tbsp" | "pinch" | "cup",
    });
  }

  return ingredients;
};

const parseMeals = (input: unknown): CookMealInput[] | null => {
  if (!Array.isArray(input) || input.length === 0) return null;

  const meals: CookMealInput[] = [];
  for (const item of input) {
    if (typeof item !== "object" || item === null) return null;
    const { recipeId, servings, ingredients } = item as Record<string, unknown>;

    if (recipeId === undefined || servings === undefined) return null;

    const parsedRecipeId = Number(recipeId);
    const parsedServings = Number(servings);
    if (!Number.isInteger(parsedRecipeId) || !Number.isInteger(parsedServings) || parsedServings <= 0) return null;

    const parsedIngredients = parseIngredients(ingredients);
    if (!parsedIngredients) return null;

    meals.push({ recipeId: parsedRecipeId, servings: parsedServings, ingredients: parsedIngredients });
  }

  return meals;
};

export const addCookedMeals = createController(async (req, res) => {
  const parsedMeals = parseMeals(req.body.meals);

  if (!parsedMeals) {
    res.status(400).json({ error: "Lista de comidas cocinadas inválida" });
    return;
  }

  try {
    const meals = await cookMeals(parsedMeals);
    res.status(201).json(meals);
  } catch (error) {
    logger.error("Error registrando comidas cocinadas", error);
    res.status(500).json({ error: "No se pudo registrar la comida cocinada" });
  }
});

export const listCookedMeals = createController(async (_req, res) => {
  try {
    const cookedMeals = await getCookedMeals();
    res.json(cookedMeals);
  } catch (error) {
    logger.error("Error obteniendo comidas cocinadas", error);
    res.status(500).json({ error: "No se pudo obtener el listado de comidas cocinadas" });
  }
});

export const getCookedMeal = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de comida cocinada inválido" });
    return;
  }

  try {
    const cookedMeal = await getCookedMealById(id);
    res.json(cookedMeal);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado la comida cocinada" });
      return;
    }
    logger.error("Error obteniendo comida cocinada", error);
    res.status(500).json({ error: "No se pudo obtener la comida cocinada" });
  }
});

export const editCookedMealRating = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de comida cocinada inválido" });
    return;
  }

  const { rating } = req.body;

  let parsedRating: number | null;
  if (rating === null) {
    parsedRating = null;
  } else {
    parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      res.status(400).json({ error: "Valoración inválida" });
      return;
    }
  }

  try {
    const cookedMeal = await updateCookedMealRating(id, { rating: parsedRating });
    res.json(cookedMeal);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado la comida cocinada" });
      return;
    }
    logger.error("Error actualizando valoración de comida cocinada", error);
    res.status(500).json({ error: "No se pudo actualizar la valoración" });
  }
});

export const removeCookedMeal = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de comida cocinada inválido" });
    return;
  }

  try {
    await deleteCookedMeal(id);
    res.status(204).send();
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado la comida cocinada" });
      return;
    }
    logger.error("Error borrando comida cocinada", error);
    res.status(500).json({ error: "No se pudo borrar la comida cocinada" });
  }
});
