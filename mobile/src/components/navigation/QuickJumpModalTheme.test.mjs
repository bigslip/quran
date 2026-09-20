import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modalSource = fs.readFileSync(path.resolve(__dirname, './QuickJumpModal.tsx'), 'utf8');
const pageTabSource = fs.readFileSync(path.resolve(__dirname, './PageJumpTab.tsx'), 'utf8');
const surahTabSource = fs.readFileSync(path.resolve(__dirname, './SurahAyahJumpTab.tsx'), 'utf8');
const juzTabSource = fs.readFileSync(path.resolve(__dirname, './JuzJumpTab.tsx'), 'utf8');

describe('QuickJumpModal Theme Tokenization Tests', () => {
  it('does not contain hardcoded dark emerald background hexes in QuickJumpModal', () => {
    assert.ok(!modalSource.includes('#07241c'), 'QuickJumpModal should not contain #07241c');
    assert.ok(!modalSource.includes('#041610'), 'QuickJumpModal should not contain #041610');
    assert.ok(!modalSource.includes('#0a2e24'), 'QuickJumpModal should not contain #0a2e24');
  });

  it('does not contain hardcoded dark emerald background hexes in PageJumpTab', () => {
    assert.ok(!pageTabSource.includes('#07241c'), 'PageJumpTab should not contain #07241c');
    assert.ok(!pageTabSource.includes('#041610'), 'PageJumpTab should not contain #041610');
    assert.ok(!pageTabSource.includes('#0a2e24'), 'PageJumpTab should not contain #0a2e24');
  });

  it('does not contain hardcoded dark emerald background hexes in SurahAyahJumpTab', () => {
    assert.ok(!surahTabSource.includes('#07241c'), 'SurahAyahJumpTab should not contain #07241c');
    assert.ok(!surahTabSource.includes('#041610'), 'SurahAyahJumpTab should not contain #041610');
    assert.ok(!surahTabSource.includes('#0a2e24'), 'SurahAyahJumpTab should not contain #0a2e24');
  });

  it('does not contain hardcoded dark emerald background hexes in JuzJumpTab', () => {
    assert.ok(!juzTabSource.includes('#07241c'), 'JuzJumpTab should not contain #07241c');
    assert.ok(!juzTabSource.includes('#041610'), 'JuzJumpTab should not contain #041610');
    assert.ok(!juzTabSource.includes('#0a2e24'), 'JuzJumpTab should not contain #0a2e24');
  });

  it('uses useThemeColors hook in QuickJumpModal and child tab components', () => {
    assert.ok(modalSource.includes('useThemeColors'), 'QuickJumpModal must consume useThemeColors');
    assert.ok(pageTabSource.includes('useThemeColors'), 'PageJumpTab must consume useThemeColors');
    assert.ok(
      surahTabSource.includes('useThemeColors'),
      'SurahAyahJumpTab must consume useThemeColors',
    );
    assert.ok(juzTabSource.includes('useThemeColors'), 'JuzJumpTab must consume useThemeColors');
  });
});
