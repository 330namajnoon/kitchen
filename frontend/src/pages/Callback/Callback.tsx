import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { exchangeCodeForTokens } from '@/services/auth/authClient'
import { useAppDispatch } from '@/store/hooks'
import { setTokens } from '@/store/slices/authSlice'
import { paths } from '@/routes/paths'
import { CallbackWrapper } from './Callback.styles'

export const Callback = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const ranOnce = useRef(false)

  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true

    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const authError = params.get('error')
      if (authError) {
        setError(params.get('error_description') || authError)
        return
      }

      const code = params.get('code')
      const state = params.get('state')
      const expectedState = sessionStorage.getItem('pkce_state')
      const codeVerifier = sessionStorage.getItem('pkce_code_verifier')

      if (!code || !state || state !== expectedState || !codeVerifier) {
        setError('Callback inválido: falta el code/state o no coincide.')
        return
      }

      try {
        const tokens = await exchangeCodeForTokens(code, codeVerifier)
        dispatch(setTokens(tokens))
        sessionStorage.removeItem('pkce_state')
        sessionStorage.removeItem('pkce_code_verifier')
        navigate(paths.home, { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al intercambiar el code por tokens')
      }
    }

    run()
  }, [dispatch, navigate])

  if (error) {
    return (
      <CallbackWrapper>
        <Typography variant="h6" color="error">
          No se pudo iniciar sesión
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(paths.login, { replace: true })}>
          Volver a intentar
        </Button>
      </CallbackWrapper>
    )
  }

  return (
    <CallbackWrapper>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Iniciando sesión…
      </Typography>
    </CallbackWrapper>
  )
}
