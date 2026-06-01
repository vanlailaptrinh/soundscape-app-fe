import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { store } from '~/redux/store';
import { setReduxAccessToken, setReduxLogout } from '~/redux/reducer/authSlice';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'ngrok-skip-browser-warning': '69420'
    }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
    failedQueue = [];
};

const setAuthHeader = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

const initializeAuthHeader = async () => {
    const { reduxIsLogin } = store.getState().auth;
    if (!reduxIsLogin) return;

    try {
        const res = await axios.get(`${BASE_URL}/auth/access-token`, { withCredentials: true });
        const newToken = res.data.accessToken;
        store.dispatch(setReduxAccessToken(newToken));
        setAuthHeader(newToken);
    } catch (err) {
        store.dispatch(setReduxLogout());
        setAuthHeader(null);
    }
};

initializeAuthHeader();

api.interceptors.request.use(
    async (config) => {
        if (config.skipAuthCheck) return config;

        const token = store.getState().auth.reduxAccessToken;

        if (!token) {
            setAuthHeader(null);
            return config;
        }

        try {
            const { exp } = jwtDecode(token);

            if (Date.now() >= exp * 1000) {
                if (!isRefreshing) {
                    isRefreshing = true;

                    try {
                        const res = await axios.get(`${BASE_URL}/auth/access-token`, { withCredentials: true });
                        const newToken = res.data.accessToken;

                        store.dispatch(setReduxAccessToken(newToken));
                        setAuthHeader(newToken);
                        processQueue(null, newToken);

                        return {
                            ...config,
                            headers: {
                                ...config.headers,
                                Authorization: `Bearer ${newToken}`,
                            },
                        };
                    } catch (err) {
                        processQueue(err, null);
                        store.dispatch(setReduxLogout());
                        setAuthHeader(null);
                        window.location.href = '/loginPage';
                        return Promise.reject(err);
                    } finally {
                        isRefreshing = false;
                    }
                }

                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            resolve({
                                ...config,
                                headers: {
                                    ...config.headers,
                                    Authorization: token ? `Bearer ${token}` : undefined,
                                },
                            });
                        },
                        reject: (err) => reject(err),
                    });
                });
            } else {
                setAuthHeader(token);
                return {
                    ...config,
                    headers: {
                        ...config.headers,
                        Authorization: `Bearer ${token}`,
                    },
                };
            }
        } catch (error) {
            store.dispatch(setReduxLogout());
            setAuthHeader(null);
            return config;
        }
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const res = await axios.get(`${BASE_URL}/auth/access-token`, { withCredentials: true });
                    const newToken = res.data.accessToken;

                    store.dispatch(setReduxAccessToken(newToken));
                    setAuthHeader(newToken);
                    processQueue(null, newToken);

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (err) {
                    processQueue(err, null);
                    store.dispatch(setReduxLogout());
                    setAuthHeader(null);
                    window.location.href = '/loginPage';
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    },
                    reject: (err) => reject(err),
                });
            });
        }

        return Promise.reject(error);
    }
);

export const updateAuthHeader = (token) => {
    setAuthHeader(token);
};

export default api;
