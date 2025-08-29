import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import QuickAccessSection from "@/components/QuickAccessSection";
import ServicesSection from "@/components/ServicesSection";
import CitiesSection from "@/components/CitiesSection";
import AIChatBox from "@/components/AIChatBox";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
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
      <Footer />
      <AIChatBox />
    </div>
  );
};

export default Index;