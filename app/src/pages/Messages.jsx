import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Search, Send, ChevronLeft, Image, Phone, Video } from 'lucide-react';
import { toast } from 'sonner';
import { api, useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';

export default function Messages() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { socket, joinChat, leaveChat, sendMessage, emitTyping, emitStopTyping, typingUsers } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (userId) {
      openChatWithUser(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => { socket.off('new_message'); };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/messages/chats');
      if (data.success) setChats(data.chats);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const openChatWithUser = async (uid) => {
    try {
      const { data } = await api.get(`/messages/chat/${uid}`);
      if (data.success) {
        await openChat(data.chat);
      }
    } catch { /* ignore */ }
  };

  const openChat = async (chat) => {
    if (activeChat) leaveChat(activeChat._id);
    setActiveChat(chat);
    joinChat(chat._id);

    try {
      const { data } = await api.get(`/messages/${chat._id}`);
      if (data.success) setMessages(data.messages);
    } catch { /* ignore */ }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !activeChat) return;

    try {
      const { data } = await api.post(`/messages/${activeChat._id}`, { text: messageText });
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        sendMessage(activeChat._id, data.message);
        setMessageText('');
      }
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!activeChat) return;
    emitTyping(activeChat._id, currentUser._id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitStopTyping(activeChat._id, currentUser._id), 3000);
  };

  const otherUser = activeChat?.participants?.find((p) => p._id !== currentUser?._id);
  const isTyping = activeChat && typingUsers[activeChat._id];

  return (
    <div className="h-[100dvh] md:h-[calc(100vh-0px)] flex bg-background">
      {/* Chat List Sidebar */}
      <div className={`w-full md:w-[350px] border-r border-border flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-xl mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages"
              className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1"><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-48" /></div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No messages yet</div>
          ) : (
            chats.map((chat) => {
              const other = chat.participants?.find((p) => p._id !== currentUser?._id);
              return (
                <button
                  key={chat._id}
                  onClick={() => openChat(chat)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors text-left ${activeChat?._id === chat._id ? 'bg-accent' : ''}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                      {other?.avatar?.url ? (
                        <img src={other.avatar.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold">{other?.username?.[0]}</div>
                      )}
                    </div>
                    {other?.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{other?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage?.text || 'Start a conversation'}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{chat.unreadCount}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : ''}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-border">
              <button onClick={() => { leaveChat(activeChat._id); setActiveChat(null); }} className="md:hidden p-1">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                {otherUser?.avatar?.url ? (
                  <img src={otherUser.avatar.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold">{otherUser?.username?.[0]}</div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{otherUser?.username}</p>
                {isTyping ? <p className="text-xs text-muted-foreground">typing...</p> : otherUser?.isOnline ? <p className="text-xs text-green-500">Online</p> : null}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${isMine ? 'bg-blue-500 text-white rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                      <p>{msg.text}</p>
                      {msg.media?.map((m, i) => (
                        m.type === 'image' ? (
                          <img key={i} src={m.url} alt="" className="mt-2 rounded-lg max-w-full" />
                        ) : (
                          <video key={i} src={m.url} className="mt-2 rounded-lg max-w-full" controls />
                        )
                      ))}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex items-center gap-2">
              <button className="p-2"><Image className="w-5 h-5 text-muted-foreground" /></button>
              <input
                type="text"
                value={messageText}
                onChange={(e) => { setMessageText(e.target.value); handleTyping(); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..."
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none"
              />
              <button onClick={handleSend} disabled={!messageText.trim()} className="p-2 text-blue-500 disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-24 h-24 rounded-full border-2 border-border flex items-center justify-center mb-4">
              <Send className="w-10 h-10" />
            </div>
            <p className="font-semibold mb-1">Your messages</p>
            <p className="text-sm">Send a message to start a chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
