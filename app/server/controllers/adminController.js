import User from '../models/User.js';
import Post from '../models/Post.js';
import Reel from '../models/Reel.js';
import Report from '../models/Report.js';
import Comment from '../models/Comment.js';
import Story from '../models/Story.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Follower from '../models/Follower.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalReels,
      totalStories,
      totalMessages,
      totalReports,
      pendingReports,
      usersToday,
      postsToday,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Reel.countDocuments(),
      Story.countDocuments(),
      Message.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Post.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    ]);

    const monthlyUsers = await User.aggregate([
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalReels,
        totalStories,
        totalMessages,
        totalReports,
        pendingReports,
        usersToday,
        postsToday,
        monthlyUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { search, isBanned } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }
    if (isBanned === 'true') query.isBanned = true;

    const users = await User.find(query)
      .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: action === 'ban', banReason: action === 'ban' ? req.body.reason : '' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: `User ${action === 'ban' ? 'banned' : 'unbanned'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { status } = req.query;

    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'username fullName avatar')
      .populate('reportedUser', 'username fullName avatar')
      .populate('post', 'images caption')
      .populate('reel', 'video thumbnail')
      .populate('comment', 'text')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.json({ success: true, reports, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNote, actionTaken } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status, adminNote, actionTaken },
      { new: true }
    );

    if (actionTaken === 'content_removed' && report.post) {
      await Post.findByIdAndDelete(report.post);
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModerationStats = async (req, res) => {
  try {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [newReports, resolvedReports, bannedUsers, deletedPosts] = await Promise.all([
      Report.countDocuments({ createdAt: { $gte: last7Days } }),
      Report.countDocuments({ status: 'resolved', updatedAt: { $gte: last7Days } }),
      User.countDocuments({ isBanned: true }),
      Report.countDocuments({ actionTaken: 'content_removed' }),
    ]);

    res.json({
      success: true,
      moderation: { newReports, resolvedReports, bannedUsers, deletedPosts },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
