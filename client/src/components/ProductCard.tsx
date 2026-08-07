import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';
import { formatINR, cls } from '@/utils/format';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '@/store/wishlistSlice';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: Props) => {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((s) => s.wishlist.items);
  const token = useAppSelector((s) => s.auth.token);
  const isFav = wishlist.some((p) => p.id === product.id);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login to use wishlist');
      return;
    }
    if (isFav) {
      await dispatch(removeFromWishlist(product.id));
      toast.success('Removed from wishlist');
    } else {
      await dispatch(addToWishlist(product.id));
      toast.success('Added to wishlist');
    }
    dispatch(fetchWishlist());
  };

  const finalPrice = product.discountPrice ?? product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="card relative">
          <div className="aspect-[4/5] overflow-hidden bg-cream">
            <img
              src={product.images[0]}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {product.images[1] && (
              <img
                src={product.images[1]}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
            {product.discountPrice && (
              <span className="absolute top-3 left-3 chip bg-ink text-white border-ink">
                -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
              </span>
            )}
            <button
              onClick={toggleFav}
              aria-label="Toggle wishlist"
              className={cls(
                'absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-white/90 backdrop-blur transition',
                'hover:scale-110',
                isFav && 'text-gold'
              )}
            >
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted">{product.brand}</p>
            <h3 className="font-medium text-sm md:text-base line-clamp-1">{product.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold">{formatINR(finalPrice)}</span>
              {product.discountPrice && (
                <span className="text-sm text-muted line-through">{formatINR(product.price)}</span>
              )}
            </div>
            <div className="flex gap-1 pt-1">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c}
                  title={c}
                  className="h-3 w-3 rounded-full border border-ink/10"
                  style={{ background: colorToHex(c) }}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const colorToHex = (c: string): string => {
  const m: Record<string, string> = {
    White: '#ffffff',
    Black: '#111111',
    Cream: '#f5f0ea',
    Charcoal: '#36454F',
    Olive: '#708238',
    Navy: '#1a2a4a',
    'Light Blue': '#add8e6',
    Indigo: '#4b0082',
    'Washed Blue': '#a3c2e0',
    Khaki: '#c3b091',
    Ivory: '#fffff0',
    Sage: '#9caf88',
    Beige: '#f5f5dc',
    Camel: '#c19a6b',
    Tan: '#d2b48c',
    Burgundy: '#800020',
    Sky: '#87ceeb',
    'Sky Blue': '#87ceeb',
    Yellow: '#ffd700',
    Grey: '#808080',
    Rust: '#b7410e',
  };
  return m[c] || '#cccccc';
};
