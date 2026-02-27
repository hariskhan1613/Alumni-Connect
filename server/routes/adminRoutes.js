import express from 'express';
import { getDashboardStats, getAllUsers, deleteUser, getAllPosts, deletePostAdmin, getAllJobs, deleteJobAdmin } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePostAdmin);
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteJobAdmin);

export default router;
