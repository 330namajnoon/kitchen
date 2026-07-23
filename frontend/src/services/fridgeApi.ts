import type { AddFridgeProductRequest, FridgeProduct } from '@/types/product'
import { api } from './api'

export const fridgeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFridgeProducts: builder.query<FridgeProduct[], void>({
      query: () => '/fridge-products',
    }),
    addFridgeProduct: builder.mutation<FridgeProduct, AddFridgeProductRequest>({
      query: (body) => ({
        url: '/fridge-products',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useGetFridgeProductsQuery, useAddFridgeProductMutation } = fridgeApi
