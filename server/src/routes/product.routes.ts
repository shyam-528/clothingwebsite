import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  relatedProducts,
  searchSuggestions,
} from '../controllers/product.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// IMPORTANT: /search must be declared before /:id so it doesn't get swallowed.
router.get('/search', searchSuggestions);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.get('/:id/related', relatedProducts);

router.post('/', requireAuth, requireAdmin, upload.array('images', 6), createProduct);
router.put('/:id', requireAuth, requireAdmin, upload.array('images', 6), updateProduct);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

router.post('/:id/reviews', requireAuth, addReview);

export default router;
