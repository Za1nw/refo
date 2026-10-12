import { configureStore } from '@reduxjs/toolkit';

import sidebarMenuReducer from '../slices/sidebarMenuSlice';
import tableReducer from '../features/table';

export function makeStore() {
    return configureStore({
        reducer: {
            sidebarMenu: sidebarMenuReducer,
            table: tableReducer,
        },
    });
}

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
