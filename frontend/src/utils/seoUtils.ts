/**
 * SEO Utilities for generating SEO-friendly URLs, meta tags, and structured data
 */

/**
 * Meta Tag Configuration Interface
 */
export interface MetaTagConfig {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogAuthor?: string;
  ogPublishedTime?: string;
  ogModifiedTime?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
}

/**
 * Schema.org Structured Data Configuration
 */
export interface SchemaOrgConfig {
  '@context': string;
  '@type': string;
  name?: string;
  description?: string;
  image?: string;
  url?: string;
  author?: {
    '@type': string;
    name: string;
    url?: string;
  };
  articleBody?: string;
  datePublished?: string;
  dateModified?: string;
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
  [key: string]: unknown;
}

export interface OpenGraphConfig {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

// Generate SEO-friendly slug from title
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 100); // Limit length
};

// Generate SEO-friendly URL for forum threads
export const generateForumUrl = (categorySlug: string, topicTitle: string, topicId: string): string => {
  const titleSlug = generateSlug(topicTitle);
  return `/forum/${categorySlug}/${titleSlug}-${topicId}`;
};

// Generate SEO-friendly URL for articles
export const generateArticleUrl = (slug: string, articleId: string): string => {
  return `/article/${slug}-${articleId}`;
};

// Generate SEO-friendly URL for reviews
export const generateReviewUrl = (perfumeName: string, reviewId: string): string => {
  const nameSlug = generateSlug(perfumeName);
  return `/review/${nameSlug}-${reviewId}`;
};

// Generate SEO-friendly URL for user profiles
export const generateProfileUrl = (username: string, userId: string): string => {
  const usernameSlug = generateSlug(username);
  return `/profile/${usernameSlug}-${userId}`;
};

// Extract title from slug
export const extractTitleFromSlug = (slug: string): string => {
  return slug
    .split('-')
    .slice(0, -1) // Remove ID at the end
    .join(' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const generateOpenGraphMeta = (config: OpenGraphConfig): MetaTagConfig => {
  return {
    ogTitle: config.title,
    ogDescription: config.description,
    ogImage: config.image,
    ogUrl: config.url,
    ogType: config.type || 'website',
    ogAuthor: config.author,
    ogPublishedTime: config.publishedTime,
    ogModifiedTime: config.modifiedTime,
    twitterCard: 'summary_large_image',
    twitterTitle: config.title,
    twitterDescription: config.description,
    twitterImage: config.image,
  };
};

// Generate Schema.org structured data for articles
export const generateArticleSchema = (
  title: string,
  description: string,
  image: string,
  author: string,
  publishedDate: string,
  modifiedDate: string
): SchemaOrgConfig => {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description,
    image: image,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mewangi Forum',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/logo.png`,
      },
    },
  };
};

// Generate Schema.org structured data for forum discussions
export const generateDiscussionSchema = (
  title: string,
  description: string,
  url: string,
  author: string,
  datePublished: string
): SchemaOrgConfig => {
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: title,
    text: description,
    url: url,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: datePublished,
  };
};

// Generate Schema.org structured data for product reviews
export const generateReviewSchema = (
  productName: string,
  reviewText: string,
  reviewRating: number,
  author: string,
  datePublished: string
): SchemaOrgConfig => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: reviewRating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: reviewText,
    name: `Review of ${productName}`,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: datePublished,
    itemReviewed: {
      '@type': 'Product',
      name: productName,
    },
  };
};

// Generate Schema.org structured data for organization (website)
export const generateOrganizationSchema = (): SchemaOrgConfig => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mewangi Forum',
    url: window.location.origin,
    description: 'Forum komunitas diskusi tentang parfum dan wewangian terbaik di Indonesia',
    image: `${window.location.origin}/logo.png`,
    publisher: {
      '@type': 'Organization',
      name: 'Mewangi',
    },
  };
};
