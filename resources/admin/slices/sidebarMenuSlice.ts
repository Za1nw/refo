import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
    emptySidebarMenu,
    getSidebarMenuFromApi,
    normalizeSidebarMenu,
} from '@menubuilder/lib/sidebar-menu';
import { type SidebarMenuResponse } from '@menubuilder/types/sidebar-menu';
import { type RootState } from '@/store/store';

type FetchSidebarMenuArgs = {
    force?: boolean;
};

export const fetchSidebarMenu = createAsyncThunk<SidebarMenuResponse, FetchSidebarMenuArgs | undefined>(
    'sidebarMenu/fetch',
    async (args) => {
        const payload = await getSidebarMenuFromApi({
            force: Boolean(args?.force),
            throwOnError: true,
        });

        return normalizeSidebarMenu(payload);
    },
    {
        condition: (args, { getState }) => {
            const state = getState() as RootState;

            if (state.sidebarMenu.isLoading) {
                return false;
            }

            if (args?.force) {
                return true;
            }

            return state.sidebarMenu.hasLoaded === false;
        },
    },
);

export type SidebarMenuState = {
    menu: SidebarMenuResponse;
    isLoading: boolean;
    error: string | null;
    hasLoaded: boolean;
    lastLoadedAt: number | null;
    openByKey: Record<string, boolean>;
};

const initialState: SidebarMenuState = {
    menu: emptySidebarMenu,
    isLoading: false,
    error: null,
    hasLoaded: false,
    lastLoadedAt: null,
    openByKey: {},
};

const sidebarMenuSlice = createSlice({
    name: 'sidebarMenu',
    initialState,
    reducers: {
        toggleOpen(state, action: PayloadAction<{ key: string }>) {
            const key = action.payload.key;
            state.openByKey[key] = !state.openByKey[key];
        },
        setOpen(state, action: PayloadAction<{ key: string; open: boolean }>) {
            state.openByKey[action.payload.key] = action.payload.open;
        },
        clearOpen(state) {
            state.openByKey = {};
        },
        clearMenu(state) {
            state.menu = emptySidebarMenu;
            state.isLoading = false;
            state.error = null;
            state.hasLoaded = false;
            state.lastLoadedAt = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSidebarMenu.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSidebarMenu.fulfilled, (state, action) => {
                state.menu = action.payload;
                state.isLoading = false;
                state.error = null;
                state.hasLoaded = true;
                state.lastLoadedAt = Date.now();
            })
            .addCase(fetchSidebarMenu.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message ?? 'Failed to load sidebar menu.';
                state.hasLoaded = true;
            });
    },
});

export const { toggleOpen, setOpen, clearOpen, clearMenu } = sidebarMenuSlice.actions;

export default sidebarMenuSlice.reducer;

export const selectSidebarMenu = (state: RootState) => state.sidebarMenu.menu;
export const selectSidebarMenuLoading = (state: RootState) => state.sidebarMenu.isLoading;
export const selectSidebarMenuError = (state: RootState) => state.sidebarMenu.error;
export const selectSidebarMenuHasLoaded = (state: RootState) => state.sidebarMenu.hasLoaded;
export const selectSidebarMenuOpenByKey = (state: RootState) => state.sidebarMenu.openByKey;
