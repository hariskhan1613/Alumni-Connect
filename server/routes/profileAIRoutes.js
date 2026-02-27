import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import {
    uploadCV,
    getProfileScore,
    getRoleReadiness,
    generateResume,
    getATSScore,
    updateAIProfile,
    getAIProfile,
    getTargetRoles,
} from '../controllers/profileAIController.js';

const router = express.Router();

// Multer config for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `cv_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    },
});

router.get('/profile', protect, getAIProfile);
router.get('/roles', protect, getTargetRoles);
router.get('/profile-score', protect, getProfileScore);
router.post('/upload-cv', protect, upload.single('cv'), uploadCV);
router.post('/role-readiness', protect, getRoleReadiness);
router.post('/generate-resume', protect, generateResume);
router.post('/ats-score', protect, getATSScore);
router.put('/update-profile', protect, updateAIProfile);

export default router;
