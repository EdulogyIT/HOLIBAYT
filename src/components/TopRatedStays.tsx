import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, MapPin, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTranslationKey } from "@/lib/utils";

interface TopRatedProperty {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string | number;
  price_type: string;
  price_currency?: string;
  images: string[];
  features?: any;
}

export const TopRatedStays = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<TopRatedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTitleOrFormatted = (key: string) => {
    const translation = t(key);
    return translation === key ? formatTranslationKey(key) : translation;
  };

  useEffect(() => {
    fetchTopRatedProperties();
  }, []);

  const fetchTopRatedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("category", "short-stay")
        .eq("status", "active")
        .gte("features->average_rating", 4.5)
        .order("features->average_rating", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching top-rated properties:", error);
        return;
      }

      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching top-rated properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const num = (v: unknown) => {
    if (typeof v === "number") return v;
    const n = parseInt(String(v ?? "").replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? n : 0;
  };

  if (isLoading) {
    return (
      <div className="w-full py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 font-playfair">
            {getTitleOrFormatted('top_rated_holiday_stays')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8 font-playfair">
          {getTitleOrFormatted('top_rated_holiday_stays')}
        </h2>

        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {properties.map((property) => {
              const avgRating = property.features?.average_rating || 0;
              const totalReviews = property.features?.total_reviews || 0;

              return (
                <CarouselItem key={property.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Card
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={property.images?.[0] || "/placeholder-property.jpg"}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {avgRating > 0 && (
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                        {property.title}
                      </h3>

                      <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">
                          {property.city}
                          {property.city && property.location ? ", " : ""}
                          {property.location}
                        </span>
                      </div>

                      {totalReviews > 0 && (
                        <div className="text-xs text-muted-foreground mb-3">
                          {totalReviews} {totalReviews === 1 ? t('review') : t('reviews')}
                        </div>
                      )}

                      <div className="text-xl font-bold text-primary">
                        {formatPrice(num(property.price), property.price_type, property.price_currency)}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="-left-4" />
          <CarouselNext className="-right-4" />
        </Carousel>
      </div>
    </div>
  );
};
