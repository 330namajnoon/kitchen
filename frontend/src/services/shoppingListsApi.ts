import type { AddShoppingListRequest, ShoppingList, UpdateShoppingListRequest } from '@/types/shoppingList'
import { api } from './api'

export const shoppingListsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getShoppingLists: builder.query<ShoppingList[], void>({
      query: () => '/shopping-lists',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ShoppingList' as const, id })),
              { type: 'ShoppingList' as const, id: 'LIST' },
            ]
          : [{ type: 'ShoppingList' as const, id: 'LIST' }],
    }),
    addShoppingList: builder.mutation<ShoppingList, AddShoppingListRequest>({
      query: (body) => ({
        url: '/shopping-lists',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ShoppingList', id: 'LIST' }],
    }),
    updateShoppingList: builder.mutation<ShoppingList, UpdateShoppingListRequest>({
      query: ({ id, ...body }) => ({
        url: `/shopping-lists/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ShoppingList', id }, { type: 'ShoppingList', id: 'LIST' }],
    }),
    deleteShoppingList: builder.mutation<void, number>({
      query: (id) => ({
        url: `/shopping-lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'ShoppingList', id }, { type: 'ShoppingList', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetShoppingListsQuery,
  useAddShoppingListMutation,
  useUpdateShoppingListMutation,
  useDeleteShoppingListMutation,
} = shoppingListsApi
