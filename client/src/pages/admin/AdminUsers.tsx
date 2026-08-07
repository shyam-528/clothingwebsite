import { useEffect, useState } from 'react';
import { adminApi } from '@/services/endpoints';
import toast from 'react-hot-toast';
import { Ban, CheckCircle } from 'lucide-react';
import type { User } from '@/types';

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.users().then((d) => setUsers(d.items)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleBlock = async (id: string) => {
    try {
      await adminApi.toggleBlockUser(id);
      toast.success('User updated');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = users.filter(
    (u) => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Users</h1>

      <div className="card p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email…"
          className="input"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream dark:bg-white/5 text-xs uppercase text-muted">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Joined</th>
              <th className="text-right p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-muted">No users</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-t border-ink/5">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-ink text-white grid place-items-center text-xs font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`chip ${u.role === 'admin' ? 'bg-gold text-white border-gold' : ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleBlock(u.id)}
                      className={`btn-outline !py-1 !px-3 text-xs ${u.isBlocked ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {u.isBlocked ? (
                        <>
                          <CheckCircle size={12} /> Unblock
                        </>
                      ) : (
                        <>
                          <Ban size={12} /> Block
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
