import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface CartLine {
  product: Types.ObjectId;
  size: string;
  color: string;
  quantity: number;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  phone?: string;
  addresses: Address[];
  wishlist: Types.ObjectId[];
  cart: CartLine[];
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<Address>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    cart: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        size:    { type: String, required: true },
        color:   { type: String, required: true },
        quantity:{ type: Number, required: true, min: 1, max: 20, default: 1 },
        _id:     false,
      },
    ],
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
