import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock } from "lucide-react";

const Blog = () => {
  const { t } = useLanguage();
  useScrollToTop();

  const blogPosts = [
    {
      id: 1,
      title: "The Future of Real Estate in Algeria",
      excerpt: "Discover the emerging trends and opportunities in Algeria's growing real estate market.",
      author: "Sarah Benali",
      date: "March 15, 2024",
      readTime: "5 min read",
      category: "Market Trends",
      image: "/src/assets/algeria-architecture-hero.jpg"
    },
    {
      id: 2,
      title: "How to Choose the Perfect Property Location",
      excerpt: "A comprehensive guide to selecting the ideal location for your next property investment.",
      author: "Ahmed Mansouri",
      date: "March 10, 2024",
      readTime: "7 min read",
      category: "Buying Guide",
      image: "/src/assets/city-alger.jpg"
    },
    {
      id: 3,
      title: "Short-Stay Rentals: A Growing Opportunity",
      excerpt: "Explore the booming short-term rental market and how to maximize your investment returns.",
      author: "Fatima Ouali",
      date: "March 5, 2024",
      readTime: "6 min read",
      category: "Investment",
      image: "/src/assets/property-seaside-rental.jpg"
    },
    {
      id: 4,
      title: "Understanding Property Valuation in Algeria",
      excerpt: "Learn the key factors that determine property values in different Algerian cities.",
      author: "Karim Hakim",
      date: "February 28, 2024",
      readTime: "8 min read",
      category: "Finance",
      image: "/src/assets/city-oran.jpg"
    },
    {
      id: 5,
      title: "Renovation Tips for Maximum ROI",
      excerpt: "Smart renovation strategies that can significantly increase your property's value.",
      author: "Leila Benaissa",
      date: "February 20, 2024",
      readTime: "9 min read",
      category: "Renovation",
      image: "/src/assets/property-modern-apartment.jpg"
    },
    {
      id: 6,
      title: "Legal Considerations for Property Buyers",
      excerpt: "Essential legal aspects every property buyer should know before making a purchase.",
      author: "Mohamed Kaci",
      date: "February 15, 2024",
      readTime: "10 min read",
      category: "Legal",
      image: "/src/assets/city-constantine.jpg"
    }
  ];

  const categories = ["All", "Market Trends", "Buying Guide", "Investment", "Finance", "Renovation", "Legal"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-playfair">
              {t('blog')} & Insights
            </h1>
            <p className="text-xl text-muted-foreground font-inter max-w-2xl mx-auto">
              Stay updated with the latest trends, tips, and insights from Algeria's real estate market
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
                <Card key={post.id} className="group cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-2">
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
              Stay Updated
            </h2>
            <p className="text-lg text-muted-foreground mb-8 font-inter">
              Subscribe to our newsletter and never miss the latest real estate insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-inter"
              />
              <button className="px-6 py-3 bg-gradient-primary text-primary-foreground rounded-md font-medium hover:shadow-elegant transition-all font-inter">
                Subscribe
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