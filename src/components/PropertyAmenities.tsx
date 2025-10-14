import { useState } from "react";
import { 
  Wifi, 
  Tv, 
  Wind, 
  Car, 
  Waves, 
  Coffee, 
  Dumbbell, 
  Utensils,
  Snowflake,
  Heater,
  ShowerHead,
  Sofa,
  Bed,
  DoorOpen,
  Shield,
  Camera,
  Flame,
  Trees,
  Fence,
  Sun,
  Moon,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyAmenitiesProps {
  features?: any;
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  tv: Tv,
  air_conditioning: Wind,
  parking: Car,
  pool: Waves,
  kitchen: Coffee,
  gym: Dumbbell,
  restaurant: Utensils,
  heating: Heater,
  hot_water: ShowerHead,
  furnished: Sofa,
  balcony: DoorOpen,
  security: Shield,
  cctv: Camera,
  fireplace: Flame,
  garden: Trees,
  private_entrance: Fence,
  natural_light: Sun,
  quiet_area: Moon,
  available_247: Clock,
};

export const PropertyAmenities = ({ features = {} }: PropertyAmenitiesProps) => {
  const { t } = useLanguage();
  const [showAllModal, setShowAllModal] = useState(false);

  // Parse amenities from features
  const allAmenities = Object.entries(features)
    .filter(([_, value]) => value === true)
    .map(([key]) => ({
      key,
      icon: amenityIcons[key] || CheckCircle2,
      label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }));

  const displayedAmenities = allAmenities.slice(0, 8);
  const hasMore = allAmenities.length > 8;

  if (allAmenities.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">{t('whatThisPlaceOffers')}</h2>
        
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedAmenities.map((amenity) => {
              const Icon = amenity.icon;
              return (
                <div key={amenity.key} className="flex items-center gap-3 py-2">
                  <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-base">{amenity.label}</span>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <Button
              variant="outline"
              className="w-full mt-6"
              onClick={() => setShowAllModal(true)}
            >
              {t('showAllAmenities').replace('{{count}}', allAmenities.length.toString())}
            </Button>
          )}
        </Card>
      </div>

      {/* All Amenities Modal */}
      <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('allAmenities')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {allAmenities.map((amenity) => {
              const Icon = amenity.icon;
              return (
                <div key={amenity.key} className="flex items-center gap-3 py-3 border-b">
                  <Icon className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="text-base font-medium">{amenity.label}</span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
