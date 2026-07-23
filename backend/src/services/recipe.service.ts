import { prisma } from "@/config/prisma";

export interface RecipeIngredientInput {
  genericProductId: number;
  quantityAmount: number;
  quantityUnit: "g" | "ml" | "u";
}

export interface CreateRecipeInput {
  name: string;
  description: string;
  photoUrl?: string;
  ingredients: RecipeIngredientInput[];
}

const includeIngredients = {
  ingredients: { include: { genericProduct: true } },
} as const;

export async function createRecipe(input: CreateRecipeInput) {
  return prisma.recipe.create({
    data: {
      name: input.name,
      description: input.description,
      photoUrl: input.photoUrl,
      ingredients: {
        create: input.ingredients.map((ingredient) => ({
          genericProductId: ingredient.genericProductId,
          quantityAmount: ingredient.quantityAmount,
          quantityUnit: ingredient.quantityUnit,
        })),
      },
    },
    include: includeIngredients,
  });
}

export async function getRecipes() {
  return prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    include: includeIngredients,
  });
}

export interface UpdateRecipeInput {
  name?: string;
  description?: string;
  photoUrl?: string;
  ingredients?: RecipeIngredientInput[];
}

export async function updateRecipe(id: number, input: UpdateRecipeInput) {
  return prisma.$transaction(async (tx) => {
    if (input.ingredients) {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
    }

    return tx.recipe.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        photoUrl: input.photoUrl,
        ingredients: input.ingredients
          ? {
              create: input.ingredients.map((ingredient) => ({
                genericProductId: ingredient.genericProductId,
                quantityAmount: ingredient.quantityAmount,
                quantityUnit: ingredient.quantityUnit,
              })),
            }
          : undefined,
      },
      include: includeIngredients,
    });
  });
}

export async function deleteRecipe(id: number) {
  return prisma.recipe.delete({ where: { id } });
}
