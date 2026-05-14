import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Notification from '../models/Notification.js';

const onlineUsers = new Map();

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('join', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId);

      await User.findByIdAndUpdate(userId, { isOnline: true, lastActive: new Date() });
      io.emit('user_online', { userId, isOnline: true });

      const userChats = await Chat.find({ participants: userId }).select('_id');
      userChats.forEach((chat) => socket.join(`chat_${chat._id}`));
    });

    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    socket.on('send_message', async (data) => {
      const { chatId, message } = data;
      socket.to(`chat_${chatId}`).emit('new_message', message);
    });

    socket.on('typing', (data) => {
      const { chatId, userId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', { userId, chatId });
    });

    socket.on('stop_typing', (data) => {
      const { chatId, userId } = data;
      socket.to(`chat_${chatId}`).emit('user_stop_typing', { userId, chatId });
    });

    socket.on('message_seen', (data) => {
      const { chatId, userId } = data;
      socket.to(`chat_${chatId}`).emit('message_seen', { userId, chatId });
    });

    socket.on('send_notification', async (data) => {
      const { recipientId, notification } = data;
      io.to(recipientId).emit('new_notification', notification);
    });

    socket.on('story_viewed', (data) => {
      const { storyId, userId } = data;
      socket.to(`story_${storyId}`).emit('viewer_added', { userId });
    });

    socket.on('join_story', (storyId) => {
      socket.join(`story_${storyId}`);
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastActive: new Date() });
        io.emit('user_offline', { userId: socket.userId });
      }
    });
  });
};

export const getOnlineUsers = () => onlineUsers;
