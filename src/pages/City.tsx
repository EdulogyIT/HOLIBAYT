import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Bed, Bath, Square, Clock, Users, Building } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import AIChatBox from "@/components/AIChatBox";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useEffect } from "react";
import algerImage from "@/assets/city-alger.jpg";
import oranImage from "@/assets/city-oran.jpg";
import constantineImage from "@/assets/city-constantine.jpg";
import annabaImage from "@/assets/city-annaba.jpg";
import villaMediterranean from "@/assets/property-villa-mediterranean.jpg";
import luxuryApartment from "@/assets/property-luxury-apartment.jpg";
import shortStay from "@/assets/property-short-stay.jpg";

const City = () => {
  const navigate = useNavigate();
  const { t, currentLang } = useLanguage();
  const { cityId } = useParams();
  
  useScrollToTop();

  // Re-render when language changes
  useEffect(() => {
    // Component will re-render when currentLang changes
  }, [currentLang]);

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

  // Sample properties for each city
  const buyProperties = [
    {
      id: 1,
      title: `${t('propertyVilla')} ${currentCity.name}`,
      location: `${currentCity.name}, ${t('algeria')}`,
      price: `2,500,000 ${t('currencyDA')}`,
      beds: 4,
      baths: 3,
      area: "280 m²",
      image: villaMediterranean,
      type: t('propertyVilla')
    },
    {
      id: 2,
      title: `${t('propertyAppartement')} ${currentCity.name}`,
      location: `${currentCity.name}, ${t('algeria')}`,
      price: `1,800,000 ${t('currencyDA')}`,
      beds: 3,
      baths: 2,
      area: "120 m²",
      image: luxuryApartment,
      type: t('propertyAppartement')
    }
  ];

  const rentProperties = [
    {
      id: 3,
      title: `${t('propertyStudio')} ${currentCity.name}`,
      location: `${currentCity.name}, ${t('algeria')}`,
      price: `35,000 ${t('currencyPerMonth')}`,
      beds: 1,
      baths: 1,
      area: "45 m²",
      image: shortStay,
      type: t('propertyStudio')
    },
    {
      id: 4,
      title: `${t('propertyAppartement')} ${currentCity.name}`,
      location: `${currentCity.name}, ${t('algeria')}`,
      price: `55,000 ${t('currencyPerMonth')}`,
      beds: 3,
      baths: 2,
      area: "110 m²",
      image: luxuryApartment,
      type: t('propertyAppartement')
    }
  ];

  const shortStayProperties = [
    {
      id: 5,
      title: `${t('propertySuite')} ${currentCity.name}`,
      location: `${currentCity.name}, ${t('algeria')}`,
      price: `12,000 ${t('currencyPerNight')}`,
      beds: 2,
      baths: 1,
      area: "75 m²",
      image: shortStay,
      type: t('propertySuite'),
      rating: 4.8
    },
    {
      id: 6,
      title: `${t('propertyAppartement')} Vue ${currentCity.name}`,
      location: `${currentCity.name}, ${t('algeria')}`,
      price: `15,000 ${t('currencyPerNight')}`,
      beds: 3,
      baths: 2,
      area: "95 m²",
      image: luxuryApartment,
      type: t('propertyAppartement'),
      rating: 4.9
    }
  ];

  const PropertyCard = ({ property, listingType }: { property: any, listingType: string }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/property/${property.id}`)}
    >
      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-playfair">{property.title}</CardTitle>
          <Badge variant="secondary" className="font-inter">{property.type}</Badge>
        </div>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm font-inter">{property.location}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-primary font-playfair">{property.price}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-4 font-inter">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            {property.beds}
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            {property.baths}
          </div>
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            {property.area}
          </div>
        </div>
        <Button 
          className="w-full bg-gradient-primary hover:shadow-elegant font-inter flex items-center justify-center min-h-[44px]" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/property/${property.id}`);
          }}
        >
          {listingType === 'shortStay' ? t('reserve') : t('seeDetails')}
        </Button>
      </CardContent>
    </Card>
  );

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
                    onClick={() => navigate('/buy')}
                  >
                    {t('seeAllForSale')}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="rent" className="space-y-6">
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
                    onClick={() => navigate('/rent')}
                  >
                    {t('seeAllForRent')}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="shortStay" className="space-y-6">
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
                    onClick={() => navigate('/short-stay')}
                  >
                    {t('seeAllShortStay')}
                  </Button>
                </div>
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