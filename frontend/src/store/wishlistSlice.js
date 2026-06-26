import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const getLocalWishlist = () => JSON.parse(localStorage.getItem('wishlist') || '[]');

// Fetch remote wishlist
export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/wishlist');
    return data.data?.products || [];
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Add item to wishlist (syncs with server if logged in)
export const addToWishlist = createAsyncThunk('wishlist/add', async (product, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth.token) {
    try {
      const { data } = await api.post('/wishlist', { productId: product._id });
      return data.data?.products || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  } else {
    // Guest logic
    const wishlist = getLocalWishlist();
    const exists = wishlist.some((i) => i._id === product._id);
    if (!exists) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    return wishlist;
  }
});

// Remove item from wishlist
export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth.token) {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      return data.data?.products || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  } else {
    // Guest logic
    const wishlist = getLocalWishlist().filter((i) => i._id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    return wishlist;
  }
});

// Clear wishlist
export const clearWishlist = createAsyncThunk('wishlist/clear', async (_, { rejectWithValue }) => {
  localStorage.removeItem('wishlist');
  return [];
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: getLocalWishlist(),
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const handleFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload;
      localStorage.setItem('wishlist', JSON.stringify(action.payload));
    };
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update wishlist';
    };

    builder
      .addCase(fetchWishlist.pending, handlePending)
      .addCase(fetchWishlist.fulfilled, handleFulfilled)
      .addCase(fetchWishlist.rejected, handleRejected)
      .addCase(addToWishlist.pending, handlePending)
      .addCase(addToWishlist.fulfilled, handleFulfilled)
      .addCase(addToWishlist.rejected, handleRejected)
      .addCase(removeFromWishlist.pending, handlePending)
      .addCase(removeFromWishlist.fulfilled, handleFulfilled)
      .addCase(removeFromWishlist.rejected, handleRejected)
      .addCase(clearWishlist.fulfilled, handleFulfilled);
  },
});

export default wishlistSlice.reducer;
