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
}

export const GuestsSelector = ({ value, onChange }: GuestsSelectorProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const updateCount = (type: keyof GuestCounts, delta: number) => {
    const next = Math.max(0, value[type] + delta);
    const safe = type === 'adults' ? Math.max(1, next) : next; // min 1 adult
    onChange({ ...value, [type]: safe });
  };

  const totalGuests = (value.adults ?? 0) + (value.children ?? 0);

  const guestTypes = [
    { key: 'adults' as const, label: t('adults') || 'Adults', description: t('ages13OrAbove') || 'Ages 13 or above', min: 1, max: 16 },
    { key: 'children' as const, label: t('children') || 'Children', description: t('ages2to12') || 'Ages 2–12', min: 0, max: 16 },
    { key: 'infants' as const, label: t('infants') || 'Infants', description: t('under2') || 'Under 2', min: 0, max: 5 },
    { key: 'pets' as const, label: t('pets') || 'Pets', description: t('bringingServiceAnimal') || 'Bringing a service animal?', min: 0, max: 5 },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between text-left font-normal h-12 bg-white min-h-[48px]"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{t('who') || 'Who'}</span>
              <span className="text-sm">
                {totalGuests > 0
                  ? `${totalGuests} ${totalGuests === 1 ? (t('guest') || 'guest') : (t('guests') || 'guests')}${
                      value.infants ? `, ${value.infants} ${value.infants === 1 ? 'infant' : 'infants'}` : ''
                    }${value.pets ? `, ${value.pets} ${value.pets === 1 ? 'pet' : 'pets'}` : ''}`
                  : t('addGuests') || 'Add guests'}
              </span>
            </div>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-4 bg-background z-[100]"
        align="start"
        sideOffset={8}
        // keep these to avoid focus jank; they do NOT block outside-click closing
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-4">
          {guestTypes.map(({ key, label, description, min, max }) => {
            const val = value[key] ?? 0;
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (val > min) updateCount(key, -1);
                    }}
                    disabled={val <= min}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="w-8 text-center font-medium tabular-nums">{val}</span>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (val < max) updateCount(key, +1);
                    }}
                    disabled={val >= max}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            {t('done') || 'Done'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
