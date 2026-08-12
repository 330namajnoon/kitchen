import { createApi, fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react'
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { refreshTokens } from '@/services/auth/authClient'
import { logout, selectRefreshToken, setTokens } from '@/store/slices/authSlice'
import type { RootState } from '@/store'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4001'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const { accessToken } = (getState() as RootState).auth
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
    return headers
  },
})

// Patrón estándar de RTK Query: en un 401 intenta renovar una vez con el refresh_token antes
// de rendirse. Si el refresh también falla, cierra sesión — RequireAuth se encarga de redirigir
// a /login en cuanto el store pierde el token, no hace falta navegar desde acá.
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshToken = selectRefreshToken(api.getState() as RootState)

    if (refreshToken) {
      try {
        const tokens = await refreshTokens(refreshToken)
        api.dispatch(setTokens(tokens))
        result = await rawBaseQuery(args, api, extraOptions)
      } catch {
        api.dispatch(logout())
      }
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

/**
 * API base de RTK Query. Los distintos dominios (productos, etc.) inyectan
 * sus endpoints aquí vía `api.injectEndpoints` en vez de crear su propio
 * `createApi`, así comparten reducerPath, baseQuery y tagTypes.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'GenericProduct', 'Recipe', 'ShoppingList', 'AvailableProduct'],
  endpoints: () => ({}),
})
