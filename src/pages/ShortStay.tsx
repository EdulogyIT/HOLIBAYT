import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import PropertyFilters from "@/components/PropertyFilters";
import shortStay from "@/assets/property-short-stay.jpg";
import luxuryApartment from "@/assets/property-luxury-apartment.jpg";
import villaMediterranean from "@/assets/property-villa-mediterranean.jpg";
import modernApartment from "@/assets/property-modern-apartment.jpg";
import traditionalHouse from "@/assets/property-traditional-house.jpg";
import penthouse from "@/assets/property-penthouse.jpg";
import studio from "@/assets/property-studio.jpg";
import seasideRental from "@/assets/property-seaside-rental.jpg";
import { useState } from "react";
import AIChatBox from "@/components/AIChatBox";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const ShortStay = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  
  useScrollToTop();

  const properties = [
    {
      id: 5,
      title: t('studioShortStay'),
      location: t('algerCentreAlgeria'),
      price: `8,000 ${t('currencyPerNight')}`,
      beds: 1,
      baths: 1,
      area: "45 m²",
      image: studio,
      type: t('propertyStudio'),
      rating: 4.8
    },
    {
      id: 6,
      title: t('seaViewApartment'),
      location: t('tipazaAlgeria'), 
      price: `12,000 ${t('currencyPerNight')}`,
      beds: 2,
      baths: 1,
      area: "75 m²",
      image: seasideRental, 
      type: t('propertyAppartement'),
      rating: 4.9
    },
    {
      id: 19,
      title: t('holidayVilla'),
      location: t('oranAlgeria'),
      price: `18,000 ${t('currencyPerNight')}`,
      beds: 4,
      baths: 3,
      area: "200 m²",
      image: villaMediterranean,
      type: t('propertyVilla'),
      rating: 4.7
    },
    {
      id: 20,
      title: t('guestRoom'),
      location: t('constantineAlgeria'),
      price: `6,000 ${t('currencyPerNight')}`,
      beds: 1,
      baths: 1,
      area: "25 m²",
      image: traditionalHouse,
      type: t('propertyChambre'),
      rating: 4.5
    },
    {
      id: 21,
      title: t('modernLoft'),
      location: t('annabaAlgeria'),
      price: `14,000 ${t('currencyPerNight')}`,
      beds: 2,
      baths: 2,
      area: "90 m²",
      image: modernApartment,
      type: t('propertyLoft'),
      rating: 4.8
    },
    {
      id: 22,
      title: t('familySuite'),
      location: t('tlemcenAlgeria'),
      price: `16,000 ${t('currencyPerNight')}`,
      beds: 3,
      baths: 2,
      area: "120 m²",
      image: luxuryApartment,
      type: t('propertySuite'),
      rating: 4.6
    },
    {
      id: 23,
      title: t('penthouseSeaView'),
      location: t('bejaiaAlgeria'),
      price: `25,000 ${t('currencyPerNight')}`,
      beds: 3,
      baths: 3,
      area: "150 m²",
      image: penthouse,
      type: t('propertyPenthouse'),
      rating: 4.9
    },
    {
      id: 24,
      title: t('traditionalHouse'),
      location: t('setifAlgeria'),
      price: `10,000 ${t('currencyPerNight')}`,
      beds: 2,
      baths: 1,
      area: "80 m²",
      image: shortStay,
      type: t('propertyMaison'),
      rating: 4.4
    }
  ];

  const handleFilterChange = (filters: any) => {
    let filtered = [...properties];
    
    if (filters.location) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.propertyType && filters.propertyType !== "all") {
      filtered = filtered.filter(p => 
        p.type.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }
    
    if (filters.bedrooms && filters.bedrooms !== "all") {
      const minBeds = parseInt(filters.bedrooms);
      filtered = filtered.filter(p => p.beds >= minBeds);
    }
    
    if (filters.bathrooms && filters.bathrooms !== "all") {
      const minBaths = parseInt(filters.bathrooms);
      filtered = filtered.filter(p => p.baths >= minBaths);
    }
    
    if (filters.minArea) {
      const minArea = parseInt(filters.minArea);
      filtered = filtered.filter(p => parseInt(p.area) >= minArea);
    }
    
    if (filters.maxArea) {
      const maxArea = parseInt(filters.maxArea);
      filtered = filtered.filter(p => parseInt(p.area) <= maxArea);
    }
    
    if (filters.maxPrice && filters.maxPrice[0] > 0) {
      const maxPrice = filters.maxPrice[0];
      filtered = filtered.filter(p => {
        const priceNum = parseInt(p.price.replace(/[^\d]/g, ''));
        return priceNum <= maxPrice;
      });
    }
    
    setFilteredProperties(filtered);
  };

  const displayProperties = filteredProperties.length > 0 ? filteredProperties : properties;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 font-playfair">{t('shortStayTitle')}</h1>
            <p className="text-lg text-muted-foreground font-inter">{t('shortStayDesc')}</p>
          </div>
          
          <PropertyFilters onFilterChange={handleFilterChange} listingType="shortStay" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProperties.map((property) => (
              <Card 
                key={property.id} 
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
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm font-inter">{property.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-sm font-medium font-inter">{property.rating}</span>
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
                    {t('bookNow')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <AIChatBox />
    </div>
  );
};

export default ShortStay;