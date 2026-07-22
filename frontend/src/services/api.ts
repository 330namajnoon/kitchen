import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4001'

/**
 * API base de RTK Query. Los distintos dominios (productos, etc.) inyectan
 * sus endpoints aquí vía `api.injectEndpoints` en vez de crear su propio
 * `createApi`, así comparten reducerPath, baseQuery y tagTypes.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: () => ({}),
})
