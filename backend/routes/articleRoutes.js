const express = require('express');
const router = express.Router();
const { protect, verified } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getArticles, getArticleBySlug, getArticleById, createArticle, updateArticle, deleteArticle, getMyArticles, addArticleComment, deleteArticleComment
} = require('../controllers/articleController');

// Public
router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

// Private
router.get('/edit/:id', protect, getArticleById);
router.get('/my/list', protect, getMyArticles);
router.post('/', protect, verified, upload.single('coverImage'), createArticle);
router.post('/:id/comments', protect, verified, addArticleComment);
router.delete('/comments/:commentId', protect, deleteArticleComment);
router.put('/:id', protect, verified, upload.single('coverImage'), updateArticle);
router.delete('/:id', protect, deleteArticle);

module.exports = router;
