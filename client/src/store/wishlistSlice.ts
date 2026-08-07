import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistApi } from '@/services/endpoints';
import type { Product } from '@/types';

interface State {
  items: Product[];
}

const initialState: State = { items: [] };

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  return (await wishlistApi.list()).items;
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId: string) => {
  await wishlistApi.add(productId);
  return productId;
});

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId: string) => {
    await wishlistApi.remove(productId);
    return productId;
  }
);

const slice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchWishlist.fulfilled, (s, a) => {
      s.items = a.payload;
    });
  },
});

export default slice.reducer;
