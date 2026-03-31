import { Helmet } from 'react-helmet-async';
import type { SchemaOrgConfig } from '../../utils/seoUtils';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: SchemaOrgConfig;
  robots?: string;
}

/**
 * SEO Component for managing head tags, meta tags, and structured data
 * Supports Open Graph, Twitter Card, and Schema.org structured data
 */
function SEO({
  title,
  description,
  keywords,
  canonical,
  image = `${window.location.origin}/og-image.png`,
  url = window.location.href,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  structuredData,
  robots = 'index, follow',
}: SEOProps) {
  const siteTitle = 'Mewangi Forum - Diskusi Parfum & Wewangian';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <meta charSet="utf-8" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="language" content="Indonesian" />
      <meta name="author" content={author || 'Mewangi'} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      {author && <meta property="og:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@mewangi_forum" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#8B4513" />
      <link rel="icon" type="image/png" href="/favicon.png" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
