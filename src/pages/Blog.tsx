import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import blog images
import blogFutureRealEstate from "@/assets/blog-future-real-estate.jpg";
import blogInvestmentTips from "@/assets/blog-investment-tips.jpg";
import blogRenovationTips from "@/assets/blog-renovation-tips-new.jpg";
import blogCoastalRentals from "@/assets/blog-coastal-rentals.jpg";
import blogPropertyValuation from "@/assets/blog-property-valuation-new.jpg";
import blogLegalConsiderations from "@/assets/blog-legal-considerations-new.jpg";

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

const Blog = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  useScrollToTop();

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  // Map image URLs to imported assets
  const imageMap: Record<string, string> = {
    '/src/assets/blog-future-real-estate.jpg': blogFutureRealEstate,
    '/src/assets/blog-investment-tips.jpg': blogInvestmentTips,
    '/src/assets/blog-renovation-tips-new.jpg': blogRenovationTips,
    '/src/assets/blog-coastal-rentals.jpg': blogCoastalRentals,
    '/src/assets/blog-property-valuation-new.jpg': blogPropertyValuation,
    '/src/assets/blog-legal-considerations-new.jpg': blogLegalConsiderations,
  };

  // Helper to get the image source
  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl) return null;
    return imageMap[imageUrl] || imageUrl;
  };

  // Helper to strip HTML tags from content
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const categories = ['all', 'general', 'tips', 'news', 'guides', 'Market Trends'];
  
  const filteredBlogs = selectedCategory === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.category.toLowerCase() === selectedCategory.toLowerCase());

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
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors capitalize"
                  onClick={() => setSelectedCategory(category)}
                >
                  {t(category) || category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('loading') || 'Loading blogs...'}</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noBlogsFound') || 'No blog posts found.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((post) => (
                  <Card 
                    key={post.id} 
                    className="group cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
                    onClick={() => navigate(`/blog/${post.id}`)}
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
                        {post.title}
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
