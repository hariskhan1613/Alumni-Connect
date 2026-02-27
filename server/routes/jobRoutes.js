import express from 'express';
import { createJob, getJobs, getJob, applyToJob, deleteJob } from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('alumni', 'admin'), createJob);
router.get('/', protect, getJobs);
router.get('/:id', protect, getJob);
router.post('/:id/apply', protect, authorize('student'), applyToJob);
router.delete('/:id', protect, deleteJob);

export default router;
