import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Import blog images
import blogRealEstateFuture from "@/assets/blog-real-estate-future.jpg";
import blogPropertyLocation from "@/assets/blog-property-location.jpg";
import blogShortStayRental from "@/assets/blog-short-stay-rental.jpg";
import blogPropertyValuation from "@/assets/blog-property-valuation.jpg";
import blogRenovationTips from "@/assets/blog-renovation-tips.jpg";
import blogLegalConsiderations from "@/assets/blog-legal-considerations.jpg";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

const Blog = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  useScrollToTop();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBlogPosts(data);
    }
    setLoading(false);
  };

  const categories = [t('allCategories'), t('marketTrends'), t('buyingGuide'), t('investment'), t('finance'), t('renovation'), t('legal')];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-playfair">
              {t('blogInsights')}
            </h1>
            <p className="text-xl text-muted-foreground font-inter max-w-2xl mx-auto">
              {t('blogDescription')}
            </p>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge 
                  key={category}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No blog posts available yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="group cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                      <img 
                        src={post.image_url || '/placeholder.svg'} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{post.category}</Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {t('readTime5')}
                        </div>
                      </div>
                      <CardTitle className="text-xl font-playfair group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="font-inter line-clamp-3">
                        {post.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
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
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-gradient-subtle">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4 font-playfair">
              {t('stayUpdated')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 font-inter">
              {t('newsletterDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={t('enterEmail')}
                className="flex-1 px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-inter"
              />
              <button className="px-6 py-3 bg-gradient-primary text-primary-foreground rounded-md font-medium hover:shadow-elegant transition-all font-inter">
                {t('subscribe')}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;