import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTransactionHistory = createAsyncThunk('transaction/fetchHistory', async () => {
  const response = await api.get('/transactions/history');
  return response.data;
});

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default transactionSlice.reducer;
