/**
 * Breakpoints compartidos. Mismos valores que usa MUI por defecto (theme.mui.ts
 * hereda los breakpoints estándar de MUI), para que un layout mixto MUI +
 * styled-components rompa en los mismos puntos.
 *
 * Uso en styled-components (mobile-first, min-width):
 *   ${media.up('md')} { flex-direction: row; }
 */
export const breakpointValues = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const

export type Breakpoint = keyof typeof breakpointValues

export const media = {
  up: (bp: Breakpoint) => `@media (min-width: ${breakpointValues[bp]}px)`,
  down: (bp: Breakpoint) => `@media (max-width: ${breakpointValues[bp] - 0.05}px)`,
}
