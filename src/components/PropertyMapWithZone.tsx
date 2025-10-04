import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import StaticPropertyMap from "@/components/StaticPropertyMap";
import { useMemo } from "react";

interface PropertyMapWithZoneProps {
  location: string;            // e.g., "Algiers, Hydra"
  address?: string;            // full address if available
  lat?: number;                // coordinates for interactive map
  lng?: number;
  zoom?: number;               // optional map zoom (default 15 via StaticPropertyMap)
  zones?: string[];            // override the default nearby zones
  onZoneSearch?: (zone: string) => void; // handler invoked on zone click
}

const DEFAULT_ZONES = [
  "Alger Centre",
  "Hydra",
  "Bab Ezzouar",
  "Cheraga",
  "Dar El Beida",
  "Kouba",
];

const PropertyMapWithZone = ({
  location,
  address,
  lat,
  lng,
  zoom,
  zones = DEFAULT_ZONES,
  onZoneSearch,
}: PropertyMapWithZoneProps) => {
  // Try to extract a city to bias Google Maps when we fallback
  const cityHint = useMemo(() => location.split(",")[0].trim(), [location]);

  const handleZoneClick = (zone: string) => {
    if (onZoneSearch) {
      onZoneSearch(zone);
      return;
    }
    // Fallback: open Google Maps search for that zone (scoped by city if available)
    const q = encodeURIComponent(`${zone}${cityHint ? `, ${cityHint}` : ""}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Interactive map (or pretty static fallback if no coords) */}
      <StaticPropertyMap
        location={location}
        address={address}
        lat={lat}
        lng={lng}
        zoom={zoom}
      />

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
            {zones.map((zone) => (
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
