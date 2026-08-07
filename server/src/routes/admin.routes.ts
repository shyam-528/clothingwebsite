import { Router } from 'express';
import {
  getStats,
  listUsers,
  toggleBlockUser,
  listAllOrders,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/users/:id/block', toggleBlockUser);
router.get('/orders', listAllOrders);

// Categories
router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
