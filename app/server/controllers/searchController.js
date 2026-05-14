import User from '../models/User.js';
import Post from '../models/Post.js';
import Reel from '../models/Reel.js';
import Hashtag from '../models/Hashtag.js';

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
      ],
    })
      .select('username fullName avatar isVerified followersCount')
      .limit(20)
      .sort({ followersCount: -1 });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchHashtags = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json({ success: true, hashtags: [] });
    }

    const hashtags = await Hashtag.find({
      tag: { $regex: q.replace('#', ''), $options: 'i' },
    })
      .limit(20)
      .sort({ postsCount: -1 });

    res.json({ success: true, hashtags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json({ success: true, posts: [] });
    }

    const posts = await Post.find({
      $or: [
        { caption: { $regex: q, $options: 'i' } },
        { hashtags: { $in: [q.replace('#', '').toLowerCase()] } },
      ],
      isArchived: false,
    })
      .populate('user', 'username fullName avatar isVerified')
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExplorePosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;

    const posts = await Post.find({ isArchived: false })
      .populate('user', 'username fullName avatar isVerified')
      .sort({ likesCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const reels = await Reel.find()
      .populate('user', 'username fullName avatar isVerified')
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(8);

    res.json({ success: true, posts, reels, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPostsByHashtag = async (req, res) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;

    const posts = await Post.find({
      hashtags: tag.toLowerCase(),
      isArchived: false,
    })
      .populate('user', 'username fullName avatar isVerified')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const hashtag = await Hashtag.findOne({ tag: tag.toLowerCase() });

    res.json({ success: true, posts, hashtag, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
