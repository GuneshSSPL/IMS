import express from 'express';
import { printBarcode } from '../controllers/barcodeController.js';

const router = express.Router();

router.post('/', printBarcode);

export default router;
