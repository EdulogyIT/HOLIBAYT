import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  created_at: string;
  image_url?: string;
}

interface BlogPostCardProps {
  post: BlogPost;
  getImageSrc: (url?: string) => string | undefined;
  stripHtml: (html: string) => string;
  onClick: () => void;
}

export const BlogPostCard = ({ post, getImageSrc, stripHtml, onClick }: BlogPostCardProps) => {
  const { t, currentLang } = useLanguage();
  const { translatedText: translatedTitle } = usePropertyTranslation(
    post.title,
    currentLang,
    'blog_title'
  );

  return (
    <Card 
      className="group cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
      onClick={onClick}
    >
      {post.image_url && (
        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
          <img 
            src={getImageSrc(post.image_url) || post.image_url} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="capitalize">
            {t(post.category) || post.category}
          </Badge>
        </div>
        <CardTitle className="text-xl font-playfair group-hover:text-primary transition-colors">
          {translatedTitle || post.title}
        </CardTitle>
        <CardDescription className="font-inter line-clamp-3">
          {stripHtml(post.content).substring(0, 150)}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {post.author_name}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
