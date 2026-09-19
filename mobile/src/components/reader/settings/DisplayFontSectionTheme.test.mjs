import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const source = fs.readFileSync(path.resolve(__dirname, './DisplayFontSection.tsx'), 'utf8');
const settingsSource = fs.readFileSync(
  path.resolve(__dirname, '../../../app/(tabs)/settings.tsx'),
  'utf8',
);

describe('DisplayFontSection Theme Switcher Tests', () => {
  it('implements 4-way theme selector with all 4 themes and accessibility attributes', () => {
    assert.ok(source.includes('theme-dark'), 'Must include theme-dark testID');
    assert.ok(source.includes('theme-emerald'), 'Must include theme-emerald testID');
    assert.ok(source.includes('theme-sepia'), 'Must include theme-sepia testID');
    assert.ok(source.includes('theme-light'), 'Must include theme-light testID');
    assert.ok(
      source.includes('minHeight: 44') || source.includes('minHeight: stepperButtonSize'),
      'Must guarantee touch targets >= 44pt',
    );
    assert.ok(source.includes('accessibilityRole="button"'), 'Must have button accessibility role');
  });

  it('renders all 4 Persian theme names and accessibility labels in DisplayFontSection', () => {
    assert.ok(source.includes('شبستان'), 'Must include dark theme name شبستان');
    assert.ok(source.includes('شب معنوی'), 'Must include emerald theme name شب معنوی');
    assert.ok(source.includes('مصحف پوستی'), 'Must include sepia theme name مصحف پوستی');
    assert.ok(source.includes('وضوح روز'), 'Must include light theme name وضوح روز');
    assert.ok(
      source.includes('فعالسازی تم') || source.includes('فعال‌سازی تم'),
      'Must provide Persian accessibility label for theme activation',
    );
    assert.ok(
      source.includes('تم و رنگ‌بندی مصحف') || source.includes('تم و رنگبندی مصحف'),
      'Must have theme section heading',
    );
  });

  it('provides swatch color indicator for each theme option in reader settings', () => {
    assert.ok(
      source.includes('themeSwatch') ||
        source.includes('swatchDot') ||
        source.includes('colorIndicator') ||
        source.includes('swatch'),
      'Must have swatch indicator style or element',
    );
  });

  it('implements theme selector cards in settings screen with dynamic useThemeColors', () => {
    assert.ok(
      settingsSource.includes('useThemeColors') || settingsSource.includes('useAppTheme'),
      'Settings screen must consume dynamic theme hook',
    );
    assert.ok(
      settingsSource.includes('پوسته و رنگبندی') || settingsSource.includes('پوسته و رنگ‌بندی'),
      'Settings screen must include theme section heading',
    );
    assert.ok(settingsSource.includes('setTheme'), 'Settings screen must call setTheme');
    assert.ok(settingsSource.includes('dark'), 'Settings must support dark');
    assert.ok(settingsSource.includes('emerald'), 'Settings must support emerald');
    assert.ok(settingsSource.includes('sepia'), 'Settings must support sepia');
    assert.ok(settingsSource.includes('light'), 'Settings must support light');
  });
});
