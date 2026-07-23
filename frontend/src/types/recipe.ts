import type { GenericProduct } from './genericProduct'
import type { QuantityUnit } from './product'

export interface RecipeIngredientInput {
  genericProductId: number
  quantityAmount: number
  quantityUnit: QuantityUnit
}

export interface RecipeIngredient extends RecipeIngredientInput {
  id: number
  genericProduct: GenericProduct
}

export interface AddRecipeRequest {
  name: string
  description: string
  photoUrl?: string
  ingredients: RecipeIngredientInput[]
}

export interface Recipe extends Omit<AddRecipeRequest, 'ingredients'> {
  id: number
  createdAt: string
  ingredients: RecipeIngredient[]
}

export interface UpdateRecipeRequest extends Partial<AddRecipeRequest> {
  id: number
}

export interface RecipeFormValues {
  name: string
  description: string
  photoUrl: string
  ingredients: RecipeIngredientInput[]
}
