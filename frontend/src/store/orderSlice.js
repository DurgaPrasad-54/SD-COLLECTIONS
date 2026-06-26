import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchOrders = createAsyncThunk('order/fetchAll', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/orders/my-orders'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const fetchAllOrders = createAsyncThunk('order/fetchAllAdmin', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/orders', { params }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const fetchOrderById = createAsyncThunk('order/fetchById', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/orders/${id}`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const placeOrder = createAsyncThunk('order/place', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/orders', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const updateOrderStatus = createAsyncThunk('order/updateStatus', async ({ id, orderStatus }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/orders/${id}/status`, { orderStatus }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const cancelOrder = createAsyncThunk('order/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/orders/${id}/cancel`, { reason }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

const orderSlice = createSlice({
  name: 'order',
  initialState: { list: [], adminList: [], current: null, loading: false, error: null },
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    const p = (state) => { state.loading = true; state.error = null; };
    const r = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(fetchOrders.pending, p)
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.list = action.payload.orders || action.payload; })
      .addCase(fetchOrders.rejected, r)
      .addCase(fetchAllOrders.pending, p)
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.loading = false; state.adminList = action.payload.orders || action.payload; })
      .addCase(fetchAllOrders.rejected, r)
      .addCase(fetchOrderById.pending, p)
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchOrderById.rejected, r)
      .addCase(placeOrder.pending, p)
      .addCase(placeOrder.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; state.list.unshift(action.payload); })
      .addCase(placeOrder.rejected, r)
      .addCase(cancelOrder.pending, p)
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        const idx = state.list.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(cancelOrder.rejected, r)
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.adminList.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.adminList[idx] = action.payload;
      });
  },
});

export const { clearCurrent } = orderSlice.actions;
export default orderSlice.reducer;
