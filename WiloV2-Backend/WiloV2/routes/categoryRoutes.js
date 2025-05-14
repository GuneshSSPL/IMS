import express from 'express';
import { getAllCategories, createCategory } from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate); // secure the endpoints

router.get('/', getAllCategories);
router.post('/', createCategory);

export default router;
