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
    if (!text || targetLanguage === 'EN') {
      setTranslatedText(text || '');
      return;
    }

    const cacheKey = getCacheKey(text, targetLanguage, contentType);
    const cache = getTranslationCache();

    // Check cache first
    if (cache[cacheKey]) {
      setTranslatedText(cache[cacheKey]);
      return;
    }

    // Translate if not in cache
    const translateText = async () => {
      setIsTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke('translate-content', {
          body: {
            text,
            targetLanguage,
            contentType
          }
        });

        if (error) throw error;

        const translated = data?.translatedText || text;
        setTranslatedText(translated);

        // Update cache
        const updatedCache = { ...cache, [cacheKey]: translated };
        setTranslationCache(updatedCache);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, targetLanguage, contentType]);

  return { translatedText, isTranslating };
};
