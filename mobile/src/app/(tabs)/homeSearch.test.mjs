import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { searchChapters, searchQuran, setSearchDatabase } from '../../services/db/searchService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootMobile = path.resolve(__dirname, '../../..');
const dbPath = path.resolve(rootMobile, 'assets/data/quran.db');

describe('Home Screen Search Bar & Navigation Contracts', () => {
  const homeScreenPath = path.resolve(__dirname, 'index.tsx');
  const searchScreenPath = path.resolve(__dirname, 'search.tsx');
  const searchBarPath = path.resolve(rootMobile, 'src/components/common/SearchBar.tsx');

  const homeSource = fs.readFileSync(homeScreenPath, 'utf8');
  const searchSource = fs.readFileSync(searchScreenPath, 'utf8');
  const searchBarSource = fs.readFileSync(searchBarPath, 'utf8');

  it('SearchBar component supports interactive submit, clear, and return key props', () => {
    assert.ok(
      searchBarSource.includes('onSubmitEditing?: () => void;'),
      'SearchBarProps must include onSubmitEditing callback',
    );
    assert.ok(
      searchBarSource.includes('returnKeyType?: ReturnKeyTypeOptions;'),
      'SearchBarProps must include returnKeyType',
    );
    assert.ok(
      searchBarSource.includes('testID?: string;'),
      'SearchBarProps must include testID prop',
    );
    assert.ok(
      searchBarSource.includes('search-bar-submit-button') || searchBarSource.includes('submit-button'),
      'SearchBar must render an interactive submit button on the search icon',
    );
    assert.ok(
      searchBarSource.includes('search-bar-clear-button') || searchBarSource.includes('clear-button'),
      'SearchBar must render an interactive clear button when text is present',
    );
  });

  it('Home screen index.tsx binds SearchBar to search navigation and live preview', () => {
    assert.ok(
      homeSource.includes('onSubmitEditing={handleSearchSubmit}'),
      'HomeScreen must bind SearchBar onSubmitEditing to handleSearchSubmit',
    );
    assert.ok(
      homeSource.includes("router.push({") && homeSource.includes("pathname: '/(tabs)/search'"),
      'HomeScreen handleSearchSubmit must navigate to /(tabs)/search with route params',
    );
    assert.ok(
      homeSource.includes('onClear={handleClearSearch}'),
      'HomeScreen must provide onClear callback to reset search state and quick results',
    );
    assert.ok(
      homeSource.includes('quickSearchResultsPanel'),
      'HomeScreen must include quickSearchResultsPanel for live query preview',
    );
    assert.ok(
      homeSource.includes('home-view-all-search-results'),
      'HomeScreen must provide View All Results button to jump to full search screen',
    );
  });

  it('SearchScreen search.tsx reads route query params and triggers initial search', () => {
    assert.ok(
      searchSource.includes('useLocalSearchParams'),
      'SearchScreen must import and use useLocalSearchParams from expo-router',
    );
    assert.ok(
      searchSource.includes('params.q'),
      'SearchScreen must observe params.q to execute search for queries passed from Home screen',
    );
    assert.ok(
      searchSource.includes('searchChapters'),
      'SearchScreen must search matching Surahs via searchChapters',
    );
    assert.ok(
      searchSource.includes('matchedChapters'),
      'SearchScreen must render matching chapters when available',
    );
  });

  it('Verifies end-to-end SQLite search results for Surahs and Verses', async () => {
    const db = new DatabaseSync(dbPath, { readOnly: true });
    setSearchDatabase(db);

    // Search Surah by name
    const surahResults = await searchChapters('یس');
    assert.ok(surahResults.length > 0, 'Must match Surah Ya-Sin');
    assert.strictEqual(surahResults[0].id, 36);

    // Search Verses by query
    const verseResults = await searchQuran('یس', 5);
    assert.ok(verseResults.length > 0, 'Must return matching verses for query');

    setSearchDatabase(null);
    db.close();
  });
});
