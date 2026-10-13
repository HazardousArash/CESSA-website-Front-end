import axios from "axios";
import { triggerAlarm, clearAlarm, clearAuth, setSession } from "@/redux/slices/authSlice";
import { clearClientSession, persistSessionFromAuthResult } from "@/lib/api/auth/session";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cessaland.ir/api";

const apiInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let _store = null;
export function initApiClient(store) {
  _store = store;
}

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

apiInstance.interceptors.request.use((config) => {
  // Always grab the freshest token from localStorage to prevent Redux lag issues
  const token = typeof window !== "undefined" ? localStorage.getItem("cessa_access_token") : _store?.getState()?.auth?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/")) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRole = typeof window !== "undefined" ? localStorage.getItem("cessa_role") : "student";
        const activeRole =
          storedRole?.toLowerCase() === "admin"
            ? "admin"
            : storedRole?.toLowerCase() === "contentcreator"
            ? "creator"
            : "student";

        const payload = {
          accessToken: typeof window !== "undefined" ? localStorage.getItem("cessa_access_token") : null,
          refreshToken: typeof window !== "undefined" ? localStorage.getItem("cessa_refresh_token") : null,
        };

        const refreshRes = await axios.post(`${BASE_URL}/${activeRole}/auth/refresh`, payload, {
          withCredentials: true,
        });

        let newAccess = null;
        if (refreshRes.data?.data) {
          const { role, userId, email } = persistSessionFromAuthResult(refreshRes.data.data);
          newAccess = refreshRes.data.data.accessToken;
          
          // Inject the new token into the failed request before retrying
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          
          _store?.dispatch(setSession({
            token: newAccess,
            role: role,
            user: { id: userId, email }
          }));
        }

        isRefreshing = false;
        onRefreshed(newAccess);
        return apiInstance(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        onRefreshed(null);
        clearClientSession();
        _store?.dispatch(clearAuth());
        _store?.dispatch(triggerAlarm("نشست کاربری منقضی شد. لطفاً دوباره وارد شوید."));
        setTimeout(() => _store?.dispatch(clearAlarm()), 3500);
        return Promise.reject(refreshErr);
      }
    }

    let errorMessage = "خطا در ارتباط با سرور";
    if (error.message === "Network Error") {
      errorMessage = "خطای ارتباط با سرور";
    } else if (error.response?.data?.errors) {
      errorMessage = Object.values(error.response.data.errors).flat().join(" | ");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    if (status === 401 || status === 403 || status >= 500 || error.message === "Network Error") {
      _store?.dispatch(triggerAlarm(errorMessage));
      setTimeout(() => _store?.dispatch(clearAlarm()), 4500);
    }

    return Promise.reject(new Error(errorMessage));
  }
);

const requests = {
  get: (url, config = {}) => apiInstance.get(url, config),
  post: (url, body = {}, config = {}) => apiInstance.post(url, body, config),
  put: (url, body = {}, config = {}) => apiInstance.put(url, body, config),
  patch: (url, body = {}, config = {}) => apiInstance.patch(url, body, config),
  delete: (url, config = {}) => apiInstance.delete(url, config),
};

export default requests;
