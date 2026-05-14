import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Reel from '../models/Reel.js';
import Like from '../models/Like.js';
import Notification from '../models/Notification.js';

export const addComment = async (req, res) => {
  try {
    const { text, parent } = req.body;
    const { type, id } = req.params;

    const Model = type === 'reel' ? Reel : Post;
    const item = await Model.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const comment = await Comment.create({
      [type === 'reel' ? 'reel' : 'post']: id,
      user: req.user._id,
      text,
      parent: parent || null,
    });

    await Model.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });

    if (parent) {
      await Comment.findByIdAndUpdate(parent, { $push: { replies: comment._id }, $inc: { repliesCount: 1 } });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: item.user,
        sender: req.user._id,
        type: 'comment',
        [type === 'reel' ? 'reel' : 'post']: id,
        comment: comment._id,
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username fullName avatar isVerified')
      .populate({ path: 'replies', populate: { path: 'user', select: 'username fullName avatar' } });

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { type, id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const comments = await Comment.find({
      [type === 'reel' ? 'reel' : 'post']: id,
      parent: null,
    })
      .populate('user', 'username fullName avatar isVerified')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'username fullName avatar isVerified' },
        options: { sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, comments, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isLiked = comment.likes.includes(req.user._id);

    if (isLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== req.user._id.toString());
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      comment.likes.push(req.user._id);
      comment.likesCount += 1;
    }

    await comment.save();
    res.json({ success: true, liked: !isLiked, likesCount: comment.likesCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      user: req.user._id,
    });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });
    }

    const Model = comment.reel ? Reel : Post;
    await Model.findByIdAndUpdate(comment.post || comment.reel, { $inc: { commentsCount: -1 } });

    if (comment.parent) {
      await Comment.findByIdAndUpdate(comment.parent, { $pull: { replies: comment._id }, $inc: { repliesCount: -1 } });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
