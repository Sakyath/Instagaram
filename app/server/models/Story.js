import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true },
        duration: { type: Number, default: 5 },
        text: { type: String, default: '' },
        textPosition: {
          x: { type: Number, default: 50 },
          y: { type: Number, default: 50 },
        },
      },
    ],
    viewers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        viewedAt: { type: Date, default: Date.now },
        reaction: { type: String, enum: ['', 'like', 'heart', 'fire', 'clap', 'wow'], default: '' },
      },
    ],
    viewersCount: { type: Number, default: 0 },
    isHighlight: { type: Boolean, default: false },
    highlightTitle: { type: String, default: '' },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

storySchema.index({ user: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

const Story = mongoose.model('Story', storySchema);
export default Story;
