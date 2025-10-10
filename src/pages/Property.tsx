import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Bed, Bath, Square, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useEffect, useState } from "react";
import StaticPropertyMap from "@/components/StaticPropertyMap";
import PropertyDatePicker from "@/components/PropertyDatePicker";
import { BookingModal } from "@/components/BookingModal";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ScheduleVisitModal from "@/components/ScheduleVisitModal";
import MessageOwnerModal from "@/components/MessageOwnerModal";
import { PropertyReviews } from "@/components/PropertyReviews";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";
import { HostProfileSection } from "@/components/HostProfileSection";
import { GuestFavouriteBadge } from "@/components/GuestFavouriteBadge";
import { RatingBreakdown } from "@/components/RatingBreakdown";
import { ReviewTags } from "@/components/ReviewTags";
import { RatingDistributionChart } from "@/components/RatingDistributionChart";

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  district?: string;
  full_address?: string;
  price: string;
  price_type: string;
  price_currency?: string;
  category: string;
  bedrooms?: string;
  bathrooms?: string;
  area: string;
  images: string[];
  property_type: string;
  features?: any;
  description?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at: string;
  user_id?: string;
  commission_rate?: number;
  check_in_time?: string;
  check_out_time?: string;
  fees?: any;
}

const Property = () => {
  const { id } = useParams();
  const { t, currentLang } = useLanguage();
  const { formatPrice } = useCurrency();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Array<{ rating: number }>>([]);
  const [selectedDates, setSelectedDates] = useState<{ checkIn: Date | undefined; checkOut: Date | undefined }>({
    checkIn: undefined,
    checkOut: undefined
  });
  
  useScrollToTop();

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('property_id', id);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching property:', error);
        setError('Property not found');
        return;
      }

      if (!data) {
        setError('Property not found');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const isOwner = user && user.id === data.user_id;
      
      if (!isOwner) {
        setProperty({
          ...data,
          contact_name: undefined,
          contact_email: undefined,
          contact_phone: undefined
        });
      } else {
        setProperty(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to load property');
    } finally {
      setIsLoading(false);
    }
  };

  const { translatedText: translatedTitle } = usePropertyTranslation(
    property?.title,
    currentLang,
    'property_title'
  );

  const { translatedText: translatedDescription } = usePropertyTranslation(
    property?.description,
    currentLang,
    'property_description'
  );

  const handlePreviousImage = () => {
    if (property && property.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (property && property.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
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

  const averageRating = property.features?.average_rating || 0;
  const totalReviews = property.features?.total_reviews || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Property Images Gallery - Interactive */}
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-xl overflow-hidden group">
                  <img 
                    src={property.images[selectedImageIndex]} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {property.images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-all ${
                        selectedImageIndex === index ? 'ring-4 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${property.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Title & Basic Info */}
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl font-bold mb-2">
                        {translatedTitle || property.title}
                      </CardTitle>
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span className="text-lg">
                          {property.city}, {property.location}
                          {property.district && ` - ${property.district}`}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {property.category === 'sale' ? t('forSale') : property.category === 'rent' ? t('forRent') : t('shortStay')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6 text-lg">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-6 w-6 text-primary" />
                        <span>{property.bedrooms} {t('bedrooms')}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-6 w-6 text-primary" />
                        <span>{property.bathrooms} {t('bathrooms')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Square className="h-6 w-6 text-primary" />
                      <span>{property.area} {t('areaUnit')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guest Favourite Badge */}
              {averageRating >= 4.5 && totalReviews >= 5 && (
                <GuestFavouriteBadge rating={averageRating} reviewCount={totalReviews} />
              )}

              {/* Meet Your Host - Right After Images */}
              {property.user_id && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Meet Your Host</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HostProfileSection 
                      userId={property.user_id}
                      onContactHost={() => setIsMessageModalOpen(true)}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {translatedDescription && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">{t('description')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                      {translatedDescription}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Amenities & Features */}
              {property.features && Object.keys(property.features).length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">{t('amenities')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(property.features).map(([key, value]) => {
                        if (typeof value === 'boolean' && value) {
                          return (
                            <div key={key} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rating Breakdown */}
              {averageRating > 0 && (
                <>
                  <RatingDistributionChart reviews={reviews} />
                  
                  <RatingBreakdown 
                    averageRating={averageRating}
                    categoryRatings={{
                      cleanliness: property.features?.cleanliness_rating,
                      accuracy: property.features?.accuracy_rating,
                      checkin: property.features?.checkin_rating,
                      communication: property.features?.communication_rating,
                      location: property.features?.location_rating,
                      value: property.features?.value_rating,
                    }}
                  />
                </>
              )}

              {/* Review Tags */}
              {totalReviews > 0 && (
                <ReviewTags tags={property.features?.review_tags} />
              )}

              {/* Reviews */}
              <PropertyReviews propertyId={property.id} hostUserId={property.user_id || ''} />

              {/* Location Map */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">{t('location')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {property.full_address || `${property.city}, ${property.location}`}
                  </p>
                </CardHeader>
                <CardContent>
                  <StaticPropertyMap location={`${property.city}, ${property.location}`} />
                </CardContent>
              </Card>
            </div>

            {/* Sticky Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl sticky top-24">
                <CardHeader>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-primary">
                      {formatPrice(Number(property.price), property.price_type, property.price_currency)}
                    </span>
                    {property.price_type !== 'total' && (
                      <span className="text-muted-foreground">
                        / {property.price_type === 'daily' ? t('night') : property.price_type === 'weekly' ? t('week') : t('month')}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.category === 'short-stay' && (
                    <>
                      <PropertyDatePicker 
                        onDateChange={(dates) => setSelectedDates(dates)}
                        propertyId={property.id}
                      />
                      <BookingModal
                        property={{
                          id: property.id,
                          title: property.title,
                          price: property.price,
                          price_type: property.price_type,
                          price_currency: property.price_currency,
                          category: property.category
                        }}
                        trigger={
                          <Button size="lg" className="w-full">
                            <Calendar className="w-4 h-4 mr-2" />
                            {t('bookNow')}
                          </Button>
                        }
                      />
                    </>
                  )}

                  {property.category !== 'short-stay' && (
                    <>
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => setIsScheduleModalOpen(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {t('scheduleVisit')}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsMessageModalOpen(true)}
                      >
                        {t('contactOwner')}
                      </Button>
                    </>
                  )}

                  <Separator />

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      🔒 {t('securePayment')} • {t('instantConfirmation')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Modals */}
        {property.id && (
          <>
            <ScheduleVisitModal
              isOpen={isScheduleModalOpen}
              onClose={() => setIsScheduleModalOpen(false)}
              propertyTitle={property.title}
            />
            <MessageOwnerModal
              isOpen={isMessageModalOpen}
              onClose={() => setIsMessageModalOpen(false)}
              ownerName={property.contact_name || 'Owner'}
              ownerEmail={property.contact_email || ''}
              propertyTitle={property.title}
              propertyId={property.id}
              isSecureMode={true}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Property;