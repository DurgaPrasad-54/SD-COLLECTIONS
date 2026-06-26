import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchCoupons = createAsyncThunk('coupon/fetchAll', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/coupons'); return data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const applyCoupon = createAsyncThunk('coupon/apply', async ({ code, orderAmount }, { rejectWithValue }) => {
  try { const { data } = await api.post('/coupons/apply', { code, orderAmount }); return data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const createCoupon = createAsyncThunk('coupon/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/coupons', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const updateCoupon = createAsyncThunk('coupon/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/coupons/${id}`, payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const deleteCoupon = createAsyncThunk('coupon/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/coupons/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

const couponSlice = createSlice({
  name: 'coupon',
  initialState: { list: [], appliedCoupon: null, discount: 0, loading: false, error: null },
  reducers: {
    clearAppliedCoupon(state) { state.appliedCoupon = null; state.discount = 0; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.fulfilled, (state, action) => { state.list = action.payload.data || []; })
      .addCase(applyCoupon.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedCoupon = action.payload.data;
        state.discount = action.payload.data?.discount || 0;
      })
      .addCase(applyCoupon.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createCoupon.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => { state.list = state.list.filter((c) => c._id !== action.payload); });
  },
});

export const { clearAppliedCoupon } = couponSlice.actions;
export default couponSlice.reducer;
