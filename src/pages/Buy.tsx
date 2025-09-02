import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import PropertyFilters from "@/components/PropertyFilters";
import villaMediterranean from "@/assets/property-villa-mediterranean.jpg";
import luxuryApartment from "@/assets/property-luxury-apartment.jpg";
import shortStay from "@/assets/property-short-stay.jpg";
import modernApartment from "@/assets/property-modern-apartment.jpg";
import traditionalHouse from "@/assets/property-traditional-house.jpg";
import penthouse from "@/assets/property-penthouse.jpg";
import studio from "@/assets/property-studio.jpg";
import seasideRental from "@/assets/property-seaside-rental.jpg";
import { useState, useEffect } from "react";
import AIChatBox from "@/components/AIChatBox";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const Buy = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  
  useScrollToTop();

  const properties = [
    {
      id: 1,
      title: t('villaMediterranean'),
      location: t('algerAlgeria'),
      price: "2,500,000 DA",
      beds: 4,
      baths: 3,
      area: "280 m²",
      image: villaMediterranean,
      type: "Villa"
    },
    {
      id: 2,
      title: t('luxuryApartment'),
      location: t('oranAlgeria'), 
      price: "1,800,000 DA",
      beds: 3,
      baths: 2,
      area: "120 m²",
      image: luxuryApartment, 
      type: "Appartement"
    },
    {
      id: 7,
      title: t('villaModern'),
      location: t('constantineAlgeria'),
      price: "3,200,000 DA",
      beds: 5,
      baths: 4,
      area: "350 m²",
      image: modernApartment,
      type: "Villa"
    },
    {
      id: 8,
      title: t('duplexFamily'),
      location: t('tlemcenAlgeria'),
      price: "2,800,000 DA",
      beds: 4,
      baths: 3,
      area: "220 m²",
      image: penthouse,
      type: "Duplex"
    },
    {
      id: 9,
      title: t('traditionalHouse'),
      location: t('setifAlgeria'),
      price: "1,950,000 DA",
      beds: 3,
      baths: 2,
      area: "180 m²",
      image: traditionalHouse,
      type: "Maison"
    },
    {
      id: 10,
      title: t('modernStudio'),
      location: t('bejaiaAlgeria'),
      price: "950,000 DA",
      beds: 1,
      baths: 1,
      area: "45 m²",
      image: studio,
      type: "Studio"
    },
    {
      id: 11,
      title: t('apartmentStanding'),
      location: t('annabaAlgeria'),
      price: "2,100,000 DA",
      beds: 3,
      baths: 2,
      area: "140 m²",
      image: seasideRental,
      type: "Appartement"
    },
    {
      id: 12,
      title: t('villaWithPool'),
      location: t('tipazaAlgeria'),
      price: "4,500,000 DA",
      beds: 6,
      baths: 5,
      area: "450 m²",
      image: shortStay,
      type: "Villa"
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
            <h1 className="text-4xl font-bold text-foreground mb-4 font-playfair">{t('propertiesForSale')}</h1>
            <p className="text-lg text-muted-foreground font-inter">{t('propertiesForSaleDesc')}</p>
          </div>
          
          <PropertyFilters onFilterChange={handleFilterChange} listingType="buy" />
          
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

export default Buy;