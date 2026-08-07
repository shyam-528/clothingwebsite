import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchMe } from '@/store/authSlice';
import { fetchCart } from '@/store/cartSlice';
import { fetchWishlist } from '@/store/wishlistSlice';

import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { Home } from '@/pages/Home';
import { Shop } from '@/pages/Shop';
import { ProductDetails } from '@/pages/ProductDetails';
import { Cart } from '@/pages/Cart';
import { Checkout } from '@/pages/Checkout';
import { Wishlist } from '@/pages/Wishlist';
import { OrderDetail } from '@/pages/OrderDetail';
import { NotFound } from '@/pages/NotFound';

import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

import { Overview } from '@/pages/dashboard/Overview';
import { Profile } from '@/pages/dashboard/Profile';
import { Orders } from '@/pages/dashboard/Orders';
import { Addresses } from '@/pages/dashboard/Addresses';

import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminCategories } from '@/pages/admin/AdminCategories';

const App = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe()).catch(() => {
        // Token invalid — let slices settle in empty state.
      });
      dispatch(fetchCart()).catch(() => {});
      dispatch(fetchWishlist()).catch(() => {});
    }
  }, [token, dispatch]);

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
      </Route>

      {/* Auth (no layout chrome) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* User dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="orders" element={<Orders />} />
        <Route path="addresses" element={<Addresses />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
