import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/services/endpoints';
import toast from 'react-hot-toast';

const schema = z
  .object({
    password: z.string().min(6),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ password: string; confirm: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { password: string }) => {
    if (!token) return;
    setSubmitting(true);
    try {
      await authApi.reset(token, data.password);
      toast.success('Password updated. Please log in.');
      navigate('/login');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x py-12 max-w-md">
      <h1 className="font-display text-3xl font-bold mb-1">New password</h1>
      <p className="text-muted mb-6">Enter your new password below.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted mb-1 block">New password</label>
          <input className="input" type="password" {...register('password')} />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Confirm password</label>
          <input className="input" type="password" {...register('confirm')} />
          {errors.confirm && <p className="text-xs text-red-600 mt-1">{errors.confirm.message}</p>}
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>

      <p className="text-center text-sm mt-4 text-muted">
        <Link to="/login" className="text-gold hover:underline">Back to login</Link>
      </p>
    </div>
  );
};
