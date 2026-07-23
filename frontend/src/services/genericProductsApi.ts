import type { AddGenericProductRequest, GenericProduct, UpdateGenericProductRequest } from '@/types/genericProduct'
import { api } from './api'

export const genericProductsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGenericProducts: builder.query<GenericProduct[], void>({
      query: () => '/generic-products',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'GenericProduct' as const, id })), { type: 'GenericProduct' as const, id: 'LIST' }]
          : [{ type: 'GenericProduct' as const, id: 'LIST' }],
    }),
    addGenericProduct: builder.mutation<GenericProduct, AddGenericProductRequest>({
      query: (body) => ({
        url: '/generic-products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'GenericProduct', id: 'LIST' }],
    }),
    updateGenericProduct: builder.mutation<GenericProduct, UpdateGenericProductRequest>({
      query: ({ id, ...body }) => ({
        url: `/generic-products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'GenericProduct', id }, { type: 'GenericProduct', id: 'LIST' }],
    }),
    deleteGenericProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/generic-products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'GenericProduct', id }, { type: 'GenericProduct', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetGenericProductsQuery,
  useAddGenericProductMutation,
  useUpdateGenericProductMutation,
  useDeleteGenericProductMutation,
} = genericProductsApi
