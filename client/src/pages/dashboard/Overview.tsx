import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, MapPin, TrendingUp } from 'lucide-react';
import { ordersApi, wishlistApi, authApi } from '@/services/endpoints';
import { formatINR, orderStatusColor, orderStatusLabel } from '@/utils/format';
import type { Order, Product } from '@/types';

export const Overview = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    ordersApi.myOrders().then((d) => setOrders(d.orders)).catch(() => {});
    wishlistApi.list().then((d) => setWishlist(d.items)).catch(() => {});
    authApi.me().then((d) => setUser(d.user)).catch(() => {});
  }, []);

  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <h1 className="section-title">Welcome back, {user?.name?.split(' ')[0]}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Package} label="Orders" value={orders.length} />
        <Stat icon={Heart} label="Wishlist" value={wishlist.length} />
        <Stat icon={MapPin} label="Addresses" value={user?.addresses?.length || 0} />
        <Stat icon={TrendingUp} label="Total Spent" value={formatINR(totalSpent)} />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-sm text-gold hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No orders yet. <Link to="/shop" className="text-gold hover:underline">Start shopping</Link></p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-cream dark:hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-3">
                  <img src={o.items[0].image} alt="" className="h-12 w-12 rounded object-cover" />
                  <div>
                    <p className="font-medium text-sm">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatINR(o.totalAmount)}</p>
                  <span className={`chip text-[10px] ${orderStatusColor[o.orderStatus]} border-0`}>
                    {orderStatusLabel[o.orderStatus]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: any }) => (
  <div className="card p-4">
    <Icon size={20} className="text-gold mb-2" />
    <p className="text-xs text-muted">{label}</p>
    <p className="font-display text-xl font-bold mt-1">{value}</p>
  </div>
);
