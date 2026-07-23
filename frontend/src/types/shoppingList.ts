import type { GenericProduct } from './genericProduct'
import type { QuantityUnit } from './product'

export type ShoppingListStatus = 'pending' | 'completed'

export interface ShoppingListItemInput {
  genericProductId: number
  quantityAmount: number
  quantityUnit: QuantityUnit
}

export interface ShoppingListItem extends ShoppingListItemInput {
  id: number
  genericProduct: GenericProduct
}

export interface AddShoppingListRequest {
  estimatedPurchaseDate: string
  status?: ShoppingListStatus
  items: ShoppingListItemInput[]
}

export interface ShoppingList extends Omit<AddShoppingListRequest, 'items'> {
  id: number
  status: ShoppingListStatus
  createdAt: string
  items: ShoppingListItem[]
}

export interface UpdateShoppingListRequest extends Partial<AddShoppingListRequest> {
  id: number
}

export interface ShoppingListFormValues {
  estimatedPurchaseDate: string
  status: ShoppingListStatus
  items: ShoppingListItemInput[]
}
