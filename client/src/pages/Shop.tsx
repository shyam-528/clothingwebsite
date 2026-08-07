import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { productsApi } from '@/services/endpoints';
import type { Product } from '@/types';
import { cls } from '@/utils/format';

const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const allColors = ['White', 'Black', 'Cream', 'Beige', 'Olive', 'Navy', 'Red', 'Blue', 'Green', 'Brown'];
const sorts = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
];

export const Shop = () => {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () => ({
      category: params.get('category') || '',
      q: params.get('q') || '',
      size: params.get('size') || '',
      color: params.get('color') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sort: params.get('sort') || 'newest',
      page: parseInt(params.get('page') || '1', 10),
    }),
    [params]
  );

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({
        category: filters.category || undefined,
        q: filters.q || undefined,
        size: filters.size || undefined,
        color: filters.color || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sort: filters.sort,
        page: filters.page,
      })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <div className="container-x py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Shop</h1>
          <p className="text-sm text-muted mt-1">{total} products</p>
        </div>
        <div className="flex gap-2">
          <button
            className="lg:hidden btn-outline"
            onClick={() => setShowFilters(true)}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={filters.sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input py-2 px-3 w-auto text-sm"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className={cls(
          'space-y-6',
          'lg:block',
          showFilters ? 'fixed inset-0 z-50 bg-cream dark:bg-[#0f0f10] p-6 overflow-auto lg:static lg:p-0 lg:bg-transparent' : 'hidden'
        )}>
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="font-display text-lg font-bold">Filters</h3>
            <button onClick={() => setShowFilters(false)}><X /></button>
          </div>

          <div>
            <h4 className="font-medium mb-3">Category</h4>
            <div className="space-y-2 text-sm">
              {[
                { v: '', l: 'All' },
                { v: 'mens-wear', l: 'Men' },
                { v: 'womens-wear', l: 'Women' },
                { v: 'kids-wear', l: 'Kids' },
                { v: 'footwear', l: 'Footwear' },
                { v: 'accessories', l: 'Accessories' },
              ].map((c) => (
                <label key={c.v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === c.v}
                    onChange={() => updateParam('category', c.v || null)}
                    className="accent-gold"
                  />
                  {c.l}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Price (₹)</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="input"
              />
              <span className="text-muted">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Size</h4>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => updateParam('size', filters.size === s ? null : s)}
                  className={cls(
                    'h-9 min-w-9 px-2 rounded-full border text-sm transition',
                    filters.size === s
                      ? 'bg-ink text-white border-ink'
                      : 'border-ink/20 hover:border-ink'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Color</h4>
            <div className="flex flex-wrap gap-2">
              {allColors.map((c) => (
                <button
                  key={c}
                  onClick={() => updateParam('color', filters.color === c ? null : c)}
                  className={cls(
                    'px-3 py-1 rounded-full text-xs border transition',
                    filters.color === c
                      ? 'bg-ink text-white border-ink'
                      : 'border-ink/20 hover:border-ink'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {(filters.category || filters.size || filters.color || filters.minPrice || filters.maxPrice) && (
            <button
              onClick={() => setParams({})}
              className="text-sm text-gold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] skeleton rounded-card" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-muted mb-4">No products match your filters.</p>
              <button onClick={() => setParams({})} className="btn-outline">Clear filters</button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </motion.div>
          )}

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateParam('page', String(i + 1))}
                  className={cls(
                    'h-9 w-9 rounded-full text-sm transition',
                    filters.page === i + 1
                      ? 'bg-ink text-white'
                      : 'border border-ink/20 hover:border-ink'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
