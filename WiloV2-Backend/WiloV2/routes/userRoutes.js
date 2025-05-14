import express from 'express';
import { getCurrentUser, getAllUsers, updateUserRole } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect routes with authentication middleware
router.use(authenticate);

// Get current user profile
router.get('/me', getCurrentUser);

// List all users; only accessible by admin users (you may need to adjust role name(s))
router.get('/', authorize('admin'), getAllUsers);

// Update user role; only accessible by admin users (you may need to adjust role name(s))
router.put('/:id/role', authorize('admin'), updateUserRole);

export default router;
