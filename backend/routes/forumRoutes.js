const express = require('express');
const router = express.Router();
const { protect, verified } = require('../middleware/auth');
const {
  getTopics, getTopicById, getTopicForEdit, createTopic, updateTopic, deleteTopic,
  addComment, deleteComment, getMyTopics
} = require('../controllers/forumController');

// Public
router.get('/', getTopics);
router.get('/:id', getTopicById);

// Private (verified member)
router.get('/my/list', protect, getMyTopics);
router.get('/edit/:id', protect, getTopicForEdit);
router.post('/', protect, verified, createTopic);
router.put('/:id', protect, verified, updateTopic);
router.delete('/:id', protect, deleteTopic);

// Comments
router.post('/:id/comments', protect, verified, addComment);
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
