import express from 'express';
import { searchUsers, searchHashtags, searchPosts, getExplorePosts, getPostsByHashtag } from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', protect, searchUsers);
router.get('/hashtags', protect, searchHashtags);
router.get('/posts', protect, searchPosts);
router.get('/explore', protect, getExplorePosts);
router.get('/hashtag/:tag', protect, getPostsByHashtag);

export default router;
