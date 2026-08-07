import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '@/services/endpoints';
import type { Cart } from '@/types';

interface CartState extends Cart {
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
  loading: false,
};

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  return await cartApi.get();
});

export const addItem = createAsyncThunk(
  'cart/add',
  async (data: { productId: string; size: string; color: string; quantity: number }) => {
    return await cartApi.add(data);
  }
);

export const updateItem = createAsyncThunk(
  'cart/update',
  async (data: { productId: string; size: string; color: string; quantity: number }) => {
    return await cartApi.update(data);
  }
);

export const removeItem = createAsyncThunk(
  'cart/remove',
  async (data: { productId: string; size: string; color: string }) => {
    return await cartApi.remove(data.productId, data.size, data.color);
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearLocal(state) {
      state.items = [];
      state.subtotal = 0;
      state.itemCount = 0;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCart.fulfilled, (s, a) => {
      s.items = a.payload.items;
      s.subtotal = a.payload.subtotal;
      s.itemCount = a.payload.itemCount;
    }).addCase(addItem.fulfilled, (s, a) => {
      s.items = a.payload.items;
      s.subtotal = a.payload.subtotal;
      s.itemCount = a.payload.itemCount;
    }).addCase(updateItem.fulfilled, (s, a) => {
      s.items = a.payload.items;
      s.subtotal = a.payload.subtotal;
      s.itemCount = a.payload.itemCount;
    }).addCase(removeItem.fulfilled, (s, a) => {
      s.items = a.payload.items;
      s.subtotal = a.payload.subtotal;
      s.itemCount = a.payload.itemCount;
    });
  },
});

export const { clearLocal } = cartSlice.actions;
export default cartSlice.reducer;
