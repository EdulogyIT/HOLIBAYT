import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Users, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface GuestsSelectorProps {
  value: GuestCounts;
  onChange: (value: GuestCounts) => void;
  keepOpen?: boolean;
}

export const GuestsSelector = ({ value, onChange, keepOpen = false }: GuestsSelectorProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const updateCount = (type: keyof GuestCounts, delta: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const newValue = Math.max(0, value[type] + delta);
    if (type === 'adults' && newValue === 0) return; // At least 1 adult required
    onChange({ ...value, [type]: newValue });
  };

  const totalGuests = value.adults + value.children + value.infants;

  const guestTypes = [
    { 
      key: 'adults' as keyof GuestCounts, 
      label: t('adults') || 'Adults', 
      description: t('ages13OrAbove') || 'Ages 13 or above',
      min: 1 
    },
    { 
      key: 'children' as keyof GuestCounts, 
      label: t('children') || 'Children', 
      description: t('ages2to12') || 'Ages 2-12',
      min: 0 
    },
    { 
      key: 'infants' as keyof GuestCounts, 
      label: t('infants') || 'Infants', 
      description: t('under2') || 'Under 2',
      min: 0 
    },
    { 
      key: 'pets' as keyof GuestCounts, 
      label: t('pets') || 'Pets', 
      description: t('bringingServiceAnimal') || 'Bringing a service animal?',
      min: 0 
    }
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between text-left font-normal h-12 bg-white min-h-[48px]"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{t('who') || 'Who'}</span>
              <span className="text-sm">
                {totalGuests > 0 
                  ? `${totalGuests} ${totalGuests === 1 ? t('guest') || 'guest' : t('guests') || 'guests'}${value.pets > 0 ? `, ${value.pets} ${value.pets === 1 ? 'pet' : 'pets'}` : ''}`
                  : t('addGuests') || 'Add guests'
                }
              </span>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 bg-background z-[100]" 
        align="center" 
        collisionPadding={10}
        onInteractOutside={(e) => {
          // Prevent closing when clicking inside the popover if keepOpen is true
          if (keepOpen) {
            e.preventDefault();
          }
        }}
      >
        <div className="space-y-4">
          {guestTypes.map((type) => (
            <div key={type.key} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-muted-foreground">{type.description}</div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => updateCount(type.key, -1, e)}
                  disabled={value[type.key] <= type.min}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{value[type.key]}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => updateCount(type.key, 1, e)}
                  disabled={type.key === 'adults' && value[type.key] >= 16}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {keepOpen && (
            <div className="pt-4 mt-4 border-t">
              <Button 
                className="w-full" 
                onClick={() => setOpen(false)}
              >
                {t('done') || 'Done'}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
