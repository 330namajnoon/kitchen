import type { Product } from './product'

export interface AvailableProductItemInput {
  productId: number
  quantity: number
  expirationDate?: string
}

export interface AddAvailableProductsRequest {
  items: AvailableProductItemInput[]
}

export interface AvailableProduct {
  id: number
  quantity: number
  percentageRemaining: number
  expirationDate: string | null
  createdAt: string
  productId: number
  product: Product
}

export interface UpdateAvailableProductRequest {
  id: number
  percentageRemaining?: number
  expirationDate?: string | null
}
