import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '@/hooks/redux';
import { loginThunk } from '@/store/authSlice';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as any)?.from || '/';

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await dispatch(loginThunk(data)).unwrap();
      toast.success('Welcome back!');
      navigate(redirect);
    } catch (e: any) {
      toast.error(e.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x py-12 max-w-md">
      <h1 className="font-display text-3xl font-bold mb-1">Welcome back</h1>
      <p className="text-muted mb-6">Log in to your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Email</label>
          <input className="input" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Password</label>
          <input className="input" type="password" {...register('password')} />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-gold" {...register('remember')} />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-gold hover:underline">Forgot password?</Link>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-center text-sm mt-4 text-muted">
        Don't have an account? <Link to="/register" className="text-gold hover:underline">Sign up</Link>
      </p>
    </div>
  );
};
