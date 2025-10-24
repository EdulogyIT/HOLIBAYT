// src/pages/Buy.tsx
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BuyHeroSearch from "@/components/BuyHeroSearch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Loader2, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import PropertyFilters from "@/components/PropertyFilters";
import { useState, useEffect } from "react";
import AIChatBox from "@/components/AIChatBox";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { supabase } from "@/integrations/supabase/client";
import { InteractivePropertyMarkerMap } from "@/components/InteractivePropertyMarkerMap";
import CitiesSection from "@/components/CitiesSection";
import React from "react";

/** ---------- Types ---------- */
interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string | number;
  price_type?: "daily" | "weekly" | "monthly"; // unused for sale, but kept for parity
  price_currency?: string;
  bedrooms?: string;
  bathrooms?: string;
  area: string | number;
  images: string[] | null;
  property_type: string;
  is_verified?: boolean;
}

/** ---------- Utils ---------- */
const num = (v: unknown) => {
  if (typeof v === "number") return v;
  const n = parseInt(String(v ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

/** ---------- Error Boundary ---------- */
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
    console.error("Buy Page ErrorBoundary caught:", err);
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
const Buy = () => {
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

  useEffect(() => {
    applyFiltersFromURL();
  }, [properties, routerLocation.search]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("category", "sale")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error) {
        setProperties((data as any) || []);
        setFilteredProperties((data as any) || []);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersFromURL = () => {
    const urlParams = new URLSearchParams(routerLocation.search);
    const location = (urlParams.get("location") || "").trim();
    const type = (urlParams.get("type") || "").trim();
    const budget = (urlParams.get("budget") || "").trim();

    let filtered = [...properties];

    if (location) {
      const loc = location.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.city || "").toLowerCase().includes(loc) ||
          (p.location || "").toLowerCase().includes(loc)
      );
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

  const handleSearch = (vals: { location?: string; type?: string; budget?: string | number }) => {
    const qs = new URLSearchParams();
    if (vals.location) qs.set("location", String(vals.location));
    if (vals.type && vals.type !== "all") qs.set("type", String(vals.type));
    if (vals.budget && String(vals.budget) !== "0") qs.set("budget", String(vals.budget));
    navigate({ pathname: "/buy", search: qs.toString() });
  };

  /** Image-tile-only card (text outside), identical to Short Stay style */
  const PropertyCard = ({ property }: { property: Property }) => {
    const firstImage =
      (Array.isArray(property.images) && property.images[0]) ||
      "/placeholder-property.jpg";

    return (
      <div
        className="cursor-pointer group"
        onClick={() => navigate(`/property/${property.id}`)}
      >
        {/* Image box only */}
        <Card className="bg-transparent shadow-none border-0">
          <div className="relative w-full rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[5/4]">
            <img
              src={firstImage}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/placeholder-property.jpg";
              }}
            />
            {/* Verified icon only */}
            {property.is_verified && (
              <span
                title="Verified"
                className="absolute left-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/85 backdrop-blur border"
              >
                <ShieldCheck className="h-4 w-4" />
              </span>
            )}
            {/* For-sale badge to mirror the Short Stay unit chip location */}
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-background/80 text-foreground text-xs">
                {t("forSale") || "For sale"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Info outside the box */}
        <div className="mt-2">
          <div className="text-[15px] sm:text-base font-semibold line-clamp-1">
            {property.title}
          </div>
          <div className="mt-0.5 flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-[13px] line-clamp-1">
              {(property.city || "").trim()}
              {property.city && property.location ? ", " : ""}
              {(property.location || "").trim()}
            </span>
          </div>
          <div className="mt-1 text-lg md:text-xl font-bold">
            {formatPrice(num(property.price), undefined, property.price_currency)}
          </div>
          <div className="mt-1.5 flex items-center gap-4 text-muted-foreground text-xs">
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
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <BuyHeroSearch onSearch={handleSearch} />

        {/* Map + list: identical layout to Short Stay */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Map column */}
            <div className="lg:col-span-4">
              <style>{`
                .map-frame, .map-frame * { box-sizing: border-box; }
                .map-fit, .map-fit > * { height: 100% !important; width: 100% !important; }
                .map-fit :where(.mapboxgl-ctrl-legend,
                                .mapboxgl-legend,
                                .leaflet-control-legend,
                                .leaflet-legend,
                                [class*="legend"],
                                [data-legend]) { display: none !important; }
                .map-fit :where(.mapboxgl-control-container) { margin: 0 !important; padding: 0 !important; }
              `}</style>

              <LocalErrorBoundary
                fallback={
                  <div className="sticky top-28 rounded-2xl ring-1 ring-border bg-background grid place-items-center h-[520px] md:h-[560px] xl:h-[600px]">
                    Map unavailable
                  </div>
                }
              >
                <div className="sticky top-28">
                  <div className="map-frame rounded-2xl overflow-hidden ring-1 ring-border">
                    <div className="map-fit h-[520px] md:h-[560px] xl:h-[600px]">
                      <InteractivePropertyMarkerMap
                        properties={filteredProperties || []}
                        className="h-full w-full block"
                        // If supported internally:
                        // @ts-ignore
                        hideLegend
                        // @ts-ignore
                        showLegend={false}
                        // @ts-ignore
                        legend={false}
                      />
                    </div>
                  </div>
                </div>
              </LocalErrorBoundary>
            </div>

            {/* Cards column */}
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
                      const loc = (filters.location || "").toLowerCase();
                      filtered = filtered.filter(
                        (p) =>
                          (p.city || "").toLowerCase().includes(loc) ||
                          (p.location || "").toLowerCase().includes(loc)
                      );
                    }

                    if (filters.propertyType !== "all") {
                      filtered = filtered.filter(
                        (p) => p.property_type === filters.propertyType
                      );
                    }

                    if (filters.bedrooms !== "all") {
                      filtered = filtered.filter((p) => p.bedrooms === filters.bedrooms);
                    }

                    if (filters.bathrooms !== "all") {
                      filtered = filtered.filter((p) => p.bathrooms === filters.bathrooms);
                    }

                    if (filters.minPrice[0] > 0 || filters.maxPrice[0] < 5_000_000_000) {
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
                  <div className="text-muted-foreground">{t("Adjust Filters Or Check Later")}</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

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
