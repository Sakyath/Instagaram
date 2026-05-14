import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'accepted',
    },
  },
  { timestamps: true }
);

followerSchema.index({ follower: 1, following: 1 }, { unique: true });
followerSchema.index({ following: 1, status: 1 });
followerSchema.index({ follower: 1, status: 1 });

const Follower = mongoose.model('Follower', followerSchema);
export default Follower;
