import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/services/endpoints';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email() });

export const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { email: string }) => {
    setSubmitting(true);
    try {
      await authApi.forgot(data.email);
      setSent(true);
      toast.success('Reset link sent (check server console in dev)');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x py-12 max-w-md">
      <h1 className="font-display text-3xl font-bold mb-1">Reset password</h1>
      <p className="text-muted mb-6">We'll email you a link to reset your password.</p>

      {sent ? (
        <div className="card p-6 text-center">
          <p className="text-green-600 font-medium">Check your inbox.</p>
          <p className="text-sm text-muted mt-2">
            We've sent password reset instructions to your email.
          </p>
          <Link to="/login" className="btn-outline mt-4 inline-flex">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Email</label>
            <input className="input" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="text-center text-sm mt-4 text-muted">
        <Link to="/login" className="text-gold hover:underline">Back to login</Link>
      </p>
    </div>
  );
};
