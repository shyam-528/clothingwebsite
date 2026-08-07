import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, IndianRupee, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/services/endpoints';
import { formatINR, orderStatusColor, orderStatusLabel } from '@/utils/format';
import type { AdminStats } from '@/types';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card p-10 text-center">Loading…</div>;
  if (!stats) return <div>Failed to load.</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Total Sales" value={formatINR(stats.totalSales)} accent="gold" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} />
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Revenue (Last 14 days)</h2>
            <TrendingUp size={18} className="text-gold" />
          </div>
          <RevenueChart data={stats.chart} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-gold hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-muted">{(o as any).user?.name || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatINR(o.totalAmount)}</p>
                  <span className={`chip text-[10px] ${orderStatusColor[o.orderStatus]} border-0`}>
                    {orderStatusLabel[o.orderStatus]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: any;
  accent?: 'gold';
}) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-display text-2xl md:text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className={`h-10 w-10 grid place-items-center rounded-full ${accent === 'gold' ? 'bg-gold/10 text-gold' : 'bg-ink/5 text-ink'}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const RevenueChart = ({ data }: { data: { _id: string; revenue: number; orders: number }[] }) => {
  if (data.length === 0) {
    return <p className="text-sm text-muted text-center py-12">No data yet.</p>;
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-44">
        {data.map((d) => (
          <div
            key={d._id}
            className="flex-1 bg-ink rounded-t relative group"
            style={{ height: `${(d.revenue / max) * 100}%`, minHeight: 4 }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              {formatINR(d.revenue)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted">
        {data.map((d) => (
          <span key={d._id} className="flex-1 text-center truncate">{d._id.slice(5)}</span>
        ))}
      </div>
    </div>
  );
};
