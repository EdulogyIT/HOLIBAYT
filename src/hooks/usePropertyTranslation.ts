import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ContentType = 'property_title' | 'property_description' | 'blog_title' | 'blog_content';

interface TranslationCache {
  [key: string]: string;
}

const getTranslationCache = (): TranslationCache => {
  try {
    const cache = localStorage.getItem('translation_cache');
    return cache ? JSON.parse(cache) : {};
  } catch {
    return {};
  }
};

const setTranslationCache = (cache: TranslationCache) => {
  try {
    localStorage.setItem('translation_cache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache translation:', error);
  }
};

const getCacheKey = (text: string, targetLang: string, contentType: ContentType): string => {
  return `${contentType}:${targetLang}:${text.substring(0, 100)}`;
};

export const usePropertyTranslation = (
  text: string | undefined,
  targetLanguage: string,
  contentType: ContentType = 'property_title'
) => {
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!text || targetLanguage === 'EN' || !text.trim()) {
      setTranslatedText(text || '');
      return;
    }

    // Show original text immediately
    setTranslatedText(text);

    const cacheKey = getCacheKey(text, targetLanguage, contentType);
    const cache = getTranslationCache();

    // Check cache first
    if (cache[cacheKey]) {
      setTranslatedText(cache[cacheKey]);
      return;
    }

    // Translate if not in cache with retry logic
    const translateText = async (retryCount = 0) => {
      setIsTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke('translate-content', {
          body: {
            text,
            targetLanguage,
            contentType
          }
        });

        if (error) {
          console.error('Translation API error:', error);
          throw error;
        }

        const translated = data?.translatedText || text;
        setTranslatedText(translated);

        // Update cache
        const updatedCache = { ...cache, [cacheKey]: translated };
        setTranslationCache(updatedCache);
      } catch (error: any) {
        console.error('Translation error:', error);
        
        // Retry logic for network errors (max 2 retries)
        if (retryCount < 2 && (error.message?.includes('fetch') || error.message?.includes('network'))) {
          console.log(`Retrying translation (attempt ${retryCount + 1})...`);
          setTimeout(() => translateText(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          // Fallback to original text on permanent error
          console.warn('Translation failed, using original text');
          setTranslatedText(text);
        }
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, targetLanguage, contentType]);

  return { translatedText: translatedText || text, isTranslating };
};
