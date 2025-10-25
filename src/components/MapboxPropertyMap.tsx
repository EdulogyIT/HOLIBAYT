import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  price: string | number;
  price_type?: string;
  price_currency?: string;
  city: string;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

interface MapboxPropertyMapProps {
  properties: Property[];
}

export const MapboxPropertyMap = ({ properties }: MapboxPropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (!error && data?.token) {
          setMapboxToken(data.token);
        } else {
          // Fallback token for development
          setMapboxToken('pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTRmYm0ycDMwYWVzMnBzaHo0aTg5enBkIn0.VhY5RN5gX_zc5SjGHLqKJQ');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setMapboxToken('pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTRmYm0ycDMwYWVzMnBzaHo0aTg5enBkIn0.VhY5RN5gX_zc5SjGHLqKJQ');
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Center on Algeria
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [3.0588, 36.7538], // Algiers
      zoom: 5,
      cooperativeGestures: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Add property markers
  useEffect(() => {
    if (!map.current || !properties.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoords = false;

    properties.forEach((property) => {
      const lat = property.latitude || getCityCoords(property.city).lat;
      const lng = property.longitude || getCityCoords(property.city).lng;

      if (!lat || !lng) return;

      hasValidCoords = true;
      bounds.extend([lng, lat]);

      // Create price bubble
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.innerHTML = `
        <div style="
          background: hsl(var(--primary));
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          border: 2px solid white;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          ${formatPrice(
            typeof property.price === 'number' ? property.price : parseFloat(String(property.price)),
            property.price_type,
            property.price_currency || 'DZD'
          )}
        </div>
      `;

      el.addEventListener('click', () => {
        navigate(`/property/${property.id}`);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px; min-width: 200px;">
                ${property.images?.[0] ? `<img src="${property.images[0]}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ''}
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${property.title}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${property.location}</div>
                <div style="font-weight: 700; color: hsl(var(--primary)); font-size: 14px;">
                  ${formatPrice(
                    typeof property.price === 'number' ? property.price : parseFloat(String(property.price)),
                    property.price_type,
                    property.price_currency || 'DZD'
                  )}
                </div>
              </div>
            `)
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Fit bounds if we have valid coordinates
    if (hasValidCoords && map.current) {
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 12,
      });
    }
  }, [properties, formatPrice, navigate]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};

// Fallback city coordinates
const getCityCoords = (city: string): { lat: number; lng: number } => {
  const coords: Record<string, { lat: number; lng: number }> = {
    'Algiers': { lat: 36.7538, lng: 3.0588 },
    'Alger': { lat: 36.7538, lng: 3.0588 },
    'Oran': { lat: 35.6969, lng: -0.6331 },
    'Constantine': { lat: 36.3650, lng: 6.6147 },
    'Annaba': { lat: 36.9000, lng: 7.7667 },
    'Blida': { lat: 36.4800, lng: 2.8300 },
    'Batna': { lat: 35.5559, lng: 6.1741 },
    'Setif': { lat: 36.1905, lng: 5.4139 },
    'Tlemcen': { lat: 34.8780, lng: -1.3150 },
    'Béjaïa': { lat: 36.7525, lng: 5.0556 },
  };
  return coords[city] || { lat: 36.7538, lng: 3.0588 };
};
