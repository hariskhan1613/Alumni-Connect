import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    createSession,
    getSessions,
    getRecommendedSessions,
    bookSession,
    getMyBookings,
    rateSession,
} from '../controllers/sessionController.js';

const router = express.Router();

router.get('/', protect, getSessions);
router.get('/recommended', protect, getRecommendedSessions);
router.get('/my-bookings', protect, getMyBookings);
router.post('/', protect, createSession);
router.post('/:id/book', protect, bookSession);
router.post('/:id/rate', protect, rateSession);

export default router;
