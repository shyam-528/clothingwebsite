# Deployment Guide

Complete walkthrough for taking Urban Threads to production.

---

## 🚀 Quick Start: Vercel (frontend) + Render (backend) — both free

Both `vercel.json` files are already configured. Three steps:

### 1. Push to GitHub
```bash
cd urban-threads
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/urban-threads.git
git push -u origin main
```

### 2. Deploy frontend to Vercel
1. https://vercel.com/signup → sign up with GitHub
2. **Add New → Project** → import `urban-threads`
3. **Root Directory:** `client` (click Edit, type `client`)
4. Framework auto-detects as **Vite**
5. **Environment Variables:**
   - `VITE_API_URL` = `https://urban-threads-api.onrender.com/api` *(set after step 3)*
   - `VITE_RAZORPAY_KEY_ID` = `rzp_test_xxxxxxxxxxxx`
6. Click **Deploy** → live at `https://urban-threads.vercel.app` in ~60s

### 3. Deploy backend to Render (free, ~2 min)
1. https://render.com → sign up with GitHub
2. **New + Web Service** → pick `urban-threads` repo
3. **Root Directory:** `server`
4. **Build:** `npm install --no-audit --no-fund && npm run build`
5. **Start:** `npm start`
6. **Instance Type:** Free
7. Add env vars (see full guide below)
8. Click **Create Web Service** → live at `https://urban-threads-api.onrender.com`

Then go back to Vercel, set `VITE_API_URL` to your Render URL, **Redeploy**.

Seed the production DB once from your laptop:
```bash
cd server
MONGO_URI="<your-atlas-connection-string>" npm run seed
```

**Free tier limits:** Vercel = 100 GB/mo bandwidth. Render = 750 hr/mo, sleeps after 15 min idle. MongoDB Atlas M0 = 512 MB. Plenty for a demo/portfolio project.

---

## Full guide below for production hardening


## 1. Database — MongoDB Atlas

1. Sign up at <https://cloud.mongodb.com> (free tier is enough for a demo).
2. Create a **Cluster** (M0 free tier, AWS region near your users).
3. Under **Database Access**, create a user with `readWrite` on your DB.
4. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) for dev, or your server's IP for production.
5. Click **Connect → Drivers** and copy the connection string.
6. Set `MONGO_URI` in your server env. Example:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/urban-threads?retryWrites=true&w=majority
   ```

---

## 2. Backend — Render

1. Push your repo to GitHub.
2. Sign up at <https://render.com>.
3. **New → Web Service**, connect your repo, root directory `server`.
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=10000` (Render sets this automatically)
   - `CLIENT_URL=https://your-app.vercel.app`
   - `MONGO_URI=...`
   - `JWT_SECRET=<openssl rand -hex 32>`
   - `CLOUDINARY_CLOUD_NAME=...`
   - `CLOUDINARY_API_KEY=...`
   - `CLOUDINARY_API_SECRET=...`
   - `RAZORPAY_KEY_ID=...`
   - `RAZORPAY_KEY_SECRET=...`
7. Deploy. Render gives you a URL like `https://urban-threads-api.onrender.com`.

### Alternative: Railway
Similar flow. `https://railway.app` → New Project → Deploy from GitHub → set root to `server`.

---

## 3. Frontend — Vercel

1. Sign up at <https://vercel.com>.
2. **New Project**, import your repo.
3. Set **Root Directory** to `client`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add env var: `VITE_API_URL=https://urban-threads-api.onrender.com/api`
7. Deploy. Vercel gives you a URL like `https://urban-threads.vercel.app`.

### Important
After the frontend is deployed, go back to your backend env and update `CLIENT_URL` to the Vercel URL, then redeploy.

---

## 4. Cloudinary (image uploads)

1. Sign up at <https://cloudinary.com> (free tier = 25 GB storage, 25 GB bandwidth).
2. From the dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. Set these in your backend env (see step 2).
4. The seed script uses external URLs (Unsplash) so seeding works without Cloudinary.

---

## 5. Razorpay (payments)

1. Sign up at <https://razorpay.com>.
2. Switch to **Test Mode** in the dashboard.
3. **Settings → API Keys → Generate Test Key**.
4. Copy the **Key ID** and **Key Secret**.
5. Set these in your backend env.
6. For production, complete KYC and switch to **Live Mode**.

### Test cards
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`
- Any future expiry, any 3-digit CVV.

### Where to wire the widget
In `client/src/pages/Checkout.tsx`, the `placeOrder` function has a hook for `razorpay.orders` data. Add the Razorpay checkout script to `client/index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```
And update `placeOrder` to open the widget:
```ts
const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount: order.totalAmount * 100,
  currency: 'INR',
  name: 'Urban Threads',
  order_id: order.paymentId,
  handler: () => navigate(`/orders/${order.id}`),
};
new (window as any).Razorpay(options).open();
```

---

## 6. Custom Domain

### Vercel
Project Settings → Domains → Add your domain. Follow the DNS instructions.

### Render
Service Settings → Custom Domain → Add. Add a CNAME record pointing to your Render URL.

### Email
For production forgot-password flow, integrate **SendGrid** or **Resend** in `server/src/controllers/auth.controller.ts`:
```ts
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
await sgMail.send({
  to: user.email,
  from: 'no-reply@urbanthreads.com',
  subject: 'Reset your password',
  text: `Click here: ${process.env.CLIENT_URL}/reset-password/${token}`,
});
```

---

## 7. Post-deploy checklist

- [ ] `npm run seed` against the production DB (or seed script in CI)
- [ ] Update `CLIENT_URL` env to match deployed frontend
- [ ] Test register → login → add to cart → checkout flow
- [ ] Test admin login → add product → upload image
- [ ] Test Razorpay with a test card
- [ ] Set up monitoring (Render provides request logs; add Sentry for error tracking)
- [ ] Set up backups: Atlas → free tier has daily snapshots
- [ ] Configure CORS (already handled in `server/src/index.ts`, but verify)
- [ ] Set up a CDN for product images (Cloudinary handles this automatically)

---

## 8. CI/CD (optional)

A minimal GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd server && npm ci && npm run build
      # Add Render deploy hook or Railway deploy step

  client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd client && npm ci && npm run build
      # Vercel auto-deploys on push if connected
```

---

## 9. Estimated monthly cost (production-ready)

| Service | Tier | Cost |
|---|---|---|
| MongoDB Atlas | M0 (free) → M10 (small prod) | $0–$9 |
| Render | Free (with sleeps) → Starter | $0–$7 |
| Vercel | Hobby (free) → Pro | $0–$20 |
| Cloudinary | Free tier | $0 |
| Razorpay | 2% per transaction | pay-as-you-go |
| **Total** | | **~$0–$36/month** |

For a real production workload at scale, expect ~$50–$150/month with proper Redis cache, CDN, and a managed Mongo cluster.
