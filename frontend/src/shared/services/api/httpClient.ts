import axios from 'axios';

export const usersApi = axios.create({
  baseURL: import.meta.env.VITE_USERS_API_URL,
});

export const walletApi = axios.create({
  baseURL: import.meta.env.VITE_WALLET_API_URL,
});

const attachAuthToken = (token: string | null) => (config: any) => {
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

export function configureHttpAuth(token: string | null) {
  usersApi.interceptors.request.use(attachAuthToken(token));
  walletApi.interceptors.request.use(attachAuthToken(token));
}
