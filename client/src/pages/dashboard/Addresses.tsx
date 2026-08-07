import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setUser } from '@/store/authSlice';
import { authApi } from '@/services/endpoints';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Address } from '@/types';

export const Addresses = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Address>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Local helper since we don't expose an /addresses endpoint separately.
  // The user document holds addresses; for the demo we update via /me by
  // patching the local state and persisting through profile update on save.
  const save = async () => {
    if (!user) return;
    const next = [...(user.addresses || []), { ...draft, isDefault: !user.addresses?.length }];
    try {
      // No dedicated endpoint in this scaffold; persist addresses by re-saving
      // through a generic update. For brevity we only persist to local Redux
      // and warn the user — in production wire a dedicated /auth/addresses route.
      dispatch(setUser({ ...user, addresses: next }));
      toast.success('Address added (local only — wire /auth/addresses for persistence)');
      setAdding(false);
      setDraft({ ...draft, line1: '', city: '', state: '', postalCode: '' });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = (idx: number) => {
    if (!user) return;
    const next = (user.addresses || []).filter((_, i) => i !== idx);
    dispatch(setUser({ ...user, addresses: next }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Addresses</h1>
        <button onClick={() => setAdding(!adding)} className="btn-primary">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {adding && (
        <div className="card p-6 space-y-4">
          <h3 className="font-display text-lg font-bold">New Address</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {(['fullName', 'phone', 'line1', 'city', 'state', 'postalCode', 'country'] as const).map((k) => (
              <div key={k} className={k === 'line1' ? 'md:col-span-2' : ''}>
                <label className="text-xs uppercase text-muted mb-1 block">{k}</label>
                <input
                  className="input"
                  value={draft[k]}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary">Save</button>
            <button onClick={() => setAdding(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {(user?.addresses || []).map((a, idx) => (
          <div key={idx} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                {a.isDefault && <span className="chip text-[10px] mb-2">Default</span>}
                <p className="font-medium">{a.fullName}</p>
                <p className="text-sm text-muted mt-1">
                  {a.line1}, {a.city}, {a.state} {a.postalCode}
                </p>
                <p className="text-sm text-muted">{a.phone}</p>
              </div>
              <button onClick={() => remove(idx)} className="text-muted hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {user?.addresses?.length === 0 && (
          <p className="text-muted text-sm col-span-2 text-center py-8">No addresses yet.</p>
        )}
      </div>
    </div>
  );
};
