import type { AddRecipeRequest, Recipe, UpdateRecipeRequest } from '@/types/recipe'
import { STATIC_BASE_URL, api } from './api'

export const recipesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecipes: builder.query<Recipe[], void>({
      query: () => '/recipes',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Recipe' as const, id })), { type: 'Recipe' as const, id: 'LIST' }]
          : [{ type: 'Recipe' as const, id: 'LIST' }],
    }),
    addRecipe: builder.mutation<Recipe, AddRecipeRequest>({
      query: (body) => ({
        url: '/recipes',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Recipe', id: 'LIST' }],
    }),
    updateRecipe: builder.mutation<Recipe, UpdateRecipeRequest>({
      query: ({ id, ...body }) => ({
        url: `/recipes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Recipe', id }, { type: 'Recipe', id: 'LIST' }],
    }),
    deleteRecipe: builder.mutation<void, number>({
      query: (id) => ({
        url: `/recipes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Recipe', id }, { type: 'Recipe', id: 'LIST' }],
    }),
    uploadRecipePhoto: builder.mutation<{ url: string }, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('photo', file)
        return {
          url: '/recipes/photo',
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: { url: string }) => ({ url: `${STATIC_BASE_URL}${response.url}` }),
    }),
  }),
})

export const {
  useGetRecipesQuery,
  useAddRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useUploadRecipePhotoMutation,
} = recipesApi
