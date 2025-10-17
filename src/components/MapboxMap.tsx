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
  compact?: boolean;
  latitude?: number;
  longitude?: number;
  showPropertyMarker?: boolean;
  interactive?: boolean;
  zoom?: number;
}

const MapboxMap = ({ 
  location, 
  address, 
  compact = false, 
  latitude, 
  longitude,
  showPropertyMarker = false,
  interactive = true,
  zoom = 12
}: MapboxMapProps) => {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          throw error;
        }
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
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
        mapboxgl.accessToken = mapboxToken;
        
        const useWebGL = mapboxgl.supported();
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: useWebGL ? 'mapbox://styles/mapbox/streets-v12' : 'mapbox://styles/mapbox/light-v11',
          center: [longitude || 3.0588, latitude || 36.7538],
          zoom: zoom,
          interactive: interactive,
        });

        if (interactive) {
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        // Add custom property marker
        if (showPropertyMarker) {
          const el = document.createElement('div');
          el.className = 'property-marker';
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = 'hsl(var(--primary))';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
          el.style.cursor = 'pointer';
          el.innerHTML = `
            <div style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 18px;
            ">
              📍
            </div>
          `;

          new mapboxgl.Marker({ element: el })
            .setLngLat([longitude || 3.0588, latitude || 36.7538])
            .addTo(map.current);
        } else {
          new mapboxgl.Marker({ color: '#FF6B6B' })
            .setLngLat([longitude || 3.0588, latitude || 36.7538])
            .addTo(map.current);
        }
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
  }, [mapboxToken, latitude, longitude, showPropertyMarker, interactive, zoom]);

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
