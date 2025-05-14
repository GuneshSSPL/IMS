import express from 'express';
import { 
  assignDepartment,
  getRoles,
  assignRole,
  getUsers 
} from '../controllers/userManagementController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.post('/assign-department', assignDepartment);
router.get('/roles', getRoles);
router.get('/getUsers', getUsers);  
router.post('/assign-role', assignRole);

export default router;

