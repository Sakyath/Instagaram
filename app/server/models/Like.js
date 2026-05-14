import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, post: 1 }, { unique: true, partialFilterExpression: { post: { $ne: null } } });
likeSchema.index({ user: 1, reel: 1 }, { unique: true, partialFilterExpression: { reel: { $ne: null } } });
likeSchema.index({ user: 1, comment: 1 }, { unique: true, partialFilterExpression: { comment: { $ne: null } } });

const Like = mongoose.model('Like', likeSchema);
export default Like;
