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
import PropertyFilters from "@/components/PropertyFilters";
import { useState, useEffect } from "react";
import AIChatBox from "@/components/AIChatBox";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { supabase } from "@/integrations/supabase/client";

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string | number;
  price_type: string; // "daily" | "weekly" | "monthly"
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
}

const num = (v: unknown) => {
  if (typeof v === "number") return v;
  const n = parseInt(String(v ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const ShortStay = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    // Keeping these for future use (date/guest filtering later)
    const checkIn = (urlParams.get("checkIn") || "").trim();
    const checkOut = (urlParams.get("checkOut") || "").trim();
    const travelers = (urlParams.get("travelers") || "").trim();

    let filtered = [...properties];

    if (location) {
      const l = location.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.city || "").toLowerCase().includes(l) ||
          (p.location || "").toLowerCase().includes(l)
      );
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

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.images?.[0] || "/placeholder-property.jpg"}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-primary-foreground">
            {t(property.property_type) || property.property_type}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/80 text-foreground">
            {property.price_type === "daily"
              ? t("perNight")
              : property.price_type === "weekly"
              ? t("perWeek")
              : t("perMonth")}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
          {property.title}
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
            {formatPrice(num(property.price), property.price_type)}
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
            <span>{num(property.area)} m²</span>
          </div>
        </div>

        {property.features && (
          <div className="flex items-center gap-2 mb-4">
            {Object.entries(property.features)
              .filter(([_, value]) => value)
              .slice(0, 3)
              .map(([key]) => (
                <div key={key} className="flex items-center text-muted-foreground text-xs">
                  {getFeatureIcon(key)}
                </div>
              ))}
          </div>
        )}

        <Button className="w-full" onClick={() => navigate(`/property/${property.id}`)}>
          {t("bookNow")}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Wire up search just like Rent/Buy pages */}
        <ShortStayHeroSearch onSearch={handleSearch} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
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

                  // Short-stay price range (adjust the ceiling to your context)
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
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground font-playfair">
                  {t("shortStayProperties")}
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

        <AIChatBox />
      </main>
      <Footer />
    </div>
  );
};

export default ShortStay;
