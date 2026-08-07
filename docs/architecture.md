# Architecture

## Stack at a glance

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Vite + React 18 + TS)                              │
│  Redux Toolkit | React Router 6 | Tailwind | Framer Motion  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (Axios + JWT)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  SERVER (Express + TS)                                      │
│  Routes → Controllers → Mongoose Models → MongoDB           │
│  Middleware: JWT auth, error handler, Multer+Cloudinary      │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        ┌───────────┐           ┌──────────────┐
        │  MongoDB  │           │  Cloudinary  │
        │  (Atlas)  │           │ (product imgs)│
        └───────────┘           └──────────────┘
```

---

## Auth flow

```
[ Register ] → bcrypt hash → save to DB → sign JWT → return { user, token }
[ Login ]    → bcrypt compare → sign JWT → return { user, token }
[ Request ]  → req.headers.authorization = "Bearer <token>"
                │
                ▼
              requireAuth middleware → verify JWT → attach req.user
                                          │
                                          ▼
                                  requireAdmin if needed
```

The JWT sits in `localStorage` (key: `ut_token`). The Axios interceptor attaches it on every request. On 401 the user is redirected to `/login`.

---

## Cart persistence

For a small-to-medium storefront, the cart is stored on the `User` document. On every cart mutation, the full cart is updated in Mongo and a server-side `populate` resolves the product data so the client never sends stale prices.

For high-traffic systems, move the cart to Redis with a TTL of 30 days:

```
Key:   cart:{userId}
Value: JSON array of items
TTL:   30 days
```

The API surface stays the same — only the storage layer changes.

---

## Order lifecycle

```
pending ─confirmed─→ shipped ─→ out_for_delivery ─→ delivered
   │                       │
   └──── cancelled ─────────┘
```

Each transition is appended to `statusHistory[]` with a timestamp. The dashboard timeline reads this array to render the order tracking widget.

---

## Scaling considerations

- **Database**: Index on `Product.category`, `Product.isFeatured`, `Product.$text` for search. Currently set up.
- **Backend**: Stateless Express. Horizontal scaling via Render/Railway. Add Redis-backed rate limiting for `/api/auth/*` in production.
- **Frontend**: Vite produces a static bundle. CDN-cacheable via Vercel/Cloudflare.
- **Images**: Cloudinary handles optimization, format negotiation, and CDN. Free tier is generous.
- **Search**: For >10k products, migrate from MongoDB `$text` to Atlas Search or Meilisearch.

---

## File layout

```
urban-threads/
├── client/                          # Vite + React + TS
│   ├── src/
│   │   ├── components/             # UI primitives (Header, Footer, ProductCard, CartDrawer)
│   │   ├── pages/                  # Route-level components
│   │   ├── layouts/                # Shared layouts (Public, Dashboard, Admin)
│   │   ├── hooks/                  # Typed Redux hooks
│   │   ├── services/               # Axios + endpoint wrappers
│   │   ├── store/                  # Slices: auth, cart, wishlist, ui
│   │   ├── types/                  # TypeScript interfaces
│   │   └── utils/                  # Format helpers
│   ├── tailwind.config.js          # Brand palette, dark mode
│   ├── postcss.config.js
│   ├── vite.config.ts              # /api proxy to :5000
│   └── tsconfig.json
└── server/                          # Express + TS
    └── src/
        ├── controllers/            # Route handlers per resource
        ├── models/                 # Mongoose schemas
        ├── routes/                 # Express routers
        ├── middleware/             # auth, error, upload
        ├── config/                 # env, db, cloudinary
        ├── utils/                  # jwt, slug, validate, seed
        └── index.ts                # App entry
```

---

## Plugins / libraries used

| Concern | Library |
|---|---|
| State | Redux Toolkit |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Routing | React Router 6 |
| Styling | Tailwind CSS |
| Icons | Lucide |
| Notifications | React Hot Toast |
| Auth | JWT + bcrypt |
| Image upload | Multer + Cloudinary |
| Payments | Razorpay |
| Validation | Zod (server + client) |
