export const COLORS = {
  primary: '#1C3A5A',
  secondary: '#00A79D',
  accent: '#F58220',
  background: '#F5F5F5',
  cardBg: '#FFFFFF',
  textDark: '#444444',
  textLight: '#7f8c8d',
  success: '#4CAF50',
  danger: '#F44336',
  white: '#FFFFFF',
} as const;

export type ColorType = typeof COLORS;