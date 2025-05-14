import express from 'express';
import { getCustomReport, exportPDFReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/custom', getCustomReport);
router.get('/export-pdf', exportPDFReport);

export default router;