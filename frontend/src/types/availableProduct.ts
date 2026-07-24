import type { Product } from './product'

export interface AvailableProductItemInput {
  productId: number
  quantity: number
}

export interface AddAvailableProductsRequest {
  items: AvailableProductItemInput[]
}

export interface AvailableProduct {
  id: number
  quantity: number
  percentageRemaining: number
  createdAt: string
  productId: number
  product: Product
}

export interface UpdateAvailableProductPercentageRequest {
  id: number
  percentageRemaining: number
}
