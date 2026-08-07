import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Coupon } from '../models/Coupon';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Stable Unsplash URLs — w=800 keeps payload small.
const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const categories = [
  { name: "Men's Wear", slug: 'mens-wear', description: 'Shirts, tees, denim and outerwear' },
  { name: "Women's Wear", slug: 'womens-wear', description: 'Dresses, blazers, kurtas' },
  { name: "Kids' Wear", slug: 'kids-wear', description: 'Comfortable everyday wear' },
  { name: 'Footwear', slug: 'footwear', description: 'Sneakers, loafers, sandals' },
  { name: 'Accessories', slug: 'accessories', description: 'Bags, belts and more' },
];

const products = [
  {
    title: 'Oversized Hoodie',
    description:
      'Heavyweight 400 GSM cotton fleece hoodie with dropped shoulders, ribbed cuffs and a generous kangaroo pocket. Pre-washed for that lived-in softness from day one.',
    category: 'mens-wear',
    subCategory: 'hoodies',
    brand: 'Urban Threads',
    price: 2499,
    discountPrice: 1799,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Cream', 'Black'],
    images: [img('photo-1556821840-3a63f95609a7'), img('photo-1620799140408-edc6dcb6d633')],
    stock: 50,
    isFeatured: true,
    ratings: 4.6,
    numReviews: 128,
  },
  {
    title: 'Slim Fit T-Shirt',
    description:
      'Mid-weight 180 GSM combed cotton tee with a clean crew neck and reinforced shoulder seam. Cut slim through the chest and sleeves for a sharp silhouette.',
    category: 'mens-wear',
    subCategory: 'tees',
    brand: 'Urban Threads',
    price: 899,
    discountPrice: 599,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Olive', 'Navy'],
    images: [img('photo-1521572163474-6864f9cf17ab'), img('photo-1583743814966-8936f5b7be1a')],
    stock: 120,
    isFeatured: true,
    ratings: 4.4,
    numReviews: 312,
  },
  {
    title: 'Denim Jacket',
    description:
      '13 oz rigid denim trucker jacket with copper rivets, twin flap pockets and an unlined construction for easy layering. Wear it in — gets better with age.',
    category: 'mens-wear',
    subCategory: 'jackets',
    brand: 'Urban Threads',
    price: 4499,
    discountPrice: 3299,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Indigo', 'Washed Blue'],
    images: [img('photo-1551028719-00167b16eac5'), img('photo-1543076447-215ad9ba6923')],
    stock: 35,
    isFeatured: false,
    ratings: 4.7,
    numReviews: 89,
  },
  {
    title: 'Cargo Pants',
    description:
      'Relaxed-fit cargo with six utility pockets, drawstring cuffs and a gusseted crotch for movement. Made from ripstop cotton that handles abrasion.',
    category: 'mens-wear',
    subCategory: 'bottoms',
    brand: 'Urban Threads',
    price: 2199,
    discountPrice: 1599,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Olive', 'Black', 'Khaki'],
    images: [img('photo-1624378439575-d8705ad7ae80'), img('photo-1473966968600-fa801b869a1a')],
    stock: 60,
    isFeatured: false,
    ratings: 4.3,
    numReviews: 142,
  },
  {
    title: 'Floral Summer Dress',
    description:
      'Breezy viscose midi dress with a tiered hem and adjustable spaghetti straps. Hand-block printed floral pattern on a soft ivory base.',
    category: 'womens-wear',
    subCategory: 'dresses',
    brand: 'Urban Threads',
    price: 2899,
    discountPrice: 1999,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Ivory', 'Sage'],
    images: [img('photo-1572804013309-59a88b7e92f1'), img('photo-1539109136881-3be0616acf4b')],
    stock: 40,
    isFeatured: true,
    ratings: 4.8,
    numReviews: 76,
  },
  {
    title: "Women's Blazer",
    description:
      'Tailored single-breasted blazer with notched lapels and a slightly cropped hem. Fully lined with stretch lining for comfort. Pairs with denim or trousers.',
    category: 'womens-wear',
    subCategory: 'blazers',
    brand: 'Urban Threads',
    price: 4999,
    discountPrice: 3799,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Beige', 'Camel'],
    images: [img('photo-1632149877166-f75d49000351'), img('photo-1591047139829-d91aecb6caea')],
    stock: 28,
    isFeatured: true,
    ratings: 4.6,
    numReviews: 54,
  },
  {
    title: 'Kids Graphic Tee',
    description:
      'Soft 160 GSM cotton tee with playful printed graphics and reinforced neckline to handle daily wear and tear. Tag-free interior.',
    category: 'kids-wear',
    subCategory: 'tees',
    brand: 'Urban Threads',
    price: 699,
    discountPrice: 449,
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colors: ['White', 'Yellow', 'Sky Blue'],
    images: [img('photo-1519238263530-99bdd11df2ea'), img('photo-1503944583220-79d8926ad5e2')],
    stock: 80,
    isFeatured: false,
    ratings: 4.5,
    numReviews: 64,
  },
  {
    title: 'Running Sneakers',
    description:
      'Lightweight knit upper with responsive EVA midsole and rubber outsole pods for grip. Engineered for everyday training and casual wear.',
    category: 'footwear',
    subCategory: 'sneakers',
    brand: 'Urban Threads',
    price: 3499,
    discountPrice: 2499,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Black', 'Grey'],
    images: [img('photo-1542291026-7eec264c27ff'), img('photo-1595950653106-6c9ebd614d3a')],
    stock: 65,
    isFeatured: true,
    ratings: 4.5,
    numReviews: 211,
  },
  {
    title: 'Leather Handbag',
    description:
      'Genuine full-grain leather tote with brass hardware, magnetic snap closure and an internal zip pocket. Develops a rich patina with use.',
    category: 'accessories',
    subCategory: 'bags',
    brand: 'Urban Threads',
    price: 5999,
    discountPrice: 4499,
    sizes: ['One Size'],
    colors: ['Tan', 'Black', 'Burgundy'],
    images: [img('photo-1584917865442-de89df76afd3'), img('photo-1591561954557-26941169b49e')],
    stock: 22,
    isFeatured: true,
    ratings: 4.9,
    numReviews: 47,
  },
  {
    title: 'Classic White Shirt',
    description:
      'Crisp poplin shirt with a spread collar, single chest pocket and French placket. Cut from long-staple cotton that holds its press all day.',
    category: 'mens-wear',
    subCategory: 'shirts',
    brand: 'Urban Threads',
    price: 1899,
    discountPrice: 1299,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Light Blue'],
    images: [img('photo-1602810318383-e386cc2a3ccf'), img('photo-1598033129183-c4f50c736f10')],
    stock: 90,
    isFeatured: false,
    ratings: 4.4,
    numReviews: 98,
  },
  {
    title: 'Black Joggers',
    description:
      'French terry joggers with tapered legs, side zipper pockets and an elasticated waist with internal drawcord. Pre-shrunk for a consistent fit.',
    category: 'mens-wear',
    subCategory: 'bottoms',
    brand: 'Urban Threads',
    price: 1599,
    discountPrice: 1099,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Charcoal', 'Olive'],
    images: [img('photo-1552902865-b72c031ac5ea'), img('photo-1624378439575-d8705ad7ae80')],
    stock: 75,
    isFeatured: false,
    ratings: 4.5,
    numReviews: 156,
  },
  {
    title: 'Cotton Kurta',
    description:
      'Hand-finished straight-cut kurta in pure cotton with mother-of-pearl buttons and side slits. Versatile — wear solo or layered.',
    category: 'womens-wear',
    subCategory: 'kurtas',
    brand: 'Urban Threads',
    price: 2299,
    discountPrice: 1699,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Ivory', 'Sage', 'Rust'],
    images: [img('photo-1610030469983-98e550d6193c'), img('photo-1583391733956-3750e0ff4e8b')],
    stock: 45,
    isFeatured: true,
    ratings: 4.7,
    numReviews: 88,
  },
];

const coupons = [
  { code: 'WELCOME10', type: 'percent' as const, value: 10, minOrderValue: 1000, maxUses: 0 },
  { code: 'SUMMER20', type: 'percent' as const, value: 20, minOrderValue: 2000, maxUses: 0 },
  { code: 'FREESHIP', type: 'freeship' as const, value: 0, minOrderValue: 0, maxUses: 0 },
];

const seed = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Coupon.deleteMany({}),
    ]);

    console.log('Inserting categories...');
    await Category.insertMany(categories);

    console.log('Inserting products...');
    const slugify = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const productsWithSlugs = products.map((p) => ({
      ...p,
      slug: `${slugify(p.title)}-${Date.now().toString(36)}`,
    }));
    await Product.insertMany(productsWithSlugs);

    console.log('Inserting coupons...');
    await Coupon.insertMany(coupons);

    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@urbanthreads.com',
      password: adminPassword,
      role: 'admin',
    });

    console.log('Creating demo customer...');
    const userPassword = await bcrypt.hash('Demo@123', 10);
    await User.create({
      name: 'Demo Customer',
      email: 'demo@urbanthreads.com',
      password: userPassword,
      role: 'user',
      phone: '+91 9876543210',
    });

    console.log('\n✅ Seed complete!');
    console.log('   Admin: admin@urbanthreads.com / Admin@123');
    console.log('   Demo:  demo@urbanthreads.com / Demo@123');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
