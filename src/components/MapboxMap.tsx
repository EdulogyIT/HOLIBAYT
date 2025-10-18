import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { geocodeAddressWithCache } from "@/utils/geocoding";

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
  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Validate coordinates
  const hasValidCoordinates = latitude && longitude && 
    !isNaN(latitude) && !isNaN(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180;

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

  // Geocode location if coordinates are missing
  useEffect(() => {
    const geocodeLocation = async () => {
      if (hasValidCoordinates || !location || !mapboxToken || isGeocoding) return;

      setIsGeocoding(true);
      
      // Set timeout for geocoding (10 seconds)
      const timeoutId = setTimeout(() => {
        console.warn('Geocoding timeout, using default Algiers center');
        setGeocodedCoords({ lat: 36.7538, lng: 3.0588 });
        setIsGeocoding(false);
      }, 10000);

      try {
        const coords = await geocodeAddressWithCache(location, mapboxToken);
        
        clearTimeout(timeoutId);
        
        if (coords) {
          setGeocodedCoords({ lat: coords.latitude, lng: coords.longitude });
        } else {
          // Fallback to Algiers center if geocoding returns null
          setGeocodedCoords({ lat: 36.7538, lng: 3.0588 });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Geocoding failed:', error);
        // Fallback to Algiers center on error
        setGeocodedCoords({ lat: 36.7538, lng: 3.0588 });
      } finally {
        setIsGeocoding(false);
      }
    };

    geocodeLocation();
  }, [location, mapboxToken, hasValidCoordinates, isGeocoding]);

  useEffect(() => {
    if (mapboxToken && mapContainer.current && !map.current) {
      try {
        mapboxgl.accessToken = mapboxToken;
        
        // Use coordinates in priority: provided coords > geocoded coords > default Algiers center
        const displayLat = hasValidCoordinates ? latitude! : geocodedCoords?.lat ?? 36.7538;
        const displayLng = hasValidCoordinates ? longitude! : geocodedCoords?.lng ?? 3.0588;
        const shouldShowMarker = hasValidCoordinates || geocodedCoords !== null;
        
        const useWebGL = mapboxgl.supported();
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: useWebGL ? 'mapbox://styles/mapbox/streets-v12' : 'mapbox://styles/mapbox/light-v11',
          center: [displayLng, displayLat],
          zoom: zoom,
          interactive: interactive,
        });

        if (interactive) {
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        // Add custom property marker with "You are here" text
        if (showPropertyMarker && shouldShowMarker) {
          const el = document.createElement('div');
          el.className = 'you-are-here-marker';
          el.style.display = 'flex';
          el.style.flexDirection = 'column';
          el.style.alignItems = 'center';
          el.style.gap = '8px';
          el.innerHTML = `
            <style>
              @keyframes mapPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
              .marker-pin {
                animation: mapPulse 2s ease-in-out infinite;
              }
            </style>
            <div class="marker-pin" style="
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
            ">
              <div style="
                width: 50px;
                height: 50px;
                background: hsl(var(--primary));
                border: 4px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              ">
                <span style="font-size: 24px;">📍</span>
              </div>
              <div style="
                background: white;
                padding: 6px 14px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
                border: 1px solid #e5e7eb;
                color: #1f2937;
              ">
                ${t('youAreHere') || 'You are here'}
              </div>
            </div>
          `;

          new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([displayLng, displayLat])
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
  }, [mapboxToken, hasValidCoordinates, geocodedCoords, latitude, longitude, showPropertyMarker, interactive, zoom, t]);

  if (isLoading || isGeocoding) {
    const loadingMessage = isGeocoding ? 'Finding location...' : 'Loading map...';
    
    if (compact) {
      return (
        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
          </div>
        </div>
      );
    }
    
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-muted-foreground">{loadingMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    if (!hasValidCoordinates && !geocodedCoords) {
      return (
        <div className="w-full h-full bg-muted rounded-lg flex flex-col items-center justify-center p-4">
          <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground font-inter text-center">Map not available</p>
        </div>
      );
    }
    return (
      <>
        {error ? (
          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-destructive font-inter">{error}</p>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
        )}
      </>
    );
  }

  if (!hasValidCoordinates && !geocodedCoords) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center font-playfair">
            <MapPin className="w-5 h-5 mr-2" />
            {t('locationTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center p-6">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4 font-inter text-center">
              Map not available for this location
            </p>
            <Button asChild variant="outline" size="sm">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter"
              >
                View on Google Maps
              </a>
            </Button>
          </div>
          
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
        </CardContent>
      </Card>
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
        {error ? (
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
