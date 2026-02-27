import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    createReferral,
    getReferrals,
    getMatches,
    applyToReferral,
    getReferralDetails,
} from '../controllers/referralController.js';

const router = express.Router();

router.get('/', protect, getReferrals);
router.get('/matches', protect, getMatches);
router.get('/:id', protect, getReferralDetails);
router.post('/', protect, createReferral);
router.post('/:id/apply', protect, applyToReferral);

export default router;
