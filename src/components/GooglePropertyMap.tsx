import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GooglePropertyMapProps {
  location: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

const GooglePropertyMap = ({ location, address, latitude, longitude }: GooglePropertyMapProps) => {
  // Build the embed URL - use coordinates if available, otherwise use location string
  const getMapUrl = () => {
    if (latitude && longitude) {
      return `https://maps.google.com/maps?q=${latitude},${longitude}&output=embed`;
    }
    // Fallback to location string
    const query = encodeURIComponent(location);
    return `https://maps.google.com/maps?q=${query}&output=embed`;
  };

  const getDirectionsUrl = () => {
    if (latitude && longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }
    const query = encodeURIComponent(location);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-playfair">
          <MapPin className="w-5 h-5 mr-2" />
          Where you'll be
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Maps Embed */}
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
          <iframe
            src={getMapUrl()}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Property location map"
            className="absolute inset-0"
          />
        </div>

        {/* Location Details */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium">{location}</p>
              {address && <p className="text-sm text-muted-foreground">{address}</p>}
            </div>
          </div>
          
          {/* Get Directions Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(getDirectionsUrl(), '_blank')}
          >
            Get Directions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GooglePropertyMap;
