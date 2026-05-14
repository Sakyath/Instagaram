import Follower from '../models/Follower.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existing = await Follower.findOne({ follower: req.user._id, following: userId });

    if (existing) {
      await Follower.findByIdAndDelete(existing._id);
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });

      res.json({ success: true, following: false, status: null });
    } else {
      const status = targetUser.isPrivate ? 'pending' : 'accepted';
      await Follower.create({ follower: req.user._id, following: userId, status });

      if (status === 'accepted') {
        await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });
      }

      if (targetUser._id.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: targetUser._id,
          sender: req.user._id,
          type: status === 'pending' ? 'follow_request' : 'follow',
        });
      }

      res.json({ success: true, following: true, status });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const follow = await Follower.findOneAndUpdate(
      { follower: userId, following: req.user._id, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!follow) {
      return res.status(404).json({ success: false, message: 'Follow request not found' });
    }

    await User.findByIdAndUpdate(userId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { followersCount: 1 } });

    res.json({ success: true, message: 'Follow request accepted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectFollowRequest = async (req, res) => {
  try {
    await Follower.findOneAndDelete({ follower: req.params.userId, following: req.user._id, status: 'pending' });
    res.json({ success: true, message: 'Follow request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFollowRequests = async (req, res) => {
  try {
    const requests = await Follower.find({ following: req.user._id, status: 'pending' })
      .populate('follower', 'username fullName avatar isVerified')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests: requests.map((r) => r.follower) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFollower = async (req, res) => {
  try {
    await Follower.findOneAndDelete({ follower: req.params.userId, following: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { $inc: { followersCount: -1 } });
    res.json({ success: true, message: 'Follower removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
