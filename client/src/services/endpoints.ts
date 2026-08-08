import { api } from './api';
import type {
  Product,
  Cart,
  Order,
  User,
  Category,
  AdminStats,
  Address,
} from '@/types';
import {
  staticProductsList,
  staticProductGet,
  staticSuggestions,
  staticRelated,
  staticCategories,
} from '@/data/staticCatalogue';

/**
 * Run a network call. If it fails (timeout, 4xx, 5xx, no API configured),
 * run the offline fallback so the UI never shows a blank screen. Used only
 * for public product browsing — auth/cart/orders/wishlist should surface
 * errors so the user knows those features aren't actually working.
 */
async function withFallback<T>(live: () => Promise<T>, offline: () => T): Promise<T> {
  try {
    return await live();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[api] falling back to static data:', (err as Error)?.message);
    return offline();
  }
}

// ---------- Auth ----------
// NO fallback — auth errors must be honest so users don't think they're logged in.
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', data).then((r) => r.data),
  forgot: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }).then((r) => r.data),
  reset: (token: string, password: string) =>
    api
      .post<{ message: string }>('/auth/reset-password', { token, password })
      .then((r) => r.data),
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data),
  updateProfile: (data: Partial<User>) =>
    api.put<{ user: User }>('/auth/me', data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/auth/change-password', data).then((r) => r.data),
};

// ---------- Products (public — falls back to static catalogue) ----------
export const productsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    withFallback(
      () =>
        api
          .get<{ items: Product[]; total: number; page: number; pages: number }>(
            '/products',
            { params }
          )
          .then((r) => r.data),
      () => staticProductsList(params as any)
    ),
  get: (idOrSlug: string) =>
    withFallback(
      () => api.get<{ product: Product }>(`/products/${idOrSlug}`).then((r) => r.data),
      () => {
        const product = staticProductGet(idOrSlug);
        if (!product) throw new Error('Product not found');
        return { product };
      }
    ),
  related: (id: string) =>
    withFallback(
      () => api.get<{ items: Product[] }>(`/products/${id}/related`).then((r) => r.data),
      () => ({ items: staticRelated(id) })
    ),
  search: (q: string) =>
    withFallback(
      () =>
        api
          .get<{ items: Product[] }>('/products/search', { params: { q } })
          .then((r) => r.data),
      () => ({ items: staticSuggestions(q) })
    ),
  categories: () =>
    withFallback(
      () => api.get<{ items: Category[] }>('/products/categories').then((r) => r.data),
      () => ({ items: staticCategories() })
    ),
  addReview: (id: string, data: { rating: number; comment: string }) =>
    api.post<{ product: Product }>(`/products/${id}/reviews`, data).then((r) => r.data),
};

// ---------- Cart ----------
// NO fallback — cart is user-specific state, must be real or honestly broken.
export const cartApi = {
  get: () => api.get<Cart>('/cart').then((r) => r.data),
  add: (data: { productId: string; size: string; color: string; quantity: number }) =>
    api.post<Cart>('/cart/add', data).then((r) => r.data),
  update: (data: { productId: string; size: string; color: string; quantity: number }) =>
    api.put<Cart>('/cart/update', data).then((r) => r.data),
  remove: (productId: string, size: string, color: string) =>
    api
      .delete<Cart>('/cart/remove', { params: { productId, size, color } })
      .then((r) => r.data),
  clear: () => api.delete<Cart>('/cart/clear').then((r) => r.data),
};

// ---------- Orders ----------
// NO fallback — orders are user-specific state.
export const ordersApi = {
  create: (data: {
    shippingAddress: Address;
    paymentMethod: string;
    couponCode?: string;
  }) =>
    api
      .post<{ order: Order; razorpayOrder?: any }>('/orders', data)
      .then((r) => r.data),
  myOrders: () => api.get<{ orders: Order[] }>('/orders/my-orders').then((r) => r.data),
  get: (id: string) => api.get<{ order: Order }>(`/orders/${id}`).then((r) => r.data),
  cancel: (id: string) =>
    api.put<{ order: Order }>(`/orders/${id}/cancel`, {}).then((r) => r.data),
  applyCoupon: (code: string) =>
    api
      .post<{ code: string; type: string; discount: number; shippingFee: number; tax: number; totalAmount: number }>(
        '/orders/apply-coupon',
        { code }
      )
      .then((r) => r.data),
};

// ---------- Wishlist ----------
// NO fallback — wishlist is user-specific state.
export const wishlistApi = {
  list: () =>
    api.get<{ items: Product[] }>('/wishlist').then((r) => r.data),
  add: (productId: string) =>
    api.post<{ message: string }>(`/wishlist/${productId}`, {}).then((r) => r.data),
  remove: (productId: string) =>
    api.delete<{ message: string }>(`/wishlist/${productId}`).then((r) => r.data),
};

// ---------- Admin ----------
// NO fallback — admin data shouldn't be faked.
export const adminApi = {
  stats: () => api.get<AdminStats>('/admin/stats').then((r) => r.data),
  users: (params?: Record<string, string | undefined>) =>
    api
      .get<{ items: User[]; total: number; page: number; pages: number }>(
        '/admin/users',
        { params }
      )
      .then((r) => r.data),
  toggleBlockUser: (id: string) =>
    api.put<{ user: User }>(`/admin/users/${id}/block`, {}).then((r) => r.data),
  orders: (params?: Record<string, string | undefined>) =>
    api
      .get<{ items: Order[]; total: number; page: number; pages: number }>(
        '/admin/orders',
        { params }
      )
      .then((r) => r.data),
  updateOrderStatus: (id: string, status: string) =>
    api
      .put<{ order: Order }>(`/orders/${id}/status`, { status })
      .then((r) => r.data),
  categories: () => api.get<{ items: Category[] }>('/admin/categories').then((r) => r.data),
};