import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { ALGIERS_DISTRICTS_GEOJSON, ALGIERS_CENTER, ALGIERS_BOUNDS } from '@/data/algiersDistricts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string | number;
  price_currency?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  images?: string[];
}

interface AlgiersDistrictMapProps {
  properties: Property[];
  selectedDistrict?: string;
  onDistrictClick?: (district: string) => void;
  onPropertyClick?: (propertyId: string) => void;
  height?: string;
}

const AlgiersDistrictMap: React.FC<AlgiersDistrictMapProps> = ({
  properties,
  selectedDistrict,
  onDistrictClick,
  onPropertyClick,
  height = '600px'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { currentLang } = useLanguage();
  const { formatPrice } = useCurrency();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      console.log('🗺️ [AlgiersDistrictMap] Starting token fetch...');
      
      const timeoutId = setTimeout(() => {
        console.error('🗺️ [AlgiersDistrictMap] Token fetch timeout');
        setError('Map loading timeout. Please refresh the page.');
        setIsLoading(false);
      }, 10000);

      try {
        const { data, error: invokeError } = await supabase.functions.invoke('get-mapbox-token');
        clearTimeout(timeoutId);
        
        console.log('🗺️ [AlgiersDistrictMap] Token response:', { data, error: invokeError });
        
        if (invokeError) {
          console.error('🗺️ [AlgiersDistrictMap] Invoke error:', invokeError);
          setError(`Failed to load map: ${invokeError.message}`);
          setIsLoading(false);
          return;
        }
        
        if (data?.token) {
          console.log('🗺️ [AlgiersDistrictMap] Token received successfully');
          setMapboxToken(data.token);
        } else {
          console.error('🗺️ [AlgiersDistrictMap] No token in response');
          setError('Map configuration missing. Please contact support.');
          setIsLoading(false);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('🗺️ [AlgiersDistrictMap] Exception:', error);
        setError('Failed to load map. Please refresh the page.');
        setIsLoading(false);
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: ALGIERS_CENTER,
      zoom: 11,
      maxBounds: ALGIERS_BOUNDS
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      addDistrictLayers();
      setIsLoading(false);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Add district boundaries and labels
  const addDistrictLayers = () => {
    if (!map.current) return;

    // Add district boundaries source
    map.current.addSource('districts', {
      type: 'geojson',
      data: ALGIERS_DISTRICTS_GEOJSON as any
    });

    // Add fill layer for districts
    map.current.addLayer({
      id: 'districts-fill',
      type: 'fill',
      source: 'districts',
      paint: {
        'fill-color': 'hsl(var(--primary))',
        'fill-opacity': [
          'case',
          ['==', ['get', 'name'], selectedDistrict || ''],
          0.3,
          0.08
        ]
      }
    });

    // Add outline layer
    map.current.addLayer({
      id: 'districts-outline',
      type: 'line',
      source: 'districts',
      paint: {
        'line-color': 'hsl(var(--primary))',
        'line-width': 2,
        'line-opacity': 0.6
      }
    });

    // Add district labels
    map.current.addLayer({
      id: 'districts-labels',
      type: 'symbol',
      source: 'districts',
      layout: {
        'text-field': ['get', currentLang === 'AR' ? 'name_ar' : currentLang === 'FR' ? 'name_fr' : 'name'],
        'text-size': 14,
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
      },
      paint: {
        'text-color': 'hsl(var(--foreground))',
        'text-halo-color': 'hsl(var(--background))',
        'text-halo-width': 2
      }
    });

    // Add click handler for districts
    map.current.on('click', 'districts-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const districtName = e.features[0].properties?.name;
        if (districtName && onDistrictClick) {
          onDistrictClick(districtName);
        }
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'districts-fill', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'districts-fill', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  };

  // Update property markers with geocoding fallback
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const addMarkersForProperties = async () => {
      const validCoords: Array<{ lng: number; lat: number }> = [];

      for (const property of properties) {
        let lat = property.latitude;
        let lng = property.longitude;

        // If no coordinates, try to geocode
        if (!lat || !lng) {
          const location = property.location;
          if (location) {
            try {
              const { geocodeAddressWithCache } = await import('@/utils/geocoding');
              const coords = await geocodeAddressWithCache(location, mapboxToken);
              if (coords) {
                lat = coords.latitude;
                lng = coords.longitude;
              }
            } catch (error) {
              console.error('Failed to geocode property:', property.id, error);
              continue;
            }
          } else {
            continue;
          }
        }

        if (!lat || !lng) continue;

        validCoords.push({ lng, lat });

        // Create custom marker with price badge
        const el = document.createElement('div');
        el.className = 'property-marker';
        
        const pricePerUnit = property.category === 'short_stay' ? '/night' : 
                             property.category === 'rent' ? '/month' : '';
        
        el.innerHTML = `
          <div style="
            background: white;
            padding: 6px 12px;
            border-radius: 20px;
            border: 2px solid hsl(var(--primary));
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: 600;
            font-size: 13px;
            color: hsl(var(--foreground));
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
          " class="property-marker-content">
            ${formatPrice(Number(property.price), property.price_currency)}${pricePerUnit}
          </div>
        `;

        el.addEventListener('mouseenter', () => {
          const content = el.querySelector('.property-marker-content') as HTMLElement;
          if (content) {
            content.style.transform = 'scale(1.1)';
            content.style.zIndex = '1000';
          }
        });

        el.addEventListener('mouseleave', () => {
          const content = el.querySelector('.property-marker-content') as HTMLElement;
          if (content) {
            content.style.transform = 'scale(1)';
            content.style.zIndex = 'auto';
          }
        });

        el.addEventListener('click', () => {
          if (onPropertyClick) {
            onPropertyClick(property.id);
          }
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      }

      // Fit bounds to show all properties
      if (validCoords.length > 0 && map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        validCoords.forEach(coord => bounds.extend([coord.lng, coord.lat]));
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 13 });
      }
    };

    addMarkersForProperties();
  }, [properties, mapboxToken, formatPrice, onPropertyClick]);

  // Update district highlight when selection changes
  useEffect(() => {
    if (!map.current || !map.current.getLayer('districts-fill')) return;

    map.current.setPaintProperty('districts-fill', 'fill-opacity', [
      'case',
      ['==', ['get', 'name'], selectedDistrict || ''],
      0.3,
      0.08
    ]);
  }, [selectedDistrict]);

  if (error) {
    return (
      <Card className="flex items-center justify-center p-8" style={{ height }}>
        <div className="text-center space-y-4">
          <div className="text-destructive">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">Try refreshing the page or contact support if the issue persists.</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-primary hover:underline"
          >
            Refresh Page
          </button>
        </div>
      </Card>
    );
  }

  if (!mapboxToken) {
    return (
      <Card className="flex items-center justify-center" style={{ height }}>
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default AlgiersDistrictMap;
