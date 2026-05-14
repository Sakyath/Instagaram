import express from 'express';
import { getTrendingHashtags } from '../controllers/hashtagController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/trending', protect, getTrendingHashtags);

export default router;
