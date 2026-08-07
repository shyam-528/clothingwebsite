import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '@/hooks/redux';
import { registerThunk } from '@/store/authSlice';
import toast from 'react-hot-toast';

const schema = z
  .object({
    name: z.string().min(2, 'Name too short'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await dispatch(
        registerThunk({ name: data.name, email: data.email, password: data.password })
      ).unwrap();
      toast.success('Welcome to Urban Threads!');
      navigate('/');
    } catch (e: any) {
      toast.error(e.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x py-12 max-w-md">
      <h1 className="font-display text-3xl font-bold mb-1">Create account</h1>
      <p className="text-muted mb-6">Join Urban Threads for exclusive drops.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Full name</label>
          <input className="input" {...register('name')} />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
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
        <div>
          <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Confirm password</label>
          <input className="input" type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm mt-4 text-muted">
        Already have an account? <Link to="/login" className="text-gold hover:underline">Log in</Link>
      </p>
    </div>
  );
};
