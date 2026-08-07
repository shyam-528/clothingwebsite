import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { formatINR, orderStatusColor, orderStatusLabel } from '@/utils/format';
import type { Order, OrderStatus } from '@/types';
import toast from 'react-hot-toast';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [q, setQ] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .orders({ status: statusFilter || undefined, limit: '100' })
      .then((d) => setOrders(d.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      toast.success('Status updated');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = orders.filter((o) =>
    !q || o.id.toLowerCase().includes(q.toLowerCase()) || o.shippingAddress.fullName.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Orders</h1>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-cream dark:bg-white/5 rounded-full px-4 py-2 flex-1 min-w-[200px]">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ID or name…"
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input py-2 px-4 w-auto text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{orderStatusLabel[s]}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream dark:bg-white/5 text-xs uppercase text-muted">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-right p-3">Items</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-muted">No orders</td></tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-t border-ink/5">
                  <td className="p-3">
                    <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{(o as any).user?.name || o.shippingAddress.fullName}</p>
                    <p className="text-xs text-muted">{(o as any).user?.email}</p>
                  </td>
                  <td className="p-3 text-right">{o.items.length}</td>
                  <td className="p-3 text-right font-medium">{formatINR(o.totalAmount)}</td>
                  <td className="p-3 text-right">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                      className={`chip text-xs border-0 ${orderStatusColor[o.orderStatus]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{orderStatusLabel[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
