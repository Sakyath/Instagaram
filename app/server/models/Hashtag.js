import mongoose from 'mongoose';

const hashtagSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    postsCount: { type: Number, default: 0 },
    reelsCount: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },
    lastUsed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

hashtagSchema.index({ tag: 1 });
hashtagSchema.index({ trendingScore: -1 });
hashtagSchema.index({ lastUsed: -1 });

const Hashtag = mongoose.model('Hashtag', hashtagSchema);
export default Hashtag;
