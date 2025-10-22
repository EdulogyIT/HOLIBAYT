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
    },
    setif: {
      name: t('citySetif'),
      description: t('setifDescription'),
      history: t('setifHistory') || "Setif, located in the High Plains, is known for its rich history and agricultural significance.",
      stats: {
        population: "500k " + t('inhabitantsShort'),
        area: "127 km²",
        founded: "1st Century"
      },
      image: algerImage
    },
    tlemcen: {
      name: t('cityTlemcen'),
      description: t('tlemcenDescription'),
      history: t('tlemcenHistory') || "Tlemcen, the Pearl of the Maghreb, is renowned for its Andalusian architecture and cultural heritage.",
      stats: {
        population: "170k " + t('inhabitantsShort'),
        area: "9,017 km²",
        founded: "8th Century"
      },
      image: oranImage
    },
    bejaia: {
      name: t('cityBejaia'),
      description: t('bejaiaDescription'),
      history: t('bejaiaHistory') || "Bejaia is a coastal city with stunning Mediterranean views and a rich historical port heritage.",
      stats: {
        population: "180k " + t('inhabitantsShort'),
        area: "3,268 km²",
        founded: "Pre-Roman times"
      },
      image: annabaImage
    },
    blida: {
      name: t('cityBlida'),
      description: t('blidaDescription'),
      history: t('blidaHistory') || "Blida, known as the City of Roses, is famous for its beautiful gardens and proximity to the Atlas Mountains.",
      stats: {
        population: "330k " + t('inhabitantsShort'),
        area: "1,696 km²",
        founded: "16th Century"
      },
      image: constantineImage
    }
  } as const;

  const currentCity = cityData[cityId as keyof typeof cityData];

  useEffect(() => {
    if (currentCity) {
      void fetchPropertiesForCity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang, cityId]);

  const fetchPropertiesForCity = async () => {
    if (!currentCity) return;
    try {
      setIsLoading(true);
      const searchCity = cityId || '';
      
      const { data: buyData } = await supabase
        .from('properties').select('*')
        .eq('category', 'sale').eq('status', 'active')
        .or(`city.ilike.%${searchCity}%,location.ilike.%${searchCity}%`)
        .limit(2);
      
      const { data: rentData } = await supabase
        .from('properties').select('*')
        .eq('category', 'rent').eq('status', 'active')
        .or(`city.ilike.%${searchCity}%,location.ilike.%${searchCity}%`)
        .limit(2);
      
      const { data: shortStayData } = await supabase
        .from('properties').select('*')
        .eq('category', 'short-stay').eq('status', 'active')
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
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navigation />
        <main className="pt-20 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-foreground mb-4 break-words">{t('cityNotFound')}</h1>
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

  const PropertyCard = ({ property }: { property: any; listingType: string }) => {
    const formatted = formatPropertyForCard(property);
    return (
      <Card
        className="w-full max-w-full cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate(`/property/${formatted.id}`)}
      >
        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
          <img
            src={formatted.image}
            alt={formatted.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 min-w-0">
            <CardTitle className="text-xl font-playfair min-w-0 break-words">
              {formatted.title}
            </CardTitle>
            <Badge variant="secondary" className="font-inter shrink-0">{formatted.type}</Badge>
          </div>
          <div className="flex items-start text-muted-foreground min-w-0">
            <MapPin className="w-4 h-4 mr-1 shrink-0 mt-0.5" />
            <span className="text-sm font-inter break-words">{formatted.location}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-primary font-playfair break-words">
              {formatted.price}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mb-4 font-inter">
            <div className="flex items-center"><Bed className="w-4 h-4 mr-1" />{formatted.beds}</div>
            <div className="flex items-center"><Bath className="w-4 h-4 mr-1" />{formatted.baths}</div>
            <div className="flex items-center"><Square className="w-4 h-4 mr-1" />{formatted.area}</div>
          </div>
          <Button
            className="w-full bg-gradient-primary hover:shadow-elegant font-inter flex items-center justify-center min-h-[44px]"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/property/${formatted.id}`);
            }}
          >
            {t('viewDetails')}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section (mobile-safe) */}
        <div className="relative w-full max-w-full h-[42vh] sm:h-[52vh] lg:h-[60vh] overflow-hidden">
          <img
            src={currentCity.image}
            alt={currentCity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10">
            <div className="max-w-7xl mx-auto min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-3 sm:mb-4 break-words">
                {currentCity.name}
              </h1>
              <p className="text-base sm:text-lg text-white/90 font-inter font-light max-w-2xl break-words
                             line-clamp-6 sm:line-clamp-none">
                {currentCity.description}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-10 sm:py-12">
          {/* City Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
            <div className="text-center p-5 sm:p-6 bg-card rounded-xl shadow-sm">
              <Users className="h-7 w-7 sm:h-8 sm:w-8 text-primary mx-auto mb-2.5 sm:mb-3" />
              <div className="text-xl sm:text-2xl font-bold text-foreground font-playfair mb-1">
                {currentCity.stats.population}
              </div>
              <div className="text-muted-foreground font-inter text-xs sm:text-sm">{t('population')}</div>
            </div>
            <div className="text-center p-5 sm:p-6 bg-card rounded-xl shadow-sm">
              <Square className="h-7 w-7 sm:h-8 sm:w-8 text-accent mx-auto mb-2.5 sm:mb-3" />
              <div className="text-xl sm:text-2xl font-bold text-foreground font-playfair mb-1">
                {currentCity.stats.area}
              </div>
              <div className="text-muted-foreground font-inter text-xs sm:text-sm">{t('cityArea')}</div>
            </div>
            <div className="text-center p-5 sm:p-6 bg-card rounded-xl shadow-sm">
              <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-foreground mx-auto mb-2.5 sm:mb-3" />
              <div className="text-xl sm:text-2xl font-bold text-foreground font-playfair mb-1">
                {currentCity.stats.founded}
              </div>
              <div className="text-muted-foreground font-inter text-xs sm:text-sm">{t('foundedIn')}</div>
            </div>
          </div>

          {/* History Section */}
          <div className="mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground mb-4 sm:mb-6 break-words">
              {t('historyHeritage')}
            </h2>
            <div className="bg-card px-4 sm:px-6 lg:px-8 py-6 sm:py-8 rounded-xl shadow-sm">
              <p className="text-muted-foreground font-inter leading-relaxed text-base sm:text-lg break-words">
                {currentCity.history}
              </p>
            </div>
          </div>

          {/* Properties Tabs */}
          <div className="mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground mb-4 sm:mb-6 break-words">
              {t('propertiesAvailableIn')} {currentCity.name}
            </h2>

            <Tabs defaultValue="buy" className="w-full">
              {/* Tabs List: allow wrap & never overflow */}
              <TabsList className="w-full flex flex-wrap gap-2 sm:gap-3 justify-stretch sm:justify-start mb-6 sm:mb-8">
                <TabsTrigger value="buy" className="font-inter flex-1 sm:flex-none min-w-[120px]">
                  <Building className="h-4 w-4 mr-2 shrink-0" />
                  {t('buy')}
                </TabsTrigger>
                <TabsTrigger value="rent" className="font-inter flex-1 sm:flex-none min-w-[120px]">
                  <MapPin className="h-4 w-4 mr-2 shrink-0" />
                  {t('rent')}
                </TabsTrigger>
                <TabsTrigger value="shortStay" className="font-inter flex-1 sm:flex-none min-w-[120px]">
                  <Bed className="h-4 w-4 mr-2 shrink-0" />
                  {t('shortStay')}
                </TabsTrigger>
              </TabsList>

              {/* BUY */}
              <TabsContent value="buy" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : buyProperties.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {buyProperties.map((p) => (
                        <PropertyCard key={p.id} property={p} listingType="buy" />
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
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/buy')}>
                      {t('browseAllProperties')}
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* RENT */}
              <TabsContent value="rent" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : rentProperties.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {rentProperties.map((p) => (
                        <PropertyCard key={p.id} property={p} listingType="rent" />
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
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/rent')}>
                      {t('browseAllProperties')}
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* SHORT STAY */}
              <TabsContent value="shortStay" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : shortStayProperties.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {shortStayProperties.map((p) => (
                        <PropertyCard key={p.id} property={p} listingType="shortStay" />
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
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/short-stay')}>
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
