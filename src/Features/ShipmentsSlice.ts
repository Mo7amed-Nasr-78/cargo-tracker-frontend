import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface ShipmentState {
    data: object[],
    loading: boolean,
    error: string | null | undefined
}

interface Filter {
    status: string,
    orderBy: string,
}

const initialState: ShipmentState = {
    data: [],
    loading: false,
    error: null
}

export const fetchShipments = createAsyncThunk(
    'shipments/fetchShipments',
    async ({ status, orderBy }: Filter) => {
        try {
            const { data }  = await axios.get(
                `${import.meta.env.VITE_APP_URL}/api/shipments?orderBy=${orderBy}&status=${status}`
            );
            return data.shipments;
        } catch(err) {
            console.log(err);
        }
    }
)

export const ShipmentsSlice = createSlice({
    name: 'shipments',
    initialState,
    reducers: {
        addShipment: (state, action) => {
            state.data.push(action.payload);
        },
        updateShipment: (state, action) => {
            const updateShipments = state.data.map((shipment) => {
                return shipment.shipmentId === action.payload.shipment.shipmentId? { ...shipment, ...action.payload.shipment } : shipment;
            });

            return { ...state, data: updateShipments }
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchShipments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchShipments.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.data = action.payload;
                }
            })
            .addCase(fetchShipments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
});


export const { addShipment, updateShipment } = ShipmentsSlice.actions;
export default ShipmentsSlice.reducer;