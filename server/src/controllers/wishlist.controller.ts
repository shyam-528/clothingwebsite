import asyncHandler from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { AppError } from '../middleware/error';

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId).populate({
    path: 'wishlist',
    match: { isActive: true },
  });
  if (!user) throw new AppError(404, 'User not found');
  res.json({ items: user.wishlist });
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) throw new AppError(404, 'Product not found');

  await User.findByIdAndUpdate(req.user!.userId, {
    $addToSet: { wishlist: productId },
  });
  res.status(201).json({ message: 'Added to wishlist' });
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user!.userId, {
    $pull: { wishlist: req.params.productId },
  });
  res.json({ message: 'Removed from wishlist' });
});
