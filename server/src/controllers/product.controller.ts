import asyncHandler from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { z } from 'zod';
import { Product, CategorySlug } from '../models/Product';
import { AppError } from '../middleware/error';
import { validate } from '../utils/validate';
import { toSlug } from '../utils/slug';

const productSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  category: z.enum(['mens-wear', 'womens-wear', 'kids-wear', 'footwear', 'accessories']),
  subCategory: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().positive(),
  discountPrice: z.number().min(0).optional(),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
  isFeatured: z.boolean().optional(),
});

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(2).max(500),
});

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    q,
    minPrice,
    maxPrice,
    size,
    color,
    sort = 'newest',
    page = '1',
    limit = '12',
    featured,
  } = req.query as Record<string, string>;

  const filter: any = { isActive: true };
  if (category) filter.category = category as CategorySlug;
  if (featured === 'true') filter.isFeatured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (size) filter.sizes = size;
  if (color) filter.colors = color;
  if (q) filter.$text = { $search: q };

  const sortMap: Record<string, any> = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'best-selling': { numReviews: -1, ratings: -1 },
    rating: { ratings: -1 },
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(48, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
  });
});

export const searchSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ items: [] });
  const items = await Product.find(
    { isActive: true, $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(8)
    .select('title slug images price discountPrice');
  res.json({ items });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const idOrSlug = req.params.id;
  const product = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? await Product.findById(idOrSlug)
    : await Product.findOne({ slug: idOrSlug });
  if (!product) throw new AppError(404, 'Product not found');
  res.json({ product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(productSchema, req.body);
  // Images come either from Cloudinary upload (req.files) or from a JSON array
  // (used when the admin pastes URLs or seeds the DB).
  const uploaded = (req.files as Express.Multer.File[]) || [];
  const imageUrls = uploaded.map((f) => (f as any).path).filter(Boolean);
  const bodyImages: string[] = Array.isArray(req.body.images) ? req.body.images : [];
  const images = [...imageUrls, ...bodyImages];

  const slug = toSlug(`${data.title}-${Date.now().toString(36)}`);
  const product = await Product.create({ ...data, slug, images });
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(productSchema.partial(), req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!product) throw new AppError(404, 'Product not found');
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError(404, 'Product not found');
  res.json({ message: 'Product deleted' });
});

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(reviewSchema, req.body);
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError(404, 'Product not found');

  const user = await (await import('../models/User')).User.findById(req.user!.userId);
  if (!user) throw new AppError(404, 'User not found');

  product.reviews.push({
    user: user._id,
    name: user.name,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date(),
  });
  product.numReviews = product.reviews.length;
  product.ratings =
    product.reviews.reduce((s, r) => s + r.rating, 0) / product.numReviews;
  await product.save();
  res.status(201).json({ product });
});

export const relatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError(404, 'Product not found');
  const items = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  }).limit(8);
  res.json({ items });
});
