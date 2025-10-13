import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Shield, AlertTriangle, MessageCircle, Calendar } from "lucide-react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useEffect, useState } from "react";
import { BookingModal } from "@/components/BookingModal";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ScheduleVisitModal from "@/components/ScheduleVisitModal";
import MessageOwnerModal from "@/components/MessageOwnerModal";
import { PropertyReviews } from "@/components/PropertyReviews";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";
import { GuestFavouriteBadge } from "@/components/GuestFavouriteBadge";
import { PropertyShareButton } from "@/components/PropertyShareButton";
import { useAuth } from "@/contexts/AuthContext";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { PropertyHighlights } from "@/components/PropertyHighlights";
import { KeyDetailsTable } from "@/components/KeyDetailsTable";
import { VerifiedOwnerSection } from "@/components/VerifiedOwnerSection";
import { WhyBuyWithHolibayt } from "@/components/WhyBuyWithHolibayt";
import { WhyRentWithHolibayt } from "@/components/WhyRentWithHolibayt";
import { HolibaytPayExplainer } from "@/components/HolibaytPayExplainer";
import { SimilarProperties } from "@/components/SimilarProperties";
import { RecentlySoldRented } from "@/components/RecentlySoldRented";
import { NeighborhoodInsights } from "@/components/NeighborhoodInsights";
import CurrencySelector from "@/components/CurrencySelector";
import { WishlistButton } from "@/components/WishlistButton";
import { buyRentTranslations } from "@/contexts/LanguageTranslations";
import { useWishlist } from "@/hooks/useWishlist";

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
  verified?: boolean;
  financing_available?: boolean;
  holibayt_pay_eligible?: boolean;
  new_build?: boolean;
  contract_digitally_available?: boolean;
  condition?: string;
  availability_status?: string;
  minimum_rental_term?: string;
  furnished?: boolean;
}

interface Profile {
  name?: string;
  avatar_url?: string;
  kyc_approved_at?: string;
  languages_spoken?: string[];
  response_rate?: number;
  transaction_count?: number;
  average_rating?: number;
  id_verified?: boolean;
  ownership_verified?: boolean;
}

const PropertyEnhanced = () => {
  const { id } = useParams();
  const { t, currentLang } = useLanguage();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { wishlistIds, toggleWishlist } = useWishlist(user?.id);
  
  useScrollToTop();

  // Get translation helper with fallback
  const tKey = (key: string) => {
    const translations = buyRentTranslations[currentLang] || buyRentTranslations.EN;
    return translations[key] || key;
  };

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

      setProperty(data);

      // Fetch profile data
      if (data.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user_id)
          .maybeSingle();
        
        if (profileData) {
          setProfile(profileData);
        }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">{error || "Property not found"}</h1>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isBuy = property.category === "buy";
  const isRent = property.category === "rent";
  const isShortStay = property.category === "short-stay";
  const verificationYear = profile?.kyc_approved_at
    ? new Date(profile.kyc_approved_at).getFullYear() 
    : new Date().getFullYear();
  const isInWishlist = wishlistIds.has(property.id);

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Trust Badge Line */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span>
            {isBuy ? tKey("protectedByHolibaytPay") : tKey("rentSafelyWithHolibayt")}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <PropertyImageGallery images={property.images} title={translatedTitle} />

            {/* Title & Location */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-2">
                    {translatedTitle}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}, {property.city}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <PropertyShareButton propertyId={property.id} propertyTitle={translatedTitle} />
                  <WishlistButton 
                    isInWishlist={isInWishlist} 
                    onToggle={() => toggleWishlist(property.id)} 
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {property.verified && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="w-3 h-3" />
                    {t("verified")}
                  </Badge>
                )}
                {property.holibayt_pay_eligible && (
                  <Badge variant="default">Holibayt Pay™</Badge>
                )}
                {property.new_build && (
                  <Badge variant="outline">{t("newBuild")}</Badge>
                )}
                {isRent && property.furnished && (
                  <Badge variant="outline">{tKey("furnished")}</Badge>
                )}
              </div>
            </div>

            {/* About This Property */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                {isBuy || isRent ? tKey(isBuy ? "aboutThisProperty" : "aboutThisRental") : t("propertyDetails")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {translatedDescription || "No description available"}
                {property.verified && (
                  <span className="block mt-2 text-sm text-primary flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    {tKey("verifiedByTeam")}
                  </span>
                )}
              </p>
              {translatedDescription && translatedDescription.length > 300 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? "Show less" : tKey("readMore")}
                </Button>
              )}
            </div>

            <Separator />

            {/* Property Highlights */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{tKey("propertyHighlights")}</h3>
              <PropertyHighlights
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                features={property.features}
                category={property.category}
              />
            </div>

            <Separator />

            {/* Key Details Table */}
            <KeyDetailsTable
              propertyType={property.property_type}
              condition={property.condition}
              ownership={property.verified ? "Verified by Holibayt" : "Pending verification"}
              availability={property.availability_status}
              minimumTerm={property.minimum_rental_term}
              furnished={property.furnished}
              category={property.category}
            />

            <Separator />

            {/* Verified Owner Section */}
            {profile && (
              <>
                <VerifiedOwnerSection
                  name={profile.name || "Property Owner"}
                  avatarUrl={profile.avatar_url}
                  verifiedSince={verificationYear.toString()}
                  city={property.city}
                  languages={profile.languages_spoken || ["Arabic", "French"]}
                  transactionCount={profile.transaction_count || 0}
                  responseRate={profile.response_rate || 100}
                  averageRating={profile.average_rating}
                  isVerified={profile.id_verified || profile.ownership_verified || false}
                  category={isBuy ? "buy" : (isRent ? "rent" : "short-stay")}
                />
                <Separator />
              </>
            )}

            {/* Holibayt Pay Protection */}
            {property.holibayt_pay_eligible && (
              <>
                <HolibaytPayExplainer category={isBuy ? "buy" : "rent"} />
                <Separator />
              </>
            )}

            {/* Location & Neighborhood */}
            <NeighborhoodInsights
              city={property.city}
              location={property.location}
              district={property.district}
            />

            <Separator />

            {/* Why Buy/Rent with Holibayt */}
            {isBuy ? <WhyBuyWithHolibayt /> : isRent ? <WhyRentWithHolibayt /> : null}

            <Separator />

            {/* Reviews - Single Section Only */}
            <PropertyReviews propertyId={property.id} hostUserId={property.user_id || ""} />

            {/* Similar Properties */}
            <SimilarProperties
              currentPropertyId={property.id}
              city={property.city}
              category={property.category}
            />

            {/* Recently Sold/Rented */}
            {(isBuy || isRent) && (
              <RecentlySoldRented
                city={property.city}
                category={isBuy ? "buy" : "rent"}
              />
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6 shadow-lg hover:shadow-2xl transition-shadow space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(parseFloat(property.price), property.price_currency || "DZD")}
                  </div>
                  <CurrencySelector />
                </div>
                <p className="text-sm text-muted-foreground">
                  {property.price_type === "per_month" && t("perMonth")}
                  {property.price_type === "per_night" && t("perNight")}
                </p>
                {property.fees?.security_deposit?.enabled && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {tKey("deposit")}: {formatPrice(property.fees.security_deposit.amount, property.price_currency || "DZD")} {tKey("depositHeldVia")}
                  </p>
                )}
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full hover:-translate-y-0.5 transition-transform shadow-md"
                  size="lg"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {isBuy ? tKey("requestVisit") : isRent ? tKey("scheduleVisit") : tKey("bookViewingSafely")}
                </Button>
                
                <Button
                  onClick={() => setIsMessageModalOpen(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {tKey("chatSecurely")}
                </Button>

                {property.financing_available && isBuy && (
                  <Button variant="outline" className="w-full" size="sm">
                    {tKey("getPreApproved")}
                  </Button>
                )}
              </div>

              {/* Warning - Only for Short Stay */}
              {isShortStay && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 whitespace-normal break-words leading-relaxed">
                    {tKey("communicationWarning")}
                  </p>
                </div>
              )}

              {/* Guest Favourite */}
              {property.category === "short-stay" && property.features?.average_rating && (
                <GuestFavouriteBadge 
                  rating={property.features.average_rating} 
                  reviewCount={property.features.total_reviews || 0} 
                />
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <ScheduleVisitModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        propertyTitle={translatedTitle}
      />
      <MessageOwnerModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        ownerName={profile?.name || "Property Owner"}
        ownerEmail={property.contact_email || ""}
        propertyTitle={translatedTitle}
        propertyId={property.id}
        isSecureMode={true}
      />
      {property.category === "short-stay" && (
        <BookingModal property={property} />
      )}
    </div>
  );
};

export default PropertyEnhanced;
