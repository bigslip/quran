import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type Search = {
  searchHistory: string[];
};

const initialState: Search = { searchHistory: [] };

const MAXIMUM_RECENT_SEARCH_QUERIES = 5;

export const searchSlice = createSlice({
  name: SliceName.SEARCH,
  initialState,
  reducers: {
    addSearchHistoryRecord: (state: Search, action: PayloadAction<string>) => {
      const newSearchQuery = action.payload?.trim();
      if (!newSearchQuery) return state;

      // Filter out existing occurrence first so duplicates move to the front
      const filteredHistory = state.searchHistory.filter(
        (currentSearchQuery) => currentSearchQuery !== newSearchQuery,
      );

      // Prepend the new query and slice to maximum length
      const newSearchHistory = [newSearchQuery, ...filteredHistory].slice(
        0,
        MAXIMUM_RECENT_SEARCH_QUERIES,
      );

      return {
        ...state,
        searchHistory: newSearchHistory,
      };
    },
    removeSearchHistoryRecord: (state: Search, action: PayloadAction<string>) => {
      // filter out the search queries from the current search queries array.
      const newSearchHistory = [...state.searchHistory].filter(
        (currentSearchQuery) => currentSearchQuery !== action.payload,
      );
      return {
        ...state,
        searchHistory: newSearchHistory,
      };
    },
  },
});

export const { addSearchHistoryRecord, removeSearchHistoryRecord } = searchSlice.actions;

export const selectSearchHistory = (state: RootState) => state.search.searchHistory;

export default searchSlice.reducer;
