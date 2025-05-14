import express from 'express';
import { getAllSuppliers, createSupplier } from '../controllers/supplierController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate); // protect routes

router.get('/', getAllSuppliers);
router.post('/', createSupplier);

export default router;
