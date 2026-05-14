import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'hate_speech', 'nudity', 'violence', 'misinformation', 'self_harm', 'other'],
      required: true,
    },
    description: { type: String, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    adminNote: { type: String, default: '' },
    actionTaken: {
      type: String,
      enum: ['none', 'content_removed', 'user_warned', 'user_banned', 'account_suspended'],
      default: 'none',
    },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
