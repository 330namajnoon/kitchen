import type { AddFridgeProductRequest, FridgeProduct, UpdateFridgeProductRequest } from '@/types/product'
import { api } from './api'

export const fridgeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFridgeProducts: builder.query<FridgeProduct[], void>({
      query: () => '/fridge-products',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'FridgeProduct' as const, id })), { type: 'FridgeProduct' as const, id: 'LIST' }]
          : [{ type: 'FridgeProduct' as const, id: 'LIST' }],
    }),
    addFridgeProduct: builder.mutation<FridgeProduct, AddFridgeProductRequest>({
      query: (body) => ({
        url: '/fridge-products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'FridgeProduct', id: 'LIST' }],
    }),
    updateFridgeProduct: builder.mutation<FridgeProduct, UpdateFridgeProductRequest>({
      query: ({ id, ...body }) => ({
        url: `/fridge-products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'FridgeProduct', id }, { type: 'FridgeProduct', id: 'LIST' }],
    }),
    deleteFridgeProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/fridge-products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'FridgeProduct', id }, { type: 'FridgeProduct', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetFridgeProductsQuery,
  useAddFridgeProductMutation,
  useUpdateFridgeProductMutation,
  useDeleteFridgeProductMutation,
} = fridgeApi
