import mongoose, { Schema, Document, Types } from 'mongoose';
import { Address } from './User';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking' | 'razorpay';

export interface OrderItem {
  product: Types.ObjectId;
  title: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  at: Date;
  note?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  orderStatus: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  itemsTotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<StatusHistoryEntry>(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const addressSchema = new Schema<Address>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: addressSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'card', 'netbanking', 'razorpay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
