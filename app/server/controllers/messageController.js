import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;

    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate('participants', 'username fullName avatar isOnline lastActive');

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, userId],
        isGroup: false,
      });
      chat = await Chat.findById(chat._id).populate('participants', 'username fullName avatar isOnline lastActive');
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'username fullName avatar isOnline lastActive')
      .populate('lastMessage.sender', 'username fullName avatar')
      .sort({ updatedAt: -1 });

    const chatsWithUnread = chats.map((chat) => {
      const unreadEntry = chat.unreadCounts?.find((u) => u.user?.toString() === req.user._id.toString());
      return {
        ...chat.toObject(),
        unreadCount: unreadEntry?.count || 0,
        otherParticipant: chat.participants.find((p) => p._id.toString() !== req.user._id.toString()),
      };
    });

    res.json({ success: true, chats: chatsWithUnread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const messages = await Message.find({ chat: chatId, isDeleted: false })
      .populate('sender', 'username fullName avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'username fullName avatar' },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    await Message.updateMany(
      { chat: chatId, 'seenBy': { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } }
    );

    await Chat.findByIdAndUpdate(chatId, {
      $set: {
        'unreadCounts.$[elem].count': 0,
      },
    }, {
      arrayFilters: [{ 'elem.user': req.user._id }],
    });

    res.json({ success: true, messages: messages.reverse(), page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, replyTo } = req.body;

    const media = req.uploadedFiles?.map((f) => ({
      url: f.url,
      publicId: f.publicId,
      type: f.type,
    })) || [];

    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      text: text || '',
      media,
      replyTo: replyTo || null,
    });

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        lastMessage: { text: text || (media.length > 0 ? 'Sent media' : ''), sender: req.user._id, createdAt: new Date() },
      },
      { new: true }
    );

    for (const participant of chat.participants) {
      if (participant.toString() !== req.user._id.toString()) {
        await Chat.findByIdAndUpdate(chatId, {
          $inc: { 'unreadCounts.$[elem].count': 1 },
        }, {
          arrayFilters: [{ 'elem.user': participant }],
          upsert: true,
        });
      }
    }

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username fullName avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'username fullName avatar' },
      });

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.messageId, sender: req.user._id },
      { isDeleted: true, text: '', media: [] },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    const { name, participantIds } = req.body;
    const allParticipants = [...new Set([...participantIds, req.user._id.toString()])];

    const chat = await Chat.create({
      participants: allParticipants,
      isGroup: true,
      groupName: name,
      admins: [req.user._id],
      unreadCounts: allParticipants.map((id) => ({ user: id, count: 0 })),
    });

    const populated = await Chat.findById(chat._id).populate('participants', 'username fullName avatar');
    res.status(201).json({ success: true, chat: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q } = req.query;

    const messages = await Message.find({
      chat: chatId,
      text: { $regex: q, $options: 'i' },
      isDeleted: false,
    })
      .populate('sender', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
