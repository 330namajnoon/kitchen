/**
 * Single source of truth for the app's color palette.
 * Consumed by both the MUI theme (theme.mui.ts) and the
 * styled-components theme (theme.styled.ts) so every styling
 * layer stays in sync. Replace these with the brand colors
 * whenever they're ready.
 */
export const colors = {
  primary: {
    lightest: '#EEF2FF',
    light: '#818CF8',
    main: '#4F46E5',
    dark: '#3730A3',
    contrastText: '#FFFFFF',
  },
  secondary: {
    lightest: '#ECFEFF',
    light: '#67E8F9',
    main: '#0891B2',
    dark: '#155E75',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#16A34A',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#D97706',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#DC2626',
    contrastText: '#FFFFFF',
  },
  neutral: {
    white: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: '#94A3B8',
  },
} as const
