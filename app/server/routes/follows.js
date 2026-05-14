import express from 'express';
import { followUser, acceptFollowRequest, rejectFollowRequest, getFollowRequests, removeFollower } from '../controllers/followController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/:userId', protect, followUser);
router.post('/:userId/accept', protect, acceptFollowRequest);
router.post('/:userId/reject', protect, rejectFollowRequest);
router.get('/requests', protect, getFollowRequests);
router.delete('/:userId/remove', protect, removeFollower);

export default router;
