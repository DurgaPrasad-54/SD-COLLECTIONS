import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const user = JSON.parse(localStorage.getItem('user') || 'null');
const token = localStorage.getItem('token') || null;

// Send registration OTP
export const sendRegisterOtp = createAsyncThunk('auth/sendRegisterOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register/send-otp', payload);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Verify registration OTP and complete sign up
export const verifyRegisterOtp = createAsyncThunk('auth/verifyRegisterOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register/verify-otp', payload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Send user login OTP
export const sendLoginOtp = createAsyncThunk('auth/sendLoginOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login/send-otp', payload);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Verify user login OTP and sign in
export const verifyLoginOtp = createAsyncThunk('auth/verifyLoginOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login/verify-otp', payload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Send admin login OTP
export const sendAdminOtp = createAsyncThunk('auth/sendAdminOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/admin/send-otp', payload);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Verify admin login OTP
export const verifyAdminOtp = createAsyncThunk('auth/verifyAdminOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/admin/verify-otp', payload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Resend OTP
export const resendOtp = createAsyncThunk('auth/resendOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/resend-otp', payload);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Fetch Profile
export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/profile');
    localStorage.setItem('user', JSON.stringify(data.data));
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Update Profile
export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const { data } = await api.put('/auth/profile', payload, { headers });
    localStorage.setItem('user', JSON.stringify(data.data));
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Add Address
export const addAddress = createAsyncThunk('auth/addAddress', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/addresses', payload);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Update Address
export const updateAddress = createAsyncThunk('auth/updateAddress', async ({ addressId, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/auth/addresses/${addressId}`, payload);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Delete Address
export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (addressId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/auth/addresses/${addressId}`);
    return { addressId, data };
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

// Logout User
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return data;
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return rejectWithValue(err.response?.data || err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,
    token,
    loading: false,
    error: null,
    otpSent: false,
    otpPurpose: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.otpSent = false;
      state.otpPurpose = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setCredentials(state, action) {
      const { user: u, token: t } = action.payload;
      state.user = u;
      state.token = t;
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    },
    clearError(state) { state.error = null; },
    resetOtpState(state) {
      state.otpSent = false;
      state.otpPurpose = null;
    }
  },
  extraReducers: (builder) => {
    const p = (state) => { state.loading = true; state.error = null; };
    const r = (state, action) => { state.loading = false; state.error = action.payload?.message || action.payload || 'Something went wrong'; };
    
    builder
      // send otp processes
      .addCase(sendRegisterOtp.pending, p)
      .addCase(sendRegisterOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
        state.otpPurpose = 'register';
      })
      .addCase(sendRegisterOtp.rejected, r)
      
      .addCase(sendLoginOtp.pending, p)
      .addCase(sendLoginOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
        state.otpPurpose = 'login';
      })
      .addCase(sendLoginOtp.rejected, r)
      
      .addCase(sendAdminOtp.pending, p)
      .addCase(sendAdminOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
        state.otpPurpose = 'admin-login';
      })
      .addCase(sendAdminOtp.rejected, r)

      // verify otp processes
      .addCase(verifyRegisterOtp.pending, p)
      .addCase(verifyRegisterOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data;
        state.otpSent = false;
        state.otpPurpose = null;
      })
      .addCase(verifyRegisterOtp.rejected, r)

      .addCase(verifyLoginOtp.pending, p)
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data;
        state.otpSent = false;
        state.otpPurpose = null;
      })
      .addCase(verifyLoginOtp.rejected, r)

      .addCase(verifyAdminOtp.pending, p)
      .addCase(verifyAdminOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data;
        state.otpSent = false;
        state.otpPurpose = null;
      })
      .addCase(verifyAdminOtp.rejected, r)
      
      // resend OTP
      .addCase(resendOtp.pending, p)
      .addCase(resendOtp.fulfilled, (state) => { state.loading = false; })
      .addCase(resendOtp.rejected, r)

      // logout
      .addCase(logoutUser.pending, p)
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.otpSent = false;
        state.otpPurpose = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.otpSent = false;
        state.otpPurpose = null;
      })

      // profile & addresses
      .addCase(fetchProfile.pending, p)
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(fetchProfile.rejected, r)

      .addCase(updateProfile.pending, p)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(updateProfile.rejected, r)

      .addCase(addAddress.pending, p)
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.addresses = action.payload.data;
        }
      })
      .addCase(addAddress.rejected, r)

      .addCase(updateAddress.pending, p)
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.addresses = action.payload.data;
        }
      })
      .addCase(updateAddress.rejected, r)

      .addCase(deleteAddress.pending, p)
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.addresses = action.payload.data;
        }
      })
      .addCase(deleteAddress.rejected, r);
  },
});

export const { logout, setCredentials, clearError, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
