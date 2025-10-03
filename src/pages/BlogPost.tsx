import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useParams, Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BlogSocialShare } from "@/components/BlogSocialShare";
import { BlogComments } from "@/components/BlogComments";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Import blog images
import blogRealEstateFuture from "@/assets/blog-real-estate-future.jpg";
import blogPropertyLocation from "@/assets/blog-property-location.jpg";
import blogShortStayRental from "@/assets/blog-short-stay-rental.jpg";
import blogPropertyValuation from "@/assets/blog-property-valuation.jpg";
import blogRenovationTips from "@/assets/blog-renovation-tips.jpg";
import blogLegalConsiderations from "@/assets/blog-legal-considerations.jpg";

interface BlogPostType {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  useScrollToTop();
  const [blogPost, setBlogPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const fetchBlogPost = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (!error && data) {
      setBlogPost(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Blog post not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="font-inter mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToBlog')}
          </Button>
        </div>

        {/* Hero Image */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={blogPost.image_url || '/placeholder.svg'} 
              alt={blogPost.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">{blogPost.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {t('readTime5')}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-playfair">
              {blogPost.title}
            </h1>

            <div className="flex items-center justify-between text-sm text-muted-foreground font-inter border-b border-border pb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="mr-4">{blogPost.author_name}</span>
                <Calendar className="w-4 h-4 mr-1" />
                <span>{new Date(blogPost.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div 
            className="prose prose-lg max-w-none font-inter"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />

          <BlogSocialShare title={blogPost.title} />
          
          <BlogComments blogPostId={id || ''} />
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;