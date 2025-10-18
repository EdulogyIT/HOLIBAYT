import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
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

  // Update dropdown position when it opens or input moves
  useEffect(() => {
    if (showSuggestions && wrapperRef.current) {
      const updatePosition = () => {
        if (wrapperRef.current) {
          const rect = wrapperRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 8, // Use fixed positioning relative to viewport
            left: rect.left,
            width: rect.width
          });
        }
      };
      
      // Use requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(updatePosition);
      
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showSuggestions]);

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
      setSuggestions([
        { name: "Algiers Centre", type: "district", region: "Alger" },
        { name: "Oran", type: "city", region: "Oran" },
        { name: "Constantine", type: "city", region: "Constantine" },
        { name: "Annaba", type: "city", region: "Annaba" },
        { name: "Tlemcen", type: "city", region: "Tlemcen" },
        { name: "Béjaïa", type: "city", region: "Béjaïa" },
        { name: "Sétif", type: "city", region: "Sétif" },
        { name: "Blida", type: "city", region: "Blida" },
        { name: "Batna", type: "city", region: "Batna" },
        { name: "Tizi Ouzou", type: "city", region: "Tizi Ouzou" },
        { name: "Skikda", type: "city", region: "Skikda" },
        { name: "Mostaganem", type: "city", region: "Mostaganem" },
        { name: "Tipaza", type: "city", region: "Tipaza" },
        { name: "Boumerdès", type: "city", region: "Boumerdès" },
        { name: "Ghardaïa", type: "city", region: "Ghardaïa" },
      ]);
      setShowSuggestions(true);
    } else if (value.trim().length >= 2) {
      const results = searchLocations(value);
      setSuggestions(results);
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-2 min-w-0">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        className={cn("pl-10 bg-background border border-input", className)}
      />
      
      {showSuggestions && suggestions.length > 0 && createPortal(
        <div 
          className="fixed min-w-[400px] w-max max-w-[600px] bg-card border border-border rounded-lg shadow-2xl z-[99999] max-h-80 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            minWidth: `${Math.max(400, dropdownPosition.width)}px`
          }}
        >
          {value.trim().length === 0 && (
            <div className="px-5 py-3 text-sm font-medium text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-10">
              Popular destinations in Algeria
            </div>
          )}
          {suggestions.map((location, index) => (
            <button
              key={`${location.name}-${index}`}
              onClick={() => handleSuggestionClick(location.name)}
              className="w-full px-5 py-4 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-b-0"
            >
              <div className="flex-1">
                <div className="font-medium text-foreground text-base">{location.name}</div>
                <div className="text-sm text-muted-foreground capitalize mt-1">{location.type} • {location.region}</div>
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}
      
      {showSuggestions && value.trim().length >= 2 && suggestions.length === 0 && createPortal(
        <div 
          className="fixed bg-card border border-border rounded-lg shadow-2xl z-[99999] p-4 text-center text-muted-foreground"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          No locations found for "{value}"
        </div>,
        document.body
      )}
    </div>
  );
}
