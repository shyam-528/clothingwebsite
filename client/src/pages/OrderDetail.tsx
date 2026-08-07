import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Package, Truck, Home, X } from 'lucide-react';
import { ordersApi } from '@/services/endpoints';
import type { Order } from '@/types';
import { formatINR, orderStatusLabel, orderStatusColor } from '@/utils/format';

const timeline = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'] as const;
const stepLabel: Record<typeof timeline[number], string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    ordersApi
      .get(id)
      .then((d) => setOrder(d.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container-x py-20 text-center">Loading…</div>;
  if (!order) return <div className="container-x py-20 text-center">Order not found.</div>;

  const currentStepIdx = order.orderStatus === 'cancelled' ? -1 : timeline.indexOf(order.orderStatus as any);

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="section-title">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-muted">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`chip ${orderStatusColor[order.orderStatus]} border-0`}>
          {orderStatusLabel[order.orderStatus]}
        </span>
      </div>

      {order.orderStatus !== 'cancelled' ? (
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-5 gap-2">
            {timeline.map((step, idx) => {
              const done = idx <= currentStepIdx;
              return (
                <div key={step} className="flex flex-col items-center text-center">
                  <div
                    className={`h-10 w-10 rounded-full grid place-items-center mb-2 ${
                      done ? 'bg-gold text-white' : 'bg-ink/10 text-muted'
                    }`}
                  >
                    {step === 'pending' && <Check size={16} />}
                    {step === 'confirmed' && <Package size={16} />}
                    {step === 'shipped' && <Package size={16} />}
                    {step === 'out_for_delivery' && <Truck size={16} />}
                    {step === 'delivered' && <Home size={16} />}
                  </div>
                  <p className={`text-xs ${done ? 'font-medium' : 'text-muted'}`}>{stepLabel[step]}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-6 mb-6 bg-red-50 dark:bg-red-900/10 border-red-200">
          <p className="text-red-700 dark:text-red-300 font-medium">This order has been cancelled.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold mb-4">Items</h3>
          <div className="space-y-3">
            {order.items.map((i) => (
              <div key={i.product} className="flex gap-3 pb-3 border-b border-ink/5 last:border-0">
                <img src={i.image} alt="" className="h-16 w-16 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{i.title}</p>
                  <p className="text-xs text-muted">{i.size} · {i.color} · ×{i.quantity}</p>
                </div>
                <p className="font-medium">{formatINR(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-display text-lg font-bold mb-3">Shipping Address</h3>
            <p className="text-sm">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-muted">
              {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-sm text-muted">{order.shippingAddress.phone}</p>
          </div>
          <div className="card p-6 space-y-2 text-sm">
            <h3 className="font-display text-lg font-bold">Payment</h3>
            <div className="flex justify-between"><span>Method</span><span className="font-medium">{order.paymentMethod.toUpperCase()}</span></div>
            <div className="flex justify-between"><span>Status</span><span className="font-medium">{order.paymentStatus}</span></div>
            <hr className="border-ink/10 my-2" />
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.itemsTotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatINR(order.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatINR(order.tax)}</span></div>
            <hr className="border-ink/10 my-2" />
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatINR(order.totalAmount)}</span></div>
          </div>
        </div>
      </div>

      <Link to="/dashboard/orders" className="text-sm text-muted hover:text-ink mt-6 inline-block">
        ← Back to orders
      </Link>
    </div>
  );
};
