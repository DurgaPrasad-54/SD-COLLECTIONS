import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const getLocalCart = () => JSON.parse(localStorage.getItem('cart') || '[]');

const mapBackendCart = (backendCart) => {
  if (!backendCart || !backendCart.items) return [];
  return backendCart.items.map((item) => {
    const p = item.product || {};
    return {
      key: item._id,
      productId: p._id || item.product,
      name: p.name || 'Product',
      price: item.price,
      image: p.images?.[0]?.url || '',
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || '',
    };
  });
};

// Fetch remote cart
export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return mapBackendCart(data.data);
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Add to cart (syncs with server if logged in)
export const addToCart = createAsyncThunk('cart/add', async (payload, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth.token) {
    try {
      const { data } = await api.post('/cart', {
        productId: payload.productId,
        quantity: payload.quantity || 1,
        size: payload.size,
        color: payload.color,
      });
      return mapBackendCart(data.data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  } else {
    // Guest logic
    const cart = getLocalCart();
    const key = `${payload.productId}-${payload.size || ''}-${payload.color || ''}`;
    const existing = cart.find((i) => i.key === key);
    if (existing) {
      existing.quantity += payload.quantity || 1;
    } else {
      cart.push({ key, ...payload });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  }
});

// Remove from cart
export const removeFromCart = createAsyncThunk('cart/remove', async (key, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth.token) {
    try {
      const { data } = await api.delete(`/cart/${key}`);
      return mapBackendCart(data.data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  } else {
    // Guest logic
    const cart = getLocalCart().filter((i) => i.key !== key);
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  }
});

// Update cart quantity
export const updateQuantity = createAsyncThunk('cart/updateQuantity', async ({ key, quantity }, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth.token) {
    try {
      const { data } = await api.put(`/cart/${key}`, { quantity });
      return mapBackendCart(data.data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  } else {
    // Guest logic
    const cart = getLocalCart();
    const item = cart.find((i) => i.key === key);
    if (item) item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  }
});

// Clear cart
export const clearCart = createAsyncThunk('cart/clear', async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth.token) {
    try {
      const { data } = await api.delete('/cart');
      return mapBackendCart(data.data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  } else {
    // Guest logic
    localStorage.removeItem('cart');
    return [];
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getLocalCart(),
    loading: false,
    error: null,
  },
  reducers: {
    syncLocalCart(state, action) {
      state.items = action.payload;
      localStorage.setItem('cart', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    const handleFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload;
      localStorage.setItem('cart', JSON.stringify(action.payload));
    };
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update cart';
    };

    builder
      .addCase(fetchCart.pending, handlePending)
      .addCase(fetchCart.fulfilled, handleFulfilled)
      .addCase(fetchCart.rejected, handleRejected)
      .addCase(addToCart.pending, handlePending)
      .addCase(addToCart.fulfilled, handleFulfilled)
      .addCase(addToCart.rejected, handleRejected)
      .addCase(removeFromCart.pending, handlePending)
      .addCase(removeFromCart.fulfilled, handleFulfilled)
      .addCase(removeFromCart.rejected, handleRejected)
      .addCase(updateQuantity.pending, handlePending)
      .addCase(updateQuantity.fulfilled, handleFulfilled)
      .addCase(updateQuantity.rejected, handleRejected)
      .addCase(clearCart.pending, handlePending)
      .addCase(clearCart.fulfilled, handleFulfilled)
      .addCase(clearCart.rejected, handleRejected);
  },
});

export const { syncLocalCart } = cartSlice.actions;
export default cartSlice.reducer;
