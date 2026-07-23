import type { AddProductRequest, Product, UpdateProductRequest } from '@/types/product'
import { API_BASE_URL, api } from './api'

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'Product' as const, id: 'LIST' }]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),
    addProduct: builder.mutation<Product, AddProductRequest>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<Product, UpdateProductRequest>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    uploadProductPhoto: builder.mutation<{ url: string }, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('photo', file)
        return {
          url: '/products/photo',
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: { url: string }) => ({ url: `${API_BASE_URL}${response.url}` }),
    }),
  }),
})

export const {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductPhotoMutation,
} = productsApi
