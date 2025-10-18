import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

interface GooglePropertyMapProps {
  location: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

const GooglePropertyMap = ({ location, address, latitude, longitude }: GooglePropertyMapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Build the embed URL - use coordinates if available, otherwise use location string
  const getMapUrl = () => {
    if (latitude && longitude) {
      const url = `https://maps.google.com/maps?q=${latitude},${longitude}&output=embed`;
      console.log('🗺️ GooglePropertyMap: Using coordinates', { latitude, longitude, url });
      return url;
    }
    // Fallback to location string
    const query = encodeURIComponent(location);
    const url = `https://maps.google.com/maps?q=${query}&output=embed`;
    console.log('🗺️ GooglePropertyMap: Using location string', { location, query, url });
    return url;
  };

  console.log('🗺️ GooglePropertyMap rendered', { location, address, latitude, longitude });

  const handleIframeLoad = () => {
    console.log('🗺️ GooglePropertyMap: iframe loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    console.error('🗺️ GooglePropertyMap: iframe failed to load');
    setIsLoading(false);
    setHasError(true);
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
          {/* Loading Skeleton */}
          {isLoading && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          
          {/* Error Message */}
          {hasError && (
            <Alert variant="destructive" className="absolute inset-0 m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load map. Please try opening in{" "}
                <a 
                  href={getDirectionsUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Google Maps
                </a>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Map iframe */}
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
            onLoad={handleIframeLoad}
            onError={handleIframeError}
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
