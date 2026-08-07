import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/services/endpoints';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setUser } from '@/store/authSlice';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
});

const pwSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(6, 'Min 6 characters'),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must differ',
    path: ['newPassword'],
  });

export const Profile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { name: user?.name, phone: user?.phone } });

  const onSave = async (data: any) => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile(data);
      dispatch(setUser(res.user));
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data: any) => {
    try {
      await authApi.changePassword(data);
      toast.success('Password changed');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="section-title">Profile</h1>

      <form onSubmit={handleSubmit(onSave)} className="card p-6 space-y-4">
        <h3 className="font-display text-lg font-bold">Personal Information</h3>
        <div>
          <label className="text-xs uppercase text-muted mb-1 block">Full name</label>
          <input className="input" {...register('name')} />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message as string}</p>}
        </div>
        <div>
          <label className="text-xs uppercase text-muted mb-1 block">Email</label>
          <input className="input" value={user?.email} disabled />
        </div>
        <div>
          <label className="text-xs uppercase text-muted mb-1 block">Phone</label>
          <input className="input" {...register('phone')} />
        </div>
        <button disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <ChangePasswordForm onSubmit={onChangePassword} />
    </div>
  );
};

const ChangePasswordForm = ({ onSubmit }: { onSubmit: (d: any) => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(pwSchema) });
  return (
    <form
      onSubmit={handleSubmit((d) => {
        onSubmit(d);
        reset();
      })}
      className="card p-6 space-y-4"
    >
      <h3 className="font-display text-lg font-bold">Change Password</h3>
      <div>
        <label className="text-xs uppercase text-muted mb-1 block">Current password</label>
        <input className="input" type="password" {...register('currentPassword')} />
        {errors.currentPassword && <p className="text-xs text-red-600 mt-1">{errors.currentPassword.message as string}</p>}
      </div>
      <div>
        <label className="text-xs uppercase text-muted mb-1 block">New password</label>
        <input className="input" type="password" {...register('newPassword')} />
        {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword.message as string}</p>}
      </div>
      <button className="btn-outline">Update password</button>
    </form>
  );
};
