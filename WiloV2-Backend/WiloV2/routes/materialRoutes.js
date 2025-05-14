import express from 'express';
import { createMaterial, getAllMaterials } from '../controllers/materialController.js'; // Import the correct controller functions
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authMiddleware to all routes that need protection
router.use(authMiddleware);

// Your protected routes
router.get('/', getAllMaterials); // Use the correct controller function for GET requests
router.post('/', createMaterial); // Use the correct controller function for POST requests

export default router;
