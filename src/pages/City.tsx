import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Bed, Bath, Square, Clock, Users, Building, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import AIChatBox from "@/components/AIChatBox";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import algerImage from "@/assets/city-alger.jpg";
import oranImage from "@/assets/city-oran.jpg";
import constantineImage from "@/assets/city-constantine.jpg";
import annabaImage from "@/assets/city-annaba.jpg";
import villaMediterranean from "@/assets/property-villa-mediterranean.jpg";

const City = () => {
  const navigate = useNavigate();
  const { t, currentLang } = useLanguage();
  const { cityId } = useParams();
  const [buyProperties, setBuyProperties] = useState<any[]>([]);
  const [rentProperties, setRentProperties] = useState<any[]>([]);
  const [shortStayProperties, setShortStayProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useScrollToTop();

  const cityData = {
    alger: {
      name: t('cityAlger'),
      description: t('algerDescription'),
      history: t('algerHistory'),
      stats: {
        population: "3.4M " + t('inhabitantsShort'),
        area: "809 km²",
        founded: t('tenthCentury')
      },
      image: algerImage
    },
    oran: {
      name: t('cityOran'),
      description: t('oranDescription'),
      history: t('oranHistory'),
      stats: {
        population: "1.5M " + t('inhabitantsShort'), 
        area: "2,121 km²",
        founded: "903"
      },
      image: oranImage
    },
    constantine: {
      name: t('cityConstantine'),
      description: t('constantineDescription'),
      history: t('constantineHistory'),
      stats: {
        population: "950k " + t('inhabitantsShort'),
        area: "231 km²", 
        founded: t('thirdMillenniumBC')
      },
      image: constantineImage
    },
    annaba: {
      name: t('cityAnnaba'),
      description: t('annabaDescription'),
      history: t('annabaHistory'),
      stats: {
        population: "640k " + t('inhabitantsShort'),
        area: "1,439 km²",
        founded: t('twelfthCenturyBC')
      },
      image: annabaImage
    }
  };

  const currentCity = cityData[cityId as keyof typeof cityData];

  // Re-render when language changes and fetch properties
  useEffect(() => {
    if (currentCity) {
      fetchPropertiesForCity();
    }
  }, [currentLang, cityId]);

  const fetchPropertiesForCity = async () => {
    if (!currentCity) return;
    
    try {
      setIsLoading(true);
      // Use cityId from URL params instead of translated city name
      const searchCity = cityId || '';
      
      // Fetch buy properties (stored as 'sale' in database)
      const { data: buyData } = await supabase
        .from('properties')
        .select('*')
        .eq('category', 'sale')
        .eq('status', 'active')
        .or(`city.ilike.%${searchCity}%,location.ilike.%${searchCity}%`)
        .limit(2);
      
      // Fetch rent properties
      const { data: rentData } = await supabase
        .from('properties')
        .select('*')
        .eq('category', 'rent')
        .eq('status', 'active')
        .or(`city.ilike.%${searchCity}%,location.ilike.%${searchCity}%`)
        .limit(2);
      
      // Fetch short-stay properties
      const { data: shortStayData } = await supabase
        .from('properties')
        .select('*')
        .eq('category', 'short-stay')
        .eq('status', 'active')
        .or(`city.ilike.%${searchCity}%,location.ilike.%${searchCity}%`)
        .limit(2);

      setBuyProperties(buyData || []);
      setRentProperties(rentData || []);
      setShortStayProperties(shortStayData || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentCity) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('cityNotFound')}</h1>
            <Button onClick={() => navigate('/')}>{t('backToHome')}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper to format property data
  const formatPropertyForCard = (property: any) => ({
    id: property.id,
    title: property.title,
    location: `${property.city}, ${t('algeria')}`,
    price: `${property.price} ${property.price_currency || 'DZD'}`,
    beds: property.bedrooms || '0',
    baths: property.bathrooms || '0',
    area: property.area || '0',
    image: property.images?.[0] || villaMediterranean,
    type: property.property_type || t('propertyAppartement')
  });

  const PropertyCard = ({ property, listingType }: { property: any, listingType: string }) => {
    const formattedProperty = formatPropertyForCard(property);
    
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate(`/property/${formattedProperty.id}`)}
      >
        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
          <img 
            src={formattedProperty.image} 
            alt={formattedProperty.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-playfair">{formattedProperty.title}</CardTitle>
            <Badge variant="secondary" className="font-inter">{formattedProperty.type}</Badge>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm font-inter">{formattedProperty.location}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-primary font-playfair">{formattedProperty.price}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mb-4 font-inter">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              {formattedProperty.beds}
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              {formattedProperty.baths}
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              {formattedProperty.area}
            </div>
          </div>
          <Button 
            className="w-full bg-gradient-primary hover:shadow-elegant font-inter flex items-center justify-center min-h-[44px]" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/property/${formattedProperty.id}`);
            }}
          >
            {t('viewDetails')}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <img 
            src={currentCity.image} 
            alt={currentCity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
                {currentCity.name}
              </h1>
              <p className="text-xl text-white/90 font-inter font-light max-w-2xl">
                {currentCity.description}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* City Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-card rounded-xl shadow-sm">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground font-playfair mb-1">
                {currentCity.stats.population}
              </div>
              <div className="text-muted-foreground font-inter text-sm">{t('population')}</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl shadow-sm">
              <Square className="h-8 w-8 text-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground font-playfair mb-1">
                {currentCity.stats.area}
              </div>
              <div className="text-muted-foreground font-inter text-sm">{t('cityArea')}</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl shadow-sm">
              <Clock className="h-8 w-8 text-foreground mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground font-playfair mb-1">
                {currentCity.stats.founded}
              </div>
              <div className="text-muted-foreground font-inter text-sm">{t('foundedIn')}</div>
            </div>
          </div>

          {/* History Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-6">
              {t('historyHeritage')}
            </h2>
            <div className="bg-card p-8 rounded-xl shadow-sm">
              <p className="text-muted-foreground font-inter leading-relaxed text-lg">
                {currentCity.history}
              </p>
            </div>
          </div>

          {/* Properties Tabs */}
          <div className="mb-12">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-6">
              {t('propertiesAvailableIn')} {currentCity.name}
            </h2>
            
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="buy" className="font-inter">
                  <Building className="h-4 w-4 mr-2" />
                  {t('buy')}
                </TabsTrigger>
                <TabsTrigger value="rent" className="font-inter">
                  <MapPin className="h-4 w-4 mr-2" />
                  {t('rent')}
                </TabsTrigger>
                <TabsTrigger value="shortStay" className="font-inter">
                  <Bed className="h-4 w-4 mr-2" />
                  {t('shortStay')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="buy" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : buyProperties.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {buyProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} listingType="buy" />
                      ))}
                    </div>
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="font-inter"
                        onClick={() => navigate(`/buy?location=${encodeURIComponent(currentCity.name)}`)}
                      >
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t('noPropertiesFound')}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/buy')}
                    >
                      {t('browseAllProperties')}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="rent" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : rentProperties.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rentProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} listingType="rent" />
                      ))}
                    </div>
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="font-inter"
                        onClick={() => navigate(`/rent?location=${encodeURIComponent(currentCity.name)}`)}
                      >
                        {t('seeAllForRent')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t('noPropertiesFound')}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/rent')}
                    >
                      {t('browseAllProperties')}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="shortStay" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : shortStayProperties.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {shortStayProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} listingType="shortStay" />
                      ))}
                    </div>
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="font-inter"
                        onClick={() => navigate(`/short-stay?location=${encodeURIComponent(currentCity.name)}`)}
                      >
                        {t('seeAllShortStay')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t('noPropertiesFound')}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/short-stay')}
                    >
                      {t('browseAllProperties')}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
      <AIChatBox />
    </div>
  );
};

export default City;