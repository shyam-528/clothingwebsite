import mongoose, { Schema, Document, Types } from 'mongoose';

export type CategorySlug =
  | 'mens-wear'
  | 'womens-wear'
  | 'kids-wear'
  | 'footwear'
  | 'accessories';

export interface Review {
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  category: CategorySlug;
  subCategory?: string;
  brand: string;
  price: number;
  discountPrice?: number;
  sizes: string[];
  colors: string[];
  variants: ProductVariant[];
  images: string[];
  stock: number;
  ratings: number;
  numReviews: number;
  reviews: Review[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<Review>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const variantSchema = new Schema<ProductVariant>(
  {
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['mens-wear', 'womens-wear', 'kids-wear', 'footwear', 'accessories'],
      index: true,
    },
    subCategory: { type: String },
    brand: { type: String, default: 'Urban Threads' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    variants: { type: [variantSchema], default: [] },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0, min: 0 },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', brand: 'text' });

productSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
