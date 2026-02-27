import express from 'express';
import { createPost, getFeedPosts, getPost, updatePost, deletePost, likePost, commentOnPost, getUserPosts } from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), createPost);
router.get('/', protect, getFeedPosts);
router.get('/user/:userId', protect, getUserPosts);
router.get('/:id', protect, getPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentOnPost);

export default router;
