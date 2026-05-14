import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username fullName avatar')
      .populate('post', 'images caption')
      .populate('reel', 'video thumbnail caption')
      .populate('comment', 'text')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.json({ success: true, notifications, unreadCount, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
      res.json({ success: true, message: 'All notifications marked as read' });
    } else {
      await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user._id },
        { isRead: true }
      );
      res.json({ success: true, message: 'Notification marked as read' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
