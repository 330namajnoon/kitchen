import { colors } from './colors'

export const styledTheme = {
  colors,
} as const

export type AppTheme = typeof styledTheme
