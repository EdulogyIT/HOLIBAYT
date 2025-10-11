import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface RecentlySoldRentedProps {
  city: string;
  category: "buy" | "rent";
}

export const RecentlySoldRented = ({ city, category }: RecentlySoldRentedProps) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [properties, setProperties] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProperties = async () => {
      try {
        // Fetch recently updated properties with bookings
        const { data, error } = await supabase
          .from("properties")
          .select(`
            *,
            bookings!inner(status, created_at)
          `)
          .eq("city", city)
          .eq("category", category === "buy" ? "buy" : "rent")
          .in("bookings.status", ["completed"])
          .order("bookings.created_at", { ascending: false })
          .limit(6);

        if (!error && data) {
          // Remove duplicates and format data
          const uniqueProperties = data.reduce((acc: any[], current) => {
            if (!acc.find(item => item.id === current.id)) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          setProperties(uniqueProperties);
        }
      } catch (err) {
        console.error("Error fetching recent properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProperties();
  }, [city, category]);

  if (loading || properties.length === 0) return null;

  const visibleProperties = properties.slice(currentIndex, currentIndex + 3);

  const nextSlide = () => {
    if (currentIndex + 3 < properties.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const statusBadge = category === "buy" ? "Sold" : "Rented";
  const title = category === "buy" ? t("recentlySoldInArea") : t("recentlyRented");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentIndex + 3 >= properties.length}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {visibleProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden relative">
            <Badge className="absolute top-4 left-4 z-10 bg-primary">
              {statusBadge}
            </Badge>
            <div className="aspect-video overflow-hidden opacity-75">
              <img
                src={property.images?.[0] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-1">{property.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
              <p className="text-lg font-bold text-primary">
                {formatPrice(parseFloat(property.price), property.price_currency || "DZD")}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
