import asyncHandler from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Category } from '../models/Category';
import { validate } from '../utils/validate';
import { toSlug } from '../utils/slug';

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalSales, totalOrders, totalUsers, totalProducts, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, sum: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
  ]);

  // 14-day revenue chart data
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const chart = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    totalSales: totalSales[0]?.sum || 0,
    totalOrders,
    totalUsers,
    totalProducts,
    recentOrders,
    chart,
  });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = '1', limit = '20' } = req.query as Record<string, string>;
  const filter: any = {};
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

export const toggleBlockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ user });
});

export const listAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const filter: any = {};
  if (status) filter.orderStatus = status;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));
  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// Categories
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Category.find().sort({ name: 1 });
  res.json({ items });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(categorySchema, req.body);
  const slug = toSlug(data.name);
  const cat = await Category.create({ ...data, slug });
  res.status(201).json({ category: cat });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(categorySchema.partial(), req.body);
  const cat = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json({ category: cat });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Deleted' });
});
