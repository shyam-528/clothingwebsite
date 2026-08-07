import asyncHandler from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../models/Order';
import { Coupon } from '../models/Coupon';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { AppError } from '../middleware/error';
import { validate } from '../utils/validate';
import { env } from '../config/env';

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid phone'),
  line1: z.string().min(2),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
});

const createOrderSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['cod', 'upi', 'card', 'netbanking', 'razorpay']),
  couponCode: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']),
  note: z.string().optional(),
});

const TAX_RATE = 0.05; // 5% GST
const FREE_SHIPPING_THRESHOLD = 1500;
const STANDARD_SHIPPING = 79;

let razorpay: Razorpay | null = null;
if (env.razorpay.keyId && env.razorpay.keySecret) {
  razorpay = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });
}

const computeTotals = async (
  userId: string,
  couponCode?: string
): Promise<{
  items: OrderItem[];
  itemsTotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  coupon?: any;
}> => {
  const user = await User.findById(userId);
  if (!user || !user.cart?.length) throw new AppError(400, 'Cart is empty');

  const products = await Product.find({ _id: { $in: user.cart.map((c) => c.product) } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items: OrderItem[] = [];
  let itemsTotal = 0;
  for (const c of user.cart) {
    const p = byId.get(String(c.product));
    if (!p) throw new AppError(400, `Product ${c.product} no longer available`);
    if (p.stock < c.quantity) throw new AppError(400, `Insufficient stock for ${p.title}`);
    const unitPrice = p.discountPrice ?? p.price;
    items.push({
      product: p._id,
      title: p.title,
      image: p.images[0] || '',
      size: c.size,
      color: c.color,
      quantity: c.quantity,
      price: unitPrice,
    });
    itemsTotal += unitPrice * c.quantity;
  }

  let discount = 0;
  let shippingFee = itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  let coupon;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon) throw new AppError(400, 'Invalid coupon');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError(400, 'Coupon expired');
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) throw new AppError(400, 'Coupon exhausted');
    if (coupon.minOrderValue > 0 && itemsTotal < coupon.minOrderValue)
      throw new AppError(400, `Minimum order ₹${coupon.minOrderValue} required`);

    if (coupon.type === 'percent') discount = (itemsTotal * coupon.value) / 100;
    else if (coupon.type === 'fixed') discount = coupon.value;
    else if (coupon.type === 'freeship') shippingFee = 0;
  }

  const tax = Math.round((itemsTotal - discount) * TAX_RATE);
  const totalAmount = Math.max(0, itemsTotal - discount + shippingFee + tax);
  return { items, itemsTotal, shippingFee, tax, discount, totalAmount, coupon };
};

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(createOrderSchema, req.body);
  const totals = await computeTotals(req.user!.userId, data.couponCode);

  const order = await Order.create({
    user: req.user!.userId,
    items: totals.items,
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethod,
    itemsTotal: totals.itemsTotal,
    shippingFee: totals.shippingFee,
    tax: totals.tax,
    discount: totals.discount,
    couponCode: totals.coupon?.code,
    totalAmount: totals.totalAmount,
    paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'pending',
    statusHistory: [{ status: 'pending', at: new Date() }],
  });

  // Decrement stock
  for (const item of totals.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // Mark coupon used
  if (totals.coupon) {
    await Coupon.findByIdAndUpdate(totals.coupon._id, { $inc: { usedCount: 1 } });
  }

  // Clear cart
  await User.findByIdAndUpdate(req.user!.userId, { cart: [] });

  let razorpayOrder;
  if (data.paymentMethod === 'razorpay' && razorpay) {
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totals.totalAmount * 100),
        currency: 'INR',
        receipt: String(order._id),
      });
      order.paymentId = razorpayOrder.id;
      await order.save();
    } catch (err) {
      console.error('[razorpay] order create failed', err);
    }
  }

  res.status(201).json({ order, razorpayOrder });
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, 'Order not found');
  if (String(order.user) !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AppError(403, 'Not authorized');
  }
  res.json({ order });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = validate(updateStatusSchema, req.body);
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, 'Order not found');

  order.orderStatus = data.status as OrderStatus;
  order.statusHistory.push({ status: data.status as OrderStatus, at: new Date(), note: data.note });
  await order.save();
  res.json({ order });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, 'Order not found');
  if (String(order.user) !== req.user!.userId) throw new AppError(403, 'Not authorized');
  if (!['pending', 'confirmed'].includes(order.orderStatus))
    throw new AppError(400, 'Cannot cancel at this stage');

  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', at: new Date(), note: 'User cancelled' });

  // Restock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  await order.save();
  res.json({ order });
});

export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body as { code?: string };
  if (!code) throw new AppError(400, 'Coupon code required');
  const totals = await computeTotals(req.user!.userId, code);
  res.json({
    code: totals.coupon.code,
    type: totals.coupon.type,
    discount: totals.discount,
    shippingFee: totals.shippingFee,
    tax: totals.tax,
    totalAmount: totals.totalAmount,
  });
});
