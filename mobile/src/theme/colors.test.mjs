import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  colors,
  emeraldColors,
  darkColors,
  sepiaColors,
  lightColors,
  themePalettes,
} from './colors.ts';

// Helper to compute luminance & contrast ratio according to WCAG 2.1 specs
function getLuminance(hex) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3)
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  const rgb = [0, 2, 4].map((offset) => {
    const val = parseInt(cleaned.slice(offset, offset + 2), 16) / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Theme Palettes & Token Contracts', () => {
  it('preserves static colors export matching emeraldColors for 100% backward compatibility', () => {
    assert.strictEqual(colors, emeraldColors);
    assert.strictEqual(colors.goldAccent, '#fbbf24');
    assert.strictEqual(colors.surfaceCard, 'rgba(6, 32, 25, 0.75)');
    assert.strictEqual(colors.background, '#041410');
  });

  it('verifies all 4 palettes have identical token keys', () => {
    const keys = Object.keys(emeraldColors).sort();
    assert.deepStrictEqual(Object.keys(darkColors).sort(), keys);
    assert.deepStrictEqual(Object.keys(sepiaColors).sort(), keys);
    assert.deepStrictEqual(Object.keys(lightColors).sort(), keys);
    assert.deepStrictEqual(Object.keys(themePalettes).sort(), [
      'dark',
      'emerald',
      'light',
      'sepia',
    ]);
  });

  it('enforces WCAG AAA contrast ratio for Ayah textPrimary against background across all themes', () => {
    // dark: #f8fafc on #121212
    const darkRatio = getContrastRatio(darkColors.textPrimary, darkColors.background);
    assert.ok(darkRatio >= 14, `Dark theme contrast too low: ${darkRatio}`);

    // emerald: #f0fdf4 on #041410
    const emeraldRatio = getContrastRatio(emeraldColors.textPrimary, emeraldColors.background);
    assert.ok(emeraldRatio >= 14, `Emerald theme contrast too low: ${emeraldRatio}`);

    // sepia: #2D2319 on #FBF7EE
    const sepiaRatio = getContrastRatio(sepiaColors.textPrimary, sepiaColors.background);
    assert.ok(sepiaRatio >= 11, `Sepia theme contrast too low: ${sepiaRatio}`);

    // light: #0F172A on #F8FAFC
    const lightRatio = getContrastRatio(lightColors.textPrimary, lightColors.background);
    assert.ok(lightRatio >= 15, `Light theme contrast too low: ${lightRatio}`);
  });

  it('enforces darkened goldAccent for Light and Sepia to guarantee rosette visibility', () => {
    const sepiaGoldContrast = getContrastRatio(sepiaColors.goldAccent, sepiaColors.background);
    assert.ok(sepiaGoldContrast >= 4.5, `Sepia gold contrast too low: ${sepiaGoldContrast}`);

    const lightGoldContrast = getContrastRatio(lightColors.goldAccent, lightColors.background);
    assert.ok(lightGoldContrast >= 3.0, `Light gold contrast too low: ${lightGoldContrast}`);
  });
});
