import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    theme: localStorage.getItem('theme') || 'dark',
    isSidebarOpen: false,
    isSearchOpen: false,
    toasts: [],
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', state.theme);
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        openSidebar: (state) => {
            state.isSidebarOpen = true;
        },
        closeSidebar: (state) => {
            state.isSidebarOpen = false;
        },
        toggleSearch: (state) => {
            state.isSearchOpen = !state.isSearchOpen;
        },
        openSearch: (state) => {
            state.isSearchOpen = true;
        },
        closeSearch: (state) => {
            state.isSearchOpen = false;
        },
        addToast: (state, action) => {
            state.toasts.push({
                id: Date.now(),
                ...action.payload,
            });
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
        },
    },
});

export const {
    toggleTheme,
    setTheme,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    toggleSearch,
    openSearch,
    closeSearch,
    addToast,
    removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;

export const selectTheme = (state) => state.ui.theme;
export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen;
export const selectIsSearchOpen = (state) => state.ui.isSearchOpen;
export const selectToasts = (state) => state.ui.toasts;
