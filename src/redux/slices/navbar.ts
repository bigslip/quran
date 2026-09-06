import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export enum SettingsView {
  Body = 'body',
  Translation = 'translation',
  Reciter = 'reciter',
  Tafsir = 'tafsir',
  RepeatSettings = 'repeatSettings',
}

export enum SettingsTab {
  Arabic = 'arabic',
  Translation = 'translation',
  WBW = 'wbw',
}

export type Navbar = {
  isVisible: boolean;
  isNavigationDrawerOpen: boolean;
  isSearchDrawerOpen: boolean;
  isSettingsDrawerOpen: boolean;
  isLanguageDrawerOpen: boolean;
  settingsView: SettingsView;
  lastSettingsView: SettingsView;
  lastSettingsTab: SettingsTab;
  disableSearchDrawerTransition: boolean;
  lockVisibilityState: boolean;
};

const initialState: Navbar = {
  isVisible: true,
  isNavigationDrawerOpen: false,
  isSearchDrawerOpen: false,
  isSettingsDrawerOpen: false,
  isLanguageDrawerOpen: false,
  settingsView: SettingsView.Body,
  lastSettingsView: SettingsView.Body,
  lastSettingsTab: SettingsTab.Arabic,
  disableSearchDrawerTransition: false,
  lockVisibilityState: false,
};

export const navbarSlice = createSlice({
  name: SliceName.NAVBAR,
  initialState,
  reducers: {
    setIsVisible: (state: Navbar, action: PayloadAction<boolean>) => {
      const nextVisible = state.lockVisibilityState ? state.isVisible : action.payload;
      if (state.isVisible === nextVisible) {
        return state;
      }
      return {
        ...state,
        // Only update visibility if the lock is not active
        isVisible: nextVisible,
      };
    },
    setLockVisibilityState: (state: Navbar, action: PayloadAction<boolean>) => {
      if (state.lockVisibilityState === action.payload) {
        return state;
      }
      return {
        ...state,
        lockVisibilityState: action.payload,
      };
    },
    setIsNavigationDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => {
      if (state.isNavigationDrawerOpen === action.payload) {
        return state;
      }
      return {
        ...state,
        isNavigationDrawerOpen: action.payload,
      };
    },
    setIsSearchDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => {
      if (state.isSearchDrawerOpen === action.payload) {
        return state;
      }
      return {
        ...state,
        isSearchDrawerOpen: action.payload,
      };
    },
    setIsSearchModalOpen: (state: Navbar, action: PayloadAction<boolean>) => {
      if (state.isSearchDrawerOpen === action.payload) {
        return state;
      }
      return {
        ...state,
        isSearchDrawerOpen: action.payload,
      };
    },
    toggleSearchDrawerIsOpen: (state: Navbar) => ({
      ...state,
      isSearchDrawerOpen: !state.isSearchDrawerOpen,
    }),
    toggleSearchModalIsOpen: (state: Navbar) => ({
      ...state,
      isSearchDrawerOpen: !state.isSearchDrawerOpen,
    }),
    setIsSettingsDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => {
      if (state.isSettingsDrawerOpen === action.payload) {
        return state;
      }
      return {
        ...state,
        isSettingsDrawerOpen: action.payload,
        // Reset views when drawer is closed
        ...(action.payload === false && {
          settingsView: SettingsView.Body,
          lastSettingsView: SettingsView.Body,
        }),
      };
    },
    setIsLanguageDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => {
      if (state.isLanguageDrawerOpen === action.payload) {
        return state;
      }
      return {
        ...state,
        isLanguageDrawerOpen: action.payload,
      };
    },
    setIsLanguageModalOpen: (state: Navbar, action: PayloadAction<boolean>) => {
      if (state.isLanguageDrawerOpen === action.payload) {
        return state;
      }
      return {
        ...state,
        isLanguageDrawerOpen: action.payload,
      };
    },
    toggleLanguageDrawerIsOpen: (state: Navbar) => ({
      ...state,
      isLanguageDrawerOpen: !state.isLanguageDrawerOpen,
    }),
    toggleLanguageModalIsOpen: (state: Navbar) => ({
      ...state,
      isLanguageDrawerOpen: !state.isLanguageDrawerOpen,
    }),
    setSettingsView: (state: Navbar, action: PayloadAction<SettingsView>) => {
      if (state.settingsView === action.payload) {
        return state;
      }
      return {
        ...state,
        settingsView: action.payload,
        // Track the last non-Body view for navigation context
        lastSettingsView:
          action.payload !== SettingsView.Body ? action.payload : state.lastSettingsView,
      };
    },
    setDisableSearchDrawerTransition: (state: Navbar, action: PayloadAction<boolean>) => {
      if (state.disableSearchDrawerTransition === action.payload) {
        return state;
      }
      return {
        ...state,
        disableSearchDrawerTransition: action.payload,
      };
    },
    setLastSettingsTab: (state: Navbar, action: PayloadAction<SettingsTab>) => {
      if (state.lastSettingsTab === action.payload) {
        return state;
      }
      return {
        ...state,
        lastSettingsTab: action.payload,
      };
    },
  },
});

export const {
  setIsVisible,
  setLockVisibilityState,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsSearchModalOpen,
  setIsSettingsDrawerOpen,
  setIsLanguageDrawerOpen,
  setIsLanguageModalOpen,
  setSettingsView,
  toggleSearchDrawerIsOpen,
  toggleSearchModalIsOpen,
  toggleLanguageDrawerIsOpen,
  toggleLanguageModalIsOpen,
  setDisableSearchDrawerTransition,
  setLastSettingsTab,
} = navbarSlice.actions;

export const selectNavbar = (state: RootState) => state.navbar;
export const selectIsSearchDrawerOpen = (state: RootState) => state.navbar.isSearchDrawerOpen;
export const selectIsSearchModalOpen = (state: RootState) => state.navbar.isSearchDrawerOpen;
export const selectIsNavigationDrawerOpen = (state: RootState) =>
  state.navbar.isNavigationDrawerOpen;
export const selectIsSettingsDrawerOpen = (state: RootState) => state.navbar.isSettingsDrawerOpen;
export const selectIsLanguageDrawerOpen = (state: RootState) => state.navbar.isLanguageDrawerOpen;
export const selectIsLanguageModalOpen = (state: RootState) => state.navbar.isLanguageDrawerOpen;

export default navbarSlice.reducer;
