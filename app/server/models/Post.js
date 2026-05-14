import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    caption: { type: String, maxlength: 2200, default: '' },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        aspectRatio: { type: String, default: '1:1' },
      },
    ],
    videos: [
      {
        url: { type: String },
        publicId: { type: String },
        thumbnail: { type: String },
        duration: { type: Number },
      },
    ],
    location: { type: String, default: '' },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    hashtags: [{ type: String, index: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isArchived: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    hideLikeCount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
