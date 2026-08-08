// Static catalogue used as a fallback when the backend API isn't reachable.
// Shape matches server/src/utils/seed.ts so the frontend code can't tell the
// difference. Images are stable Unsplash CDN URLs.

import type { Product, CategorySlug } from '@/types';

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const variants = (sizes: string[], colors: string[]) =>
  sizes.flatMap((size) => colors.map((color) => ({ size, color, stock: 10 })));

export const STATIC_CATEGORIES: { id: string; name: string; slug: CategorySlug; description: string; isActive: boolean }[] = [
  { id: 'c1', name: "Men's Wear", slug: 'mens-wear', description: 'Shirts, tees, denim and outerwear', isActive: true },
  { id: 'c2', name: "Women's Wear", slug: 'womens-wear', description: 'Dresses, blazers, kurtas', isActive: true },
  { id: 'c3', name: "Kids' Wear", slug: 'kids-wear', description: 'Comfortable everyday wear', isActive: true },
  { id: 'c4', name: 'Footwear', slug: 'footwear', description: 'Sneakers, loafers, sandals', isActive: true },
  { id: 'c5', name: 'Accessories', slug: 'accessories', description: 'Bags, belts and more', isActive: true },
];

const NOW = '2026-08-08T00:00:00.000Z';

const mkProduct = (
  i: number,
  data: Omit<Product, 'id' | 'slug' | 'variants' | 'reviews' | 'isActive' | 'createdAt' | 'updatedAt'>
): Product => ({
  ...data,
  id: `static-${i}`,
  slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  variants: variants(data.sizes, data.colors),
  reviews: [],
  isActive: true,
  createdAt: NOW,
  updatedAt: NOW,
});

export const STATIC_PRODUCTS: Product[] = [
  mkProduct(1, {
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
  }),
  mkProduct(2, {
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
  }),
  mkProduct(3, {
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
  }),
  mkProduct(4, {
    title: 'Cargo Pants',
    description:
      'Relaxed-fit cargo with six utility pockets, drawstring cuffs and a gusseted crotch for movement. Made from ripstop cotton that handles abrasion.',
    category: 'mens-wear',
    subCategory: 'pants',
    brand: 'Urban Threads',
    price: 2299,
    discountPrice: 1599,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Olive', 'Black', 'Khaki'],
    images: [img('photo-1624378439575-d8705ad7ae80'), img('photo-1604176354204-9268737828e4')],
    stock: 60,
    isFeatured: true,
    ratings: 4.5,
    numReviews: 76,
  }),
  mkProduct(5, {
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
    stock: 80,
    isFeatured: false,
    ratings: 4.3,
    numReviews: 154,
  }),
  mkProduct(6, {
    title: 'Floral Maxi Dress',
    description:
      'Flowy A-line maxi in rayon voile with a smocked bodice, adjustable straps and side-seam pockets. Falls just right with flats or heels.',
    category: 'womens-wear',
    subCategory: 'dresses',
    brand: 'Urban Threads',
    price: 2999,
    discountPrice: 2199,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Ivory', 'Blush'],
    images: [img('photo-1572804013309-59a88b7e92f1'), img('photo-1539109136881-3be0616acf4b')],
    stock: 40,
    isFeatured: true,
    ratings: 4.8,
    numReviews: 211,
  }),
  mkProduct(7, {
    title: 'Tailored Blazer',
    description:
      'Single-breasted blazer in a wool-blend with notch lapels, double-button closure and a half-canvas chest construction for shape that lasts.',
    category: 'womens-wear',
    subCategory: 'blazers',
    brand: 'Urban Threads',
    price: 5999,
    discountPrice: 4499,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Camel'],
    images: [img('photo-1591047139829-d91aecb6caea'), img('photo-1490481651871-ab68de25d43d')],
    stock: 25,
    isFeatured: true,
    ratings: 4.9,
    numReviews: 47,
  }),
  mkProduct(8, {
    title: 'Cotton Kurta',
    description:
      'Hand-block printed cotton kurta with mother-of-pearl buttons, side slits and a relaxed fit through the body. Pairs with denim or straight pants.',
    category: 'womens-wear',
    subCategory: 'kurtas',
    brand: 'Urban Threads',
    price: 1599,
    discountPrice: 1099,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Indigo', 'Mustard'],
    images: [img('photo-1610030469983-98e550d6193c'), img('photo-1581044777550-4cfa60707c03')],
    stock: 70,
    isFeatured: false,
    ratings: 4.5,
    numReviews: 95,
  }),
  mkProduct(9, {
    title: 'High-Top Sneakers',
    description:
      'Pebbled leather high-tops with a vulcanized rubber sole, padded ankle collar and metal eyelets. Built on a true-to-size last.',
    category: 'footwear',
    subCategory: 'sneakers',
    brand: 'Urban Threads',
    price: 3499,
    discountPrice: 2499,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Black'],
    images: [img('photo-1542291026-7eec264c27ff'), img('photo-1595950653106-6c9ebd614d3a')],
    stock: 45,
    isFeatured: true,
    ratings: 4.6,
    numReviews: 188,
  }),
  mkProduct(10, {
    title: 'Suede Loafers',
    description:
      'Hand-finished suede penny loafers with a flexible rubber sole and unlined construction. Equally at home with chinos or shorts.',
    category: 'footwear',
    subCategory: 'loafers',
    brand: 'Urban Threads',
    price: 3999,
    discountPrice: 2899,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Tan', 'Navy'],
    images: [img('photo-1614252369475-531eba835eb1'), img('photo-1533867617858-e7b97e060509')],
    stock: 30,
    isFeatured: false,
    ratings: 4.4,
    numReviews: 62,
  }),
  mkProduct(11, {
    title: 'Canvas Tote',
    description:
      'Heavy 16 oz canvas tote with reinforced handles, an internal pocket and a leather logo patch. Holds a laptop, a book and a week of groceries.',
    category: 'accessories',
    subCategory: 'bags',
    brand: 'Urban Threads',
    price: 1299,
    discountPrice: 899,
    sizes: ['One Size'],
    colors: ['Natural', 'Black'],
    images: [img('photo-1544816155-12df9643f363'), img('photo-1591561954557-26941169b49e')],
    stock: 90,
    isFeatured: true,
    ratings: 4.7,
    numReviews: 142,
  }),
  mkProduct(12, {
    title: 'Leather Belt',
    description:
      'Full-grain vegetable-tanned leather belt with a brushed brass buckle. Made to develop a rich patina over years of wear.',
    category: 'accessories',
    subCategory: 'belts',
    brand: 'Urban Threads',
    price: 1499,
    discountPrice: 999,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Black'],
    images: [img('photo-1624222247344-550fb81383d2'), img('photo-1553062407-98eeb64c6a62')],
    stock: 100,
    isFeatured: false,
    ratings: 4.5,
    numReviews: 73,
  }),
];

// Public API shape helpers — match the JSON the backend returns.

export const staticProductsList = (params?: {
  category?: string;
  featured?: string;
  sort?: string;
  limit?: number;
  page?: number;
  q?: string;
}): { items: Product[]; total: number; page: number; pages: number } => {
  let items = [...STATIC_PRODUCTS];
  if (params?.category) items = items.filter((p) => p.category === params.category);
  if (params?.featured === 'true') items = items.filter((p) => p.isFeatured);
  if (params?.q) {
    const q = params.q.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }
  if (params?.sort === 'newest') items = items.reverse();
  if (params?.sort === 'price-asc') items.sort((a, b) => a.price - b.price);
  if (params?.sort === 'price-desc') items.sort((a, b) => b.price - a.price);

  const total = items.length;
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = Math.max(1, Number(params?.limit) || 12);
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pages };
};

export const staticProductGet = (idOrSlug: string) =>
  STATIC_PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;

export const staticSuggestions = (q: string) => {
  const ql = q.toLowerCase();
  return STATIC_PRODUCTS.filter(
    (p) => p.title.toLowerCase().includes(ql) || p.brand.toLowerCase().includes(ql)
  ).slice(0, 6);
};

export const staticRelated = (idOrSlug: string) => {
  const p = staticProductGet(idOrSlug);
  if (!p) return [];
  return STATIC_PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
};

export const staticCategories = () => STATIC_CATEGORIES;