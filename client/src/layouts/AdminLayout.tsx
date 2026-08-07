import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Users, LogOut, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/store/authSlice';
import { cls } from '@/utils/format';

export const AdminLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-ink text-white p-6 lg:sticky lg:top-0 lg:h-screen flex flex-col">
        <div className="font-display text-xl font-bold mb-8">
          Urban<span className="text-gold">Threads</span>
          <span className="ml-2 text-xs font-sans font-normal opacity-60">Admin</span>
        </div>
        <nav className="space-y-1 flex-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cls(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
                  isActive ? 'bg-white text-ink' : 'hover:bg-white/10'
                )
              }
            >
              <l.icon size={16} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Back to store
          </NavLink>
          <button
            onClick={() => {
              dispatch(logout());
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-white/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
      <div className="bg-cream dark:bg-[#0f0f10] p-6 lg:p-10">
        <Outlet />
      </div>
    </div>
  );
};
