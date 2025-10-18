import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card } from './ui/card';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './ui/button';

interface Property {
  id: string;
  title: string;
  price: string | number;
  price_type: string;
  price_currency?: string;
  city: string;
  location: string;
  images?: string[];
  bedrooms?: string;
  bathrooms?: string;
}

interface InteractivePropertyMarkerMapProps {
  properties: Property[];
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

// City coordinates on Algeria map (percentage-based positioning)
const cityCoordinates: Record<string, { x: number; y: number }> = {
  'Algiers': { x: 48, y: 38 },
  'Alger': { x: 48, y: 38 },
  'Oran': { x: 28, y: 42 },
  'Constantine': { x: 68, y: 32 },
  'Annaba': { x: 78, y: 28 },
  'Blida': { x: 46, y: 40 },
  'Batna': { x: 72, y: 40 },
  'Setif': { x: 64, y: 36 },
  'Tlemcen': { x: 22, y: 48 },
  'Béjaïa': { x: 58, y: 34 },
};

export const InteractivePropertyMarkerMap = ({
  properties,
  selectedCity,
  onCityChange
}: InteractivePropertyMarkerMapProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  const handleMarkerClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const getPriceColor = (price: string | number, priceType: string): string => {
    const priceStr = typeof price === 'number' ? price.toString() : price;
    const numPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    
    if (priceType === 'total') {
      // For sale properties (in millions DZD)
      if (numPrice < 10000000) return 'bg-green-500 hover:bg-green-600';
      if (numPrice < 30000000) return 'bg-orange-500 hover:bg-orange-600';
      return 'bg-red-500 hover:bg-red-600';
    } else {
      // For rent/short-stay (daily/monthly)
      if (numPrice < 50000) return 'bg-green-500 hover:bg-green-600';
      if (numPrice < 150000) return 'bg-orange-500 hover:bg-orange-600';
      return 'bg-red-500 hover:bg-red-600';
    }
  };

  const getPropertyPosition = (city: string): { x: number; y: number } => {
    return cityCoordinates[city] || { x: 50, y: 50 };
  };

  const handleMarkerHover = (property: Property, event: React.MouseEvent) => {
    setHoveredProperty(property);
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredPosition({ x: rect.left, y: rect.top });
  };

  return (
    <div className="relative w-full">
      <Card className="overflow-hidden">
        <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
          {/* Algeria map background */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Simplified Algeria outline */}
            <path
              d="M 15,35 L 25,25 L 35,22 L 45,20 L 55,20 L 65,22 L 75,25 L 85,30 L 90,40 L 88,50 L 85,55 L 80,58 L 70,60 L 60,62 L 50,63 L 40,62 L 30,60 L 20,55 L 15,45 Z"
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.3"
            />
            
            {/* Major cities dots */}
            {Object.entries(cityCoordinates).slice(0, 5).map(([city, coords]) => (
              <circle
                key={city}
                cx={coords.x}
                cy={coords.y}
                r="0.8"
                fill="hsl(var(--muted-foreground))"
                opacity="0.3"
              />
            ))}
          </svg>

          {/* Property markers */}
          <div className="absolute inset-0">
            {properties.map((property, index) => {
              const position = getPropertyPosition(property.city);
              const colorClass = getPriceColor(property.price, property.price_type);
              
              // Add slight random offset to prevent overlapping markers in same city
              const offsetX = (index % 3 - 1) * 2;
              const offsetY = (Math.floor(index / 3) % 3 - 1) * 2;
              
              return (
                <button
                  key={property.id}
                  onClick={() => handleMarkerClick(property.id)}
                  onMouseEnter={(e) => handleMarkerHover(property, e)}
                  onMouseLeave={() => setHoveredProperty(null)}
                  style={{
                    position: 'absolute',
                    left: `calc(${position.x}% + ${offsetX}px)`,
                    top: `calc(${position.y}% + ${offsetY}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`${colorClass} text-white px-3 py-1.5 rounded-full shadow-lg hover:scale-110 transition-all duration-200 font-semibold text-xs whitespace-nowrap z-10 border-2 border-white dark:border-gray-800`}
                >
                  {formatPrice(typeof property.price === 'number' ? property.price : parseFloat(property.price))}
                </button>
              );
            })}
          </div>

          {/* Hover tooltip */}
          {hoveredProperty && (
            <div 
              className="fixed bg-card border-2 border-border rounded-lg shadow-2xl p-3 z-50 pointer-events-none w-64"
              style={{
                left: `${hoveredPosition.x}px`,
                top: `${hoveredPosition.y - 120}px`,
              }}
            >
              {hoveredProperty.images?.[0] && (
                <img 
                  src={hoveredProperty.images[0]} 
                  alt={hoveredProperty.title}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
              )}
              <p className="font-semibold text-sm line-clamp-1">{hoveredProperty.title}</p>
              <p className="text-xs text-muted-foreground">{hoveredProperty.location}</p>
              <p className="text-sm font-bold text-primary mt-1">
                {formatPrice(typeof hoveredProperty.price === 'number' ? hoveredProperty.price : parseFloat(hoveredProperty.price))}
                {hoveredProperty.price_type !== 'total' && ` / ${hoveredProperty.price_type}`}
              </p>
            </div>
          )}

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg">
            <div className="text-xs font-semibold mb-2">Price Range</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Budget</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Mid-range</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Luxury</span>
              </div>
            </div>
          </div>

          {/* Property count badge */}
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg font-semibold text-sm">
            {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
          </div>
        </div>
      </Card>
    </div>
  );
};
