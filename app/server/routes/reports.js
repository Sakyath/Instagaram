import express from 'express';
import { createReport, getMyReports } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createReport);
router.get('/my', protect, getMyReports);

export default router;
