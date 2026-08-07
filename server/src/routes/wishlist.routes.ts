import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
