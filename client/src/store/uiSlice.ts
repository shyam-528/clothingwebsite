import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  cartDrawerOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
}

const stored = (localStorage.getItem('ut_theme') as Theme) || 'light';

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  localStorage.setItem('ut_theme', theme);
};

applyTheme(stored);

const slice = createSlice({
  name: 'ui',
  initialState: {
    theme: stored,
    cartDrawerOpen: false,
    mobileMenuOpen: false,
    searchOpen: false,
  } as UIState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(state.theme);
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      applyTheme(state.theme);
    },
    openCart(state) {
      state.cartDrawerOpen = true;
    },
    closeCart(state) {
      state.cartDrawerOpen = false;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false;
    },
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
    },
    closeSearch(state) {
      state.searchOpen = false;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  openCart,
  closeCart,
  toggleMobileMenu,
  closeMobileMenu,
  toggleSearch,
  closeSearch,
} = slice.actions;
export default slice.reducer;
