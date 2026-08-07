import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export const PublicLayout = () => {
  const { pathname } = useLocation();
  // Manual scroll restoration — <ScrollRestoration /> only works inside a data router
  // (createBrowserRouter + RouterProvider). We use BrowserRouter, so we emulate the
  // behaviour here: jump to top on every route change.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <MobileBottomNav />
    </div>
  );
};
