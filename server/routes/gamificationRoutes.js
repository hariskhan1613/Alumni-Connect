import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getLeaderboard,
    getBadges,
    getProgress,
    checkBadges,
    getDashboardSummary,
} from '../controllers/gamificationController.js';

const router = express.Router();

router.get('/leaderboard', protect, getLeaderboard);
router.get('/badges', protect, getBadges);
router.get('/progress', protect, getProgress);
router.get('/dashboard', protect, getDashboardSummary);
router.post('/check-badges', protect, checkBadges);

export default router;
