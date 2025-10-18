import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card } from './ui/card';
import { ZoomIn, ZoomOut, Plus, Minus, RotateCcw } from 'lucide-react';
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

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
        <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-100 via-white to-green-50 dark:from-blue-950/30 dark:via-slate-900 dark:to-green-950/30 overflow-hidden">
          {/* Algeria map background */}
          <svg 
            className="absolute inset-0 w-full h-full transition-transform duration-300" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
              cursor: 'grab'
            }}
          >
            {/* Algeria country outline */}
            <path
              d="M 15,35 L 25,25 L 35,22 L 45,20 L 55,20 L 65,22 L 75,25 L 85,30 L 90,40 L 88,50 L 85,55 L 80,58 L 70,60 L 60,62 L 50,63 L 40,62 L 30,60 L 20,55 L 15,45 Z"
              fill="rgba(200, 220, 240, 0.4)"
              stroke="rgba(100, 116, 139, 0.6)"
              strokeWidth="0.8"
              opacity="0.8"
            />
            
            {/* Coastal line for more detail */}
            <path
              d="M 15,35 L 25,30 L 40,28 L 60,28 L 75,30 L 85,32"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="0.5"
              fill="none"
            />
            
            {/* Major cities dots with labels */}
            {Object.entries(cityCoordinates).slice(0, 5).map(([city, coords]) => (
              <g key={city}>
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="1"
                  fill="rgba(100, 116, 139, 0.5)"
                  stroke="white"
                  strokeWidth="0.3"
                />
                <text
                  x={coords.x}
                  y={coords.y + 3}
                  fontSize="2.5"
                  fill="rgba(100, 116, 139, 0.7)"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {city}
                </text>
              </g>
            ))}
          </svg>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 bg-card/95 backdrop-blur border border-border rounded-lg p-2 shadow-lg z-20">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
              disabled={zoomLevel >= 3}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
              disabled={zoomLevel <= 0.5}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                setZoomLevel(1);
                setPanPosition({ x: 0, y: 0 });
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

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
                  {formatPrice(
                    typeof property.price === 'number' ? property.price : parseFloat(property.price),
                    property.price_type,
                    property.price_currency || 'DZD'
                  )}
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
                {formatPrice(
                  typeof hoveredProperty.price === 'number' ? hoveredProperty.price : parseFloat(hoveredProperty.price),
                  hoveredProperty.price_type,
                  hoveredProperty.price_currency || 'DZD'
                )}
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
