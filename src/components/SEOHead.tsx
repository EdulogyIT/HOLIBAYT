import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  schema?: object;
  author?: string;
  locale?: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords,
  ogImage = '/lovable-uploads/bd206675-bfd0-4aee-936b-479f6c1240ca.png',
  canonicalUrl,
  schema,
  author = 'Holibayt',
  locale = 'fr_FR'
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Holibayt - Plateforme Immobilière Algérie`;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:locale', locale, true);
    updateMetaTag('og:site_name', 'Holibayt', true);
    
    if (canonicalUrl) {
      updateMetaTag('og:url', canonicalUrl, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Structured Data (JSON-LD)
    if (schema) {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    // Language meta tags
    updateMetaTag('language', locale.split('_')[0]);
    
    // Mobile optimization
    updateMetaTag('format-detection', 'telephone=yes');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');

  }, [title, description, keywords, ogImage, canonicalUrl, schema, author, locale]);

  return null;
};

export default SEOHead;