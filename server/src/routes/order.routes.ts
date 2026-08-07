import { Router } from 'express';
import {
  createOrder,
  myOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  applyCoupon,
} from '../controllers/order.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', createOrder);
router.get('/my-orders', myOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);
router.post('/apply-coupon', applyCoupon);

// Admin
router.put('/:id/status', requireAdmin, updateOrderStatus);

export default router;
