import type { GenericProduct } from './genericProduct'
import type { QuantityUnit } from './product'
import type { Recipe } from './recipe'

export type CookedMealRecipe = Pick<Recipe, 'id' | 'name' | 'description' | 'photoUrl' | 'servings'>

export interface CookedMealIngredient {
  id: number
  quantityAmount: number
  quantityUnit: QuantityUnit
  genericProductId: number
  genericProduct: GenericProduct
}

export interface CookedMeal {
  id: number
  cookedAt: string
  servings: number
  rating: number | null
  recipeId: number
  recipe: CookedMealRecipe
  ingredients: CookedMealIngredient[]
}

export interface CookMealIngredientInput {
  genericProductId: number
  quantityAmount: number
  quantityUnit: QuantityUnit
}

export interface CookMealInput {
  recipeId: number
  servings: number
  ingredients: CookMealIngredientInput[]
}

export interface CookMealsRequest {
  meals: CookMealInput[]
}

export interface UpdateCookedMealRatingRequest {
  id: number
  rating: number | null
}
