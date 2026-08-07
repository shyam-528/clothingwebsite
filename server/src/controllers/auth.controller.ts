import asyncHandler from '../utils/asyncHandler';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { validate } from '../utils/validate';
import { AppError } from '../middleware/error';

// In-memory reset tokens for the demo. In production, persist to Redis or DB
// with an expiry so the flow survives restarts.
const resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

const registerSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({ email: z.string().email() });

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(registerSchema, req.body);
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new AppError(409, 'Email already registered');

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password: hashed });
  const token = signToken({ userId: String(user._id), role: user.role });

  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(loginSchema, req.body);
  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user) throw new AppError(401, 'Invalid credentials');
  if (user.isBlocked) throw new AppError(403, 'Account blocked. Contact support.');

  const ok = await bcrypt.compare(data.password, user.password);
  if (!ok) throw new AppError(401, 'Invalid credentials');

  const token = signToken({ userId: String(user._id), role: user.role });
  res.json({ user, token });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(forgotSchema, req.body);
  const user = await User.findOne({ email: data.email });
  // Don't reveal whether the email exists — return same response either way.
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, {
      userId: String(user._id),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    // In production: send via email provider (SendGrid, Resend).
    console.log(`[dev] reset token for ${user.email}: ${token}`);
  }
  res.json({ message: 'If the email exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(resetSchema, req.body);
  const record = resetTokens.get(data.token);
  if (!record || record.expiresAt < new Date()) {
    resetTokens.delete(data.token);
    throw new AppError(400, 'Invalid or expired reset token');
  }
  const hashed = await bcrypt.hash(data.password, 10);
  await User.findByIdAndUpdate(record.userId, { password: hashed });
  resetTokens.delete(data.token);
  res.json({ message: 'Password updated successfully' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId).populate('wishlist');
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(updateProfileSchema, req.body);
  const user = await User.findByIdAndUpdate(req.user!.userId, data, { new: true });
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(changePasswordSchema, req.body);
  const user = await User.findById(req.user!.userId).select('+password');
  if (!user) throw new AppError(404, 'User not found');

  const ok = await bcrypt.compare(data.currentPassword, user.password);
  if (!ok) throw new AppError(401, 'Current password is incorrect');

  user.password = await bcrypt.hash(data.newPassword, 10);
  await user.save();
  res.json({ message: 'Password changed' });
});
