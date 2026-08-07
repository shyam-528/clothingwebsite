import { Link } from 'react-router-dom';
import { Home, Grid, Heart, User } from 'lucide-react';
import { useAppDispatch } from '@/hooks/redux';
import { openCart } from '@/store/uiSlice';
import { useAppSelector } from '@/hooks/redux';

export const MobileBottomNav = () => {
  const dispatch = useAppDispatch();
  const itemCount = useAppSelector((s) => s.cart.itemCount);
  const user = useAppSelector((s) => s.auth.user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-cream/95 dark:bg-[#0f0f10]/95 backdrop-blur border-t border-ink/10">
      <div className="grid grid-cols-5 h-16">
        <Link to="/" className="flex flex-col items-center justify-center gap-0.5 text-xs">
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to="/shop" className="flex flex-col items-center justify-center gap-0.5 text-xs">
          <Grid size={20} />
          <span>Shop</span>
        </Link>
        <button
          onClick={() => dispatch(openCart())}
          className="flex flex-col items-center justify-center gap-0.5 text-xs relative"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>Cart</span>
          {itemCount > 0 && (
            <span className="absolute top-1 right-4 h-4 min-w-4 px-1 grid place-items-center text-[10px] font-bold rounded-full bg-gold text-white">
              {itemCount}
            </span>
          )}
        </button>
        <Link to="/wishlist" className="flex flex-col items-center justify-center gap-0.5 text-xs">
          <Heart size={20} />
          <span>Wishlist</span>
        </Link>
        <Link
          to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
          className="flex flex-col items-center justify-center gap-0.5 text-xs"
        >
          <User size={20} />
          <span>{user ? 'Account' : 'Login'}</span>
        </Link>
      </div>
    </nav>
  );
};
