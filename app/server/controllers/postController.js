import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Post from '../models/Post.js';
import Like from '../models/Like.js';
import SavedPost from '../models/SavedPost.js';
import User from '../models/User.js';
import Follower from '../models/Follower.js';
import Notification from '../models/Notification.js';
import Hashtag from '../models/Hashtag.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Save a file from express-fileupload to local disk
const saveFileLocally = (file) => {
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadsDir, filename);
  file.mv(filePath);
  return { url: `/uploads/${filename}`, publicId: filename };
};

// Delete a local file by publicId (filename)
const deleteLocalFile = (publicId) => {
  if (!publicId) return;
  const filePath = path.join(uploadsDir, publicId);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

const isVideo = (file) => file.mimetype.startsWith('video/');
const isImage = (file) => file.mimetype.startsWith('image/');

const extractHashtags = (text) => {
  const hashtags = text.match(/#[\w]+/g);
  return hashtags ? hashtags.map((tag) => tag.slice(1).toLowerCase()) : [];
};

const updateHashtagCounts = async (hashtags, type = 'inc') => {
  for (const tag of hashtags) {
    await Hashtag.findOneAndUpdate(
      { tag },
      {
        $inc: { postsCount: type === 'inc' ? 1 : -1 },
        lastUsed: new Date(),
      },
      { upsert: true }
    );
  }
};

export const createPost = async (req, res) => {
  try {
    const { caption, location, allowComments, hideLikeCount } = req.body;

    // Handle files from express-fileupload (req.files)
    let uploadedImages = [];
    let uploadedVideos = [];

    if (req.files) {
      const files = Array.isArray(req.files.files)
        ? req.files.files
        : req.files.files
        ? [req.files.files]
        : [];

      for (const file of files) {
        const saved = saveFileLocally(file);
        if (isVideo(file)) {
          uploadedVideos.push(saved);
        } else if (isImage(file)) {
          uploadedImages.push(saved);
        }
      }
    }

    if (uploadedImages.length === 0 && uploadedVideos.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image or video' });
    }

    const hashtags = extractHashtags(caption || '');

    const post = await Post.create({
      user: req.user._id,
      caption: caption || '',
      images: uploadedImages.map((img) => ({ url: img.url, publicId: img.publicId, aspectRatio: '1:1' })),
      videos: uploadedVideos.map((vid) => ({ url: vid.url, publicId: vid.publicId })),
      location: location || '',
      hashtags,
      allowComments: allowComments !== 'false',
      hideLikeCount: hideLikeCount === 'true',
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });
    await updateHashtagCounts(hashtags, 'inc');

    const populatedPost = await Post.findById(post._id).populate('user', 'username fullName avatar isVerified');
    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const followingIds = await Follower.find({ follower: req.user._id, status: 'accepted' }).select('following');
    const followingArray = followingIds.map((f) => f.following.toString());

    const posts = await Post.find({
      user: { $in: [...followingArray, req.user._id.toString()] },
      isArchived: false,
    })
      .populate('user', 'username fullName avatar isVerified')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username fullName avatar' },
        options: { limit: 2, sort: { createdAt: -1 } },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const postsWithUserActions = await Promise.all(
      posts.map(async (post) => {
        const [isLiked, isSaved] = await Promise.all([
          Like.exists({ user: req.user._id, post: post._id }),
          SavedPost.exists({ user: req.user._id, post: post._id }),
        ]);
        return { ...post.toObject(), isLiked: !!isLiked, isSaved: !!isSaved };
      })
    );

    res.json({ success: true, posts: postsWithUserActions, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username fullName avatar isVerified')
      .populate({
        path: 'comments',
        populate: [
          { path: 'user', select: 'username fullName avatar' },
          { path: 'replies', populate: { path: 'user', select: 'username fullName avatar' } },
        ],
      });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const [isLiked, isSaved] = await Promise.all([
      Like.exists({ user: req.user._id, post: post._id }),
      SavedPost.exists({ user: req.user._id, post: post._id }),
    ]);

    res.json({ success: true, post: { ...post.toObject(), isLiked: !!isLiked, isSaved: !!isSaved } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const posts = await Post.find({ user: userId, isArchived: false })
      .populate('user', 'username fullName avatar isVerified')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments({ user: userId, isArchived: false });

    res.json({ success: true, posts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { caption, location, allowComments, hideLikeCount } = req.body;
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
    }

    const oldHashtags = post.hashtags;

    if (caption !== undefined) {
      post.caption = caption;
      post.hashtags = extractHashtags(caption);
    }
    if (location !== undefined) post.location = location;
    if (allowComments !== undefined) post.allowComments = allowComments;
    if (hideLikeCount !== undefined) post.hideLikeCount = hideLikeCount;

    await post.save();

    const newHashtags = post.hashtags.filter((t) => !oldHashtags.includes(t));
    const removedHashtags = oldHashtags.filter((t) => !post.hashtags.includes(t));
    await updateHashtagCounts(newHashtags, 'inc');
    await updateHashtagCounts(removedHashtags, 'dec');

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
    }

    // Delete local files instead of Cloudinary
    for (const img of post.images) {
      deleteLocalFile(img.publicId);
    }
    for (const vid of post.videos) {
      deleteLocalFile(vid.publicId);
    }

    await updateHashtagCounts(post.hashtags, 'dec');
    await Like.deleteMany({ post: post._id });
    await SavedPost.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const existingLike = await Like.findOne({ user: req.user._id, post: id });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      await Post.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
      res.json({ success: true, liked: false });
    } else {
      await Like.create({ user: req.user._id, post: id });
      await Post.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });

      const post = await Post.findById(id);
      if (post && post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: id,
        });
      }

      res.json({ success: true, liked: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await SavedPost.findOne({ user: req.user._id, post: id });

    if (existing) {
      await SavedPost.findByIdAndDelete(existing._id);
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedPosts: id } });
      await Post.findByIdAndUpdate(id, { $inc: { savesCount: -1 } });
      res.json({ success: true, saved: false });
    } else {
      await SavedPost.create({ user: req.user._id, post: id });
      await User.findByIdAndUpdate(req.user._id, { $push: { savedPosts: id } });
      await Post.findByIdAndUpdate(id, { $inc: { savesCount: 1 } });
      res.json({ success: true, saved: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const saved = await SavedPost.find({ user: req.user._id })
      .populate({
        path: 'post',
        populate: { path: 'user', select: 'username fullName avatar isVerified' },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const posts = saved.map((s) => s.post).filter(Boolean);
    res.json({ success: true, posts, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const posts = await Post.find({ isArchived: false })
      .populate('user', 'username fullName avatar isVerified')
      .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, posts, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};