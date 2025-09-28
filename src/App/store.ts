import { configureStore } from "@reduxjs/toolkit";
import ShipmentsReducer from "../Features/ShipmentsSlice";
import SidebarReducer from "../Features/SidebarSlice";

const store = configureStore({
    reducer: {
        shipments: ShipmentsReducer,
        sidebar: SidebarReducer,
    }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>
export default store;