const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Kirim pesan pribadi
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Penerima dan isi pesan wajib diisi' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Penerima tidak ditemukan' });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
    });

    await message.populate('sender', 'username avatar');
    await message.populate('recipient', 'username avatar');

    // Socket.io Real-time emission
    const socket = require('../socket');
    socket.getIO().to(recipientId.toString()).emit('new_message', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengirim pesan', error: error.message });
  }
};

// @desc    Ambil daftar percakapan (user-user unik)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Ambil pesan terakhir dari setiap percakapan
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'username avatar')
    .populate('recipient', 'username avatar');

    const conversations = [];
    const seenUsers = new Set();

    for (const msg of messages) {
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.recipient : msg.sender;
      const otherUserId = otherUser._id.toString();

      if (!seenUsers.has(otherUserId)) {
        seenUsers.add(otherUserId);
        conversations.push({
          user: otherUser,
          lastMessage: msg,
          unread: !msg.isRead && msg.recipient._id.toString() === userId.toString()
        });
      }
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil percakapan', error: error.message });
  }
};

// @desc    Ambil pesan dengan user tertentu
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: userId },
        { sender: userId, recipient: myId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username avatar')
    .populate('recipient', 'username avatar');

    // Tandai sudah dibaca
    await Message.updateMany(
      { sender: userId, recipient: myId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil pesan', error: error.message });
  }
};

module.exports = { sendMessage, getConversations, getMessages };
