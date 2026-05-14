import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, default: '' },
    groupAvatar: { type: String, default: '' },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
    unreadCounts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 0 },
      },
    ],
    typingUsers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        startedAt: { type: Date, default: Date.now },
      },
    ],
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
