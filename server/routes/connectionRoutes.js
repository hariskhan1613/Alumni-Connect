import express from 'express';
import { sendRequest, acceptRequest, rejectRequest, getConnections, getPendingRequests, getConnectionStatus } from '../controllers/connectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/request/:id', protect, sendRequest);
router.put('/accept/:id', protect, acceptRequest);
router.put('/reject/:id', protect, rejectRequest);
router.get('/', protect, getConnections);
router.get('/pending', protect, getPendingRequests);
router.get('/status/:id', protect, getConnectionStatus);

export default router;
