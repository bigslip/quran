export const colors = {
  // Emerald Radiance (Brand Accent)
  primary: '#10b981',
  primaryLight: '#34d399',
  primaryDark: '#059669',
  primarySubtle: 'rgba(16, 185, 129, 0.12)',
  primaryGlow: 'rgba(16, 185, 129, 0.25)',

  // Celestial Dark Palette (Default theme)
  background: '#041410',
  backgroundElevated: '#062019',
  surfaceCard: 'rgba(6, 32, 25, 0.75)',
  surfaceCardHover: 'rgba(12, 46, 37, 0.9)',
  surfaceFloating: 'rgba(10, 38, 30, 0.85)',

  // Borders & Dividers
  borderSubtle: 'rgba(16, 185, 129, 0.15)',
  borderIridescent: 'rgba(52, 211, 153, 0.3)',
  borderActive: '#10b981',
  borderSeparator: 'rgba(255, 255, 255, 0.07)',

  // Text Hierarchy
  textPrimary: '#f0fdf4',
  textSecondary: '#a7f3d0',
  textMuted: '#6ee7b7',
  textFaded: '#94a3b8',
  textInverse: '#021410',

  // Accents & Badges
  goldAccent: '#fbbf24',
  goldGlow: 'rgba(251, 191, 36, 0.2)',
  badgeMakki: 'rgba(245, 158, 11, 0.15)',
  badgeMakkiText: '#fcd34d',
  badgeMadani: 'rgba(16, 185, 129, 0.15)',
  badgeMadaniText: '#6ee7b7',

  // Status
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#38bdf8',
} as const;

export type ColorTheme = typeof colors;
