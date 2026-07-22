import { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LoginCard, LoginWrapper } from './Login.styles'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
  }

  return (
    <LoginWrapper>
      <LoginCard as="form" onSubmit={handleSubmit}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Iniciar sesión
        </Typography>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          fullWidth
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained" fullWidth>
          Entrar
        </Button>
      </LoginCard>
    </LoginWrapper>
  )
}
