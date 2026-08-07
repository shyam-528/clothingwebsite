import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, User, Menu, X, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { toggleTheme, toggleMobileMenu, closeMobileMenu, openCart } from '@/store/uiSlice';
import { productsApi } from '@/services/endpoints';
import type { Product } from '@/types';
import { formatINR } from '@/utils/format';
import toast from 'react-hot-toast';

export const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { itemCount } = useAppSelector((s) => s.cart);
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.ui.theme);
  const mobileMenuOpen = useAppSelector((s) => s.ui.mobileMenuOpen);

  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const { items } = await productsApi.search(q.trim());
        setSuggestions(items);
      } catch {
        /* swallow */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const navLinks = [
    { to: '/shop?category=mens-wear', label: 'Men' },
    { to: '/shop?category=womens-wear', label: 'Women' },
    { to: '/shop?category=kids-wear', label: 'Kids' },
    { to: '/shop?category=footwear', label: 'Footwear' },
    { to: '/shop?category=accessories', label: 'Accessories' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur bg-cream/85 dark:bg-[#0f0f10]/85 border-b border-ink/5">
        <div className="container-x flex items-center gap-4 h-16">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => dispatch(toggleMobileMenu())}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="font-display text-xl md:text-2xl font-bold tracking-tight">
            Urban<span className="text-gold">Threads</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 ml-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium hover:text-gold transition ${isActive ? 'text-gold' : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <div className="hidden md:block relative">
              <div className="flex items-center bg-white dark:bg-[#1a1a1c] rounded-full px-3 py-2 w-64 border border-ink/5 focus-within:border-gold transition">
                <Search size={16} />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setShowSuggest(true);
                  }}
                  onFocus={() => setShowSuggest(true)}
                  onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && q.trim()) {
                      navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
                      setShowSuggest(false);
                    }
                  }}
                  placeholder="Search products…"
                  className="bg-transparent ml-2 outline-none text-sm flex-1"
                />
              </div>
              <AnimatePresence>
                {showSuggest && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 right-0 mt-2 card p-2 max-h-96 overflow-auto"
                  >
                    {suggestions.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream dark:hover:bg-white/5"
                        onClick={() => setShowSuggest(false)}
                      >
                        <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                          <p className="text-xs text-muted">{formatINR(p.discountPrice ?? p.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
              className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-white/5"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 rounded-full hover:bg-ink/5 dark:hover:bg-white/5"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 grid place-items-center text-[10px] font-bold rounded-full bg-gold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => dispatch(openCart())}
              aria-label="Open cart"
              className="relative p-2 rounded-full hover:bg-ink/5 dark:hover:bg-white/5"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 grid place-items-center text-[10px] font-bold rounded-full bg-ink text-white">
                  {itemCount}
                </span>
              )}
            </button>

            <Link
              to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
              aria-label="Account"
              className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-white/5"
            >
              <User size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => dispatch(closeMobileMenu())}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative h-full w-72 bg-cream dark:bg-[#0f0f10] p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-xl font-bold">
                  Urban<span className="text-gold">Threads</span>
                </span>
                <button onClick={() => dispatch(closeMobileMenu())}>
                  <X size={22} />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => dispatch(closeMobileMenu())}
                    className="px-3 py-3 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 font-medium"
                  >
                    {l.label}
                  </Link>
                ))}
                <hr className="my-3 border-ink/10" />
                <Link
                  to={user ? '/dashboard' : '/login'}
                  onClick={() => dispatch(closeMobileMenu())}
                  className="px-3 py-3 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 font-medium"
                >
                  {user ? 'My Account' : 'Login'}
                </Link>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
