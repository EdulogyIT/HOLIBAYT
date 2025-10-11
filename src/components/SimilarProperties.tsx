import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SimilarPropertiesProps {
  currentPropertyId: string;
  city: string;
  category: string;
}

export const SimilarProperties = ({
  currentPropertyId,
  city,
  category
}: SimilarPropertiesProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [properties, setProperties] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("city", city)
          .eq("category", category)
          .eq("status", "active")
          .neq("id", currentPropertyId)
          .limit(6);

        if (!error && data) {
          setProperties(data);
        }
      } catch (err) {
        console.error("Error fetching similar properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [currentPropertyId, city, category]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">{t("similarPropertiesNearby")}</h2>
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
          <Card
            key={property.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
            onClick={() => navigate(`/property/${property.id}`)}
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={property.images?.[0] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
