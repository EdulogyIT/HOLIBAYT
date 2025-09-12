import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import QuickAccessSection from "@/components/QuickAccessSection";
import ServicesSection from "@/components/ServicesSection";
import CitiesSection from "@/components/CitiesSection";
import AIChatBox from "@/components/AIChatBox";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Holibayt",
    "url": "https://holibayt.com",
    "logo": "https://holibayt.com/lovable-uploads/bd206675-bfd0-4aee-936b-479f6c1240ca.png",
    "description": "Plateforme immobilière leader en Algérie pour l'achat, la location et la location saisonnière de propriétés",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "DZ",
      "addressLocality": "Alger"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+213-21-123-456",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://facebook.com/holibayt",
      "https://instagram.com/holibayt"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Accueil - Immobilier Algérie"
        description="Découvrez des milliers de propriétés à vendre et à louer en Algérie. Villa, appartement, studio - Trouvez votre propriété idéale avec Holibayt."
        keywords="immobilier algérie, achat maison alger, location appartement, villa à vendre, propriété algérie"
        schema={schema}
        canonicalUrl="https://holibayt.com"
      />
      <Navigation />
      <main>
        <HeroSection />
        <div className="py-1">
          <QuickAccessSection />
        </div>
        <div className="py-1">
          <ServicesSection />
        </div>
        <div className="py-2">
          <CitiesSection />
        </div>
      </main>
      <Footer />
      <AIChatBox />
    </div>
  );
};

export default Index;
