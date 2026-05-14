import express from 'express';
import { addComment, getComments, likeComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.post('/', protect, addComment);
router.get('/', protect, getComments);
router.post('/:commentId/like', protect, likeComment);
router.delete('/:commentId', protect, deleteComment);

export default router;
