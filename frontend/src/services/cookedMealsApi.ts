import type { CookedMeal, CookMealsRequest, UpdateCookedMealRatingRequest } from '@/types/cookedMeal'
import { api } from './api'

export const cookedMealsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCookedMeals: builder.query<CookedMeal[], void>({
      query: () => '/cooked-meals',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'CookedMeal' as const, id })), { type: 'CookedMeal' as const, id: 'LIST' }]
          : [{ type: 'CookedMeal' as const, id: 'LIST' }],
    }),
    getCookedMeal: builder.query<CookedMeal, number>({
      query: (id) => `/cooked-meals/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'CookedMeal', id }],
    }),
    cookMeals: builder.mutation<CookedMeal[], CookMealsRequest>({
      query: (body) => ({
        url: '/cooked-meals',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'CookedMeal', id: 'LIST' },
        { type: 'AvailableProduct', id: 'LIST' },
      ],
    }),
    updateCookedMealRating: builder.mutation<CookedMeal, UpdateCookedMealRatingRequest>({
      query: ({ id, rating }) => ({
        url: `/cooked-meals/${id}`,
        method: 'PUT',
        body: { rating },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CookedMeal', id }, { type: 'CookedMeal', id: 'LIST' }],
    }),
  }),
})

export const { useGetCookedMealsQuery, useGetCookedMealQuery, useCookMealsMutation, useUpdateCookedMealRatingMutation } = cookedMealsApi
