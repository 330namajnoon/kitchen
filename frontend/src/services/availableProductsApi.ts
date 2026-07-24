import type {
  AddAvailableProductsRequest,
  AvailableProduct,
  UpdateAvailableProductPercentageRequest,
} from '@/types/availableProduct'
import { api } from './api'

export const availableProductsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableProducts: builder.query<AvailableProduct[], void>({
      query: () => '/available-products',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'AvailableProduct' as const, id })), { type: 'AvailableProduct' as const, id: 'LIST' }]
          : [{ type: 'AvailableProduct' as const, id: 'LIST' }],
    }),
    getAvailableProduct: builder.query<AvailableProduct, number>({
      query: (id) => `/available-products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AvailableProduct', id }],
    }),
    addAvailableProducts: builder.mutation<AvailableProduct[], AddAvailableProductsRequest>({
      query: (body) => ({
        url: '/available-products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AvailableProduct', id: 'LIST' }],
    }),
    updateAvailableProductPercentage: builder.mutation<AvailableProduct, UpdateAvailableProductPercentageRequest>({
      query: ({ id, ...body }) => ({
        url: `/available-products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'AvailableProduct', id }, { type: 'AvailableProduct', id: 'LIST' }],
    }),
    deleteAvailableProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/available-products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'AvailableProduct', id }, { type: 'AvailableProduct', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetAvailableProductsQuery,
  useGetAvailableProductQuery,
  useAddAvailableProductsMutation,
  useUpdateAvailableProductPercentageMutation,
  useDeleteAvailableProductMutation,
} = availableProductsApi
