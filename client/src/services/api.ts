import axios, { AxiosError } from 'axios';

const rawBase = import.meta.env.VITE_API_URL || '';

// Friendly banner shown when API isn't configured. Read by Header.tsx.
export const apiBaseURL = (rawBase || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
export const isApiConfigured = Boolean(rawBase);

// When VITE_API_URL is empty we deliberately point at the same origin so
// axios shows a clear CORS / network error instead of silently calling
// localhost. The error overlay in the UI explains the next step.
const baseURL = rawBase || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

export const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15000,
});

// Attach JWT from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ut_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Surface server error messages nicely.
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const message =
      err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
