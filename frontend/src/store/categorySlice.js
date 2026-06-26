import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchCategories = createAsyncThunk('category/fetchAll', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/categories'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const createCategory = createAsyncThunk('category/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/categories', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const updateCategory = createAsyncThunk('category/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/categories/${id}`, payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const deleteCategory = createAsyncThunk('category/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/categories/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

const categorySlice = createSlice({
  name: 'category',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createCategory.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
