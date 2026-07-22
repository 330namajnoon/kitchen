import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    margin: 0;
    background-color: ${({ theme }) => theme.colors.background.default};
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
`
