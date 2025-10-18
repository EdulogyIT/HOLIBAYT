import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ShortStayHeroSearch from "@/components/ShortStayHeroSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Loader2, Wifi, Car, Waves, Coffee } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import PropertyFilters from "@/components/PropertyFilters";
import { useState, useEffect } from "react";
import AIChatBox from "@/components/AIChatBox";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/hooks/useWishlist";
import { WishlistButton } from "@/components/WishlistButton";
import { PropertyBadges } from "@/components/PropertyBadges";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";
import { LocationInsights } from "@/components/LocationInsights";
import { TopRatedStays } from "@/components/TopRatedStays";
import { PopularAmenities } from "@/components/PopularAmenities";
import { InteractivePropertyMarkerMap } from "@/components/InteractivePropertyMarkerMap";
import { DestinationsToExplore } from "@/components/DestinationsToExplore";

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string | number;
  price_type: string; // "daily" | "weekly" | "monthly"
  price_currency?: string;
  bedrooms?: string;
  bathrooms?: string;
  area: string | number;
  images: string[];
  property_type: string;
  features?: any;
  description?: string;
  commission_rate?: number;
  contact_name: string;
  contact_phone: string;
  is_hot_deal?: boolean;
  is_verified?: boolean;
  is_new?: boolean;
  pets_allowed?: boolean;
  latitude?: number;
  longitude?: number;
}

const num = (v: unknown) => {
  if (typeof v === "number") return v;
  const n = parseInt(String(v ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const ShortStay = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { t, currentLang } = useLanguage();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist(user?.id);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState<string>("Constantine");
  const [selectedAmenity, setSelectedAmenity] = useState<string>("");

  useScrollToTop();

  useEffect(() => {
    fetchProperties();
  }, []);

  // Re-apply filters whenever properties OR the URL query changes
  useEffect(() => {
    applyFiltersFromURL();
  }, [properties, routerLocation.search]);

  const applyFiltersFromURL = () => {
    const urlParams = new URLSearchParams(routerLocation.search);
    const location = (urlParams.get("location") || "").trim();
    const checkIn = (urlParams.get("checkIn") || "").trim();
    const checkOut = (urlParams.get("checkOut") || "").trim();
    const travelers = (urlParams.get("travelers") || "").trim();
    const filterType = (urlParams.get("filterType") || "").trim();
    const filterValue = (urlParams.get("filterValue") || "").trim();

    // Update current city for MarketDataBar
    if (location) {
      setCurrentCity(location);
    }

    let filtered = [...properties];

    if (location) {
      const l = location.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.city || "").toLowerCase().includes(l) ||
          (p.location || "").toLowerCase().includes(l)
      );
    }

    // Apply destination filters
    if (filterType && filterValue) {
      if (filterType === 'feature') {
        filtered = filtered.filter(p => p.features?.[filterValue] === true);
      } else if (filterType === 'pets') {
        filtered = filtered.filter(p => p.pets_allowed === true);
      } else if (filterType === 'price') {
        // Luxury filter: price > 20000
        filtered = filtered.filter(p => num(p.price) > 20000);
      }
    }

    // NOTE: Add check-in/out & travelers logic later when availability is modeled.

    setFilteredProperties(filtered);
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("category", "short-stay")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching properties:", error);
        return;
      }

      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Wire ShortStayHeroSearch to update the URL
  const handleSearch = (vals: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    travelers?: string | number;
  }) => {
    const qs = new URLSearchParams();
    if (vals.location) qs.set("location", String(vals.location));
    if (vals.checkIn) qs.set("checkIn", String(vals.checkIn));
    if (vals.checkOut) qs.set("checkOut", String(vals.checkOut));
    if (vals.travelers) qs.set("travelers", String(vals.travelers));
    navigate({ pathname: "/short-stay", search: qs.toString() });
  };

  const handleAmenityClick = (amenityKey: string) => {
    if (selectedAmenity === amenityKey) {
      setSelectedAmenity("");
      setFilteredProperties(properties);
    } else {
      setSelectedAmenity(amenityKey);
      const filtered = properties.filter(p => p.features?.[amenityKey]);
      setFilteredProperties(filtered);
    }
  };

  const handleDestinationClick = (destination: { type: string; value: string | boolean }) => {
    // Navigate to filtered page with search params
    const params = new URLSearchParams();
    params.set('filterType', destination.type);
    params.set('filterValue', String(destination.value));
    navigate(`/short-stay?${params.toString()}`);
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "swimmingPool":
        return <Waves className="h-4 w-4" />;
      default:
        return <Coffee className="h-4 w-4" />;
    }
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    const { translatedText: translatedTitle } = usePropertyTranslation(
      property.title,
      currentLang,
      'property_title'
    );

    const handleCardClick = () => {
      navigate(`/property/${property.id}`);
    };

    const handleWishlistClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleWishlist(property.id);
    };

    return (
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group w-full"
        onClick={handleCardClick}
      >
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={property.images?.[0] || "/placeholder-property.jpg"}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <PropertyBadges
            isHotDeal={property.is_hot_deal}
            isVerified={property.is_verified}
            isNew={property.is_new}
            showVerifiedHost={true}
            showInstantBooking={true}
            size="sm"
          />
          <div onClick={handleWishlistClick}>
            <WishlistButton
              isInWishlist={wishlistIds.has(property.id)}
              onToggle={() => {}}
            />
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-background/80 text-foreground text-xs">
              {property.price_type === "daily"
                ? t("perNight")
                : property.price_type === "weekly"
                ? t("perWeek")
                : t("perMonth")}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold text-foreground line-clamp-2">
            {translatedTitle || property.title}
          </CardTitle>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">
            {(property.city || "").trim()}
            {property.city && property.location ? ", " : ""}
            {(property.location || "").trim()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-xl sm:text-2xl font-bold text-primary">
            {formatPrice(num(property.price), property.price_type, property.price_currency)}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground text-xs sm:text-sm mb-4 flex-wrap">
          {property.bedrooms && (
            <div className="flex items-center whitespace-nowrap">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center whitespace-nowrap">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center whitespace-nowrap">
            <Square className="h-4 w-4 mr-1" />
            <span>{num(property.area)} {t("areaUnit")}</span>
          </div>
        </div>

        {property.features && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto">
            {Object.entries(property.features)
              .filter(([_, value]) => value)
              .slice(0, 3)
              .map(([key]) => (
                <div key={key} className="flex items-center text-muted-foreground text-xs flex-shrink-0">
                  {getFeatureIcon(key)}
                </div>
              ))}
          </div>
        )}

        <Button className="w-full h-12 sm:h-10 text-sm sm:text-base" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
          {t("secureYourStay") || t("bookNow")}
        </Button>
      </CardContent>
    </Card>
  );
};
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        <ShortStayHeroSearch onSearch={handleSearch} />

        {/* Popular Amenities Section */}
        <PopularAmenities 
          onAmenityClick={handleAmenityClick}
          selectedAmenity={selectedAmenity}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Interactive Map */}
            <div className="lg:col-span-1">
              <InteractivePropertyMarkerMap 
                properties={filteredProperties}
              />
            </div>

            {/* Right: Properties */}
            <div className="lg:col-span-2">
              {/* Header with Filter Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {filteredProperties.length} {t('properties') || 'properties'}
                </h2>
                <PropertyFilters 
                  onFilterChange={(filters) => {
                    let filtered = properties;

                    if (filters.location) {
                      const loc = filters.location.toLowerCase();
                      filtered = filtered.filter(
                        (p) =>
                          (p.city || "").toLowerCase().includes(loc) ||
                          (p.location || "").toLowerCase().includes(loc)
                      );
                    }

                    if (filters.propertyType !== "all") {
                      filtered = filtered.filter((p) => p.property_type === filters.propertyType);
                    }

                    if (filters.bedrooms !== "all") {
                      filtered = filtered.filter((p) => p.bedrooms === filters.bedrooms);
                    }

                    if (filters.bathrooms !== "all") {
                      filtered = filtered.filter((p) => p.bathrooms === filters.bathrooms);
                    }

                    // Short-stay price range
                    if (filters.minPrice[0] > 0 || filters.maxPrice[0] < 50000) {
                      filtered = filtered.filter((p) => {
                        const price = num(p.price);
                        return price >= filters.minPrice[0] && price <= filters.maxPrice[0];
                      });
                    }

                    // Area filtering
                    if (filters.minArea || filters.maxArea) {
                      const minArea = filters.minArea ? num(filters.minArea) : 0;
                      const maxArea = filters.maxArea ? num(filters.maxArea) : Infinity;
                      filtered = filtered.filter((p) => {
                        const area = num(p.area);
                        return area >= minArea && area <= maxArea;
                      });
                    }

                    setFilteredProperties(filtered);
                  }}
                  listingType="shortStay"
                />
              </div>

              {/* Properties Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">{t("loading")}</span>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-lg font-semibold text-foreground mb-2">
                    {t("noPropertiesFound")}
                  </div>
                  <div className="text-muted-foreground">{t("adjustFiltersOrCheckLater")}</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Rated Stays */}
        <TopRatedStays />

        {/* Destinations to Explore */}
        <DestinationsToExplore onDestinationClick={handleDestinationClick} />

        <AIChatBox />
      </main>
      <Footer />
    </div>
  );
};

export default ShortStay;
