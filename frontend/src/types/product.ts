export interface ProductNutriments {
  'energy-kcal_100g'?: number
  'energy-kcal_serving'?: number
  fat_100g?: number
  'saturated-fat_100g'?: number
  carbohydrates_100g?: number
  sugars_100g?: number
  fiber_100g?: number
  proteins_100g?: number
  salt_100g?: number
  sodium_100g?: number
}

import type { GenericProduct } from './genericProduct'

export type QuantityUnit = 'g' | 'ml' | 'u'

export interface AddProductRequest {
  barcode: string
  name?: string
  photoUrl?: string
  description: string
  category: string
  expirationDate: string
  quantityAmount: number
  quantityUnit: QuantityUnit
  quantityRemaining: number
  price?: number
  comment?: string
  genericProductId?: number
}

export interface Product extends AddProductRequest {
  id: number
  createdAt: string
  genericProduct?: GenericProduct
}

export interface UpdateProductRequest extends Partial<AddProductRequest> {
  id: number
}

/** Respuesta de GET /product-lookup/:barcode (backend/src/controllers/product-lookup.controller.ts) */
export interface ProductLookupResponse {
  productName?: string
  productImage?: string
  productBrands?: string
  productQuantity?: string
  productNutriscore?: 'a' | 'b' | 'c' | 'd' | 'e'
  productNovaGroup?: 1 | 2 | 3 | 4
  productEcoscore?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
  productIngredients?: string
  productAllergens?: string[]
  productNutriments?: ProductNutriments
  productCategories?: string[]
  productLabels?: string[]
  productCountries?: string[]
  productCompleteness?: number
  productIngredientsAnalysis?: string[]
  productGenericName?: string
  productGenericNameEs?: string
  productIngredientsTextEs?: string
  productImageFrontUrl?: string
  productImageFrontSmallUrl?: string
  productImageIngredientsUrl?: string
  productImageNutritionUrl?: string
  productBrandsTags?: string[]
  productNutriscore2023Tags?: string[]
  productEcoscoreTags?: string[]
}
