import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useParams, Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BlogSocialShare } from "@/components/BlogSocialShare";
import { BlogComments } from "@/components/BlogComments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author_name: string;
  status: string;
  category: string;
  created_at: string;
  image_url?: string;
}

const BlogPost = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  useScrollToTop();

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const fetchBlogPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        }
        throw error;
      }

      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast.error('Failed to load blog post');
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <p className="text-muted-foreground">{t('loading') || 'Loading...'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !blog) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-6 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t('backToBlogs') || 'Back to Blogs'}
          </Button>

          {/* Blog Header */}
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4 capitalize">
              {blog.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-playfair">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="font-inter">{blog.author_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-inter">
                  {new Date(blog.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.image_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={blog.image_url} 
                alt={blog.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Blog Content */}
          <div 
            className="prose prose-lg max-w-none mb-12 font-inter
                       prose-headings:font-playfair prose-headings:text-foreground
                       prose-p:text-muted-foreground prose-p:leading-relaxed
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-foreground prose-strong:font-semibold
                       prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Social Share */}
          <div className="border-t border-border pt-8 mb-12">
            <BlogSocialShare 
              title={blog.title}
              url={window.location.href}
            />
          </div>

          {/* Comments Section */}
          <div className="border-t border-border pt-8">
            <BlogComments blogPostId={blog.id} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
