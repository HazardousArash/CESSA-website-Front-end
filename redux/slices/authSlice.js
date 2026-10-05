import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  role: null,
  user: null,
  isAuthenticated: false,
  authChecked: false,
  isAlarm: false,
  alarmMessage: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action) {
      const { token = null, role = null, user = null } = action.payload || {};
      state.token = token;
      state.role = role;
      if (user) state.user = user;
      state.isAuthenticated = Boolean(token);
      state.authChecked = true;
    },
    clearAuth(state) {
      state.token = null;
      state.role = null;
      state.user = null;
      state.isAuthenticated = false;
      state.authChecked = true;
    },
    triggerAlarm(state, action) {
      state.isAlarm = true;
      state.alarmMessage = action.payload || "خطای امنیتی در سیستم";
    },
    clearAlarm(state) {
      state.isAlarm = false;
      state.alarmMessage = "";
    },
  },
});

export const { setSession, clearAuth, triggerAlarm, clearAlarm } = authSlice.actions;
export default authSlice.reducer;

export const selectToken = (state) => state.auth.token;
export const selectRole = (state) => state.auth.role;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAlarm = (state) => state.auth.isAlarm;