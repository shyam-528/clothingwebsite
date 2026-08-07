import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Heart, Star, Truck, RotateCcw, Shield } from 'lucide-react';
import { productsApi } from '@/services/endpoints';
import type { Product } from '@/types';
import { formatINR } from '@/utils/format';
import { ProductCard } from '@/components/ProductCard';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addItem } from '@/store/cartSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '@/store/wishlistSlice';
import { openCart } from '@/store/uiSlice';
import toast from 'react-hot-toast';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((s) => s.wishlist.items);
  const user = useAppSelector((s) => s.auth.user);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsApi
      .get(id)
      .then((d) => {
        setProduct(d.product);
        setSize(d.product.sizes[0] || '');
        setColor(d.product.colors[0] || '');
        return productsApi.related(d.product.id);
      })
      .then((d) => setRelated(d.items))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-x py-10 grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/5] skeleton rounded-card" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 skeleton" />
          <div className="h-6 w-1/2 skeleton" />
          <div className="h-32 skeleton" />
        </div>
      </div>
    );
  }

  if (!product) return <div className="container-x py-20 text-center">Product not found.</div>;

  const isFav = wishlist.some((p) => p.id === product.id);
  const finalPrice = product.discountPrice ?? product.price;

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    await dispatch(addItem({ productId: product.id, size, color, quantity: qty }));
    toast.success('Added to cart');
    dispatch(openCart());
  };

  const buyNow = async () => {
    await addToCart();
    setTimeout(() => navigate('/checkout'), 300);
  };

  return (
    <div className="container-x py-8">
      <nav className="text-sm text-muted mb-6">
        <Link to="/" className="hover:text-ink dark:hover:text-white">Home</Link> /
        <Link to="/shop" className="hover:text-ink dark:hover:text-white mx-1">Shop</Link> /
        <span className="text-ink dark:text-white">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div
            className="aspect-[4/5] rounded-card overflow-hidden bg-cream relative cursor-zoom-in"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
                active: true,
              });
            }}
            onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
          >
            <img
              src={product.images[imgIdx]}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-300"
              style={
                zoom.active
                  ? { transform: `scale(1.8)`, transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    imgIdx === i ? 'border-ink' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="uppercase tracking-wider text-xs text-muted">{product.brand}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">{product.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(product.ratings) ? 'fill-gold text-gold' : 'text-ink/20'}
                  />
                ))}
              </div>
              <span className="text-muted">{product.ratings.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold">{formatINR(finalPrice)}</span>
            {product.discountPrice && (
              <>
                <span className="text-lg text-muted line-through">{formatINR(product.price)}</span>
                <span className="chip bg-gold text-white border-gold">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-muted leading-relaxed">{product.description}</p>

          <div>
            <h4 className="font-medium mb-2">Size</h4>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-10 min-w-10 px-3 rounded-full border text-sm font-medium transition ${
                    size === s ? 'bg-ink text-white border-ink' : 'border-ink/20 hover:border-ink'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Color: <span className="text-muted">{color}</span></h4>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    color === c ? 'ring-2 ring-offset-2 ring-gold' : ''
                  }`}
                  style={{ background: c.toLowerCase(), borderColor: 'rgba(0,0,0,0.1)' }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Quantity</h4>
            <div className="inline-flex items-center border border-ink/20 rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 grid place-items-center">
                <Minus size={14} />
              </button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(20, qty + 1))} className="h-10 w-10 grid place-items-center">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={addToCart} className="btn-outline flex-1">Add to Cart</button>
            <button onClick={buyNow} className="btn-primary flex-1">Buy Now</button>
            <button
              onClick={async () => {
                if (isFav) {
                  await dispatch(removeFromWishlist(product.id));
                } else {
                  await dispatch(addToWishlist(product.id));
                }
                dispatch(fetchWishlist());
              }}
              className="btn-outline !px-4"
              aria-label="Wishlist"
            >
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'text-gold' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-ink/10">
            {[
              { icon: Truck, t: 'Free Shipping' },
              { icon: RotateCcw, t: '30-day Returns' },
              { icon: Shield, t: 'Secure Pay' },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="flex items-center gap-2 text-xs text-muted">
                <Icon size={14} /> {t}
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-2 text-sm">
            <p><strong>Material:</strong> 100% premium cotton</p>
            <p><strong>Wash care:</strong> Machine wash cold, tumble dry low, iron on reverse</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">Customer Reviews</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.reviews.slice(0, 6).map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} size={12} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{r.name}</span>
                </div>
                <p className="text-sm text-muted">{r.comment}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
