import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import type { Product } from '@/types';
import { formatINR } from '@/utils/format';

const emptyForm = {
  title: '',
  description: '',
  category: 'mens-wear',
  brand: 'Urban Threads',
  price: 0,
  discountPrice: 0,
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['Black'],
  stock: 0,
  images: [] as string[],
  isFeatured: false,
};

export const AdminProducts = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [imgUrl, setImgUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/products', { params: { limit: 100 } }).then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      category: p.category,
      brand: p.brand,
      price: p.price,
      discountPrice: p.discountPrice || 0,
      sizes: p.sizes,
      colors: p.colors,
      stock: p.stock,
      images: p.images,
      isFeatured: p.isFeatured,
    });
  };

  const cancel = () => {
    setEditing(null);
    setForm(emptyForm);
    setImgUrl('');
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product created');
      }
      cancel();
      load();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        <button onClick={() => startEdit({} as any)} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 bg-cream dark:bg-white/5 rounded-full px-4 py-2">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream dark:bg-white/5 text-xs uppercase text-muted">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-muted">No products</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-t border-ink/5">
                  <td className="p-3 flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                    <span className="font-medium">{p.title}</span>
                  </td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3 text-right">{formatINR(p.discountPrice ?? p.price)}</td>
                  <td className="p-3 text-right">{p.stock}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => startEdit(p)} className="p-2 hover:bg-ink/5 rounded">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => remove(p.id)} className="p-2 hover:bg-red-50 text-red-600 rounded">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 overflow-auto">
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="font-display text-xl font-bold mb-4">
              {editing.id ? 'Edit Product' : 'New Product'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Title" className="md:col-span-2">
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label="Description" className="md:col-span-2">
                <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <Field label="Category">
                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="mens-wear">Men</option>
                  <option value="womens-wear">Women</option>
                  <option value="kids-wear">Kids</option>
                  <option value="footwear">Footwear</option>
                  <option value="accessories">Accessories</option>
                </select>
              </Field>
              <Field label="Brand">
                <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </Field>
              <Field label="Price">
                <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </Field>
              <Field label="Discount Price">
                <input className="input" type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })} />
              </Field>
              <Field label="Stock">
                <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </Field>
              <Field label="Sizes (comma)">
                <input className="input" value={form.sizes.join(', ')} onChange={(e) => setForm({ ...form, sizes: e.target.value.split(',').map((s: string) => s.trim()) })} />
              </Field>
              <Field label="Colors (comma)" className="md:col-span-2">
                <input className="input" value={form.colors.join(', ')} onChange={(e) => setForm({ ...form, colors: e.target.value.split(',').map((s: string) => s.trim()) })} />
              </Field>
              <Field label="Image URLs" className="md:col-span-2">
                <div className="flex gap-2">
                  <input
                    className="input"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imgUrl.trim()) {
                        setForm({ ...form, images: [...form.images, imgUrl.trim()] });
                        setImgUrl('');
                      }
                    }}
                    className="btn-outline"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.images.map((url: string, i: number) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="h-12 w-12 rounded object-cover" />
                      <button
                        onClick={() => setForm({ ...form, images: form.images.filter((_: any, j: number) => j !== i) })}
                        className="absolute -top-1 -right-1 h-4 w-4 grid place-items-center rounded-full bg-red-500 text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </Field>
              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-gold"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                Featured product (shown on homepage)
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={cancel} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children, className = '' }: any) => (
  <div className={className}>
    <label className="text-xs uppercase text-muted mb-1 block">{label}</label>
    {children}
  </div>
);
