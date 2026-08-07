export type CategorySlug =
  | 'mens-wear'
  | 'womens-wear'
  | 'kids-wear'
  | 'footwear'
  | 'accessories';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CategorySlug;
  subCategory?: string;
  brand: string;
  price: number;
  discountPrice?: number;
  sizes: string[];
  colors: string[];
  variants: { size: string; color: string; stock: number }[];
  images: string[];
  stock: number;
  ratings: number;
  numReviews: number;
  reviews: Review[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  addresses: Address[];
  wishlist: string[];
  isBlocked: boolean;
  createdAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  product: string;
  title: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  orderStatus: OrderStatus;
  statusHistory: { status: OrderStatus; at: string; note?: string }[];
  itemsTotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
  chart: { _id: string; revenue: number; orders: number }[];
}
