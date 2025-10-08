import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import StaticPropertyMap from "@/components/StaticPropertyMap";

interface PropertyMapWithZoneProps {
  location: string;
  address?: string;
  onZoneSearch?: (zone: string) => void;
}

const PropertyMapWithZone = ({ location, address, onZoneSearch }: PropertyMapWithZoneProps) => {
  const handleZoneClick = (zone: string) => {
    if (onZoneSearch) {
      onZoneSearch(zone);
    }
  };

  return (
    <div className="space-y-4">
      <StaticPropertyMap location={location} address={address} />

      {/* Zone Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center font-playfair text-lg">
            <Navigation className="w-4 h-4 mr-2" />
            Nearby Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
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
                className="justify-start text-sm w-full"
              >
                <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                <span className="truncate">{zone}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyMapWithZone;
