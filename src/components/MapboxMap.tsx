import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface MapboxMapProps {
  location: string;
  address?: string;
}

const MapboxMap = ({ location, address }: MapboxMapProps) => {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          throw new Error('No token received');
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setError('Failed to load map');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (mapboxToken && mapContainer.current && !map.current) {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [3.0588, 36.7538], // Default to Algiers
        zoom: 14,
        attributionControl: false,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add a custom marker for the property location
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.width = '32px';
      markerElement.style.height = '32px';
      markerElement.style.backgroundColor = '#0ea5e9';
      markerElement.style.borderRadius = '50%';
      markerElement.style.border = '3px solid white';
      markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      new mapboxgl.Marker({ element: markerElement })
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-playfair">
          <MapPin className="w-5 h-5 mr-2" />
          {t('locationTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground font-inter">Loading map...</p>
          </div>
        ) : error ? (
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-destructive font-inter">{error}</p>
          </div>
        ) : (
          <div className="w-full h-64 bg-muted rounded-lg overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-sm font-inter">
            <span className="font-medium text-foreground mr-2">{t('addressLabel')}:</span>
            <span className="text-muted-foreground">{location}</span>
          </div>
          {address && (
            <div className="flex items-center text-sm font-inter">
              <span className="font-medium text-foreground mr-2">{t('detailsLabel')}:</span>
              <span className="text-muted-foreground">{address}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-inter font-medium text-foreground">{t('transport')}</div>
            <div className="text-xs font-inter text-muted-foreground mt-1">{t('transportAccessible')}</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-inter font-medium text-foreground">{t('nearbyShops')}</div>
            <div className="text-xs font-inter text-muted-foreground mt-1">{t('nearbyShopsNote')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapboxMap;