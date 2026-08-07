import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '@/services/endpoints';
import type { Order } from '@/types';
import { formatINR, orderStatusColor, orderStatusLabel } from '@/utils/format';

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.myOrders().then((d) => setOrders(d.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card p-10 text-center">Loading…</div>;

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="section-title mb-6">My Orders</h1>
        <div className="card p-10 text-center">
          <p className="text-muted mb-4">No orders yet.</p>
          <Link to="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title mb-6">My Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            to={`/orders/${o.id}`}
            className="card p-4 flex flex-wrap items-center gap-4 hover:shadow-hover transition"
          >
            <div className="flex -space-x-2">
              {o.items.slice(0, 3).map((i, idx) => (
                <img
                  key={idx}
                  src={i.image}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-[#1a1a1c]"
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-muted">
                {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item{o.items.length !== 1 && 's'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatINR(o.totalAmount)}</p>
              <span className={`chip text-[10px] ${orderStatusColor[o.orderStatus]} border-0 mt-1`}>
                {orderStatusLabel[o.orderStatus]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
