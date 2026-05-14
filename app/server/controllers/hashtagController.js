import Hashtag from '../models/Hashtag.js';

export const getTrendingHashtags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const hashtags = await Hashtag.find()
      .sort({ trendingScore: -1, lastUsed: -1 })
      .limit(limit);

    res.json({ success: true, hashtags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
