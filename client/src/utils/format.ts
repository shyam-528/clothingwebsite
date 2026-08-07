export const formatINR = (n: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export const cls = (...args: (string | false | null | undefined)[]) =>
  args.filter(Boolean).join(' ');

export const orderStatusLabel: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const orderStatusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
