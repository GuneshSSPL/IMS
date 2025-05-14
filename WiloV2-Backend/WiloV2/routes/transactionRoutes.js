import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createInwardTransaction,
  createConsumptionTransaction,
  getAllTransactions,
  getDailyReport,
  consumeMaterialByQR,
  getMonthlySummary,
  getInwardTransactions,
  getConsumptionTransactions 
} from '../controllers/transactionController.js';

const router = express.Router();

router.use(authenticate);

router.post('/inward', createInwardTransaction);

router.post('/consumption', createConsumptionTransaction);

router.get('/', getAllTransactions);

router.get('/reports/daily', getDailyReport);

router.get('/reports/monthly', getMonthlySummary);

router.post('/consume-qr', consumeMaterialByQR);

router.get('/inward', getInwardTransactions);

router.get('/consumption', getConsumptionTransactions);

export default router;
