import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, underscores, and periods'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    bio: {
      type: String,
      maxlength: [150, 'Bio cannot exceed 150 characters'],
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isPrivate: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    taggedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mutedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    preferences: {
      darkMode: { type: Boolean, default: false },
      notifications: {
        likes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        follows: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
      },
      privacy: {
        showActivityStatus: { type: Boolean, default: true },
        allowTagging: { type: Boolean, default: true },
        allowMentions: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

// ✅ FIX: Removed duplicate indexes for username and email.
// unique: true in the field definition already creates indexes automatically.
// Only keeping createdAt index which is genuinely additional.
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;