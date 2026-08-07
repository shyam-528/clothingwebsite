import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove', removeCartItem);
router.delete('/clear', clearCart);

export default router;
