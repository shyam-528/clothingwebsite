import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { closeCart } from '@/store/uiSlice';
import { updateItem, removeItem } from '@/store/cartSlice';
import { formatINR } from '@/utils/format';

export const CartDrawer = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.cartDrawerOpen);
  const { items, subtotal } = useAppSelector((s) => s.cart);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => dispatch(closeCart())} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-cream dark:bg-[#0f0f10] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-ink/10">
              <h2 className="font-display text-xl font-bold">Your Cart</h2>
              <button onClick={() => dispatch(closeCart())} aria-label="Close cart">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted">Your cart is empty.</p>
                  <Link
                    to="/shop"
                    onClick={() => dispatch(closeCart())}
                    className="btn-outline mt-6 inline-flex"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}

              {items.map((i) => (
                <div key={`${i.product.id}-${i.size}-${i.color}`} className="flex gap-4 card p-3">
                  <img
                    src={i.product.images[0]}
                    alt={i.product.title}
                    className="h-20 w-20 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{i.product.title}</p>
                    <p className="text-xs text-muted">{i.size} · {i.color}</p>
                    <p className="text-sm font-semibold mt-1">{formatINR(i.lineTotal)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          dispatch(
                            updateItem({
                              productId: i.product.id,
                              size: i.size,
                              color: i.color,
                              quantity: Math.max(1, i.quantity - 1),
                            })
                          )
                        }
                        className="h-7 w-7 grid place-items-center rounded-full border border-ink/20 hover:bg-ink/5"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">{i.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(
                            updateItem({
                              productId: i.product.id,
                              size: i.size,
                              color: i.color,
                              quantity: i.quantity + 1,
                            })
                          )
                        }
                        className="h-7 w-7 grid place-items-center rounded-full border border-ink/20 hover:bg-ink/5"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() =>
                          dispatch(
                            removeItem({ productId: i.product.id, size: i.size, color: i.color })
                          )
                        }
                        className="ml-auto text-muted hover:text-red-600"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-ink/10 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold">{formatINR(subtotal)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="btn-primary w-full"
                >
                  Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="block text-center text-sm text-muted hover:text-ink"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
