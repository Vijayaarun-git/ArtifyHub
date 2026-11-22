import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import artworkReducer from './slices/artworkSlice';
import transactionReducer from './slices/transactionSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    artwork: artworkReducer,
    transaction: transactionReducer,
    ui: uiReducer,
  },
});

export default store;
