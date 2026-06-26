import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchProducts = createAsyncThunk('product/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const fetchProductById = createAsyncThunk('product/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const createProduct = createAsyncThunk('product/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/products', payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const updateProduct = createAsyncThunk('product/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/products/${id}`, payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const deleteProduct = createAsyncThunk('product/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

const productSlice = createSlice({
  name: 'product',
  initialState: {
    list: [],
    total: 0,
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(fetchProducts.pending, pending)
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.total = action.payload.total || state.list.length;
      })
      .addCase(fetchProducts.rejected, rejected)
      .addCase(fetchProductById.pending, pending)
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchProductById.rejected, rejected)
      .addCase(createProduct.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearCurrent } = productSlice.actions;
export default productSlice.reducer;
