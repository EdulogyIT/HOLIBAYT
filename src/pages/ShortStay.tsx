// src/pages/ShortStay.tsx
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ShortStayHeroSearch from "@/components/ShortStayHeroSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Loader2,
  Wifi,
  Car,
  Waves,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import PropertyFilters from "@/components/PropertyFilters";
import { useState, useEffect } from "react";
import AIChatBox from "@/components/AIChatBox";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { supabase } from "@/integrations/supabase/client";
// NOTE: intentionally NOT using wishlist or property translation hooks in safe mode
import { TopRatedStays } from "@/components/TopRatedStays";
import { InteractivePropertyMarkerMap } from "@/components/InteractivePropertyMarkerMap";
import { DestinationsToExplore } from "@/components/DestinationsToExplore";
import CitiesSection from "@/components/CitiesSection";

/** ---------- Types ---------- */
interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string | number;
  price_type: "daily" | "weekly" | "monthly";
  price_currency?: string;
  bedrooms?: string;
  bathrooms?: string;
  area: string | number;
  images: string[] | null;
  property_type: string;
  features?: unknown;
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

/** ---------- Utils ---------- */
const num = (v: unknown) => {
  if (typeof v === "number") return v;
  const n = parseInt(String(v ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const safeFeatureEntries = (features: unknown): [string, unknown][] => {
  if (features && typeof features === "object" && !Array.isArray(features)) {
    try {
      return Object.entries(features as Record<string, unknown>);
    } catch {
      return [];
    }
  }
  return [];
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
      return null;
  }
};

/** ---------- Error Boundary for unstable children (map, etc.) ---------- */
import React from "react";
class LocalErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: any) {
    console.error("ShortStay ErrorBoundary caught:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            Component failed to load.
          </div>
        )
      );
    }
    return this.props.children as any;
  }
}

/** ---------- Page ---------- */
const ShortStay = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAmenity, setSelectedAmenity] = useState<string>("");

  useScrollToTop();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFiltersFromURL();
  }, [properties, routerLocation.search]);

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
        setProperties([]);
        setFilteredProperties([]);
      } else {
        setProperties((data as any) || []);
        setFilteredProperties((data as any) || []);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersFromURL = () => {
    const urlParams = new URLSearchParams(routerLocation.search);
    const location = (urlParams.get("location") || "").trim();
    const filterType = (urlParams.get("filterType") || "").trim();
    const filterValue = (urlParams.get("filterValue") || "").trim();

    let filtered = [...properties];

    if (location) {
      const l = location.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.city || "").toLowerCase().includes(l) ||
          (p.location || "").toLowerCase().includes(l)
      );
    }

    if (filterType && filterValue) {
      if (filterType === "feature") {
        filtered = filtered.filter((p) => {
          const dict = Object.fromEntries(safeFeatureEntries(p.features)) as Record<
            string,
            unknown
          >;
          return Boolean(dict[filterValue]);
        });
      } else if (filterType === "pets") {
        filtered = filtered.filter((p) => p.pets_allowed === true);
      } else if (filterType === "price") {
        filtered = filtered.filter((p) => num(p.price) > 20000);
      }
    }

    setFilteredProperties(filtered);
  };

  const handleSearch = (vals: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    travelers?: string | number;
    adults?: number;
    children?: number;
    infants?: number;
    pets?: number;
    propertyType?: string;
  }) => {
    const qs = new URLSearchParams();

    if (vals.location) qs.set("location", String(vals.location));
    if (vals.checkIn) qs.set("checkIn", String(vals.checkIn));
    if (vals.checkOut) qs.set("checkOut", String(vals.checkOut));
    qs.set("adults", String(vals.adults ?? 1));
    qs.set("children", String(vals.children ?? 0));
    qs.set("infants", String(vals.infants ?? 0));
    qs.set("pets", String(vals.pets ?? 0));
    if (vals.propertyType) qs.set("type", String(vals.propertyType));
    if (vals.travelers !== undefined) qs.set("travelers", String(vals.travelers));

    navigate({ pathname: "/short-stay", search: qs.toString() });
  };

  const handleAmenityClick = (amenityKey: string) => {
    if (selectedAmenity === amenityKey) {
      setSelectedAmenity("");
      setFilteredProperties(properties);
    } else {
      setSelectedAmenity(amenityKey);
      const filtered = properties.filter((p) => {
        const dict = Object.fromEntries(safeFeatureEntries(p.features)) as Record<
          string,
          unknown
        >;
        return Boolean(dict[amenityKey]);
      });
      setFilteredProperties(filtered);
    }
  };

  const handleDestinationClick = (destination: { type: string; value: string | boolean }) => {
    const params = new URLSearchParams();
    params.set("filterType", destination.type);
    params.set("filterValue", String(destination.value));
    navigate(`/short-stay?${params.toString()}`);
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    const firstImage =
      (Array.isArray(property.images) && property.images[0]) ||
      "/placeholder-property.jpg";

    const featureEntries = safeFeatureEntries(property.features);

    return (
      <Card className="bg-transparent shadow-none cursor-pointer group">
        {/* Image */}
        <div className="relative w-full rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[5/4]">
          <img
            src={firstImage}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder-property.jpg";
            }}
          />
          {/* Price unit chip */}
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

        {/* Text */}
        <CardHeader className="px-0 pb-0 pt-3">
          <CardTitle className="text-[15px] sm:text-base font-semibold leading-6 line-clamp-1">
            {property.title}
          </CardTitle>
          <div className="mt-0.5 flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-[13px] leading-5 line-clamp-1">
              {(property.city || "").trim()}
              {property.city && property.location ? ", " : ""}
              {(property.location || "").trim()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-0 pt-2">
          <div className="mb-2">
            <div className="text-lg md:text-xl font-bold leading-6">
              {formatPrice(num(property.price), property.price_type, property.price_currency)}
            </div>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground text-xs sm:text-[13px] leading-5">
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
              <span>
                {num(property.area)} {t("areaUnit")}
              </span>
            </div>
          </div>

          {featureEntries.length > 0 && (
            <div className="flex items-center gap-2 mt-2 overflow-x-auto">
              {featureEntries
                .filter(([_, value]) => Boolean(value))
                .slice(0, 3)
                .map(([key]) => {
                  const IconEl = getFeatureIcon(key);
                  return IconEl ? (
                    <div
                      key={key}
                      className="flex items-center text-muted-foreground text-xs flex-shrink-0"
                    >
                      {IconEl}
                    </div>
                  ) : null;
                })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20">
        <ShortStayHeroSearch onSearch={handleSearch} />

        {/* Simple amenity chips */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {[
              { key: "swimmingPool", label: "Swimming Pool" },
              { key: "wifi", label: "Wi-Fi" },
              { key: "parking", label: "Parking" },
            ].map((a) => (
              <button
                key={a.key}
                onClick={() => handleAmenityClick(a.key)}
                className={[
                  "border rounded-full px-3 py-1.5 text-sm whitespace-nowrap",
                  selectedAmenity === a.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background",
                ].join(" ")}
              >
                {a.label}
              </button>
            ))}
            {selectedAmenity && (
              <button
                onClick={() => setSelectedAmenity("")}
                className="ml-auto text-sm underline"
                title="Clear filter"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Map + list wrapped in Error Boundaries */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
              <LocalErrorBoundary
                fallback={
                  <div className="sticky top-24 h-[70vh] rounded-2xl overflow-hidden border bg-background grid place-items-center text-sm text-muted-foreground">
                    Map unavailable
                  </div>
                }
              >
                <div className="sticky top-24 h-[70vh] rounded-2xl overflow-hidden border bg-background">
                  <InteractivePropertyMarkerMap properties={filteredProperties || []} />
                </div>
              </LocalErrorBoundary>
            </div>

            <div className="lg:col-span-8">
              {/* Header — count only */}
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h2 className="text-2xl font-bold">
                  {filteredProperties.length} {t("properties") || "properties"}
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

                    if (filters.minPrice[0] > 0 || filters.maxPrice[0] < 50000) {
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
                  listingType="shortStay"
                />
              </div>

              <LocalErrorBoundary
                fallback={
                  <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                    Listings failed to render.
                  </div>
                }
              >
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
                    <div className="text-muted-foreground">{t("Adjust Filters Or Check Later")}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                    {filteredProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}
              </LocalErrorBoundary>
            </div>
          </div>
        </section>

        <TopRatedStays />
        <DestinationsToExplore onDestinationClick={handleDestinationClick} />
        <CitiesSection />
        <AIChatBox />
      </main>

      <Footer />
    </div>
  );
};

export default ShortStay;
