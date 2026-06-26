import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchSalesAnalytics = createAsyncThunk(
  'admin/fetchSalesAnalytics',
  async (year = new Date().getFullYear(), { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/analytics/sales?year=${year}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    sidebarCollapsed: false,
    stats: null,
    salesAnalytics: null,
    statsLoading: false,
    analyticsLoading: false,
    error: null,
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.statsLoading = true; state.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.statsLoading = false; state.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.statsLoading = false; state.error = action.payload; })
      .addCase(fetchSalesAnalytics.pending, (state) => { state.analyticsLoading = true; })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => { state.analyticsLoading = false; state.salesAnalytics = action.payload; })
      .addCase(fetchSalesAnalytics.rejected, (state, action) => { state.analyticsLoading = false; state.error = action.payload; });
  },
});

export const { toggleSidebar } = adminSlice.actions;
export default adminSlice.reducer;
