import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    newSocket.emit('join', user._id);

    newSocket.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    newSocket.on('user_typing', ({ userId, chatId }) => {
      setTypingUsers((prev) => ({ ...prev, [chatId]: userId }));
    });

    newSocket.on('user_stop_typing', ({ chatId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[chatId];
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  const joinChat = useCallback((chatId) => {
    socket?.emit('join_chat', chatId);
  }, [socket]);

  const leaveChat = useCallback((chatId) => {
    socket?.emit('leave_chat', chatId);
  }, [socket]);

  const sendMessage = useCallback((chatId, message) => {
    socket?.emit('send_message', { chatId, message });
  }, [socket]);

  const emitTyping = useCallback((chatId, userId) => {
    socket?.emit('typing', { chatId, userId });
  }, [socket]);

  const emitStopTyping = useCallback((chatId, userId) => {
    socket?.emit('stop_typing', { chatId, userId });
  }, [socket]);

  const emitNotification = useCallback((recipientId, notification) => {
    socket?.emit('send_notification', { recipientId, notification });
  }, [socket]);

  const isUserOnline = useCallback((userId) => onlineUsers.has(userId), [onlineUsers]);

  return (
    <SocketContext.Provider value={{
      socket, onlineUsers, typingUsers, joinChat, leaveChat,
      sendMessage, emitTyping, emitStopTyping, emitNotification, isUserOnline,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
