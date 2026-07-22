import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { colors } from './colors'

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    background: colors.background,
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})

// Escala los tamaños de Typography (h1-h6, etc.) entre breakpoints automáticamente
export const muiTheme = responsiveFontSizes(baseTheme)
