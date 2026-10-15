import { useReadingStore } from '@/stores/useReadingStore';
import { themePalettes, emeraldColors, AppTheme, ColorTheme } from './colors';

export function useThemeColors(): ColorTheme {
  const theme = useReadingStore((s) => s.theme) ?? 'emerald';
  return themePalettes[theme] ?? emeraldColors;
}

export function useAppTheme(): {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  colors: ColorTheme;
} {
  const theme = useReadingStore((s) => s.theme) ?? 'emerald';
  const setTheme = useReadingStore((s) => s.setTheme);
  const currentColors = themePalettes[theme] ?? emeraldColors;
  return { theme, setTheme, colors: currentColors };
}
