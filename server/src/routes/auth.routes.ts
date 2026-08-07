import { Router } from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  me,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateProfile);
router.put('/change-password', requireAuth, changePassword);

export default router;
