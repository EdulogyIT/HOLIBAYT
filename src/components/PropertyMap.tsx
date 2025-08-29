import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface PropertyMapProps {
  location: string;
  address?: string;
}

const PropertyMap = ({ location, address }: PropertyMapProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-playfair">
          <MapPin className="w-5 h-5 mr-2" />
          Localisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Placeholder for map - in a real app, this would be integrated with Google Maps or similar */}
          <div className="text-center space-y-2 p-4">
            <MapPin className="w-8 h-8 text-primary mx-auto" />
            <p className="font-inter font-medium text-foreground">{location}</p>
            {address && (
              <p className="font-inter text-sm text-muted-foreground">{address}</p>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm font-inter">
            <span className="font-medium text-foreground mr-2">Adresse:</span>
            <span className="text-muted-foreground">{location}</span>
          </div>
          {address && (
            <div className="flex items-center text-sm font-inter">
              <span className="font-medium text-foreground mr-2">Détails:</span>
              <span className="text-muted-foreground">{address}</span>
            </div>
          )}
        </div>
        
        {/* Interactive elements placeholder */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-inter font-medium text-foreground">Transport</div>
            <div className="text-xs font-inter text-muted-foreground mt-1">Accessible</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-inter font-medium text-foreground">Commerces</div>
            <div className="text-xs font-inter text-muted-foreground mt-1">À proximité</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyMap;