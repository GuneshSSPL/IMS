import express from 'express';
import { consumeMaterial,getMaterialByCode , getAllMaterials} from '../controllers/consumeController.js';

const router = express.Router();

router.post('/', consumeMaterial); 
router.get('/', getAllMaterials); 
router.get('/:code', getMaterialByCode); // Get material by code

export default router;
