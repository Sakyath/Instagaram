import express from 'express';
import { getDashboardStats, getUsers, banUser, getReports, updateReport, deletePost, deleteComment, getModerationStats } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.post('/users/:userId/ban', banUser);
router.get('/reports', getReports);
router.put('/reports/:reportId', updateReport);
router.delete('/posts/:postId', deletePost);
router.delete('/comments/:commentId', deleteComment);
router.get('/moderation-stats', getModerationStats);

export default router;
