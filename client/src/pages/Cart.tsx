import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchCart, updateItem, removeItem } from '@/store/cartSlice';
import { formatINR } from '@/utils/format';
import { ordersApi } from '@/services/endpoints';
import toast from 'react-hot-toast';

const FREE_SHIPPING = 1500;
const STANDARD_SHIPPING = 79;
const TAX_RATE = 0.05;

export const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, subtotal, loading } = useAppSelector((s) => s.cart);
  const user = useAppSelector((s) => s.auth.user);

  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: string;
    discount: number;
  } | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="container-x py-20 text-center">
        <p className="mb-4">Please log in to view your cart.</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-x py-10">
        <div className="h-8 w-32 skeleton mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h2 className="section-title mb-3">Your cart is empty</h2>
        <p className="text-muted mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING ? 0 : STANDARD_SHIPPING;
  const discount = appliedCoupon?.discount || 0;
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const applyCouponCode = async () => {
    if (!coupon.trim()) return;
    setApplying(true);
    try {
      const res = await ordersApi.applyCoupon(coupon.trim());
      setAppliedCoupon({ code: res.code, type: res.type, discount: res.discount });
      toast.success(`Coupon ${res.code} applied`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="container-x py-10">
      <h1 className="section-title mb-6">Shopping Cart</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-3">
          {items.map((i) => (
            <div key={`${i.product.id}-${i.size}-${i.color}`} className="card p-4 flex gap-4">
              <Link to={`/product/${i.product.slug}`} className="shrink-0">
                <img src={i.product.images[0]} alt="" className="h-28 w-28 rounded object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${i.product.slug}`} className="font-medium hover:text-gold">
                  {i.product.title}
                </Link>
                <p className="text-sm text-muted">{i.size} · {i.color}</p>
                <p className="text-sm font-semibold mt-1">{formatINR(i.lineTotal)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      dispatch(updateItem({
                        productId: i.product.id, size: i.size, color: i.color,
                        quantity: Math.max(1, i.quantity - 1),
                      }))
                    }
                    className="h-8 w-8 grid place-items-center rounded-full border border-ink/20 hover:bg-ink/5"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm">{i.quantity}</span>
                  <button
                    onClick={() =>
                      dispatch(updateItem({
                        productId: i.product.id, size: i.size, color: i.color,
                        quantity: i.quantity + 1,
                      }))
                    }
                    className="h-8 w-8 grid place-items-center rounded-full border border-ink/20 hover:bg-ink/5"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => dispatch(removeItem({ productId: i.product.id, size: i.size, color: i.color }))}
                    className="ml-auto text-muted hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit sticky top-24 space-y-4">
          <h3 className="font-display text-lg font-bold">Order Summary</h3>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="input pl-9 uppercase"
                disabled={!!appliedCoupon}
              />
            </div>
            <button
              onClick={applyCouponCode}
              disabled={applying || !coupon || !!appliedCoupon}
              className="btn-outline !px-4"
            >
              {applying ? '...' : 'Apply'}
            </button>
          </div>
          {appliedCoupon && (
            <p className="text-sm text-green-600">
              ✓ {appliedCoupon.code} applied (saved {formatINR(appliedCoupon.discount)})
            </p>
          )}

          <hr className="border-ink/10" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tax (GST 5%)</span>
              <span>{formatINR(tax)}</span>
            </div>
            {subtotal < FREE_SHIPPING && (
              <p className="text-xs text-gold mt-2">
                Add {formatINR(FREE_SHIPPING - subtotal)} more for free shipping
              </p>
            )}
          </div>

          <hr className="border-ink/10" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>

          <button onClick={() => navigate('/checkout')} className="btn-primary w-full">
            Proceed to Checkout
          </button>
          <Link to="/shop" className="block text-center text-sm text-muted hover:text-ink">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
