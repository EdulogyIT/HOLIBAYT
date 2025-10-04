import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import InteractivePropertyMap from "@/components/InteractivePropertyMap";

interface PropertyMapWithZoneProps {
  location: string;
  address?: string;
  onZoneSearch?: (zone: string) => void;
  currentProperty?: any;
}

const PropertyMapWithZone = ({ location, address, onZoneSearch, currentProperty }: PropertyMapWithZoneProps) => {
  const handleZoneClick = (zone: string) => {
    if (onZoneSearch) {
      onZoneSearch(zone);
    }
  };

  return (
    <div className="space-y-4">
      {currentProperty ? (
        <InteractivePropertyMap currentProperty={currentProperty} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-playfair">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{location}</p>
            {address && <p className="text-xs text-muted-foreground mt-1">{address}</p>}
          </CardContent>
        </Card>
      )}

      {/* Zone Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center font-playfair text-lg">
            <Navigation className="w-4 h-4 mr-2" />
            Nearby Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Alger Centre",
              "Hydra",
              "Bab Ezzouar",
              "Cheraga",
              "Dar El Beida",
              "Kouba"
            ].map((zone) => (
              <Button
                key={zone}
                variant="outline"
                size="sm"
                onClick={() => handleZoneClick(zone)}
                className="justify-start text-sm"
              >
                <MapPin className="w-3 h-3 mr-2" />
                {zone}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyMapWithZone;
