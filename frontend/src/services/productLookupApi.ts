import type { ProductLookupResponse } from '@/types/product'
import { api } from './api'

export const productLookupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductByCode: builder.query<ProductLookupResponse, string>({
      query: (code) => `/product-lookup/${code}`,
    }),
  }),
})

export const { useGetProductByCodeQuery } = productLookupApi
