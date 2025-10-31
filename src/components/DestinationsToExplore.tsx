import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatTranslationKey } from "@/lib/utils";

interface DestinationsToExploreProps {
  onDestinationClick: (destination: { type: string; value: string | boolean }) => void;
}

// Replaced the old items with your amenity list
const destinations = [
  { labelKey: "swimming_pool", type: "amenity", value: "swimmingPool" },
  { labelKey: "air_conditioning", type: "amenity", value: "airConditioning" },
  { labelKey: "jacuzzi", type: "amenity", value: "jacuzzi" },
  { labelKey: "internet_access", type: "amenity", value: "internetAccess" },
  { labelKey: "washing_machine", type: "amenity", value: "washingMachine" },
  { labelKey: "barbecue", type: "amenity", value: "barbecue" },
  { labelKey: "parking", type: "amenity", value: "parking" },
  { labelKey: "dishwasher", type: "amenity", value: "dishwasher" },
  { labelKey: "terrace_or_balcony", type: "amenity", value: "terraceBalcony" },
  { labelKey: "microwave", type: "amenity", value: "microwave" },
  { labelKey: "sauna", type: "amenity", value: "sauna" },
  { labelKey: "fireplace", type: "amenity", value: "fireplace" },
  { labelKey: "wheelchair_accessibility", type: "amenity", value: "wheelchairAccessible" },
  { labelKey: "garden", type: "amenity", value: "garden" },
];

export const DestinationsToExplore = ({ onDestinationClick }: DestinationsToExploreProps) => {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const getTitleOrFormatted = (key: string) => {
    const translation = t(key);
    return translation === key ? formatTranslationKey(key) : translation;
  };

  const visibleDestinations = showAll ? destinations : destinations.slice(0, 8);

  return (
    <div className="w-full py-16 bg-gradient-to-b from-secondary/5 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8 font-playfair">
          {getTitleOrFormatted("destinations_with_amenities")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleDestinations.map((dest) => (
            <button
              key={dest.labelKey}
              onClick={() => onDestinationClick({ type: dest.type, value: dest.value })}
              className="
                group relative overflow-hidden rounded-lg p-6
                bg-gradient-to-br from-card to-accent/20
                border border-border hover:border-primary/50
                transition-all duration-300
                hover:shadow-lg hover:-translate-y-1
                text-left
              "
            >
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {getTitleOrFormatted(dest.labelKey)}
                </h3>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        {destinations.length > 8 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setShowAll(!showAll)} className="gap-2">
              {showAll ? (
                <>
                  {t("Show less destinations")}
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  {t("Show more destinations")}
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
