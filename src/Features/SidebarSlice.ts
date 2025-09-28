import { createSlice } from "@reduxjs/toolkit";


export const SidebarSlice = createSlice({
    name: 'sidebar',
    initialState: {
        openSidebar: true,
    },
    reducers: {
        sidebarTogle: (state) => {
            state.openSidebar = !state.openSidebar;
        }
    }
})

export const { sidebarTogle } = SidebarSlice.actions;
export default SidebarSlice.reducer;