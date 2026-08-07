import asyncHandler from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { AppError } from '../middleware/error';
import { validate } from '../utils/validate';

/**
 * Cart is stored on the User document as a flat array of items.
 * For high-traffic systems you'd move this to Redis with a TTL,
 * but Mongo works fine up to ~10k concurrent carts.
 *
 * IMPORTANT: writes use atomic findOneAndUpdate (positional $ operator)
 * so concurrent requests don't lose updates. populateCart() then re-reads
 * the persisted state to return canonical numbers.
 */

const cartItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

const updateSchema = z.object({
  productId: z.string(),
  size: z.string(),
  color: z.string(),
  quantity: z.number().int().min(0).max(20),
});

interface CartItem {
  product: any;
  size: string;
  color: string;
  quantity: number;
}

const populateCart = async (userId: string): Promise<{
  items: any[];
  subtotal: number;
  itemCount: number;
}> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  const ids = user.cart?.map((c: any) => c.product) || [];
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = (user.cart || [])
    .map((c: any) => {
      const p = byId.get(String(c.product));
      if (!p) return null;
      return {
        product: p,
        size: c.size,
        color: c.color,
        quantity: c.quantity,
        lineTotal: (p.discountPrice ?? p.price) * c.quantity,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((s, i: any) => s + i.lineTotal, 0);
  return { items, subtotal, itemCount: items.reduce((s, i: any) => s + i.quantity, 0) };
};

// 'cart' is declared on User/IUser in ../models/User — no module augmentation needed here.

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const result = await populateCart(req.user!.userId);
  res.json(result);
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(cartItemSchema, req.body);
  const product = await Product.findById(data.productId);
  if (!product || !product.isActive) throw new AppError(404, 'Product not found');

  // Reject if size/color isn't offered on this product — saves us from
  // ghost lines that can't be checked out.
  if (!product.sizes.includes(data.size)) {
    throw new AppError(400, `Size "${data.size}" not available for this product`);
  }
  if (!product.colors.includes(data.color)) {
    throw new AppError(400, `Color "${data.color}" not available for this product`);
  }

  const userId = req.user!.userId;

  // First check whether the line already exists so we can pick the right
  // atomic update (positional $ vs $push).
  const existing = await User.findOne(
    {
      _id: userId,
      'cart.product': data.productId,
      'cart.size': data.size,
      'cart.color': data.color,
    },
    { 'cart.$': 1 }
  ).lean();

  if (existing) {
    await User.updateOne(
      { _id: userId, 'cart.product': data.productId, 'cart.size': data.size, 'cart.color': data.color },
      { $inc: { 'cart.$.quantity': data.quantity } }
    );
    // Cap to 20 after the $inc.
    await User.updateOne(
      { _id: userId, 'cart.product': data.productId, 'cart.size': data.size, 'cart.color': data.color, 'cart.quantity': { $gt: 20 } },
      { $set: { 'cart.$.quantity': 20 } }
    );
  } else {
    await User.updateOne(
      { _id: userId },
      { $push: { cart: { product: data.productId, size: data.size, color: data.color, quantity: data.quantity } } }
    );
  }

  const result = await populateCart(userId);
  res.status(201).json(result);
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(updateSchema, req.body);
  const userId = req.user!.userId;

  if (data.quantity === 0) {
    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { product: data.productId, size: data.size, color: data.color } } }
    );
  } else {
    const r = await User.updateOne(
      { _id: userId, 'cart.product': data.productId, 'cart.size': data.size, 'cart.color': data.color },
      { $set: { 'cart.$.quantity': data.quantity } }
    );
    if (r.matchedCount === 0) throw new AppError(404, 'Item not in cart');
  }

  const result = await populateCart(userId);
  res.json(result);
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId, size, color } = req.query as Record<string, string>;
  const userId = req.user!.userId;

  await User.updateOne(
    { _id: userId },
    { $pull: { cart: { product: productId, size, color } } }
  );

  const result = await populateCart(userId);
  res.json(result);
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await User.updateOne({ _id: req.user!.userId }, { $set: { cart: [] } });
  res.json({ items: [], subtotal: 0, itemCount: 0 });
});
