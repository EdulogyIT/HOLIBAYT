import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";

interface TranslatedBlogContentProps {
  title: string;
  content: string;
  currentLang: string;
}

export const TranslatedBlogContent = ({ title, content, currentLang }: TranslatedBlogContentProps) => {
  const { translatedText: translatedTitle } = usePropertyTranslation(
    title,
    currentLang,
    'blog_title'
  );
  
  const { translatedText: translatedContent } = usePropertyTranslation(
    content,
    currentLang,
    'blog_content'
  );

  return {
    title: translatedTitle || title,
    content: translatedContent || content
  };
};
