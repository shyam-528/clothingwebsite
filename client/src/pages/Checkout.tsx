import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchCart, clearLocal } from '@/store/cartSlice';
import { ordersApi } from '@/services/endpoints';
import { formatINR } from '@/utils/format';
import toast from 'react-hot-toast';
import type { Address } from '@/types';

const paymentMethods = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'razorpay', label: 'Pay Online (Razorpay)' },
];

export const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, subtotal } = useAppSelector((s) => s.cart);
  const user = useAppSelector((s) => s.auth.user);

  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      const def = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (def) setAddress(def);
    }
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="container-x py-20 text-center">
        <Link to="/login" className="btn-primary">Login to checkout</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <p className="mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const shipping = subtotal >= 1500 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!address.fullName.trim()) err.fullName = 'Required';
    if (!/^[0-9+\-\s()]{7,20}$/.test(address.phone)) err.phone = 'Invalid phone';
    if (!address.line1.trim()) err.line1 = 'Required';
    if (!address.city.trim()) err.city = 'Required';
    if (!address.state.trim()) err.state = 'Required';
    if (address.postalCode.length < 3) err.postalCode = 'Invalid';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSubmitting(true);
    try {
      const { order } = await ordersApi.create({
        shippingAddress: address,
        paymentMethod,
      });

      // If Razorpay, attempt to open checkout widget.
      if (paymentMethod === 'razorpay' && (window as any).Razorpay) {
        // Real integration: open widget. Falls through to /orders/:id otherwise.
      }

      dispatch(clearLocal());
      toast.success('Order placed!');
      navigate(`/orders/${order.id}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x py-10">
      <h1 className="section-title mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Shipping Address</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.fullName}>
                <input className="input" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input className="input" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
              </Field>
              <Field label="Address Line 1" error={errors.line1} className="md:col-span-2">
                <input className="input" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              </Field>
              <Field label="City" error={errors.city}>
                <input className="input" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              </Field>
              <Field label="State" error={errors.state}>
                <input className="input" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              </Field>
              <Field label="Postal Code" error={errors.postalCode}>
                <input className="input" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
              </Field>
              <Field label="Country">
                <input className="input" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
              </Field>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Payment Method</h3>
            <div className="space-y-2">
              {paymentMethods.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    paymentMethod === m.value ? 'border-ink bg-cream dark:bg-white/5' : 'border-ink/10 hover:border-ink/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.value}
                    checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)}
                    className="accent-gold"
                  />
                  <span className="font-medium">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 h-fit sticky top-24 space-y-4">
          <h3 className="font-display text-lg font-bold">Order Summary</h3>
          <div className="space-y-3 max-h-72 overflow-auto">
            {items.map((i) => (
              <div key={`${i.product.id}-${i.size}-${i.color}`} className="flex gap-3 text-sm">
                <img src={i.product.images[0]} alt="" className="h-14 w-14 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{i.product.title}</p>
                  <p className="text-muted text-xs">{i.size} · {i.color} · ×{i.quantity}</p>
                </div>
                <p className="font-medium">{formatINR(i.lineTotal)}</p>
              </div>
            ))}
          </div>
          <hr className="border-ink/10" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatINR(tax)}</span></div>
          </div>
          <hr className="border-ink/10" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span><span>{formatINR(total)}</span>
          </div>
          <button onClick={placeOrder} disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
  error,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) => (
  <div className={className}>
    <label className="text-xs uppercase tracking-wider text-muted mb-1 block">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);
