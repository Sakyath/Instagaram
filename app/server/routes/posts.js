import express from 'express';
import { createPost, getFeed, getPost, getUserPosts, updatePost, deletePost, likePost, savePost, getSavedPosts, getTrendingPosts } from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import { uploadFiles } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, uploadFiles({ maxFiles: 10 }), createPost);
router.get('/feed', protect, getFeed);
router.get('/trending', protect, getTrendingPosts);
router.get('/saved', protect, getSavedPosts);
router.get('/user/:userId', protect, getUserPosts);
router.get('/:id', protect, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/save', protect, savePost);

export default router;
