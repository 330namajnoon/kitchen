import type { ProductLookupResponse } from '@/types/product'
import { api } from './api'

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductByCode: builder.query<ProductLookupResponse, string>({
      query: (code) => `/products/${code}`,
    }),
  }),
})

export const { useGetProductByCodeQuery } = productsApi
