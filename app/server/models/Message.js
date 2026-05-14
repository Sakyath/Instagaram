import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, maxlength: 5000, default: '' },
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true },
      },
    ],
    voiceMessage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      duration: { type: Number, default: 0 },
    },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String },
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
