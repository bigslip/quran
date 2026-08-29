import { describe, it, expect } from 'vitest';
import reducer, {
  addSearchHistoryRecord,
  removeSearchHistoryRecord,
  selectSearchHistory,
  Search,
} from './search';

describe('search slice', () => {
  const initialState: Search = {
    searchHistory: [],
  };

  it('adds new search queries and maintains max limit of 5', () => {
    let state = reducer(initialState, addSearchHistoryRecord('query 1'));
    state = reducer(state, addSearchHistoryRecord('query 2'));
    state = reducer(state, addSearchHistoryRecord('query 3'));
    state = reducer(state, addSearchHistoryRecord('query 4'));
    state = reducer(state, addSearchHistoryRecord('query 5'));

    expect(state.searchHistory).toEqual(['query 5', 'query 4', 'query 3', 'query 2', 'query 1']);

    // Adding 6th should drop the oldest (query 1)
    state = reducer(state, addSearchHistoryRecord('query 6'));
    expect(state.searchHistory).toEqual(['query 6', 'query 5', 'query 4', 'query 3', 'query 2']);
  });

  it('moves existing query to the front without premature truncation', () => {
    let state: Search = {
      searchHistory: ['e', 'd', 'c', 'b', 'a'],
    };

    // Re-searching for 'b' should move 'b' to the front and retain all 5 items
    state = reducer(state, addSearchHistoryRecord('b'));
    expect(state.searchHistory).toEqual(['b', 'e', 'd', 'c', 'a']);
    expect(state.searchHistory.length).toBe(5);
  });

  it('ignores empty or whitespace-only search records', () => {
    let state: Search = {
      searchHistory: ['existing'],
    };

    state = reducer(state, addSearchHistoryRecord('   '));
    expect(state.searchHistory).toEqual(['existing']);
  });

  it('removes search history record by query value', () => {
    const state: Search = {
      searchHistory: ['one', 'two', 'three'],
    };

    const newState = reducer(state, removeSearchHistoryRecord('two'));
    expect(newState.searchHistory).toEqual(['one', 'three']);
  });

  it('selects search history from root state', () => {
    const rootState = {
      search: {
        searchHistory: ['test 1', 'test 2'],
      },
    };

    expect(selectSearchHistory(rootState as any)).toEqual(['test 1', 'test 2']);
  });
});
