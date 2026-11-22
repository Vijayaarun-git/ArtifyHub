import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',

  initialState: {
    toasts: [],
  },

  reducers: {
    addToast(state, action) {
      state.toasts.push({
        id: action.payload.id ?? Date.now(),
        message: action.payload.message,
        type: action.payload.type ?? 'success',
      });
    },

    removeToast(state, action) {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
  },
});

export const { addToast, removeToast } = uiSlice.actions;
export const hideToast = removeToast;

export function showToast(message, type = 'success') {
  return (dispatch) => {
    const id = Date.now();

    dispatch(
      addToast({
        id,
        message,
        type,
      })
    );

    setTimeout(() => {
      dispatch(removeToast(id));
    }, 3500);
  };
}

export default uiSlice.reducer;