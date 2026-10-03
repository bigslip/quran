export const emeraldColors = {
  // Brand Accent
  primary: '#10b981',
  primaryLight: '#34d399',
  primaryDark: '#059669',
  primarySubtle: 'rgba(16, 185, 129, 0.12)',
  primaryGlow: 'rgba(16, 185, 129, 0.25)',

  // Celestial Emerald Palette (Original theme)
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

export type AppTheme = 'dark' | 'emerald' | 'sepia' | 'light';
export type ColorTheme = {
  [K in keyof typeof emeraldColors]: string;
};

export const darkColors: ColorTheme = {
  primary: '#10b981',
  primaryLight: '#34d399',
  primaryDark: '#059669',
  primarySubtle: 'rgba(16, 185, 129, 0.12)',
  primaryGlow: 'rgba(16, 185, 129, 0.25)',

  background: '#121212',
  backgroundElevated: '#1a1a1a',
  surfaceCard: '#1e1e1e',
  surfaceCardHover: '#282828',
  surfaceFloating: '#242424',

  borderSubtle: 'rgba(255, 255, 255, 0.09)',
  borderIridescent: 'rgba(255, 255, 255, 0.16)',
  borderActive: '#10b981',
  borderSeparator: 'rgba(255, 255, 255, 0.06)',

  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textFaded: '#64748b',
  textInverse: '#0f172a',

  goldAccent: '#fbbf24',
  goldGlow: 'rgba(251, 191, 36, 0.2)',
  badgeMakki: 'rgba(245, 158, 11, 0.15)',
  badgeMakkiText: '#fcd34d',
  badgeMadani: 'rgba(16, 185, 129, 0.15)',
  badgeMadaniText: '#6ee7b7',

  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#38bdf8',
};

export const sepiaColors: ColorTheme = {
  primary: '#059669',
  primaryLight: '#047857',
  primaryDark: '#047857',
  primarySubtle: 'rgba(5, 150, 105, 0.12)',
  primaryGlow: 'rgba(5, 150, 105, 0.22)',

  background: '#FBF7EE',
  backgroundElevated: '#F5EFE0',
  surfaceCard: '#F3ECE0',
  surfaceCardHover: '#EBE2D0',
  surfaceFloating: '#FFFFFF',

  borderSubtle: 'rgba(139, 94, 60, 0.16)',
  borderIridescent: 'rgba(180, 130, 80, 0.28)',
  borderActive: '#059669',
  borderSeparator: 'rgba(139, 94, 60, 0.10)',

  textPrimary: '#2D2319',
  textSecondary: '#57422E',
  textMuted: '#785D45',
  textFaded: '#A08873',
  textInverse: '#FBF7EE',

  goldAccent: '#B45309',
  goldGlow: 'rgba(180, 83, 9, 0.16)',
  badgeMakki: 'rgba(217, 119, 6, 0.12)',
  badgeMakkiText: '#B45309',
  badgeMadani: 'rgba(5, 150, 105, 0.12)',
  badgeMadaniText: '#047857',

  success: '#059669',
  error: '#dc2626',
  warning: '#d97706',
  info: '#0284c7',
};

export const lightColors: ColorTheme = {
  primary: '#059669',
  primaryLight: '#059669',
  primaryDark: '#047857',
  primarySubtle: 'rgba(5, 150, 105, 0.10)',
  primaryGlow: 'rgba(5, 150, 105, 0.20)',

  background: '#F8FAFC',
  backgroundElevated: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  surfaceCardHover: '#F1F5F9',
  surfaceFloating: '#FFFFFF',

  borderSubtle: 'rgba(0, 0, 0, 0.08)',
  borderIridescent: 'rgba(5, 150, 105, 0.25)',
  borderActive: '#059669',
  borderSeparator: 'rgba(0, 0, 0, 0.05)',

  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textFaded: '#94A3B8',
  textInverse: '#FFFFFF',

  goldAccent: '#D97706',
  goldGlow: 'rgba(217, 119, 6, 0.16)',
  badgeMakki: 'rgba(217, 119, 6, 0.10)',
  badgeMakkiText: '#B45309',
  badgeMadani: 'rgba(5, 150, 105, 0.10)',
  badgeMadaniText: '#047857',

  success: '#059669',
  error: '#dc2626',
  warning: '#d97706',
  info: '#0284c7',
};

export const themePalettes: Record<AppTheme, ColorTheme> = {
  dark: darkColors,
  emerald: emeraldColors,
  sepia: sepiaColors,
  light: lightColors,
};

// Static default alias for 100% test compatibility
export const colors = emeraldColors;
