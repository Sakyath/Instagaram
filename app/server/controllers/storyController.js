import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Story from '../models/Story.js';
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
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    type: file.mimetype.startsWith('video/') ? 'video' : 'image',
  };
};

const deleteLocalFile = (publicId) => {
  if (!publicId) return;
  const filePath = path.join(uploadsDir, publicId);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

export const createStory = async (req, res) => {
  try {
    const { text, textPosition, duration } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload media' });
    }

    // Handle single or multiple files
    const rawFiles = req.files.files
      ? Array.isArray(req.files.files) ? req.files.files : [req.files.files]
      : [];

    if (rawFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload media' });
    }

    const media = rawFiles.map((file) => {
      const saved = saveFileLocally(file);
      return {
        url: saved.url,
        publicId: saved.publicId,
        type: saved.type,
        duration: duration ? parseInt(duration) : saved.type === 'video' ? 15 : 5,
        text: text || '',
        textPosition: textPosition ? JSON.parse(textPosition) : { x: 50, y: 50 },
      };
    });

    const story = await Story.create({ user: req.user._id, media });
    const populated = await Story.findById(story._id).populate('user', 'username fullName avatar');
    res.status(201).json({ success: true, story: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStories = async (req, res) => {
  try {
    const followingIds = await Follower.find({ follower: req.user._id, status: 'accepted' }).select('following');
    const followingArray = followingIds.map((f) => f.following.toString());

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({
      user: { $in: [...followingArray, req.user._id.toString()] },
      expiresAt: { $gt: new Date() },
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 });

    const grouped = stories.reduce((acc, story) => {
      const userId = story.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = { user: story.user, stories: [] };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    res.json({ success: true, stories: Object.values(grouped) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('user', 'username fullName avatar isVerified')
      .populate('viewers.user', 'username fullName avatar');

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const alreadyViewed = story.viewers.some((v) => v.user?._id?.toString() === req.user._id.toString());

    if (!alreadyViewed && story.user._id.toString() !== req.user._id.toString()) {
      story.viewers.push({ user: req.user._id });
      story.viewersCount += 1;
      await story.save();
    }

    res.json({ success: true, story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reactToStory = async (req, res) => {
  try {
    const { reaction } = req.body;
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const viewerEntry = story.viewers.find((v) => v.user.toString() === req.user._id.toString());
    if (viewerEntry) {
      viewerEntry.reaction = reaction;
      await story.save();
    }

    res.json({ success: true, message: 'Reaction added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToHighlights = async (req, res) => {
  try {
    const { title } = req.body;
    const story = await Story.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isHighlight: true, highlightTitle: title || 'Highlight' },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    res.json({ success: true, story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserHighlights = async (req, res) => {
  try {
    const stories = await Story.find({ user: req.params.userId, isHighlight: true })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, highlights: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Delete local files instead of Cloudinary
    for (const m of story.media) {
      deleteLocalFile(m.publicId);
    }

    res.json({ success: true, message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};