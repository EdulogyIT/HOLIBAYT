import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import algerImage from "@/assets/city-alger.jpg";
import oranImage from "@/assets/city-oran.jpg";
import constantineImage from "@/assets/city-constantine.jpg";
import annabaImage from "@/assets/city-annaba.jpg";
import { supabase } from "@/integrations/supabase/client";

const CitiesSection = () => {
  const navigate = useNavigate();
  const { t, currentLang } = useLanguage();
  const [showAllCities, setShowAllCities] = useState(false);
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});

  // Fetch dynamic property counts
  useEffect(() => {
    const fetchPropertyCounts = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('city')
        .eq('status', 'active');
      
      if (data && !error) {
        const counts: Record<string, number> = {};
        data.forEach(prop => {
          const city = prop.city?.toLowerCase() || '';
          counts[city] = (counts[city] || 0) + 1;
        });
        setCityCounts(counts);
      }
    };
    
    fetchPropertyCounts();
  }, []);

  // Re-render when language changes
  useEffect(() => {
    // Component will re-render when currentLang changes
  }, [currentLang]);
  
  const getCityPropertyCount = (cityId: string) => {
    const count = cityCounts[cityId.toLowerCase()] || 0;
    return count > 0 ? `${count} ${t('availableProperties')}` : "0 " + t('availableProperties');
  };

  const cities = [
    {
      id: "alger",
      name: t('cityAlger'),
      description: t('algerDescription'),
      properties: getCityPropertyCount("alger"),
      image: algerImage,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "oran",
      name: t('cityOran'),
      description: t('oranDescription'),
      properties: getCityPropertyCount("oran"),
      image: oranImage,
      color: "from-orange-500 to-red-500"
    },
    {
      id: "constantine", 
      name: t('cityConstantine'),
      description: t('constantineDescription'),
      properties: getCityPropertyCount("constantine"),
      image: constantineImage,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "annaba",
      name: t('cityAnnaba'),
      description: t('annabaDescription'),
      properties: getCityPropertyCount("annaba"), 
      image: annabaImage,
      color: "from-purple-500 to-pink-500"
    }
  ];

  const allCities = [
    ...cities,
    {
      id: "setif",
      name: t('citySetif'),
      description: t('setifDescription'),
      properties: getCityPropertyCount("setif"),
      image: algerImage,
      color: "from-indigo-500 to-blue-600"
    },
    {
      id: "tlemcen",
      name: t('cityTlemcen'),
      description: t('tlemcenDescription'),
      properties: getCityPropertyCount("tlemcen"),
      image: oranImage,
      color: "from-teal-500 to-green-600"
    },
    {
      id: "bejaia",
      name: t('cityBejaia'),
      description: t('bejaiaDescription'),
      properties: getCityPropertyCount("bejaia"),
      image: annabaImage,
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: "blida",
      name: t('cityBlida'),
      description: t('blidaDescription'),
      properties: getCityPropertyCount("blida"),
      image: constantineImage,
      color: "from-rose-500 to-pink-600"
    }
  ];

  const displayedCities = showAllCities ? allCities : cities;

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
            {t('exploreByTitle')} <span className="text-primary">{t('citiesTitle')}</span>
          </h2>
          <p className="text-lg text-muted-foreground font-inter font-light max-w-2xl mx-auto">
            {t('citiesDescription')}
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCities.map((city) => (
            <Card 
              key={city.id} 
              className="group relative overflow-hidden border-0 hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => navigate(`/city/${city.id}`)}
            >
              {/* City Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={city.image} 
                  alt={`${city.name} - ${city.description}`}
                  className="w-full h-full object-cover group-hover:scale-110 transform-gpu transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${city.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`}></div>
                
                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm font-inter">{city.properties}</span>
                  </div>
                  <h3 className="text-xl font-playfair font-bold mb-1">{city.name}</h3>
                  <p className="text-sm font-inter opacity-90">{city.description}</p>
                </div>
              </div>

              <CardContent className="p-4">
                <Button 
                  variant="outline" 
                  className="w-full group/btn font-inter font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/city/${city.id}`);
                  }}
                >
                  <span>{t('viewOnMap')}</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground font-inter text-sm mb-4">
            {showAllCities ? `${allCities.length} ${t('citiesAvailable')}` : `${allCities.length} ${t('citiesAvailable')}`}
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="font-inter font-medium"
            onClick={() => setShowAllCities(!showAllCities)}
          >
            {showAllCities ? t('showLess') : t('seeAllCities')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CitiesSection;