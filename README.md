# Urban Threads 👕

A modern, full-stack e-commerce application for a fashion brand. Built with React, TypeScript, Tailwind CSS, Framer Motion, Redux Toolkit, Express, MongoDB, and JWT auth.

> **Wear Your Style With Confidence** — premium clothing for men, women, kids, footwear and accessories.

---

## ✨ Features

### Storefront
- Stunning hero banner with featured collections
- Product grid with category, price, size, color filters and sorting
- Product details page with image gallery, zoom, variant picker, reviews, related products
- Cart drawer + full cart page with coupon support
- Checkout with shipping address, payment methods (COD, UPI, Card, Net Banking, Razorpay)
- Live search with suggestions
- Wishlist with persistent heart icons
- Order tracking timeline
- Dark/light theme toggle
- Fully responsive (320px → 4K)
- Animated with Framer Motion (page transitions, hover effects, drawers)

### User
- Register / Login / Forgot / Reset Password (JWT)
- Profile management & password change
- Order history with tracking
- Wishlist
- Multiple shipping addresses

### Admin
- Stats dashboard with revenue chart
- Product CRUD with multi-image upload
- Category CRUD
- Order management with status updates
- User management (block/unblock)

### Tech
- **Frontend**: React 18 + Vite + TypeScript + Tailwind + Framer Motion + Redux Toolkit + React Hook Form + Zod
- **Backend**: Node.js + Express + TypeScript + MongoDB + Mongoose + JWT + bcrypt
- **Images**: Cloudinary
- **Payments**: Razorpay (test mode)
- **Forms**: React Hook Form + Zod validation
- **Auth**: JWT stored in localStorage with axios interceptor

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com))
- Optional: [Cloudinary](https://cloudinary.com) account for image uploads
- Optional: [Razorpay](https://razorpay.com) test keys for online payments

### 1. Install dependencies

```bash
# From project root
npm install --prefix server
npm install --prefix client
```

Or in one go:

```bash
npm run install:all
```

### 2. Configure environment

#### Server — `server/.env`
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/urban-threads
JWT_SECRET=replace-with-a-long-random-string
# Cloudinary (optional, image uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# Razorpay (optional, online payments)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

#### Client — `client/.env`
```bash
cp client/.env.example client/.env
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- 5 categories, 12 products, 3 coupons
- **Admin**: `admin@urbanthreads.com` / `Admin@123`
- **Demo user**: `demo@urbanthreads.com` / `Demo@123`

### 4. Run in development

```bash
# From project root — runs both client and server concurrently
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000/api

Or run individually:
```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

### 5. Build for production

```bash
npm run build
```

Outputs the client bundle to `client/dist/`.

---

## 📁 Project Structure

```
urban-threads/
├── client/                       # React + Vite frontend
│   ├── src/
│   │   ├── components/          # ProductCard, Header, Footer, CartDrawer, MobileBottomNav
│   │   ├── pages/               # Home, Shop, ProductDetails, Cart, Checkout, OrderDetail, Wishlist
│   │   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/      # Overview, Profile, Orders, Addresses
│   │   │   └── admin/          # Dashboard, AdminProducts, AdminOrders, AdminUsers, AdminCategories
│   │   ├── layouts/            # PublicLayout, DashboardLayout, AdminLayout
│   │   ├── hooks/              # useAppDispatch, useAppSelector
│   │   ├── services/           # api.ts, endpoints.ts
│   │   ├── store/              # Redux Toolkit slices (auth, cart, wishlist, ui)
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # format helpers
│   └── tailwind.config.js
└── server/                       # Express backend
    └── src/
        ├── controllers/        # auth, product, cart, order, admin, wishlist
        ├── models/             # User, Product, Order, Category, Coupon
        ├── routes/             # auth, product, cart, order, admin, wishlist
        ├── middleware/         # auth, error, upload
        ├── config/             # env, db, cloudinary
        └── utils/              # jwt, slug, validate, seed
```

---

## 🔐 API Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/forgot-password` | — | Request reset link |
| POST | `/api/auth/reset-password` | — | Reset password |
| GET | `/api/auth/me` | user | Get current user |
| PUT | `/api/auth/me` | user | Update profile |
| PUT | `/api/auth/change-password` | user | Change password |
| GET | `/api/products` | — | List products (filters, sort, pagination) |
| GET | `/api/products/search` | — | Search suggestions |
| GET | `/api/products/:id` | — | Get product |
| GET | `/api/products/:id/related` | — | Related products |
| POST | `/api/products/:id/reviews` | user | Add review |
| POST | `/api/products` | admin | Create product |
| PUT | `/api/products/:id` | admin | Update product |
| DELETE | `/api/products/:id` | admin | Delete product |
| GET | `/api/cart` | user | Get cart |
| POST | `/api/cart/add` | user | Add to cart |
| PUT | `/api/cart/update` | user | Update quantity |
| DELETE | `/api/cart/remove` | user | Remove item |
| DELETE | `/api/cart/clear` | user | Clear cart |
| GET | `/api/wishlist` | user | Get wishlist |
| POST | `/api/wishlist/:productId` | user | Add to wishlist |
| DELETE | `/api/wishlist/:productId` | user | Remove from wishlist |
| POST | `/api/orders` | user | Create order |
| GET | `/api/orders/my-orders` | user | My orders |
| GET | `/api/orders/:id` | user/admin | Get order |
| PUT | `/api/orders/:id/cancel` | user | Cancel order |
| POST | `/api/orders/apply-coupon` | user | Apply coupon |
| PUT | `/api/orders/:id/status` | admin | Update status |
| GET | `/api/admin/stats` | admin | Dashboard stats |
| GET | `/api/admin/users` | admin | List users |
| PUT | `/api/admin/users/:id/block` | admin | Block/unblock |
| GET | `/api/admin/orders` | admin | All orders |
| GET | `/api/admin/categories` | admin | List categories |
| POST | `/api/admin/categories` | admin | Create category |
| PUT | `/api/admin/categories/:id` | admin | Update category |
| DELETE | `/api/admin/categories/:id` | admin | Delete category |

---

## 🎨 Design System

- **Palette**: Black `#111111`, White `#FFFFFF`, Beige `#F5F0EA`, Gold `#D4AF37`
- **Typography**: Poppins (headings), Inter (body)
- **Radius**: 16px cards
- **Shadow**: Soft, hover
- **Animations**: Framer Motion (page transitions, drawer, hover, fade-in)
- **Dark mode**: Class-based, persisted in localStorage

---

## 💳 Coupons (seeded)

| Code | Discount | Min Order |
|---|---|---|
| `WELCOME10` | 10% off | ₹1,000 |
| `SUMMER20` | 20% off | ₹2,000 |
| `FREESHIP` | Free shipping | — |

---

## ☁️ Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import in Vercel, set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Env vars: `VITE_API_URL=https://your-api.onrender.com/api`

### Backend → Render / Railway
1. Push to GitHub
2. Create new Web Service, root: `server`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Set env vars from `server/.env.example`

### Database → MongoDB Atlas
1. Create free cluster at https://cloud.mongodb.com
2. Whitelist IP, get connection string
3. Set `MONGO_URI` in server env

### Cloudinary
1. Sign up at https://cloudinary.com
2. Copy Cloud Name, API Key, API Secret from Dashboard
3. Set in server env

### Razorpay
1. Sign up at https://dashboard.razorpay.com
2. Switch to Test Mode, generate test keys
3. Set in server env

---

## 🧪 Demo Credentials

After `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@urbanthreads.com | Admin@123 |
| Customer | demo@urbanthreads.com | Demo@123 |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS, Framer Motion
- React Router 6
- Redux Toolkit + React-Redux
- React Hook Form + Zod
- Axios, React Hot Toast, Lucide Icons

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT + bcrypt
- Multer + Cloudinary
- Zod for validation
- Razorpay SDK

---

## 📝 License

MIT © Urban Threads

---

## 🤝 Contributing

PRs welcome. For major changes, open an issue first.

---

## 📧 Support

For questions or issues, open a GitHub issue.
