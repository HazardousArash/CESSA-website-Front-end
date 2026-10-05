"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { setSession, clearAuth } from "@/redux/slices/authSlice";
import { persistSessionFromAuthResult } from "@/lib/api/auth/session";
import Cookies from "js-cookie";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const authChecked = useSelector((state) => state.auth.authChecked);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedRole = Cookies.get("cessa_role");
        if (!storedRole) {
          dispatch(clearAuth());
          return;
        }

        const activeRole = storedRole.toLowerCase() === "admin" ? "admin" : storedRole.toLowerCase() === "contentcreator" ? "creator" : "student";
        
        // The backend reads tokens from cookies if body is empty
        const res = await cessaService.auth.refresh(activeRole, {});
        
        if (res?.success && res?.data) {
          const { role, userId, email } = persistSessionFromAuthResult(res.data);
          dispatch(setSession({
            token: res.data.accessToken,
            role: role || storedRole,
            user: { id: userId, email }
          }));
        } else {
          dispatch(clearAuth());
        }
      } catch (err) {
        dispatch(clearAuth());
      }
    };

    if (!authChecked) {
      restoreSession();
    }
  }, [dispatch, authChecked]);

  return <>{children}</>;
}