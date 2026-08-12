import { useState } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { redirectToLogin } from '@/services/auth/authClient'
import { LoginCard, LoginWrapper } from './Login.styles'

export const Login = () => {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleLogin = () => {
    setIsRedirecting(true)
    redirectToLogin()
  }

  return (
    <LoginWrapper>
      <LoginCard>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Iniciar sesión
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kitchen usa el mismo login que el resto de tus proyectos.
        </Typography>
        <Button variant="contained" fullWidth disabled={isRedirecting} onClick={handleLogin}>
          {isRedirecting ? 'Redirigiendo…' : 'Continuar con auth-server'}
        </Button>
      </LoginCard>
    </LoginWrapper>
  )
}
