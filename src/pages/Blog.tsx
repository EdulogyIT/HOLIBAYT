import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import blog images
import blogRealEstateFuture from "@/assets/blog-real-estate-future.jpg";
import blogPropertyLocation from "@/assets/blog-property-location.jpg";
import blogShortStayRental from "@/assets/blog-short-stay-rental.jpg";
import blogPropertyValuation from "@/assets/blog-property-valuation.jpg";
import blogRenovationTips from "@/assets/blog-renovation-tips.jpg";
import blogLegalConsiderations from "@/assets/blog-legal-considerations.jpg";

const Blog = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  useScrollToTop();

  const blogPosts = [
    {
      id: 1,
      title: t('blogTitle1'),
      excerpt: t('blogExcerpt1'),
      author: t('author1'),
      date: t('march15'),
      readTime: t('readTime5'),
      category: t('marketTrends'),
      image: blogRealEstateFuture
    },
    {
      id: 2,
      title: t('blogTitle2'),
      excerpt: t('blogExcerpt2'),
      author: t('author2'),
      date: t('march10'),
      readTime: t('readTime7'),
      category: t('buyingGuide'),
      image: blogPropertyLocation
    },
    {
      id: 3,
      title: t('blogTitle3'),
      excerpt: t('blogExcerpt3'),
      author: t('author3'),
      date: t('march5'),
      readTime: t('readTime6'),
      category: t('investment'),
      image: blogShortStayRental
    },
    {
      id: 4,
      title: t('blogTitle4'),
      excerpt: t('blogExcerpt4'),
      author: t('author4'),
      date: t('february28'),
      readTime: t('readTime8'),
      category: t('finance'),
      image: blogPropertyValuation
    },
    {
      id: 5,
      title: t('blogTitle5'),
      excerpt: t('blogExcerpt5'),
      author: t('author5'),
      date: t('february20'),
      readTime: t('readTime9'),
      category: t('renovation'),
      image: blogRenovationTips
    },
    {
      id: 6,
      title: t('blogTitle6'),
      excerpt: t('blogExcerpt6'),
      author: t('author6'),
      date: t('february15'),
      readTime: t('readTime10'),
      category: t('legal'),
      image: blogLegalConsiderations
    }
  ];

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="group cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-playfair group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="font-inter">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {post.date}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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