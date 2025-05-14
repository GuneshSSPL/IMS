// /routes/roleRoutes.js
import express from 'express';
import { getAllRoles } from '../controllers/roleController.js';

const router = express.Router();

router.get('/roles', getAllRoles);

export default router;
