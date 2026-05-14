import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: [true, 'Comment text is required'], maxlength: 1000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    repliesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
