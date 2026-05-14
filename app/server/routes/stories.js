import express from 'express';
import { createStory, getStories, getStory, reactToStory, addToHighlights, getUserHighlights, deleteStory } from '../controllers/storyController.js';
import { protect } from '../middleware/auth.js';
import { uploadFiles } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, uploadFiles({ maxFiles: 10 }), createStory);
router.get('/', protect, getStories);
router.get('/highlights/:userId', protect, getUserHighlights);
router.get('/:id', protect, getStory);
router.post('/:id/react', protect, reactToStory);
router.post('/:id/highlight', protect, addToHighlights);
router.delete('/:id', protect, deleteStory);

export default router;
