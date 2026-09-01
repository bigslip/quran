import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type ContextMenu = {
  isExpanded: boolean;
  showReadingPreferenceSwitcher: boolean;
  isTajweedBarExpanded: boolean;
};

const initialState: ContextMenu = {
  isExpanded: true,
  showReadingPreferenceSwitcher: false,
  isTajweedBarExpanded: false,
};

export const contextMenuSlice = createSlice({
  name: SliceName.CONTEXT_MENU,
  initialState,
  reducers: {
    setIsExpanded: (state: ContextMenu, action: PayloadAction<boolean>) => {
      if (state.isExpanded === action.payload) {
        return state;
      }
      return {
        ...state,
        isExpanded: action.payload,
      };
    },
    setShowReadingPreferenceSwitcher: (state: ContextMenu, action: PayloadAction<boolean>) => {
      if (state.showReadingPreferenceSwitcher === action.payload) {
        return state;
      }
      return {
        ...state,
        showReadingPreferenceSwitcher: action.payload,
      };
    },
    setIsTajweedBarExpanded: (state: ContextMenu, action: PayloadAction<boolean>) => {
      if (state.isTajweedBarExpanded === action.payload) {
        return state;
      }
      return {
        ...state,
        isTajweedBarExpanded: action.payload,
      };
    },
  },
});

export const { setIsExpanded, setShowReadingPreferenceSwitcher, setIsTajweedBarExpanded } =
  contextMenuSlice.actions;

export const selectContextMenu = (state: RootState) => state.contextMenu;
export const selectIsExpanded = (state: RootState) => state.contextMenu.isExpanded;
export const selectIsTajweedBarExpanded = (state: RootState) =>
  state.contextMenu.isTajweedBarExpanded;

export default contextMenuSlice.reducer;
