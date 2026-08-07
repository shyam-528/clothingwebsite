import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/services/endpoints';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

const tokenFromStorage = localStorage.getItem('ut_token');
const userFromStorage = (() => {
  const raw = localStorage.getItem('ut_user');
  try {
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
})();

const initialState: AuthState = {
  user: userFromStorage,
  token: tokenFromStorage,
  loading: false,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }) => authApi.login(data)
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string }) =>
    authApi.register(data)
);

export const fetchMe = createAsyncThunk('auth/me', async () => (await authApi.me()).user);

const persist = (state: AuthState) => {
  if (state.token) localStorage.setItem('ut_token', state.token);
  if (state.user) localStorage.setItem('ut_user', JSON.stringify(state.user));
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('ut_token');
      localStorage.removeItem('ut_user');
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      persist(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (s) => {
        s.loading = true;
      })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        persist(s);
      })
      .addCase(loginThunk.rejected, (s) => {
        s.loading = false;
      })
      .addCase(registerThunk.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.token = a.payload.token;
        persist(s);
      })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.user = a.payload;
        persist(s);
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
