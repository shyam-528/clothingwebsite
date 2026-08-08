import { isApiConfigured } from '@/services/api';

/**
 * Top-of-page banner shown only when VITE_API_URL is empty.
 * Browsing the catalogue uses a built-in demo catalogue; login/cart/orders
 * require the real backend.
 */
export const ApiStatusBanner = () => {
  if (isApiConfigured) return null;
  return (
    <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 text-xs md:text-sm flex items-center justify-center gap-2 flex-wrap text-center">
      <span className="font-semibold">Demo mode.</span>
      <span>
        You're seeing the built-in catalogue. Sign in, cart, checkout and admin
        need the live backend — set <code className="px-1 bg-amber-200 rounded">VITE_API_URL</code>{' '}
        in Vercel env vars and redeploy.
      </span>
    </div>
  );
};
