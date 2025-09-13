import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Bed, Bath, Square, Phone, Mail, Calendar, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useEffect, useState } from "react";
import MapboxMap from "@/components/MapboxMap";
import AIChatBox from "@/components/AIChatBox";
import PropertyDatePicker from "@/components/PropertyDatePicker";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  district?: string;
  full_address?: string;
  price: string;
  price_type: string;
  bedrooms?: string;
  bathrooms?: string;
  area: string;
  images: string[];
  property_type: string;
  features?: any;
  description?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
}

const Property = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useScrollToTop();

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching property:', error);
        setError('Property not found');
        return;
      }

      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to load property');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string, priceType: string) => {
    const formattedPrice = `${price} ${t('currencyDA')}`;
    if (priceType === 'monthly') return `${formattedPrice}/${t('month')}`;
    if (priceType === 'daily') return `${formattedPrice}/${t('day')}`;
    if (priceType === 'weekly') return `${formattedPrice}/${t('week')}`;
    return formattedPrice;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">{t('loading')}</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">{t('propertyNotFound') || 'Property not found'}</h1>
            <p className="text-muted-foreground">{error || 'The requested property could not be found.'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Images Gallery */}
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                      <img 
                        src={image} 
                        alt={`${property.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Info */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                     <div>
                       <CardTitle className="text-3xl mb-2 font-playfair">{property.title}</CardTitle>
                       <div className="flex items-center text-muted-foreground mb-2">
                         <MapPin className="w-5 h-5 mr-2" />
                         <span className="text-lg font-inter">{property.city}, {property.location}</span>
                       </div>
                     </div>
                     <Badge variant="secondary" className="text-lg px-3 py-1 font-inter">{t(property.property_type) || property.property_type}</Badge>
                   </div>
                   <div className="text-4xl font-bold text-primary font-playfair">{formatPrice(property.price, property.price_type)}</div>
                </CardHeader>
                <CardContent>
                   <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg mb-6">
                     {property.bedrooms && (
                       <>
                         <div className="flex items-center text-center">
                           <Bed className="w-6 h-6 mr-2 text-primary" />
                           <div>
                             <div className="font-semibold font-inter">{property.bedrooms}</div>
                             <div className="text-sm text-muted-foreground font-inter">{t('chambers')}</div>
                           </div>
                         </div>
                         <Separator orientation="vertical" className="h-12" />
                       </>
                     )}
                     {property.bathrooms && (
                       <>
                         <div className="flex items-center text-center">
                           <Bath className="w-6 h-6 mr-2 text-primary" />
                           <div>
                             <div className="font-semibold font-inter">{property.bathrooms}</div>
                             <div className="text-sm text-muted-foreground font-inter">{t('bathrooms')}</div>
                           </div>
                         </div>
                         <Separator orientation="vertical" className="h-12" />
                       </>
                     )}
                     <div className="flex items-center text-center">
                       <Square className="w-6 h-6 mr-2 text-primary" />
                       <div>
                         <div className="font-semibold font-inter">{property.area} m²</div>
                         <div className="text-sm text-muted-foreground font-inter">{t('areaField')}</div>
                       </div>
                     </div>
                   </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-playfair">{t('descriptionField')}</h3>
                    <p className="text-muted-foreground leading-relaxed font-inter">{property.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">{t('characteristics')}</CardTitle>
                </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     {property.features && Object.entries(property.features).map(([key, value]) => (
                       value && (
                         <div key={key} className="flex items-center p-3 bg-muted/50 rounded-lg">
                           <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                           <span className="text-sm font-inter">{t(key) || key}</span>
                         </div>
                       )
                     ))}
                   </div>
                 </CardContent>
              </Card>
               {/* Map */}
               <MapboxMap 
                 location={`${property.city}, ${property.location}`}
                 address={property.full_address || `${property.city}, ${property.location}`}
               />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Date Picker for Short Stay */}
              <PropertyDatePicker 
                onDateChange={(dates) => console.log("Selected dates:", dates)}
              />

              {/* Contact Owner */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center font-playfair">
                    <User className="w-5 h-5 mr-2" />
                    {t('contactOwner')}
                  </CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                   <div>
                     <h4 className="font-semibold mb-2 font-inter">{property.contact_name}</h4>
                     <div className="space-y-2">
                       <div className="flex items-center text-sm text-muted-foreground font-inter">
                         <Phone className="w-4 h-4 mr-2" />
                         {property.contact_phone}
                       </div>
                       <div className="flex items-center text-sm text-muted-foreground font-inter">
                         <Mail className="w-4 h-4 mr-2" />
                         {property.contact_email}
                       </div>
                     </div>
                   </div>
                  <Separator />
                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-primary hover:shadow-elegant font-inter">
                      <Phone className="w-4 h-4 mr-2" />
                      {t('callBtn')}
                    </Button>
                    <Button variant="outline" className="w-full font-inter">
                      <Mail className="w-4 h-4 mr-2" />
                      {t('sendMessageBtn')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">{t('listingDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-inter">{t('reference')}</span>
                    <span className="font-medium font-inter">BK-{property.id}</span>
                  </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground font-inter">{t('typeField')}</span>
                     <span className="font-medium font-inter">{t(property.property_type) || property.property_type}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground font-inter">{t('publishedOn')}</span>
                     <span className="font-medium font-inter">{formatDate(property.created_at)}</span>
                   </div>
                  <Separator />
                  <div className="flex items-center text-sm text-muted-foreground font-inter">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('lastUpdated')}: {t('daysAgo')}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AIChatBox />
    </div>
  );
};

export default Property;