import axios from "axios";
import { useAuthStore } from "../../features/auth/store/authStore.js";

const AUTH_STORE_KEY = "client-auth-store";

const parsePersistedAuth = (saved) => {
    if (!saved) return null;
    try {
        const data = JSON.parse(saved);
        return (
            data?.token ||
            data?.state?.token ||
            data?.value?.token ||
            data?.state?.value?.token ||
            null
        );
    } catch (err) {
        console.warn("No se pudo parsear client-auth-store de localStorage:", err);
        return null;
    }
};

const getStoredToken = () => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(AUTH_STORE_KEY);
    return parsePersistedAuth(saved);
};

const attachAuthToken = (config, token) => {
    if (!token) return config;
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
};

// ================= INSTANCIAS AXIOS =================
const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL,
    timeout: 60000,
    headers: { "Content-Type": "application/json" },
});

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_CLIENT_URL,
    timeout: 60000,
    headers: { "Content-Type": "application/json" },
});

// ================= INTERCEPTORES DE PETICIÓN =================
axiosAuth.interceptors.request.use((config) => {
    config._axiosClient = "auth";
    const token = useAuthStore.getState().token || getStoredToken();
    return attachAuthToken(config, token);
});

axiosClient.interceptors.request.use((config) => {
    config._axiosClient = "client";
    const token = useAuthStore.getState().token || getStoredToken();
    console.log('TOKEN:', token);
    return attachAuthToken(config, token);
});

// ================= REFRESH TOKEN =================
let _isRefreshing = false;
let failedQueue = [];

function _processQueue(_error, token = null) {
    failedQueue.forEach(({ resolve, reject }) =>
        _error ? reject(_error) : resolve(token)
    );
    failedQueue = [];
}

const handleRefreshToken = async function (_error) {
    const _original = _error.config;
    if (!_original || _original._retry) {
        return Promise.reject(_error);
    }

    const status = _error.response?.status;
    const errorCode = _error.response?.data?.error;
    const requestUrl = _original.url || "";

    const isRefreshEndpoint = requestUrl.includes("/auths/refresh");
    const isLoginEndpoint = requestUrl.includes("/Auth/login");
    
    const shouldRefresh =
        (!isRefreshEndpoint && status === 401) ||
        (!isRefreshEndpoint && status === 403 && errorCode === "TOKEN_EXPIRED");

    if (shouldRefresh) {
        const retryClient = _original._axiosClient === "client" ? axiosClient : axiosAuth;

        if (_isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    _original.headers["Authorization"] = "Bearer " + token;
                    return retryClient(_original);
                })
                .catch((err) => Promise.reject(err));
        }

        _original._retry = true;
        _isRefreshing = true;

        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
            useAuthStore.getState().logout();
            return Promise.reject(_error);
        }

        try {
            const response = await axiosAuth.post("/auths/refresh", { refreshToken });
            const {
                accessToken,
                refreshToken: newRefreshToken,
                expiresIn,
                user,
            } = response.data;

            useAuthStore.setState({
                token: accessToken,
                refreshToken: newRefreshToken,
                expiresAt: expiresIn,
                user: user || useAuthStore.getState().user,
                isAuthenticated: true,
            });

            _processQueue(null, accessToken);
            _original.headers["Authorization"] = "Bearer " + accessToken;
            return retryClient(_original);
        } catch (err) {
            _processQueue(err, null);
            useAuthStore.getState().logout();
            return Promise.reject(err);
        } finally {
            _isRefreshing = false;
        }
    }

    return Promise.reject(_error);
};

axiosAuth.interceptors.response.use((res) => res, handleRefreshToken);
axiosClient.interceptors.response.use((res) => res, handleRefreshToken);

// ================= EXPORTS =================
export { axiosAuth, axiosClient, handleRefreshToken }; 