const express = require('express');
const router = express.Router();
const { sendMessage, getConversations, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// @route   POST /api/messages
router.post('/', protect, sendMessage);

// @route   GET /api/messages/conversations
router.get('/conversations', protect, getConversations);

// @route   GET /api/messages/:userId
router.get('/:userId', protect, getMessages);

module.exports = router;
