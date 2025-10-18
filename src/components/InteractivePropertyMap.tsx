import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  price: number | string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  bedrooms?: number | string;
  bathrooms?: number | string;
  category?: string;
}

interface InteractivePropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertyClick?: (id: string) => void;
  height?: string;
}

const InteractivePropertyMap = ({ 
  properties, 
  selectedPropertyId,
  onPropertyClick,
  height = "600px"
}: InteractivePropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Calculate center from properties with coordinates
    const validProperties = properties.filter(p => p.latitude && p.longitude);
    
    let center: [number, number] = [3.0588, 36.7538]; // Default to Algiers
    let zoom = 6;

    if (validProperties.length > 0) {
      const avgLng = validProperties.reduce((sum, p) => sum + (p.longitude || 0), 0) / validProperties.length;
      const avgLat = validProperties.reduce((sum, p) => sum + (p.latitude || 0), 0) / validProperties.length;
      center = [avgLng, avgLat];
      zoom = validProperties.length === 1 ? 13 : 10;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
      cooperativeGestures: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoading(false);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, properties]);

  // Add property markers
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for properties with coordinates
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      // Create marker element
      const el = document.createElement('div');
      el.className = `property-marker ${selectedPropertyId === property.id ? 'active' : ''}`;
      el.innerHTML = `
        <div class="price-badge">
          ${formatPrice(typeof property.price === 'number' ? property.price : parseFloat(property.price) || 0)}
        </div>
      `;

      // Add click handler
      el.addEventListener('click', () => {
        if (onPropertyClick) {
          onPropertyClick(property.id);
        } else {
          navigate(`/property/${property.id}`);
        }
      });

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        className: 'property-popup'
      }).setHTML(`
        <div class="property-popup-card">
          ${property.images?.[0] ? `<img src="${property.images[0]}" alt="${property.title}" class="popup-image" />` : ''}
          <div class="popup-content">
            <h3 class="popup-title">${property.title}</h3>
            <p class="popup-price">${formatPrice(typeof property.price === 'number' ? property.price : parseFloat(property.price) || 0)}${property.category === 'rent' ? '/month' : ''}</p>
            ${property.bedrooms || property.bathrooms ? `
              <p class="popup-details">${Number(property.bedrooms) || 0} bed • ${Number(property.bathrooms) || 0} bath</p>
            ` : ''}
          </div>
        </div>
      `);

      // Create and add marker
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([property.longitude, property.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markers.current.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      properties.forEach(property => {
        if (property.latitude && property.longitude) {
          bounds.extend([property.longitude, property.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 13 });
    }
  }, [properties, selectedPropertyId, formatPrice, navigate, onPropertyClick, isLoading]);

  return (
    <>
      <style>{`
        .property-marker {
          cursor: pointer;
          transition: transform 0.2s ease, z-index 0s;
          position: relative;
          z-index: 1;
        }

        .property-marker:hover {
          transform: scale(1.1);
          z-index: 10 !important;
        }

        .property-marker.active {
          z-index: 5;
        }

        .price-badge {
          background: white;
          border: 1.5px solid #222;
          border-radius: 20px;
          padding: 6px 14px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          white-space: nowrap;
          transition: all 0.2s;
        }

        .property-marker:hover .price-badge {
          background: #222;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }

        .property-marker.active .price-badge {
          background: #222;
          color: white;
          border-color: #222;
          transform: scale(1.05);
        }

        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .property-popup-card {
          width: 280px;
        }

        .popup-image {
          width: 100%;
          height: 160px;
          object-fit: cover;
        }

        .popup-content {
          padding: 12px;
        }

        .popup-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 6px 0;
          color: #222;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .popup-price {
          font-size: 14px;
          font-weight: 700;
          color: #222;
          margin: 0 0 4px 0;
        }

        .popup-details {
          font-size: 13px;
          color: #717171;
          margin: 0;
        }

        .mapboxgl-popup-close-button {
          display: none;
        }

        .mapboxgl-popup-tip {
          border-top-color: white;
        }
      `}</style>
      
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height, borderRadius: '12px' }}
        className="shadow-lg"
      />
    </>
  );
};

export default InteractivePropertyMap;
