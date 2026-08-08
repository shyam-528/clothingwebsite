import { isApiConfigured } from '@/services/api';

/**
 * Top-of-page banner shown only when VITE_API_URL is empty.
 * Tells visitors (and you!) that the backend isn't wired up yet.
 */
export const ApiStatusBanner = () => {
  if (isApiConfigured) return null;
  return (
    <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 text-xs md:text-sm flex items-center justify-center gap-2">
      <span className="font-semibold">⚠ Backend not connected.</span>
      <span>
        Set <code className="px-1 bg-amber-200 rounded">VITE_API_URL</code> in Vercel env vars
        and redeploy. See <code className="px-1 bg-amber-200 rounded">docs/deployment.md</code>.
      </span>
    </div>
  );
};
