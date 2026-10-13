"use client";
import React, { useEffect, useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store";
import { setSession, clearAuth } from "./slices/authSlice";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { clearClientSession, isTokenExpired, decodeAccessToken, persistSessionFromAuthResult } from "@/lib/api/auth/session";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const authChecked = useSelector((state) => state.auth.authChecked);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const restoreSession = async () => {
      if (isRefreshingRef.current) return;
      
      const localAccessToken = typeof window !== "undefined" ? localStorage.getItem("cessa_access_token") : null;
      const localRefreshToken = typeof window !== "undefined" ? localStorage.getItem("cessa_refresh_token") : null;
      
      // Fast path: Token is valid and has role mapping
      if (localAccessToken && !isTokenExpired(localAccessToken)) {
        const decoded = decodeAccessToken(localAccessToken);
        if (decoded?.role) {
          let cachedUser = null;
          try {
            const rawUser = localStorage.getItem("cessa_user");
            if (rawUser) cachedUser = JSON.parse(rawUser);
          } catch {}

          dispatch(setSession({
            token: localAccessToken,
            role: decoded.role,
            user: cachedUser || { id: decoded.sub, email: decoded.email },
          }));
          return;
        }
      }

      // No refresh token available, kill session silently
      if (!localRefreshToken) {
         clearClientSession();
         dispatch(clearAuth());
         return;
      }

      // Slow path: Need to fetch a new token pairing
      isRefreshingRef.current = true;
      try {
        const storedRole = typeof window !== "undefined" ? localStorage.getItem("cessa_role") : "student";
        const activeRole = storedRole ? (storedRole.toLowerCase() === "admin" ? "admin" : storedRole.toLowerCase() === "contentcreator" ? "creator" : "student") : "student";

        const res = await cessaService.auth.refresh(activeRole, { accessToken: localAccessToken, refreshToken: localRefreshToken });
        
        if (res?.success && res?.data) {
          const { role, userId, email } = persistSessionFromAuthResult(res.data);
          let cachedUser = null;
          try {
            const rawUser = localStorage.getItem("cessa_user");
            if (rawUser) cachedUser = JSON.parse(rawUser);
          } catch {}

          dispatch(setSession({
            token: res.data.accessToken,
            role: role,
            user: cachedUser || { id: userId, email },
          }));
        } else {
          clearClientSession();
          dispatch(clearAuth());
        }
      } catch (err) {
        clearClientSession();
        dispatch(clearAuth());
      } finally {
        isRefreshingRef.current = false;
      }
    };

    if (!authChecked) {
      restoreSession();
    }
  }, [dispatch, authChecked]);

  return <>{children}</>;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
