import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = 'kitchen_auth_tokens'

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  id_token?: string
  expires_in: number
}

interface AuthUser {
  email?: string
  name?: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  expiresAt: number | null
  user: AuthUser | null
}

interface StoredTokens {
  accessToken: string
  refreshToken: string | null
  idToken: string | null
  expiresAt: number
}

// Decodifica el payload del id_token solo para mostrar "sesión iniciada como X" en la UI —
// no es una verificación de firma, esa la hace kitchen-backend sobre el access token en cada request.
function decodeIdToken(idToken: string): AuthUser {
  try {
    const payload = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { email, name } = JSON.parse(atob(payload))
    return { email, name }
  } catch {
    return {}
  }
}

function emptyState(): AuthState {
  return { accessToken: null, refreshToken: null, idToken: null, expiresAt: null, user: null }
}

function loadFromStorage(): AuthState {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return emptyState()

  try {
    const stored = JSON.parse(raw) as StoredTokens
    return {
      accessToken: stored.accessToken,
      refreshToken: stored.refreshToken,
      idToken: stored.idToken,
      expiresAt: stored.expiresAt,
      user: stored.idToken ? decodeIdToken(stored.idToken) : null,
    }
  } catch {
    return emptyState()
  }
}

function persist(state: AuthState) {
  if (!state.accessToken) {
    sessionStorage.removeItem(STORAGE_KEY)
    return
  }

  const stored: StoredTokens = {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    idToken: state.idToken,
    expiresAt: state.expiresAt ?? 0,
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadFromStorage(),
  reducers: {
    setTokens(state, action: PayloadAction<TokenResponse>) {
      state.accessToken = action.payload.access_token
      state.refreshToken = action.payload.refresh_token ?? state.refreshToken
      state.idToken = action.payload.id_token ?? state.idToken
      state.expiresAt = Date.now() + action.payload.expires_in * 1000
      state.user = state.idToken ? decodeIdToken(state.idToken) : null
      persist(state)
    },
    logout(state) {
      Object.assign(state, emptyState())
      persist(state)
    },
  },
})

export const { setTokens, logout } = authSlice.actions
export default authSlice.reducer

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.accessToken || state.auth.refreshToken)
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken
