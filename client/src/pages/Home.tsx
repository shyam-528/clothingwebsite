import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw, Award, ChevronRight, Star } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { productsApi } from '@/services/endpoints';
import type { Product } from '@/types';

const heroImg =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80';

const collections = [
  { name: "Men's Wear", slug: 'mens-wear', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80' },
  { name: "Women's Wear", slug: 'womens-wear', img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=900&q=80' },
  { name: 'Footwear', slug: 'footwear', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80' },
  { name: 'Accessories', slug: 'accessories', img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80' },
];

const promises = [
  { icon: Award, title: 'Premium Quality', desc: 'Crafted from long-staple cotton, full-grain leather and natural fibres.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping on orders over ₹1,500. Delivered in 3–5 days.' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day no-questions returns. Pickup from your doorstep.' },
  { icon: Shield, title: 'Secure Payments', desc: 'PCI-DSS compliant gateway. Your data is encrypted end-to-end.' },
];

const testimonials = [
  { name: 'Ananya R.', text: 'The hoodie is exactly what I wanted. Heavy fabric, perfect fit, and the colour is beautiful.', rating: 5 },
  { name: 'Karan M.', text: 'Their denim is on another level. Got two pairs and they get better with every wash.', rating: 5 },
  { name: 'Priya S.', text: 'Customer service sorted a size exchange in one chat. Will buy again.', rating: 4 },
];

export const Home = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [f, n] = await Promise.all([
          productsApi.list({ featured: 'true', limit: 8 }),
          productsApi.list({ sort: 'newest', limit: 8 }),
        ]);
        setFeatured(f.items);
        setNewArrivals(n.items);
      } catch (e: any) {
        setError(e?.message || 'Could not load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative h-[80vh] min-h-[500px] overflow-hidden">
        <img src={heroImg} alt="Hero" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative container-x h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl text-white"
          >
            <p className="uppercase tracking-[0.3em] text-xs mb-4 text-gold">New Collection · 2026</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              Wear Your Style<br />
              With Confidence
            </h1>
            <p className="mt-5 text-white/80 max-w-md">
              Premium clothing built to last — designed for the modern wardrobe, delivered to your door.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/shop?category=mens-wear" className="btn-gold">
                Shop Men <ChevronRight size={16} />
              </Link>
              <Link
                to="/shop?category=womens-wear"
                className="btn bg-white text-ink hover:bg-white/90"
              >
                Shop Women <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="container-x py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="section-title">Shop by Collection</h2>
          <Link to="/shop" className="text-sm font-medium hover:text-gold">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {collections.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/shop?category=${c.slug}`}
                className="group block relative aspect-[3/4] rounded-card overflow-hidden"
              >
                <img
                  src={c.img}
                  alt={c.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 p-4 text-white">
                  <p className="font-display text-lg font-semibold">{c.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-x py-10">
        <div className="flex items-end justify-between mb-8">
          <h2 className="section-title">New Arrivals</h2>
          <Link to="/shop?sort=newest" className="text-sm font-medium hover:text-gold">View all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] skeleton rounded-card" />
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-muted">
            <p className="font-medium text-ink dark:text-white">Couldn't load products.</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* FEATURED */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="section-title">Trending Now</h2>
          <Link to="/shop?featured=true" className="text-sm font-medium hover:text-gold">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* PROMISES */}
      <section className="container-x py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {promises.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 text-center"
            >
              <p.icon className="mx-auto mb-3 text-gold" size={28} />
              <h3 className="font-display font-semibold">{p.title}</h3>
              <p className="text-sm text-muted mt-1">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-x py-16">
        <h2 className="section-title text-center mb-10">Loved by 50,000+ Customers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="flex mb-2">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} size={14} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm">"{t.text}"</p>
              <p className="mt-3 font-medium text-sm">— {t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM GALLERY */}
      <section className="container-x py-16">
        <h2 className="section-title text-center mb-10">@urbanthreads</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            'photo-1483985988355-763728e1935b',
            'photo-1556821840-3a63f95609a7',
            'photo-1581044777550-4cfa60707c03',
            'photo-1542291026-7eec264c27ff',
            'photo-1572804013309-59a88b7e92f1',
            'photo-1591047139829-d91aecb6caea',
          ].map((id) => (
            <a
              key={id}
              href="#"
              className="aspect-square overflow-hidden rounded-md group"
            >
              <img
                src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=70`}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </a>
          ))}
        </div>
      </section>
    </>
  );
};
