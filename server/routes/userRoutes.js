import express from 'express';
import { getProfile, updateProfile, searchUsers, getAlumniDirectory, uploadProfileImage } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/directory', protect, getAlumniDirectory);
router.get('/profile/:id', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/upload', protect, upload.single('image'), uploadProfileImage);

export default router;
