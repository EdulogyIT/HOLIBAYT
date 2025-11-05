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
import { Navigation as NavigationIcon } from "lucide-react";
import PropertyDatePicker from "@/components/PropertyDatePicker";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ScheduleVisitModal from "@/components/ScheduleVisitModal";
import MessageOwnerModal from "@/components/MessageOwnerModal";
import { PropertyReviews } from "@/components/PropertyReviews";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";
import { HostProfileSection } from "@/components/HostProfileSection";
import { GuestFavouriteBadge } from "@/components/GuestFavouriteBadge";
import { RatingShowcase } from "@/components/RatingShowcase";
import { ReviewTags } from "@/components/ReviewTags";
import { PropertyShareButton } from "@/components/PropertyShareButton";
import { HostDetailsSection } from "@/components/HostDetailsSection";
import { NeighborhoodInsights } from "@/components/NeighborhoodInsights";
import GooglePropertyMap from "@/components/GooglePropertyMap";
import { PropertyAvailabilityCalendar } from "@/components/PropertyAvailabilityCalendar";
import { GuestsSelector } from "@/components/GuestsSelector";
import { format } from "date-fns";

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  district?: string;
  full_address?: string;
  latitude?: number;
  longitude?: number;
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
  min_nights?: number;
  max_nights?: number;
  fees?: any;
  verified?: boolean;
  financing_available?: boolean;
  holibayt_pay_eligible?: boolean;
  new_build?: boolean;
  contract_digitally_available?: boolean;
}

const Property = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [guestCounts, setGuestCounts] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });
  const [pricingBreakdown, setPricingBreakdown] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  
  useScrollToTop();

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchReviews();
    }
  }, [id]);

  // Calculate pricing when dates or guests change
  useEffect(() => {
    if (property && selectedDates.checkIn && selectedDates.checkOut && property.category === 'short-stay') {
      calculatePricing();
    }
  }, [property, selectedDates, guestCounts]);

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

  const calculatePricing = async () => {
    if (!property || !selectedDates.checkIn || !selectedDates.checkOut) return;

    setPricingLoading(true);
    try {
      const { calculateBookingPrice } = await import('@/utils/pricingCalculator');
      const breakdown = await calculateBookingPrice(
        property.id,
        selectedDates.checkIn,
        selectedDates.checkOut,
        guestCounts.adults + guestCounts.children + guestCounts.infants,
        guestCounts.pets
      );
      setPricingBreakdown(breakdown);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      // Fallback to simple calculation
      const nights = Math.ceil((selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      setPricingBreakdown({
        nights,
        total: Number(property.price) * nights,
        subtotal: Number(property.price) * nights,
        basePrice: Number(property.price)
      });
    } finally {
      setPricingLoading(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 md:space-y-10">
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
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
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
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                        {translatedTitle || property.title}
                      </CardTitle>
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="text-sm sm:text-base md:text-lg">
                          {property.city}, {property.location}
                          {property.district && ` - ${property.district}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PropertyShareButton 
                        propertyId={property.id}
                        propertyTitle={property.title}
                        variant="outline"
                        size="default"
                      />
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {property.category === 'sale' ? t('forSale') : property.category === 'rent' ? t('forRent') : t('shortStay')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-sm sm:text-base md:text-lg">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Bed className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                        <span>{property.bedrooms} {t('bedrooms')}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Bath className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                        <span>{property.bathrooms} {t('bathrooms')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Square className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                      <span>{property.area} {t('areaUnit')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

        {/* Meet Your Host Section */}
        {property.user_id && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">{t('meetYourHost')}</CardTitle>
            </CardHeader>
            <CardContent>
              <HostProfileSection 
                userId={property.user_id}
                onContactHost={() => setIsMessageModalOpen(true)}
              />
            </CardContent>
          </Card>
        )}

        {/* Unified Rating Showcase - One Beautiful Section */}
        {averageRating > 0 && (
          <RatingShowcase 
            reviews={reviews}
            averageRating={averageRating}
            totalReviews={totalReviews}
            showBadge={averageRating >= 4.5 && totalReviews >= 5}
            categoryRatings={{
              cleanliness: property.features?.cleanliness_rating,
              accuracy: property.features?.accuracy_rating,
              checkin: property.features?.checkin_rating,
              communication: property.features?.communication_rating,
              location: property.features?.location_rating,
              value: property.features?.value_rating,
            }}
          />
        )}

        {/* Description */}
              {translatedDescription && (
                <Card className="shadow-lg">
                  <CardHeader>
              <CardTitle className="text-2xl">{t('description')}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Conditional Buy Property Info Blocks */}
              {property.category === 'sale' && (
                <div className="space-y-4 mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xl">🛡️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{t('transactionSecured')}</h4>
                      <p className="text-sm text-muted-foreground">{t('fundsInEscrow')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xl">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{t('verified')}</h4>
                      <p className="text-sm text-muted-foreground">{t('listingVerified')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-xl">📅</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{t('estimatedClose')}</h4>
                      <p className="text-sm text-muted-foreground">7-10 {t('day')}s</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setIsMessageModalOpen(true)}
                  >
                    <span>⚖️</span>
                    <span className="ml-2">{t('requestLegalReview')}</span>
                  </Button>
                </div>
              )}

              {/* Conditional Rent Property Info Blocks */}
              {property.category === 'rent' && (
                <div className="space-y-4 mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xl">🛡️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{t('securePayments')}</h4>
                      <p className="text-sm text-muted-foreground">{t('rentDepositProtected')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xl">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{t('verifiedLandlord')}</h4>
                      <p className="text-sm text-muted-foreground">{t('landlordVerified')}</p>
                    </div>
                  </div>
                  {property.contract_digitally_available && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 text-xl">📜</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{t('digitalLeaseOption')}</h4>
                        <p className="text-sm text-muted-foreground">{t('contractSignOnline')}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">{translatedDescription}</p>
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

              {/* Review Tags */}
              {totalReviews > 0 && (
                <ReviewTags tags={property.features?.review_tags} />
              )}

              {/* Reviews */}
              <PropertyReviews propertyId={property.id} hostUserId={property.user_id || ''} />

              {/* Availability Calendar - Enhanced visibility for short-stay properties */}
              {property.category === "short-stay" && (
                <div className="my-8">
                  <Separator className="mb-8" />
                  <Card className="shadow-2xl border-2 border-primary/20">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                      <CardTitle className="text-3xl font-bold flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-primary" />
                        {t("selectDates") || "Select your dates"}
                      </CardTitle>
                      <p className="text-muted-foreground mt-2 text-base">
                        {property.min_nights && `Minimum stay: ${property.min_nights} night${property.min_nights > 1 ? 's' : ''}`}
                        {property.max_nights && ` • Maximum stay: ${property.max_nights} nights`}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <PropertyAvailabilityCalendar
                        propertyId={property.id}
                        basePrice={property.price}
                        priceType={property.price_type}
                        currency={property.price_currency}
                        minNights={property.min_nights || 1}
                        maxNights={property.max_nights || 365}
                        onDateSelect={(dates) => {
                          setSelectedDates(dates);
                          // Scroll to sidebar booking card when dates are selected
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    </CardContent>
                  </Card>
                  <Separator className="mt-8" />
                </div>
              )}


              {/* Location Map - Enhanced "Where you'll be" section */}
              <GooglePropertyMap 
                location={`${property.location}, ${property.city}, Algeria`}
                address={property.full_address}
                latitude={property.latitude}
                longitude={property.longitude}
              />

              {/* Neighborhood Insights */}
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <NeighborhoodInsights 
                    city={property.city}
                    location={property.location}
                    district={property.district}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sticky Sidebar - Booking Card - Airbnb Style */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl sticky top-24">
                <CardHeader className="pb-4">
                  {/* Price at top - Airbnb style */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold">
                      {formatPrice(Number(property.price), property.price_type, property.price_currency)}
                    </span>
                    <span className="text-base text-muted-foreground">night</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {property.category === 'short-stay' && (
                    <>
                      {/* Dates and Guests in bordered boxes - Airbnb style */}
                      <div className="border border-input rounded-lg overflow-hidden">
                        {/* Check-in and Check-out side by side */}
                        <div className="grid grid-cols-2">
                          <div className="p-3 border-r">
                            <div className="text-xs font-semibold uppercase mb-1">Check-in</div>
                            <div className="text-sm">
                              {selectedDates.checkIn ? format(selectedDates.checkIn, 'MM/dd/yyyy') : 'Add date'}
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="text-xs font-semibold uppercase mb-1">Checkout</div>
                            <div className="text-sm">
                              {selectedDates.checkOut ? format(selectedDates.checkOut, 'MM/dd/yyyy') : 'Add date'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Guests section with detailed selector */}
                        <div className="border-t">
                          <GuestsSelector
                            value={guestCounts}
                            onChange={setGuestCounts}
                            keepOpen={true}
                          />
                        </div>
                      </div>
                      
                      {/* Reserve button - Airbnb magenta */}
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] hover:from-[#D70466] hover:to-[#BD1E59] text-white font-semibold text-base h-12"
                        onClick={() => {
                          const params = new URLSearchParams();
                          if (selectedDates.checkIn) params.set('checkIn', selectedDates.checkIn.toISOString());
                          if (selectedDates.checkOut) params.set('checkOut', selectedDates.checkOut.toISOString());
                          params.set('guests', (guestCounts.adults + guestCounts.children + guestCounts.infants).toString());
                          if (guestCounts.pets > 0) params.set('pets', guestCounts.pets.toString());
                          navigate(`/booking/confirm/${property.id}?${params.toString()}`);
                        }}
                        disabled={!selectedDates.checkIn || !selectedDates.checkOut}
                      >
                        Reserve
                      </Button>
                      
                      <p className="text-center text-sm text-muted-foreground">
                        You won't be charged yet
                      </p>
                      
                      {/* Pricing breakdown - Airbnb style */}
                      {selectedDates.checkIn && selectedDates.checkOut && (
                        <div className="space-y-3 pt-4">
                          {pricingLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span className="ml-2 text-sm">Calculating...</span>
                            </div>
                          ) : pricingBreakdown ? (
                            <>
                              <div className="flex justify-between text-base">
                                <span className="underline">
                                  {formatPrice(pricingBreakdown.basePrice, 'night', property.price_currency)} × {pricingBreakdown.nights} nights
                                </span>
                                <span>{formatPrice(pricingBreakdown.subtotal + (pricingBreakdown.savings || 0), 'total', property.price_currency)}</span>
                              </div>
                              
                              {pricingBreakdown.lengthOfStayDiscount && (
                                <div className="flex justify-between text-base text-green-600">
                                  <span className="underline">Length of stay discount</span>
                                  <span>-{formatPrice(pricingBreakdown.lengthOfStayDiscount.amount, 'total', property.price_currency)}</span>
                                </div>
                              )}
                              
                              {pricingBreakdown.cleaningFee > 0 && (
                                <div className="flex justify-between text-base">
                                  <span className="underline">Cleaning fee</span>
                                  <span>{formatPrice(pricingBreakdown.cleaningFee, 'total', property.price_currency)}</span>
                                </div>
                              )}
                              
                              {pricingBreakdown.serviceFee > 0 && (
                                <div className="flex justify-between text-base">
                                  <span className="underline">Service fee</span>
                                  <span>{formatPrice(pricingBreakdown.serviceFee, 'total', property.price_currency)}</span>
                                </div>
                              )}
                              
                              <Separator />
                              
                              <div className="flex justify-between text-base font-semibold">
                                <span>Total</span>
                                <span>{formatPrice(pricingBreakdown.total, 'total', property.price_currency)}</span>
                              </div>
                            </>
                          ) : null}
                        </div>
                      )}
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
