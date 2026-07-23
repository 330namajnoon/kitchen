import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { store } from '@/store'
import { muiTheme } from '@/styles/theme.mui'
import { styledTheme } from '@/styles/theme.styled'
import { GlobalStyle } from '@/styles/GlobalStyle'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <MuiThemeProvider theme={muiTheme}>
        <StyledThemeProvider theme={styledTheme}>
          <CssBaseline />
          <GlobalStyle />
          <BrowserRouter basename="/mac-kitchen-public">
            <App />
          </BrowserRouter>
        </StyledThemeProvider>
      </MuiThemeProvider>
    </ReduxProvider>
  </StrictMode>,
)
