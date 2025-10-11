import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BuyHeroSearch from "@/components/BuyHeroSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import PropertyFilters from "@/components/PropertyFilters";
import { useState, useEffect } from "react";
import AIChatBox from "@/components/AIChatBox";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { WishlistButton } from "@/components/WishlistButton";
import { PropertyBadges } from "@/components/PropertyBadges";
import CitiesSection from "@/components/CitiesSection";
import PropertyMapWithZone from "@/components/PropertyMapWithZone";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string | number;
  price_type: string;
  price_currency?: string;
  bedrooms?: string;
  bathrooms?: string;
  area: string | number;
  images: string[];
  property_type: string;
  features?: any;
  description?: string;
  contact_name: string;
  contact_phone: string;
  is_hot_deal?: boolean;
  is_verified?: boolean;
  is_new?: boolean;
}

const num = (v: unknown) => {
  if (typeof v === "number") return v;
  const n = parseInt(String(v ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const Buy = () => {
  const navigate = useNavigate();
  const locationHook = useLocation();
  const { t, currentLang } = useLanguage();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist(user?.id);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useScrollToTop();

  useEffect(() => {
    fetchProperties();
  }, []);

  // Apply filters whenever properties OR URL query changes
  useEffect(() => {
    applyFiltersFromURL();
  }, [properties, locationHook.search]); // ⬅️ include search

  const applyFiltersFromURL = () => {
    const urlParams = new URLSearchParams(locationHook.search);
    const location = urlParams.get("location")?.trim() || "";
    const type = urlParams.get("type")?.trim() || "";
    const budget = urlParams.get("budget")?.trim() || "";

    let filtered = [...properties];

    if (location) {
      const loc = location.toLowerCase();
      filtered = filtered.filter((p) => {
        const city = (p.city || "").toLowerCase();
        const addr = (p.location || "").toLowerCase();
        return city.includes(loc) || addr.includes(loc);
      });
    }

    if (type && type.toLowerCase() !== "all") {
      filtered = filtered.filter(
        (p) => (p.property_type || "").toLowerCase() === type.toLowerCase()
      );
    }

    if (budget && budget !== "0") {
      const maxBudget = num(budget);
      if (maxBudget > 0) {
        filtered = filtered.filter((p) => num(p.price) <= maxBudget);
      }
    }

    setFilteredProperties(filtered);
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("category", "sale")
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

  // ⬇️ Pass this to BuyHeroSearch so clicking "Search" updates the URL
  const handleSearch = (vals: { location?: string; type?: string; budget?: string | number }) => {
    const qs = new URLSearchParams();
    if (vals.location) qs.set("location", vals.location);
    if (vals.type && vals.type !== "all") qs.set("type", String(vals.type));
    if (vals.budget && String(vals.budget) !== "0") qs.set("budget", String(vals.budget));
    navigate({ pathname: "/buy", search: qs.toString() });
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
        className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
        onClick={handleCardClick}
      >
        <div className="relative h-48 overflow-hidden">
          <PropertyBadges 
            isHotDeal={property.is_hot_deal}
            isVerified={property.is_verified}
            isNew={property.is_new}
          />
          <div onClick={handleWishlistClick}>
            <WishlistButton 
              isInWishlist={wishlistIds.has(property.id)}
              onToggle={() => {}}
            />
          </div>
          <img
            src={property.images?.[0] || "/lovable-uploads/b974fb79-9873-41fb-b3ad-9b4bf38b8a77.png"}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
            {translatedTitle || property.title}
          </CardTitle>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {(property.city || "").trim()}
            {property.city && property.location ? ", " : ""}
            {(property.location || "").trim()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-primary">
            {formatPrice(num(property.price), property.price_type, property.price_currency)}
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{num(property.area)} {t("areaUnit")}</span>
          </div>
        </div>

        <Button className="w-full" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
          {t("viewDetails")}
        </Button>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* ⬇️ wire up the search */}
        <BuyHeroSearch onSearch={handleSearch} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar with Map */}
            <div className="lg:w-1/4 space-y-6">
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

                  if (filters.minPrice[0] > 0 || filters.maxPrice[0] < 5000000000) {
                    filtered = filtered.filter((p) => {
                      const price = num(p.price);
                      return price >= filters.minPrice[0] && price <= filters.maxPrice[0];
                    });
                  }

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
                listingType="buy"
              />

              {/* Map and Nearby Zones in Sidebar */}
              <PropertyMapWithZone 
                location="Algeria"
                onZoneSearch={(zone) => {
                  const filtered = properties.filter(p => 
                    (p.city || "").toLowerCase().includes(zone.toLowerCase()) ||
                    (p.location || "").toLowerCase().includes(zone.toLowerCase())
                  );
                  setFilteredProperties(filtered);
                }}
              />
            </div>

            {/* Properties Grid */}
            <div className="lg:w-3/4 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground font-playfair">
                  {t("propertiesForSale")}
                </h2>
                <div className="text-muted-foreground">
                  {filteredProperties.length} {t("properties")} {t("found")}
                </div>
              </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="py-16">
          <CitiesSection />
        </div>

        <AIChatBox />
      </main>
      <Footer />
    </div>
  );
};

export default Buy;
