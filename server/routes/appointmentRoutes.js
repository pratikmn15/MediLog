import express from 'express';
import { createAppointment, getUserAppointments } from '../controllers/appointmentController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/', authenticate, createAppointment);
router.get('/', authenticate, getUserAppointments);

export default router;