import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import wishlistRoutes from './wishlist.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/admin', adminRoutes);

export default router;
