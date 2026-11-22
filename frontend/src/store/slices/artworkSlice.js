import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as artworkService from '../../services/artworkService';

export const fetchMarketplace = createAsyncThunk(
  'artwork/fetchAll',
  async (params = {}) => {
    const response = await artworkService.fetchMarketplace(params);
    return response?.data ?? [];
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  activeCategory: 'All',
  selectedArtwork: null
};

const artworkSlice = createSlice({
  name: 'artwork',
  initialState,
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },

    updateItem: (state, action) => {
      const index = state.items.findIndex(
        item => item.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload
        };
      }
    },

    replaceItems: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    },

    clearArtworks: state => {
      state.items = [];
    }
  },

  extraReducers: builder => {
    builder
      .addCase(fetchMarketplace.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMarketplace.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(fetchMarketplace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch artworks';
      });
  }
});

export const {
  setActiveCategory,
  updateItem,
  replaceItems,
  clearArtworks
} = artworkSlice.actions;

export default artworkSlice.reducer;