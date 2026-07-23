import { createController } from "sm-express-server";

import {
  createRecipe,
  deleteRecipe,
  getRecipes,
  updateRecipe,
  type RecipeIngredientInput,
} from "@/services/recipe.service";
import { logger } from "@/utils/logger";

const isNotFoundError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2025";

/** Valida y normaliza el body de ingredientes; devuelve null si el formato es inválido. */
const parseIngredients = (input: unknown): RecipeIngredientInput[] | null => {
  if (!Array.isArray(input)) return null;

  const ingredients: RecipeIngredientInput[] = [];
  for (const item of input) {
    if (typeof item !== "object" || item === null) return null;
    const { genericProductId, quantityAmount, quantityUnit } = item as Record<string, unknown>;

    if (
      genericProductId === undefined ||
      quantityAmount === undefined ||
      !["g", "ml", "u"].includes(quantityUnit as string)
    ) {
      return null;
    }

    ingredients.push({
      genericProductId: Number(genericProductId),
      quantityAmount: Number(quantityAmount),
      quantityUnit: quantityUnit as "g" | "ml" | "u",
    });
  }

  return ingredients;
};

export const addRecipe = createController(async (req, res) => {
  const { name, description, photoUrl, servings, ingredients } = req.body;

  if (!name || !description) {
    res.status(400).json({ error: "Faltan campos obligatorios" });
    return;
  }

  const parsedIngredients = parseIngredients(ingredients ?? []);
  if (!parsedIngredients) {
    res.status(400).json({ error: "Lista de ingredientes inválida" });
    return;
  }

  try {
    const recipe = await createRecipe({
      name,
      description,
      photoUrl,
      servings: servings === undefined ? undefined : Number(servings),
      ingredients: parsedIngredients,
    });
    res.status(201).json(recipe);
  } catch (error) {
    logger.error("Error guardando receta", error);
    res.status(500).json({ error: "No se pudo guardar la receta" });
  }
});

export const listRecipes = createController(async (_req, res) => {
  try {
    const recipes = await getRecipes();
    res.json(recipes);
  } catch (error) {
    logger.error("Error obteniendo recetas", error);
    res.status(500).json({ error: "No se pudo obtener el listado de recetas" });
  }
});

export const editRecipe = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de receta inválido" });
    return;
  }

  const { name, description, photoUrl, servings, ingredients } = req.body;

  let parsedIngredients: RecipeIngredientInput[] | undefined;
  if (ingredients !== undefined) {
    const parsed = parseIngredients(ingredients);
    if (!parsed) {
      res.status(400).json({ error: "Lista de ingredientes inválida" });
      return;
    }
    parsedIngredients = parsed;
  }

  try {
    const recipe = await updateRecipe(id, {
      name,
      description,
      photoUrl,
      servings: servings === undefined ? undefined : Number(servings),
      ingredients: parsedIngredients,
    });
    res.json(recipe);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado la receta" });
      return;
    }
    logger.error("Error actualizando receta", error);
    res.status(500).json({ error: "No se pudo actualizar la receta" });
  }
});

export const removeRecipe = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de receta inválido" });
    return;
  }

  try {
    await deleteRecipe(id);
    res.status(204).send();
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado la receta" });
      return;
    }
    logger.error("Error borrando receta", error);
    res.status(500).json({ error: "No se pudo borrar la receta" });
  }
});

export const uploadRecipePhoto = createController(async (req, res) => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "No se ha subido ninguna imagen" });
    return;
  }

  res.status(201).json({ url: `/uploads/recipes/${file.filename}` });
});
