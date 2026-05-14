import Report from '../models/Report.js';

export const createReport = async (req, res) => {
  try {
    const { reportedUser, post, reel, comment, reason, description } = req.body;

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser,
      post,
      reel,
      comment,
      reason,
      description,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate('reportedUser', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
