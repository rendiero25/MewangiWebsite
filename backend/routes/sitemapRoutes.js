const express = require('express');
const router = express.Router();
const { generateSitemap, generateRobots } = require('../controllers/sitemapController');

/**
 * SEO Routes for Sitemap and Robots.txt
 */

// GET /sitemap.xml - Generate XML sitemap
router.get('/sitemap.xml', generateSitemap);

// GET /robots.txt - Generate robots.txt
router.get('/robots.txt', generateRobots);

module.exports = router;
