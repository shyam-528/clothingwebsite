import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut, LayoutDashboard } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/store/authSlice';
import { cls } from '@/utils/format';

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/orders', icon: Package, label: 'Orders' },
    { to: '/dashboard/addresses', icon: MapPin, label: 'Addresses' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist' },
  ];

  return (
    <div className="container-x py-8 lg:py-12 grid lg:grid-cols-[260px_1fr] gap-8">
      <aside className="card p-5 h-fit sticky top-24">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-ink/10">
          <div className="h-12 w-12 rounded-full bg-ink text-white grid place-items-center font-display font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cls(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
                  isActive
                    ? 'bg-ink text-white dark:bg-white dark:text-ink'
                    : 'hover:bg-ink/5 dark:hover:bg-white/5'
                )
              }
            >
              <l.icon size={16} />
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              dispatch(logout());
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  );
};
