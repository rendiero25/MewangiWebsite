const express = require('express');
const router = express.Router();
const { protect, verified } = require('../middleware/auth');
const { 
  getTopics, getTopicById, createTopic, updateTopic, deleteTopic, 
  addComment, deleteComment, getMyTopics, getTopicForEdit,
  likeComment, dislikeComment, getTopCategories, getRelatedTopics
} = require('../controllers/forumController');

// Public
router.get('/', getTopics);
router.get('/meta/top-categories', getTopCategories);
router.get('/:id', getTopicById);
router.get('/:id/related', getRelatedTopics);

// Protected
router.post('/', protect, verified, createTopic);
router.get('/my/list', protect, getMyTopics);
router.get('/edit/:id', protect, getTopicForEdit);
router.put('/:id', protect, verified, updateTopic);
router.delete('/:id', protect, deleteTopic);

// Comments
const upload = require('../middleware/upload');
router.post('/:id/comments', protect, verified, upload.single('image'), addComment);
// Reactions
router.post('/:id/like', protect, likeTopic);
router.post('/:id/dislike', protect, dislikeTopic);
router.post('/comments/:id/like', protect, likeComment);
router.post('/comments/:id/dislike', protect, dislikeComment);
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
