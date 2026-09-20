import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const glowSource = fs.readFileSync(path.resolve(__dirname, './AmbientGlow.tsx'), 'utf8');
const rootLayoutSource = fs.readFileSync(path.resolve(__dirname, '../../app/_layout.tsx'), 'utf8');
const tabLayoutSource = fs.readFileSync(
  path.resolve(__dirname, '../../app/(tabs)/_layout.tsx'),
  'utf8',
);

describe('AmbientGlow Theme Awareness Tests', () => {
  it('verifies AmbientGlow utilizes theme colors rather than static hardcoded hexes', () => {
    assert.ok(
      glowSource.includes('useThemeColors') || glowSource.includes('useAppTheme'),
      'AmbientGlow should import and use useThemeColors or useAppTheme',
    );
    assert.ok(
      !glowSource.includes('stopColor="#041410"'),
      'AmbientGlow should not have hardcoded #041410 stopColor',
    );
  });

  it('verifies theme-specific glow configurations exist for emerald, dark, sepia, and light', () => {
    assert.ok(glowSource.includes('emerald'));
    assert.ok(glowSource.includes('dark'));
    assert.ok(glowSource.includes('sepia'));
    assert.ok(glowSource.includes('light'));
  });

  it('verifies base stop color is dynamically bound to colors.background', () => {
    assert.ok(glowSource.includes('colors.background'));
  });
});

describe('Root & Tab Navigation Chrome Theming Tests', () => {
  it('verifies RootLayout binds StatusBar, background View, and Stack contentStyle to theme', () => {
    assert.ok(rootLayoutSource.includes('useAppTheme'));
    assert.ok(
      rootLayoutSource.includes("isDark ? 'light' : 'dark'") ||
        rootLayoutSource.includes('isDark ? "light" : "dark"'),
    );
    assert.ok(rootLayoutSource.includes('contentStyle: { backgroundColor: colors.background }'));
    assert.ok(rootLayoutSource.includes('backgroundColor={colors.background}'));
    assert.ok(rootLayoutSource.includes('translucent={true}'));
  });

  it('verifies TabLayout binds tabBarStyle, activeTintColor, and inactiveTintColor to theme tokens', () => {
    assert.ok(
      tabLayoutSource.includes('useThemeColors') || tabLayoutSource.includes('useAppTheme'),
    );
    assert.ok(tabLayoutSource.includes('colors.surfaceFloating'));
    assert.ok(tabLayoutSource.includes('colors.borderSubtle'));
    assert.ok(tabLayoutSource.includes('colors.primary'));
    assert.ok(tabLayoutSource.includes('colors.textMuted'));
  });
});
