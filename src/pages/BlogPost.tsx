import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useParams, Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Import blog images
import blogRealEstateFuture from "@/assets/blog-real-estate-future.jpg";
import blogPropertyLocation from "@/assets/blog-property-location.jpg";
import blogShortStayRental from "@/assets/blog-short-stay-rental.jpg";
import blogPropertyValuation from "@/assets/blog-property-valuation.jpg";
import blogRenovationTips from "@/assets/blog-renovation-tips.jpg";
import blogLegalConsiderations from "@/assets/blog-legal-considerations.jpg";

const BlogPost = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  useScrollToTop();

  const blogPosts = [
    {
      id: 1,
      title: t('blogTitle1'),
      excerpt: t('blogExcerpt1'),
      author: t('author1'),
      date: "March 15, 2024",
      readTime: "5 min read",
      category: t('marketTrends'),
      image: blogRealEstateFuture,
      content: `
        <p>Algeria's real estate market is undergoing a significant transformation, driven by technological innovation, demographic changes, and economic reforms. As we look toward the future, several key trends are shaping the landscape of property investment and development across the country.</p>
        
        <h2>Digital Transformation</h2>
        <p>The digital revolution is fundamentally changing how Algerians buy, sell, and rent properties. Online platforms like Holibayt are making property transactions more transparent, efficient, and accessible to a broader audience. Virtual property tours, digital documentation, and AI-powered property matching are becoming standard practices.</p>
        
        <h2>Sustainable Development</h2>
        <p>Environmental consciousness is driving demand for sustainable housing solutions. Green building practices, energy-efficient designs, and renewable energy integration are becoming increasingly important factors in property valuation and buyer preferences.</p>
        
        <h2>Urban Planning Evolution</h2>
        <p>Major cities like Algiers, Oran, and Constantine are implementing smart city initiatives that improve infrastructure, transportation, and quality of life. These developments are creating new investment opportunities and reshaping property values across different neighborhoods.</p>
        
        <h2>Investment Opportunities</h2>
        <p>Foreign investment regulations are becoming more favorable, opening new possibilities for international buyers. The growing tourism sector also presents opportunities in short-term rental markets, particularly in coastal areas and historic city centers.</p>
        
        <p>As Algeria continues to modernize its economy and infrastructure, the real estate sector stands to benefit significantly. Investors who understand these trends and position themselves accordingly will be well-placed to capitalize on the opportunities ahead.</p>
      `,
      source: "Holibayt Research Team",
      tags: ["Market Analysis", "Investment", "Technology", "Sustainability"]
    },
    {
      id: 2,
      title: t('blogTitle2'),
      excerpt: t('blogExcerpt2'),
      author: t('author2'),
      date: "March 10, 2024",
      readTime: "7 min read",
      category: t('buyingGuide'),
      image: blogPropertyLocation,
      content: `
        <p>Location is the most critical factor in real estate success. Whether you're buying your first home or making an investment, understanding how to evaluate location quality will determine your property's long-term value and your satisfaction as an owner.</p>
        
        <h2>Transportation and Accessibility</h2>
        <p>Proximity to major transportation hubs, highways, and public transit significantly impacts property value. In cities like Algiers, properties near metro stations or major bus routes command higher prices and rent more easily.</p>
        
        <h2>Neighborhood Development</h2>
        <p>Research planned infrastructure projects, new schools, hospitals, and commercial developments. Areas undergoing positive transformation often present excellent investment opportunities before prices rise substantially.</p>
        
        <h2>Safety and Security</h2>
        <p>Crime statistics, lighting, and general neighborhood safety should be thoroughly evaluated. Visit the area at different times of day and week to get a complete picture of the security situation.</p>
        
        <h2>Amenities and Services</h2>
        <p>Consider proximity to essential services: schools, healthcare facilities, shopping centers, restaurants, and recreational areas. The walkability score of a neighborhood is increasingly important to modern buyers.</p>
        
        <h2>Future Growth Potential</h2>
        <p>Look for areas with strong economic fundamentals, job growth, and positive demographic trends. Government investment in infrastructure and urban planning initiatives can signal future appreciation potential.</p>
        
        <p>Remember that the perfect location varies based on your specific needs, whether you prioritize schools for a family, nightlife for young professionals, or quiet surroundings for retirees.</p>
      `,
      source: "Real Estate Location Analysis Institute",
      tags: ["Location", "Investment Strategy", "Neighborhoods", "Property Value"]
    },
    {
      id: 3,
      title: t('blogTitle3'),
      excerpt: t('blogExcerpt3'),
      author: t('author3'),
      date: "March 5, 2024",
      readTime: "6 min read",
      category: t('investment'),
      image: blogShortStayRental,
      content: `
        <p>The short-stay rental market in Algeria is experiencing unprecedented growth, driven by increased tourism, business travel, and changing accommodation preferences. This presents significant opportunities for property investors willing to adapt to this dynamic market.</p>
        
        <h2>Market Dynamics</h2>
        <p>Algeria's tourism industry is growing rapidly, with both domestic and international visitors seeking alternatives to traditional hotels. Short-stay rentals offer more space, privacy, and authentic local experiences that modern travelers value.</p>
        
        <h2>Optimal Property Types</h2>
        <p>Properties near tourist attractions, business districts, or airports perform best. One to three-bedroom apartments in city centers or unique properties like traditional houses with modern amenities are particularly popular.</p>
        
        <h2>Revenue Optimization</h2>
        <p>Successful short-stay rental operators focus on professional photography, competitive pricing strategies, and exceptional guest service. Dynamic pricing tools can help maximize revenue during peak seasons and events.</p>
        
        <h2>Legal Considerations</h2>
        <p>Understanding local regulations, tax obligations, and licensing requirements is crucial. Some areas may have restrictions on short-term rentals, so research thoroughly before investing.</p>
        
        <h2>Management Strategies</h2>
        <p>Consider whether to self-manage or hire professional management companies. Self-management offers higher margins but requires significant time investment, while professional management provides convenience at a cost.</p>
        
        <p>With proper planning and execution, short-stay rentals can provide higher returns than traditional long-term rentals while contributing to Algeria's growing tourism economy.</p>
      `,
      source: "Algeria Tourism & Investment Board",
      tags: ["Short-term Rentals", "Tourism", "Investment Returns", "Property Management"]
    },
    {
      id: 4,
      title: t('blogTitle4'),
      excerpt: t('blogExcerpt4'),
      author: t('author4'),
      date: "February 28, 2024",
      readTime: "8 min read",
      category: t('finance'),
      image: blogPropertyValuation,
      content: `
        <p>Property valuation in Algeria involves complex factors that vary significantly by region, property type, and market conditions. Understanding these elements is essential for making informed buying, selling, or investment decisions.</p>
        
        <h2>Market-Based Valuation</h2>
        <p>The comparative market analysis (CMA) method examines recent sales of similar properties in the same area. This approach works best in active markets with sufficient transaction data, commonly used in major cities like Algiers and Oran.</p>
        
        <h2>Income Approach</h2>
        <p>For investment properties, the income approach calculates value based on potential rental income. This method considers current market rents, vacancy rates, and operating expenses to determine the property's income-generating potential.</p>
        
        <h2>Cost Approach</h2>
        <p>This method estimates the cost to rebuild the property from scratch, minus depreciation, plus land value. It's particularly useful for newer properties or unique buildings with limited comparable sales data.</p>
        
        <h2>Location-Specific Factors</h2>
        <p>Each Algerian city has unique valuation drivers. Coastal cities like Annaba command premiums for sea views, while Constantine's historic center values architectural heritage. Understanding local preferences is crucial.</p>
        
        <h2>Economic Indicators</h2>
        <p>National and local economic factors significantly impact property values. Oil prices, employment rates, infrastructure investment, and government policies all influence real estate markets differently across regions.</p>
        
        <h2>Professional Appraisal</h2>
        <p>For significant transactions, hiring certified appraisers ensures accurate valuations. They consider all relevant factors and provide detailed reports essential for financing and legal purposes.</p>
        
        <p>Accurate property valuation protects both buyers and sellers, ensuring fair transactions and supporting healthy market development throughout Algeria.</p>
      `,
      source: "Algerian Real Estate Appraisers Association",
      tags: ["Property Valuation", "Market Analysis", "Investment", "Real Estate Finance"]
    },
    {
      id: 5,
      title: t('blogTitle5'),
      excerpt: t('blogExcerpt5'),
      author: t('author5'),
      date: "February 20, 2024",
      readTime: "9 min read",
      category: t('renovation'),
      image: blogRenovationTips,
      content: `
        <p>Strategic property renovation can substantially increase value and rental potential. However, not all improvements provide equal returns. Understanding which renovations offer the best ROI is crucial for maximizing your investment.</p>
        
        <h2>Kitchen Modernization</h2>
        <p>Kitchen updates consistently provide excellent returns. Focus on modern appliances, quality countertops, and efficient layouts. In Algeria, incorporating traditional design elements with modern functionality appeals to local preferences.</p>
        
        <h2>Bathroom Upgrades</h2>
        <p>Well-designed bathrooms significantly impact property appeal. Modern fixtures, good lighting, and efficient space utilization can transform older properties. Consider water efficiency, which is increasingly important in Algeria.</p>
        
        <h2>Energy Efficiency</h2>
        <p>Installing air conditioning, improving insulation, and upgrading windows reduces operating costs and increases comfort. With Algeria's climate, energy-efficient cooling systems are particularly valuable to tenants and buyers.</p>
        
        <h2>Outdoor Spaces</h2>
        <p>Balconies, terraces, and garden spaces are highly valued in Algerian properties. Creating attractive outdoor living areas can significantly boost property appeal, especially in urban environments where outdoor space is limited.</p>
        
        <h2>Technology Integration</h2>
        <p>Smart home features, reliable internet infrastructure, and modern electrical systems appeal to younger tenants and buyers. These improvements position properties for future market demands.</p>
        
        <h2>Budget Management</h2>
        <p>Set realistic budgets and prioritize high-impact improvements. Cosmetic updates often provide better ROI than structural changes. Focus on improvements that both increase value and improve livability.</p>
        
        <p>Successful renovation requires balancing costs with potential returns while considering local market preferences and regulatory requirements.</p>
      `,
      source: "Algeria Home Improvement Council",
      tags: ["Renovation", "Property Value", "ROI", "Home Improvement", "Investment Strategy"]
    },
    {
      id: 6,
      title: t('blogTitle6'),
      excerpt: t('blogExcerpt6'),
      author: t('author6'),
      date: "February 15, 2024",
      readTime: "10 min read",
      category: t('legal'),
      image: blogLegalConsiderations,
      content: `
        <p>Navigating Algeria's property law requires understanding complex legal frameworks, documentation requirements, and regulatory procedures. Proper legal preparation protects buyers from costly mistakes and ensures smooth transactions.</p>
        
        <h2>Property Ownership Types</h2>
        <p>Algeria recognizes different ownership structures: individual ownership, co-ownership for apartments, and various forms of collective ownership. Understanding these distinctions affects your rights, responsibilities, and future transaction possibilities.</p>
        
        <h2>Due Diligence Process</h2>
        <p>Thorough property verification includes checking ownership history, outstanding debts, legal disputes, and compliance with building regulations. Never skip this critical step, as it can reveal potential problems before purchase.</p>
        
        <h2>Documentation Requirements</h2>
        <p>Essential documents include property deeds, tax certificates, building permits, and utility certifications. Foreign buyers may need additional documentation and approvals depending on the property type and location.</p>
        
        <h2>Notarial Procedures</h2>
        <p>All property transactions must be completed through licensed notaries. Understanding the notarial process, associated costs, and timeline helps buyers prepare effectively for the legal aspects of their purchase.</p>
        
        <h2>Tax Obligations</h2>
        <p>Property purchases involve various taxes and fees including transfer taxes, registration fees, and ongoing property taxes. Budget for these costs and understand your long-term tax obligations as a property owner.</p>
        
        <h2>Foreign Ownership Rules</h2>
        <p>Non-Algerian citizens face specific restrictions and requirements when purchasing property. Recent regulatory changes have created new opportunities, but compliance with all applicable laws is essential.</p>
        
        <h2>Legal Representation</h2>
        <p>Hiring qualified legal counsel familiar with Algerian property law provides essential protection. Experienced lawyers can navigate complex regulations and protect your interests throughout the transaction process.</p>
        
        <p>Understanding legal requirements before beginning your property search prevents delays, complications, and potential legal issues that could jeopardize your investment.</p>
      `,
      source: "Algerian Bar Association - Real Estate Law Division",
      tags: ["Legal", "Property Law", "Due Diligence", "Foreign Investment", "Real Estate Transactions"]
    }
  ];

  const post = blogPosts.find(p => p.id === parseInt(id || ""));

  if (!post) {
    return <Navigate to="/blog" replace />;
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
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {post.readTime}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-playfair">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6 font-inter">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between text-sm text-muted-foreground font-inter border-b border-border pb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="mr-4">{post.author}</span>
                <Calendar className="w-4 h-4 mr-1" />
                <span>{post.date}</span>
              </div>
              <div className="text-xs">
                Source: {post.source}
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div 
            className="prose prose-lg max-w-none font-inter"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold mb-4 font-playfair">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-inter">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;