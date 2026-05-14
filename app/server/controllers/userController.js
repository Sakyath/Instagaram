import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Follower from '../models/Follower.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const saveFileLocally = (file) => {
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadsDir, filename);
  file.mv(filePath);
  return { url: `/uploads/${filename}`, publicId: filename };
};

const deleteLocalFile = (publicId) => {
  if (!publicId) return;
  const filePath = path.join(uploadsDir, publicId);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let isFollowing = false;
    let followStatus = null;
    if (req.user && req.user._id.toString() !== user._id.toString()) {
      const follow = await Follower.findOne({ follower: req.user._id, following: user._id });
      if (follow) {
        isFollowing = true;
        followStatus = follow.status;
      }
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        website: user.website,
        avatar: user.avatar,
        coverImage: user.coverImage,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        createdAt: user.createdAt,
        isFollowing,
        followStatus,
        isOwnProfile: req.user ? req.user._id.toString() === user._id.toString() : false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, website, isPrivate } = req.body;
    const updates = {};

    if (fullName !== undefined) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (website !== undefined) updates.website = website;
    if (isPrivate !== undefined) updates.isPrivate = isPrivate;

    // Handle avatar upload locally
    if (req.files?.avatar) {
      const user = await User.findById(req.user._id);
      if (user.avatar?.publicId) deleteLocalFile(user.avatar.publicId);
      updates.avatar = saveFileLocally(req.files.avatar);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoverImage = async (req, res) => {
  try {
    if (!req.files?.coverImage) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const user = await User.findById(req.user._id);
    if (user.coverImage?.publicId) deleteLocalFile(user.coverImage.publicId);

    user.coverImage = saveFileLocally(req.files.coverImage);
    await user.save();

    res.json({ success: true, coverImage: user.coverImage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const followingIds = await Follower.find({ follower: req.user._id }).select('following');
    const followingArray = followingIds.map((f) => f.following.toString());

    const users = await User.find({
      _id: { $nin: [...followingArray, req.user._id.toString()] },
      isPrivate: false,
    })
      .select('username fullName avatar isVerified followersCount')
      .limit(20)
      .sort({ followersCount: -1 });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const followers = await Follower.find({ following: userId, status: 'accepted' })
      .populate('follower', 'username fullName avatar isVerified')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Follower.countDocuments({ following: userId, status: 'accepted' });

    res.json({ success: true, followers: followers.map((f) => f.follower), total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const following = await Follower.find({ follower: userId, status: 'accepted' })
      .populate('following', 'username fullName avatar isVerified')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Follower.countDocuments({ follower: userId, status: 'accepted' });

    res.json({ success: true, following: following.map((f) => f.following), total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { darkMode, notifications, privacy } = req.body;
    const updates = {};

    if (darkMode !== undefined) updates['preferences.darkMode'] = darkMode;
    if (notifications) {
      Object.keys(notifications).forEach((key) => {
        updates[`preferences.notifications.${key}`] = notifications[key];
      });
    }
    if (privacy) {
      Object.keys(privacy).forEach((key) => {
        updates[`preferences.privacy.${key}`] = privacy[key];
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('preferences');
    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.blockedUsers.includes(userId)) {
      user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== userId);
      await user.save();
      res.json({ success: true, message: 'User unblocked', blocked: false });
    } else {
      user.blockedUsers.push(userId);
      await Follower.deleteOne({ follower: req.user._id, following: userId });
      await Follower.deleteOne({ follower: userId, following: req.user._id });

      const blockedUser = await User.findById(userId);
      if (blockedUser) {
        blockedUser.followersCount = Math.max(0, blockedUser.followersCount - 1);
        await blockedUser.save();
      }
      user.followingCount = Math.max(0, user.followingCount - 1);
      await user.save();

      res.json({ success: true, message: 'User blocked', blocked: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const muteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.mutedUsers.includes(userId)) {
      user.mutedUsers = user.mutedUsers.filter((id) => id.toString() !== userId);
      await user.save();
      res.json({ success: true, message: 'User unmuted', muted: false });
    } else {
      user.mutedUsers.push(userId);
      await user.save();
      res.json({ success: true, message: 'User muted', muted: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password is incorrect' });
    }

    await User.findByIdAndDelete(req.user._id);
    res.clearCookie('token');
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};