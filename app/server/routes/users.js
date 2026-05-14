import express from 'express';
import { getUserProfile, updateProfile, updateCoverImage, getSuggestedUsers, getFollowers, getFollowing, updatePreferences, blockUser, muteUser, deleteAccount } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

router.get('/suggested', protect, getSuggestedUsers);
router.get('/profile/:username', protect, getUserProfile);
router.put('/profile', protect, uploadSingle({ fieldName: 'avatar' }), updateProfile);
router.put('/cover', protect, uploadSingle({ fieldName: 'cover' }), updateCoverImage);
router.get('/:userId/followers', protect, getFollowers);
router.get('/:userId/following', protect, getFollowing);
router.put('/preferences', protect, updatePreferences);
router.post('/block/:userId', protect, blockUser);
router.post('/mute/:userId', protect, muteUser);
router.delete('/account', protect, deleteAccount);

export default router;
