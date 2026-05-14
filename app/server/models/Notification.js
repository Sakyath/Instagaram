import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'mention', 'message', 'follow_request', 'story_reply', 'reel_like', 'reel_comment'],
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', default: null },
    story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', default: null },
    text: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
