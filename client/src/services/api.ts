import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
