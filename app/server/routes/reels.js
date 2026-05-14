import express from 'express';
import { createReel, getReels, getUserReels, likeReel, deleteReel, incrementViews } from '../controllers/reelController.js';
import { protect } from '../middleware/auth.js';
import { uploadFiles } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, uploadFiles({ maxFiles: 1, folder: 'instagram-clone/reels' }), createReel);
router.get('/', protect, getReels);
router.get('/user/:userId', protect, getUserReels);
router.post('/:id/like', protect, likeReel);
router.post('/:id/view', protect, incrementViews);
router.delete('/:id', protect, deleteReel);

export default router;
