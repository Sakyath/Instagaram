import express from 'express';
import { getOrCreateChat, getChats, getMessages, sendMessage, deleteMessage, createGroupChat, searchMessages } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { uploadFiles } from '../middleware/upload.js';

const router = express.Router();

router.get('/chats', protect, getChats);
router.post('/chats/group', protect, createGroupChat);
router.get('/chat/:userId', protect, getOrCreateChat);
router.get('/:chatId', protect, getMessages);
router.post('/:chatId', protect, uploadFiles({ maxFiles: 5 }), sendMessage);
router.delete('/:messageId', protect, deleteMessage);
router.get('/:chatId/search', protect, searchMessages);

export default router;
