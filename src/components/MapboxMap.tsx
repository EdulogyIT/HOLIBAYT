import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface MapboxMapProps {
  location: string;
  address?: string;
}

const MapboxMap = ({ location, address }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    if (mapboxToken && mapContainer.current && !map.current) {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [3.0588, 36.7538], // Default to Algiers
        zoom: 13,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add a marker for the property location
      new mapboxgl.Marker({
        color: '#0ea5e9'
      })
        .setLngLat([3.0588, 36.7538])
        .addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-playfair">
          <MapPin className="w-5 h-5 mr-2" />
          Localisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showTokenInput ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-inter">
              Pour afficher la carte interactive, veuillez entrer votre token Mapbox public.
              Vous pouvez l'obtenir sur{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary underline hover:text-primary/80"
              >
                mapbox.com
              </a>
            </p>
            <form onSubmit={handleTokenSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwgImEiOiAiY2xrcG..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="font-mono text-sm"
              />
              <Button type="submit" className="w-full">
                Charger la carte
              </Button>
            </form>
          </div>
        ) : (
          <div className="w-full h-64 bg-muted rounded-lg overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        )}
        
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

export default MapboxMap;