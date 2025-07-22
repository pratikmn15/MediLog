import express from 'express';
import { createOrUpdateDetails, getUserDetails } from '../controllers/userDetailsController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/', authenticate, createOrUpdateDetails);
router.get('/', authenticate, getUserDetails);

export default router;
