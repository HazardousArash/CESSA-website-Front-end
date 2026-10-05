import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { initApiClient } from "@/lib/api/http/client";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Initialize the API client interceptors with the Redux store
initApiClient(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;