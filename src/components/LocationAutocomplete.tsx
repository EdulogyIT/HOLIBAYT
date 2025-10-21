// src/components/LocationAutocomplete.tsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
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
  className,
}: LocationAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchLocations>>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideWrapper = wrapperRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      if (!isInsideWrapper && !isInsideDropdown) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Position & size the dropdown to match the input
  useEffect(() => {
    if (!showSuggestions) return;

    const margin = 16; // viewport margin
    const updatePosition = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();

      let left = rect.left;
      const width = rect.width; // match input width

      // Clamp left so right edge never overflows viewport
      const maxLeft = Math.max(margin, window.innerWidth - width - margin);
      left = Math.min(left, maxLeft);
      left = Math.max(margin, left);

      setDropdownPosition({
        top: rect.bottom + 8, // fixed coords: viewport-based
        left,
        width,
      });
    };

    // Run now and on next frame
    updatePosition();
    requestAnimationFrame(updatePosition);

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
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
    requestAnimationFrame(() => setShowSuggestions(false));
  };

  const handleFocus = () => {
    if (value.trim().length === 0) {
      // Popular destinations on empty
      setSuggestions([
        { name: 'Algiers Centre', type: 'district', region: 'Alger' },
        { name: 'Oran', type: 'city', region: 'Oran' },
        { name: 'Constantine', type: 'city', region: 'Constantine' },
        { name: 'Annaba', type: 'city', region: 'Annaba' },
        { name: 'Tlemcen', type: 'city', region: 'Tlemcen' },
        { name: 'Béjaïa', type: 'city', region: 'Béjaïa' },
        { name: 'Sétif', type: 'city', region: 'Sétif' },
        { name: 'Blida', type: 'city', region: 'Blida' },
        { name: 'Batna', type: 'city', region: 'Batna' },
        { name: 'Tizi Ouzou', type: 'city', region: 'Tizi Ouzou' },
        { name: 'Skikda', type: 'city', region: 'Skikda' },
        { name: 'Mostaganem', type: 'city', region: 'Mostaganem' },
        { name: 'Tipaza', type: 'city', region: 'Tipaza' },
        { name: 'Boumerdès', type: 'city', region: 'Boumerdès' },
        { name: 'Ghardaïa', type: 'city', region: 'Ghardaïa' },
      ]);
      setShowSuggestions(true);
    } else if (value.trim().length >= 2) {
      const results = searchLocations(value);
      setSuggestions(results);
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full min-w-0">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        className={cn(
          // match your hero input height; keep fully fluid
          'pl-10 pr-3 bg-background border border-input truncate h-12 sm:h-14',
          className
        )}
      />

      {showSuggestions && suggestions.length > 0 &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed bg-card border border-border rounded-xl shadow-2xl z-[100000] max-h-[60vh] overflow-y-auto backdrop-blur-sm"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {value.trim().length === 0 && (
              <div className="px-4 sm:px-5 py-3 text-sm font-medium text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-10">
                Popular destinations in Algeria
              </div>
            )}
            <ul className="divide-y divide-border/50">
              {suggestions.map((location, idx) => (
                <li key={`${location.name}-${idx}`}>
                  <button
                    className="w-full px-4 sm:px-5 py-4 text-left hover:bg-accent/60 transition-colors min-h-[48px]"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(location.name);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="font-medium text-foreground text-sm sm:text-base">
                      {location.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground capitalize mt-1">
                      {location.type} • {location.region}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}

      {showSuggestions && value.trim().length >= 2 && suggestions.length === 0 &&
        createPortal(
          <div
            className="fixed bg-card border border-border rounded-xl shadow-2xl z-[100000] p-4 text-center text-muted-foreground"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            No locations found for “{value}”
          </div>,
          document.body
        )}
    </div>
  );
}
