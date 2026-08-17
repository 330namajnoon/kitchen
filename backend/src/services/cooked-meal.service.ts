import { prisma } from "@/config/prisma";
import { consumeStockInTx, type ConsumeStockItem } from "@/services/available-product.service";

export interface CookedMealIngredientInput {
  genericProductId: number;
  quantityAmount: number;
  quantityUnit: "g" | "ml" | "u" | "tsp" | "tbsp" | "pinch" | "cup";
}

export interface CookMealInput {
  recipeId: number;
  servings: number;
  ingredients: CookedMealIngredientInput[];
}

const includeMealDetails = {
  recipe: true,
  ingredients: { include: { genericProduct: true } },
} as const;

/**
 * Registra una comida cocinada por receta (con el snapshot de ingredientes ya resuelto a
 * productos genéricos y cantidades, para no depender de que la receta no cambie después) y
 * descuenta el stock consumido, todo en una única transacción: si falla el descuento no se
 * quiere quedar un histórico de "cocinado" sin que se haya restado nada, ni al revés.
 */
export async function cookMeals(meals: CookMealInput[]) {
  return prisma.$transaction(async (tx) => {
    const createdMeals = [];
    for (const meal of meals) {
      const created = await tx.cookedMeal.create({
        data: {
          recipeId: meal.recipeId,
          servings: meal.servings,
          ingredients: {
            create: meal.ingredients.map((ingredient) => ({
              genericProductId: ingredient.genericProductId,
              quantityAmount: ingredient.quantityAmount,
              quantityUnit: ingredient.quantityUnit,
            })),
          },
        },
        include: includeMealDetails,
      });
      createdMeals.push(created);
    }

    const consumeByKey = new Map<string, ConsumeStockItem>();
    meals.forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        const key = `${ingredient.genericProductId}-${ingredient.quantityUnit}`;
        const existing = consumeByKey.get(key);
        if (existing) {
          existing.quantityAmount += ingredient.quantityAmount;
        } else {
          consumeByKey.set(key, { ...ingredient });
        }
      });
    });

    await consumeStockInTx(tx, Array.from(consumeByKey.values()));

    return createdMeals;
  });
}

export async function getCookedMeals() {
  return prisma.cookedMeal.findMany({
    orderBy: { cookedAt: "desc" },
    include: includeMealDetails,
  });
}

export async function getCookedMealById(id: number) {
  return prisma.cookedMeal.findUniqueOrThrow({
    where: { id },
    include: includeMealDetails,
  });
}

export interface UpdateCookedMealInput {
  rating: number | null;
}

export async function updateCookedMealRating(id: number, input: UpdateCookedMealInput) {
  return prisma.cookedMeal.update({
    where: { id },
    data: { rating: input.rating },
    include: includeMealDetails,
  });
}

export async function deleteCookedMeal(id: number) {
  return prisma.cookedMeal.delete({ where: { id } });
}
