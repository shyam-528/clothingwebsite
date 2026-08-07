import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export const AdminCategories = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/categories').then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing({});
    setName('');
    setDescription('');
  };

  const startEdit = (c: any) => {
    setEditing(c);
    setName(c.name);
    setDescription(c.description || '');
  };

  const cancel = () => {
    setEditing(null);
    setName('');
    setDescription('');
  };

  const save = async () => {
    try {
      if (editing.id) {
        await api.put(`/admin/categories/${editing.id}`, { name, description });
        toast.success('Updated');
      } else {
        await api.post('/admin/categories', { name, description });
        toast.success('Created');
      }
      cancel();
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Categories</h1>
        <button onClick={startNew} className="btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream dark:bg-white/5 text-xs uppercase text-muted">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-muted">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-muted">No categories</td></tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-t border-ink/5">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted text-xs">{c.slug}</td>
                  <td className="p-3 text-muted">{c.description}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => startEdit(c)} className="p-2 hover:bg-ink/5 rounded">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => remove(c.id)} className="p-2 hover:bg-red-50 text-red-600 rounded">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="font-display text-xl font-bold mb-4">
              {editing.id ? 'Edit Category' : 'New Category'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase text-muted mb-1 block">Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs uppercase text-muted mb-1 block">Description</label>
                <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={save} className="btn-primary">Save</button>
              <button onClick={cancel} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
