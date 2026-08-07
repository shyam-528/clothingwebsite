import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchWishlist } from '@/store/wishlistSlice';
import { ProductCard } from '@/components/ProductCard';

export const Wishlist = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.wishlist.items);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="container-x py-20 text-center">
        <p className="mb-4">Please log in to view your wishlist.</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="section-title mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted mb-4">No items in your wishlist yet.</p>
          <Link to="/shop" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};
