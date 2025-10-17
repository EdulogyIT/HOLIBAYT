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
  compact?: boolean; // For smaller version on property pages
  latitude?: number;
  longitude?: number;
}

const MapboxMap = ({ location, address, compact = false, latitude, longitude }: MapboxMapProps) => {
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
        console.log('Fetching Mapbox token...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        console.log('Mapbox token response:', { data, error });
        
        if (error) {
          console.error('Mapbox token fetch error:', error);
          throw error;
        }
        if (data?.token) {
          console.log('Mapbox token received successfully');
          setMapboxToken(data.token);
        } else {
          console.error('No token in response:', data);
          throw new Error('No token received from edge function');
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setError(`Failed to load map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (mapboxToken && mapContainer.current && !map.current) {
      try {
        console.log('Initializing Mapbox with token:', mapboxToken.substring(0, 20) + '...');
        mapboxgl.accessToken = mapboxToken;
        
        console.log('Creating map instance...');
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [3.0588, 36.7538], // Default to Algiers
          zoom: 14,
          attributionControl: false,
        });

        console.log('Map instance created successfully');

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

        console.log('Map marker added successfully');
      } catch (err) {
        console.error('Map initialization failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Map initialization failed: ${errorMessage}`);
        setIsLoading(false);
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Compact mode: just the map without card wrapper
  if (compact) {
    return (
      <>
        {isLoading ? (
          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground font-inter">Loading map...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-destructive font-inter">{error}</p>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
        )}
      </>
    );
  }

  // Full mode: map with card wrapper and details
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