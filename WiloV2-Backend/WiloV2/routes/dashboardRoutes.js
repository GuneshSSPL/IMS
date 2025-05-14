import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate); // Add this line to protect all dashboard routes
router.get('/', getDashboardStats);
export default router;