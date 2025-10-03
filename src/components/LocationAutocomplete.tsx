import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';
import { searchLocations } from '@/data/algerianLocations';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export default function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder,
  className 
}: LocationAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchLocations>>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    if (newValue.trim().length >= 2) {
      const results = searchLocations(newValue);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (locationName: string) => {
    onChange(locationName);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (value.trim().length === 0) {
      // Show popular destinations when empty
      const popularLocations = searchLocations('alg'); // Show Algiers related
      setSuggestions([
        { name: "Algiers Centre", type: "district", region: "Alger" },
        { name: "Oran", type: "city", region: "Oran" },
        { name: "Constantine", type: "city", region: "Constantine" },
        { name: "Annaba", type: "city", region: "Annaba" },
        { name: "Tlemcen", type: "city", region: "Tlemcen" },
        { name: "Béjaïa", type: "city", region: "Béjaïa" },
      ]);
      setShowSuggestions(true);
    } else if (value.trim().length >= 2) {
      const results = searchLocations(value);
      setSuggestions(results);
      setShowSuggestions(true);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'beach':
        return '🏖️';
      case 'landmark':
        return '🏛️';
      case 'district':
        return '📍';
      default:
        return '🏙️';
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-2">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        className={cn("pl-10 bg-background border border-input", className)}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {value.trim().length === 0 && (
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50 border-b border-border">
              Popular destinations in Algeria
            </div>
          )}
          {suggestions.map((location, index) => (
            <button
              key={`${location.name}-${index}`}
              onClick={() => handleSuggestionClick(location.name)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b border-border/50 last:border-b-0"
            >
              <span className="text-xl">{getTypeIcon(location.type)}</span>
              <div className="flex-1">
                <div className="font-medium text-foreground">{location.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{location.type} • {location.region}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {showSuggestions && value.trim().length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground">
          No locations found for "{value}"
        </div>
      )}
    </div>
  );
}
