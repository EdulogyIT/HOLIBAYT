import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string;
  price_currency?: string;
  images: string[];
  category: string;
}

interface InteractivePropertyMapProps {
  currentProperty: Property & { price_currency?: string };
}

// Algerian city coordinates
const cityCoordinates: Record<string, [number, number]> = {
  'Alger': [36.7538, 3.0588],
  'Oran': [35.6969, -0.6331],
  'Constantine': [36.3650, 6.6147],
  'Annaba': [36.9000, 7.7667],
  'Blida': [36.4800, 2.8283],
  'Batna': [35.5559, 6.1743],
  'Sétif': [36.1905, 5.4106],
  'Tlemcen': [34.8783, -1.3150],
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

const InteractivePropertyMap = ({ currentProperty }: InteractivePropertyMapProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCoords = cityCoordinates[currentProperty.city] || [36.7538, 3.0588];

  useEffect(() => {
    fetchNearbyProperties();
  }, [currentProperty.id]);

  const fetchNearbyProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, city, price, images, category')
        .eq('status', 'active')
        .eq('category', currentProperty.category)
        .eq('city', currentProperty.city)
        .neq('id', currentProperty.id)
        .limit(20);

      if (error) throw error;
      
      // Map data to include price_currency fallback
      const mappedData = (data || []).map(prop => ({
        ...prop,
        price_currency: 'DZD'
      }));
      
      setNearbyProperties(mappedData);
    } catch (error) {
      console.error('Error fetching nearby properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create custom icon for current property (larger, highlighted)
  const currentPropertyIcon = L.divIcon({
    html: `<div style="background: hsl(var(--primary)); color: white; width: 48px; height: 48px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 3px solid white;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg)">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </div>`,
    className: 'custom-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });

  // Create custom icon for nearby properties
  const createNearbyIcon = (price: string) => {
    return L.divIcon({
      html: `<div style="background: hsl(var(--accent)); color: white; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid white;">
        ${formatPrice(parseFloat(price), 'DZD')}
      </div>`,
      className: 'price-marker',
      iconSize: [60, 30],
      iconAnchor: [30, 30],
    });
  };

  // Add slight random offset to markers in same city
  const getMarkerPosition = (index: number): [number, number] => {
    const baseCoords = cityCoordinates[currentProperty.city] || [36.7538, 3.0588];
    const offset = 0.01;
    const angle = (index / nearbyProperties.length) * Math.PI * 2;
    return [
      baseCoords[0] + Math.cos(angle) * offset * (0.5 + Math.random() * 0.5),
      baseCoords[1] + Math.sin(angle) * offset * (0.5 + Math.random() * 0.5),
    ];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-playfair">
          <MapPin className="w-5 h-5 mr-2" />
          Location & Nearby Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-border">
          <MapContainer
            {...({ center: currentCoords, zoom: 13 } as any)}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              {...({ 
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              } as any)}
            />
            <MapController center={currentCoords} />

            {/* Current Property Marker */}
            <Marker {...({ position: currentCoords, icon: currentPropertyIcon } as any)}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">{currentProperty.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{currentProperty.location}</p>
                  <p className="font-bold text-primary">
                    {formatPrice(parseFloat(currentProperty.price), currentProperty.price_currency || 'DZD')}
                  </p>
                  <p className="text-xs mt-1 text-center font-medium">Current Property</p>
                </div>
              </Popup>
            </Marker>

            {/* Nearby Properties Markers */}
            {nearbyProperties.map((property, index) => (
              <Marker
                key={property.id}
                {...({ 
                  position: getMarkerPosition(index),
                  icon: createNearbyIcon(property.price),
                  eventHandlers: {
                    click: () => navigate(`/property/${property.id}`),
                  }
                } as any)}
              >
                <Popup>
                  <div className="p-2 cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                    {property.images?.[0] && (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-sm mb-1">{property.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{property.location}</p>
                    <p className="font-bold text-primary">
                      {formatPrice(parseFloat(property.price), property.price_currency || 'DZD')}
                    </p>
                    <p className="text-xs mt-1 text-primary hover:underline">Click to view →</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Property Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm font-inter">
            <span className="font-medium text-foreground mr-2">Location:</span>
            <span className="text-muted-foreground">{currentProperty.location}</span>
          </div>
          {!loading && (
            <div className="flex items-center text-sm font-inter">
              <span className="font-medium text-foreground mr-2">Nearby Properties:</span>
              <span className="text-muted-foreground">
                {nearbyProperties.length} similar {nearbyProperties.length === 1 ? 'property' : 'properties'} in {currentProperty.city}
              </span>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-inter font-medium text-foreground">Interactive Map</div>
            <div className="text-xs font-inter text-muted-foreground mt-1">Click markers to explore</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-inter font-medium text-foreground">
              <Navigation className="w-4 h-4 inline mr-1" />
              Get Directions
            </div>
            <div className="text-xs font-inter text-muted-foreground mt-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentProperty.location + ', ' + currentProperty.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractivePropertyMap;
