import express from 'express';
import {
  addMedicine,
  getUserMedicines,
  updateMedicine,
  deleteMedicine
} from '../controllers/medicineController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/', authenticate, addMedicine);
router.get('/', authenticate, getUserMedicines);
router.put('/:id', authenticate, updateMedicine);
router.delete('/:id', authenticate, deleteMedicine);

export default router;