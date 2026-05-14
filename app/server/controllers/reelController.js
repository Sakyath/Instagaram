import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Reel from '../models/Reel.js';
import Like from '../models/Like.js';
import Notification from '../models/Notification.js';

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

export const createReel = async (req, res) => {
  try {
    const { caption, audioName, audioArtist } = req.body;

    // Get video file from express-fileupload
    const rawFiles = req.files?.files
      ? Array.isArray(req.files.files) ? req.files.files : [req.files.files]
      : [];

    const videoFile = rawFiles.find((f) => f.mimetype.startsWith('video/'));
    if (!videoFile) {
      return res.status(400).json({ success: false, message: 'Please upload a video' });
    }

    const saved = saveFileLocally(videoFile);
    const hashtags = (caption || '').match(/#[\w]+/g)?.map((t) => t.slice(1).toLowerCase()) || [];

    const reel = await Reel.create({
      user: req.user._id,
      video: { url: saved.url, publicId: saved.publicId },
      caption: caption || '',
      hashtags,
      audio: { name: audioName || 'Original Audio', artist: audioArtist || '' },
    });

    const populated = await Reel.findById(reel._id).populate('user', 'username fullName avatar isVerified');
    res.status(201).json({ success: true, reel: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reels = await Reel.find()
      .populate('user', 'username fullName avatar isVerified')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const reelsWithUserActions = await Promise.all(
      reels.map(async (reel) => {
        const isLiked = await Like.exists({ user: req.user._id, reel: reel._id });
        return { ...reel.toObject(), isLiked: !!isLiked };
      })
    );

    res.json({ success: true, reels: reelsWithUserActions, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserReels = async (req, res) => {
  try {
    const reels = await Reel.find({ user: req.params.userId })
      .populate('user', 'username fullName avatar isVerified')
      .sort({ createdAt: -1 });

    res.json({ success: true, reels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const likeReel = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Like.findOne({ user: req.user._id, reel: id });

    if (existing) {
      await Like.findByIdAndDelete(existing._id);
      await Reel.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
      res.json({ success: true, liked: false });
    } else {
      await Like.create({ user: req.user._id, reel: id });
      await Reel.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });

      const reel = await Reel.findById(id);
      if (reel && reel.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: reel.user,
          sender: req.user._id,
          type: 'reel_like',
          reel: id,
        });
      }

      res.json({ success: true, liked: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    // Delete local files instead of Cloudinary
    deleteLocalFile(reel.video?.publicId);
    deleteLocalFile(reel.thumbnail?.publicId);
    await Like.deleteMany({ reel: reel._id });

    res.json({ success: true, message: 'Reel deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const incrementViews = async (req, res) => {
  try {
    await Reel.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};