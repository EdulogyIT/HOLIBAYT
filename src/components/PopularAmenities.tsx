import { useLanguage } from "@/contexts/LanguageContext";
import { Utensils, Wifi, Waves, Car, Wind, Coffee } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatTranslationKey } from "@/lib/utils";

interface PopularAmenitiesProps {
  onAmenityClick: (amenityKey: string) => void;
  selectedAmenity?: string;
}

const amenities = [
  { key: "kitchen", icon: Utensils, labelKey: "kitchen" },
  { key: "wifi", icon: Wifi, labelKey: "wifi" },
  { key: "swimmingPool", icon: Waves, labelKey: "pool" },
  { key: "parking", icon: Car, labelKey: "parking" },
  { key: "airConditioning", icon: Wind, labelKey: "airConditioning" },
  { key: "coffeeMaker", icon: Coffee, labelKey: "coffeeMaker" },
];

export const PopularAmenities = ({ onAmenityClick, selectedAmenity }: PopularAmenitiesProps) => {
  const { t } = useLanguage();

  return (
    <div className="w-full py-16 bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8 font-playfair">
          {t('popular_amenities') || formatTranslationKey('popular_amenities')}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {amenities.map((amenity) => {
            const Icon = amenity.icon;
            const isActive = selectedAmenity === amenity.key;
            
            return (
              <Card
                key={amenity.key}
                className={`
                  p-6 cursor-pointer transition-all duration-300
                  hover:shadow-lg hover:-translate-y-1
                  ${isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                    : 'bg-card hover:bg-accent/50'
                  }
                `}
                onClick={() => onAmenityClick(amenity.key)}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <Icon className={`h-8 w-8 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {t(amenity.labelKey) || formatTranslationKey(amenity.labelKey)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
