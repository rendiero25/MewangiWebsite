const ForumTopic = require('../models/ForumTopic');
const Article = require('../models/Article');
const Review = require('../models/Review');
const User = require('../models/User');
const Category = require('../models/Category');

/**
 * Generate dynamic XML Sitemap
 * Includes all forum topics, articles, reviews, categories, and static pages
 */
exports.generateSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const now = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

    // Static pages
    const staticPages = [
      { loc: '/', lastmod: now, changefreq: 'daily', priority: '1.0' },
      { loc: '/forum', lastmod: now, changefreq: 'hourly', priority: '0.9' },
      { loc: '/review', lastmod: now, changefreq: 'hourly', priority: '0.9' },
      { loc: '/blog', lastmod: now, changefreq: 'daily', priority: '0.8' },
      { loc: '/tentang', lastmod: now, changefreq: 'monthly', priority: '0.5' },
    ];

    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Categories
    const categories = await Category.find({ visibility: { $ne: 'hidden' } })
      .select('name slug updatedAt')
      .lean();

    for (const category of categories) {
      sitemap += `  <url>
    <loc>${baseUrl}/forum?category=${category.slug}</loc>
    <lastmod>${category.updatedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Forum Topics
    const topics = await ForumTopic.find({ status: 'approved' })
      .select('title category updatedAt createdAt')
      .populate('category', 'slug')
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    for (const topic of topics) {
      if (topic.category) {
        const slug = topic.title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 100);
        
        sitemap += `  <url>
    <loc>${baseUrl}/forum/${topic.category.slug}/${slug}-${topic._id}</loc>
    <lastmod>${topic.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    // Articles
    const articles = await Article.find({ status: 'approved' })
      .select('slug title coverImage updatedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    for (const article of articles) {
      sitemap += `  <url>
    <loc>${baseUrl}/blog/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;

      if (article.coverImage) {
        sitemap += `
    <image:image>
      <image:loc>${article.coverImage}</image:loc>
      <image:title>${article.title}</image:title>
    </image:image>`;
      }

      sitemap += `
  </url>
`;
    }

    // Reviews
    const reviews = await Review.find({ status: 'approved' })
      .select('_id perfumeName updatedAt createdAt viewCount')
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    for (const review of reviews) {
      const slug = review.perfumeName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);

      sitemap += `  <url>
    <loc>${baseUrl}/review/${slug}-${review._id}</loc>
    <lastmod>${review.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }

    sitemap += '</urlset>';

    res.type('application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ message: 'Error generating sitemap', error: error.message });
  }
};

/**
 * Generate robots.txt file
 * Tells search engines which pages to crawl/index
 */
exports.generateRobots = (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const robots = `# Robots.txt for Mewangi Forum
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /profile (unless public)
Disallow: /messages
Disallow: /notifications

# Search engines specific rules
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Request rate limit
Request-rate: 1/10s
`;

  res.type('text/plain');
  res.send(robots);
};
