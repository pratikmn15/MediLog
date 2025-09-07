import express from 'express';
import {
  getGoogleCalendarAuthURL,
  handleGoogleCalendarCallback,
  getGoogleCalendarStatus,
  disconnectGoogleCalendar
} from '../controllers/googleCalendarController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.get('/auth-url', authenticate, getGoogleCalendarAuthURL);
router.get('/callback', handleGoogleCalendarCallback);
router.get('/status', authenticate, getGoogleCalendarStatus);
router.post('/disconnect', authenticate, disconnectGoogleCalendar);

export default router;