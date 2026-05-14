import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    video: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      duration: { type: Number, default: 0 },
    },
    thumbnail: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    caption: { type: String, maxlength: 2200, default: '' },
    hashtags: [{ type: String }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    allowComments: { type: Boolean, default: true },
    audio: {
      name: { type: String, default: '' },
      artist: { type: String, default: '' },
      url: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

reelSchema.index({ createdAt: -1 });
reelSchema.index({ likesCount: -1 });

const Reel = mongoose.model('Reel', reelSchema);
export default Reel;
