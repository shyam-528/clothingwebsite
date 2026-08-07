import mongoose, { Schema, Document } from 'mongoose';

export type CouponType = 'percent' | 'fixed' | 'freeship';

export interface ICoupon extends Document {
  code: string;
  type: CouponType;
  value: number; // percent (0-100) or fixed amount in INR, ignored for freeship
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { type: String, enum: ['percent', 'fixed', 'freeship'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
