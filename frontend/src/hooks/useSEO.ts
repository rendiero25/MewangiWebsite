import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for managing SEO in pages
 * Automatically updates canonical URL based on current location
 */
export const useSEO = (seoConfig: {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  robots?: string;
}) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    const siteTitle = 'Mewangi Forum - Diskusi Parfum & Wewangian';
    document.title = seoConfig.title ? `${seoConfig.title} | ${siteTitle}` : siteTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seoConfig.description);
    }

    // Update canonical URL
    const canonicalUrl = seoConfig.url || `${window.location.origin}${location.pathname}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Scroll to top
    window.scrollTo(0, 0);
  }, [location.pathname, seoConfig]);

  return {
    currentUrl: `${window.location.origin}${location.pathname}`,
  };
};

/**
 * Hook for managing Open Graph and Twitter Card meta tags
 */
export const useOpenGraph = (config: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
}) => {
  const location = useLocation();

  useEffect(() => {
    const updateMetaTag = (property: string, value: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    const updateNameTag = (name: string, value: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    const siteTitle = 'Mewangi Forum - Diskusi Parfum & Wewangian';
    const fullTitle = config.title ? `${config.title} | ${siteTitle}` : siteTitle;
    const imageUrl = config.image || `${window.location.origin}/og-image.png`;
    const pageUrl = config.url || `${window.location.origin}${location.pathname}`;

    // Open Graph
    updateMetaTag('og:title', fullTitle);
    updateMetaTag('og:description', config.description);
    updateMetaTag('og:image', imageUrl);
    updateMetaTag('og:url', pageUrl);
    updateMetaTag('og:type', config.type || 'website');
    updateMetaTag('og:site_name', siteTitle);

    // Twitter Card
    updateNameTag('twitter:card', 'summary_large_image');
    updateNameTag('twitter:title', fullTitle);
    updateNameTag('twitter:description', config.description);
    updateNameTag('twitter:image', imageUrl);
    updateNameTag('twitter:site', '@mewangi_forum');
  }, [location.pathname, config]);
};

/**
 * Hook for managing structured data (JSON-LD)
 */
export const useStructuredData = (schema: Record<string, unknown>) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    script.id = 'structured-data';

    // Remove old script if exists
    const oldScript = document.getElementById('structured-data');
    if (oldScript) {
      oldScript.remove();
    }

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [schema]);
};
