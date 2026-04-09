const express = require('express');
const router = express.Router();
const { protect, verified } = require('../middleware/auth');
const { 
  getTopics, getTopicById, createTopic, updateTopic, deleteTopic, 
  addComment, deleteComment, getMyTopics, getTopicForEdit,
  likeComment, dislikeComment, getTopCategories, getRelatedTopics,
  likeTopic, dislikeTopic, getTopTopics
} = require('../controllers/forumController');

// Public
router.get('/', getTopics);
router.get('/meta/top-categories', getTopCategories);
router.get('/meta/top-titles', getTopTopics);
router.get('/:id', getTopicById);

router.get('/:id/related', getRelatedTopics);

// Protected
const upload = require('../middleware/upload');
router.post('/', protect, verified, upload.single('image'), upload.cloudinaryUpload('forum'), createTopic);
router.get('/my/list', protect, getMyTopics);
router.get('/edit/:id', protect, getTopicForEdit);
router.put('/:id', protect, verified, upload.single('image'), upload.cloudinaryUpload('forum'), updateTopic);
router.delete('/:id', protect, deleteTopic);

// Comments
router.post(
  '/:id/comments',
  protect,
  verified,
  upload.single('image'),
  upload.cloudinaryUpload('forum'),
  addComment
);
// Reactions
router.post('/:id/like', protect, likeTopic);
router.post('/:id/dislike', protect, dislikeTopic);
router.post('/comments/:id/like', protect, likeComment);
router.post('/comments/:id/dislike', protect, dislikeComment);
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
