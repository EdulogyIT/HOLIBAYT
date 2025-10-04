import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StaticPropertyMapProps {
  location: string;
  address?: string;
}

const StaticPropertyMap = ({ location, address }: StaticPropertyMapProps) => {
  const { t } = useLanguage();

  // Extract city name for better Google Maps link
  const cityName = location.split(',')[0].trim();

  const handleGetDirections = () => {
    const searchQuery = encodeURIComponent(address || location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-playfair">
          <MapPin className="w-5 h-5 mr-2" />
          {t('locationTitle') || 'Location'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Static Map Visualization */}
        <div className="relative w-full h-64 bg-gradient-to-br from-muted via-muted/80 to-muted/60 rounded-lg overflow-hidden border border-border">
          {/* Map Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#map-grid)" />
            </svg>
          </div>

          {/* Location Pin - Centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Pin Shadow */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-8 h-2 bg-primary/20 rounded-full blur-sm" />
              
              {/* Pin Icon */}
              <div className="relative bg-primary text-primary-foreground rounded-full p-4 shadow-elegant animate-in zoom-in duration-500">
                <MapPin className="w-8 h-8" />
              </div>
              
              {/* Location Label */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/95 px-3 py-1.5 rounded-full border border-border shadow-sm">
                <span className="text-sm font-medium text-foreground">{cityName}</span>
              </div>
            </div>
          </div>

          {/* Decorative compass */}
          <div className="absolute top-4 right-4 opacity-30">
            <Navigation2 className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-2">
          <div className="flex items-center text-sm font-inter">
            <span className="font-medium text-foreground mr-2">{t('addressLabel') || 'Address'}:</span>
            <span className="text-muted-foreground">{location}</span>
          </div>
          {address && address !== location && (
            <div className="flex items-center text-sm font-inter">
              <span className="font-medium text-foreground mr-2">{t('detailsLabel') || 'Details'}:</span>
              <span className="text-muted-foreground">{address}</span>
            </div>
          )}
        </div>

        {/* Get Directions Button */}
        <Button 
          onClick={handleGetDirections}
          className="w-full bg-gradient-primary hover:shadow-elegant"
        >
          <Navigation2 className="w-4 h-4 mr-2" />
          {t('getDirections') || 'Get Directions'}
        </Button>

        {/* Nearby Amenities */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-inter font-medium text-foreground">
              {t('transport') || 'Public Transport'}
            </div>
            <div className="text-xs font-inter text-muted-foreground mt-1">
              {t('transportAccessible') || 'Accessible'}
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-inter font-medium text-foreground">
              {t('nearbyShops') || 'Shops'}
            </div>
            <div className="text-xs font-inter text-muted-foreground mt-1">
              {t('nearbyShopsNote') || 'Nearby'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticPropertyMap;
