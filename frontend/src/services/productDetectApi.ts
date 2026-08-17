import type { ProductLookupResponse } from '@/types/product'
import { STATIC_BASE_URL, api } from './api'

export const productDetectApi = api.injectEndpoints({
  endpoints: (builder) => ({
    detectProduct: builder.mutation<ProductLookupResponse, Blob>({
      query: (photo) => {
        const formData = new FormData()
        formData.append('photo', photo, 'photo.jpg')
        return {
          url: '/product-detect',
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: ProductLookupResponse) => ({
        ...response,
        productImage: response.productImage ? `${STATIC_BASE_URL}${response.productImage}` : undefined,
        productImageFrontUrl: response.productImageFrontUrl ? `${STATIC_BASE_URL}${response.productImageFrontUrl}` : undefined,
      }),
    }),
  }),
})

export const { useDetectProductMutation } = productDetectApi
