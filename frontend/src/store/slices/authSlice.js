import { createSlice } from '@reduxjs/toolkit';

function loadInitialState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('artify_auth') || 'null');
  } catch (error) {
    localStorage.removeItem('artify_auth');
  }

  return {
    token: saved?.token ?? null,
    role: saved?.role ?? null,
    accountid: saved?.accountid ?? saved?.accountId ?? null,
    accountId: saved?.accountid ?? saved?.accountId ?? null,
    email: saved?.email ?? null,
    username: saved?.username ?? null,
    avatarUrl: saved?.avatarUrl ?? null,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    setAuth(state, action) {
      const payload = action.payload || {};

      state.token = payload.token ?? null;
      state.role = payload.role ?? null;

      state.accountid =
        payload.accountid ??
        payload.accountId ??
        null;

      state.accountId = state.accountid;

      state.email = payload.email ?? null;
      state.username = payload.username ?? null;
      state.avatarUrl = payload.avatarUrl ?? null;

      localStorage.setItem(
        'artify_auth',
        JSON.stringify({
          token: state.token,
          role: state.role,
          accountid: state.accountid,
          accountId: state.accountid,
          email: state.email,
          username: state.username,
          avatarUrl: state.avatarUrl,
        })
      );
    },
    logout(state) {
      state.token = null;
      state.role = null;
      state.accountid = null;
      state.accountId = null;
      state.email = null;
      state.username = null;
      state.avatarUrl = null;
      localStorage.removeItem('artify_auth');
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
