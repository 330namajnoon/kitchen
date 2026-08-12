import { randomString, sha256 } from '@/utils/pkce'
import type { TokenResponse } from '@/store/slices/authSlice'

export const AUTH_ISSUER = import.meta.env.VITE_AUTH_ISSUER ?? 'https://auth.sinul.es'
export const AUTH_CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID ?? 'kitchen-web'

const SCOPE = 'openid email profile offline_access'

// Debe coincidir exactamente con uno de los redirect_uris registrados para "kitchen-web" en
// auth-server (config/clients.ts) — path fijo, independiente del basename de react-router.
function getRedirectUri() {
  return new URL('/callback', window.location.origin).toString()
}

export async function redirectToLogin() {
  const codeVerifier = randomString(64)
  const state = randomString(16)
  const codeChallenge = await sha256(codeVerifier)

  sessionStorage.setItem('pkce_code_verifier', codeVerifier)
  sessionStorage.setItem('pkce_state', state)

  const url = new URL('/auth', AUTH_ISSUER)
  url.searchParams.set('client_id', AUTH_CLIENT_ID)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', getRedirectUri())
  url.searchParams.set('scope', SCOPE)
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('state', state)
  // Requerido por el spec de OIDC para que offline_access (y por tanto el refresh_token) se
  // conceda de verdad — si no, el scope se ignora en silencio.
  url.searchParams.set('prompt', 'consent')

  window.location.href = url.toString()
}

async function requestToken(body: Record<string, string>): Promise<TokenResponse> {
  const response = await fetch(`${AUTH_ISSUER}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error_description || data.error || 'token request failed')
  }
  return data as TokenResponse
}

export function exchangeCodeForTokens(code: string, codeVerifier: string) {
  return requestToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: AUTH_CLIENT_ID,
    code_verifier: codeVerifier,
  })
}

export function refreshTokens(refreshToken: string) {
  return requestToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: AUTH_CLIENT_ID,
  })
}
