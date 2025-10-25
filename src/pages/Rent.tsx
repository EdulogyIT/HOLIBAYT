// src/pages/Rent.tsx
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RentHeroSearch from "@/components/RentHeroSearch";
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
import { MapboxPropertyMap } from "@/components/MapboxPropertyMap";
import CitiesSection from "@/components/CitiesSection";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { WishlistButton } from "@/components/WishlistButton";
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from "react";

/** ---------- Types ---------- */
interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string | number;
  price_type?: string;
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
    console.error("Rent Page ErrorBoundary caught:", err);
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
const Rent = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { t } = useLanguage();
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

  useEffect(() => {
    applyFiltersFromURL();
  }, [properties, routerLocation.search]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("category", "rent")
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
    const maxRent = (urlParams.get("maxRent") || "").trim();

    let filtered = [...properties];

    if (location) {
      const l = location.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.city || "").toLowerCase().includes(l) ||
          (p.location || "").toLowerCase().includes(l)
      );
    }

    if (type && type.toLowerCase() !== "all") {
      filtered = filtered.filter(
        (p) => (p.property_type || "").toLowerCase() === type.toLowerCase()
      );
    }

    if (maxRent && maxRent !== "0") {
      const cap = num(maxRent);
      if (cap > 0) {
        filtered = filtered.filter((p) => num(p.price) <= cap);
      }
    }

    setFilteredProperties(filtered);
  };

  const handleSearch = (vals: { location?: string; type?: string; maxRent?: string | number }) => {
    const qs = new URLSearchParams();
    if (vals.location) qs.set("location", String(vals.location));
    if (vals.type && vals.type !== "all") qs.set("type", String(vals.type));
    if (vals.maxRent && String(vals.maxRent) !== "0") qs.set("maxRent", String(vals.maxRent));
    navigate({ pathname: "/rent", search: qs.toString() });
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    const images = property.images && property.images.length > 0 ? property.images : ["/placeholder-property.jpg"];
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const isInWishlist = wishlistIds.has(property.id);

    React.useEffect(() => {
      if (!emblaApi) return;
      emblaApi.on('select', () => {
        setCurrentIndex(emblaApi.selectedScrollSnap());
      });
    }, [emblaApi]);

    return (
      <div
        className="cursor-pointer group"
        onClick={() => navigate(`/property/${property.id}`)}
      >
        <Card className="bg-transparent shadow-none border-0">
          <div className="relative w-full rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[5/4]">
            {/* Image carousel */}
            <div className="embla w-full h-full" ref={emblaRef}>
              <div className="embla__container flex h-full">
                {images.map((img, i) => (
                  <div key={i} className="embla__slide flex-[0_0_100%] min-w-0">
                    <img
                      src={img}
                      alt={`${property.title} ${i+1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder-property.jpg";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); emblaApi?.scrollPrev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md z-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); emblaApi?.scrollNext(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md z-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md z-10">
                {currentIndex + 1}/{images.length}
              </div>
            )}

            {/* Wishlist button */}
            <WishlistButton
              isInWishlist={isInWishlist}
              onToggle={() => toggleWishlist(property.id)}
            />

            {/* Verified icon */}
            {property.is_verified && (
              <span
                title="Verified"
                className="absolute left-3 bottom-12 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/85 backdrop-blur border z-10"
              >
                <ShieldCheck className="h-4 w-4" />
              </span>
            )}

            {/* Rent badge */}
            <div className="absolute bottom-3 right-3 z-10">
              <Badge variant="secondary" className="bg-background/80 text-foreground text-xs">
                {t("forRent") || "For rent"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Info below */}
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
            {formatPrice(num(property.price), property.price_type, property.price_currency)}
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
        <RentHeroSearch onSearch={handleSearch} />

        {/* Map + list identical structure to Short Stay, smaller map */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Map (narrower column & shorter height) */}
            <div className="lg:col-span-3">
              <style>{`
                .map-frame, .map-frame * { box-sizing: border-box; }
                .map-fit, .map-fit > * { height: 100% !important; width: 100% !important; }
                .map-fit :where(.mapboxgl-ctrl-legend,
                                .mapboxgl-legend,
                                .leaflet-control-legend,
                                .leaflet-legend,
                                [class*="legend"],
                                [data-legend]) { display: none !important; }
              `}</style>

              <LocalErrorBoundary
                fallback={
                  <div className="sticky top-28 rounded-2xl ring-1 ring-border bg-background grid place-items-center h-[300px] md:h-[340px] xl:h-[380px]">
                    Map unavailable
                  </div>
                }
              >
                <div className="sticky top-28 rounded-2xl overflow-hidden ring-1 ring-border h-[300px] md:h-[340px] xl:h-[380px]">
                  <MapboxPropertyMap properties={filteredProperties || []} />
                </div>
              </LocalErrorBoundary>
            </div>

            {/* Cards */}
            <div className="lg:col-span-9">
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h2 className="text-2xl font-bold">
                  {filteredProperties.length} {t("properties") || "properties"}
                </h2>
                <PropertyFilters onFilterChange={() => {}} listingType="rent" />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">{t("loading")}</span>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-lg font-semibold mb-2">
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

        <CitiesSection />
        <AIChatBox />
      </main>
      <Footer />
    </div>
  );
};

export default Rent;
