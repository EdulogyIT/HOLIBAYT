import { useEffect, useRef, useState } from 'react';
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

  // Refs so we can reliably detect outside clicks, regardless of Radix internals/portals
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocMouseDown = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      const triggerEl = triggerRef.current;
      const contentEl = contentRef.current;
      const clickedInsideTrigger = !!(triggerEl && triggerEl.contains(target));
      const clickedInsideContent = !!(contentEl && contentEl.contains(target));
      if (!clickedInsideTrigger && !clickedInsideContent) {
        setOpen(false); // close on any outside click
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') setOpen(false); // close on Esc
    };

    document.addEventListener('mousedown', handleDocMouseDown, true);
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('mousedown', handleDocMouseDown, true);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [open]);

  const updateCount = (type: keyof GuestCounts, delta: number) => {
    const next = Math.max(0, value[type] + delta);
    const safe = type === 'adults' ? Math.max(1, next) : next; // min 1 adult
    onChange({ ...value, [type]: safe });
  };

  // "guests" = adults + children (infants shown separately)
  const totalGuests = (value.adults ?? 0) + (value.children ?? 0);

  const rows: Array<{ key: keyof GuestCounts; label: string; desc: string; min: number; max: number }> = [
    { key: 'adults',  label: t('adults')   || 'Adults',   desc: t('ages13OrAbove') || 'Ages 13+',  min: 1, max: 16 },
    { key: 'children',label: t('children') || 'Children', desc: t('ages2to12')     || 'Ages 2–12', min: 0, max: 16 },
    { key: 'infants', label: t('infants')  || 'Infants',  desc: t('under2')        || 'Under 2',   min: 0, max: 5  },
    { key: 'pets',    label: t('pets')     || 'Pets',     desc: t('bringingServiceAnimal') || 'Service animals OK', min: 0, max: 5 },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button" // prevent form submit
          variant="outline"
          className="w-full justify-between text-left font-normal h-12 bg-white min-h-[48px]"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{t('who') || 'Who'}</span>
              <span className="text-sm">
                {totalGuests > 0
                  ? `${totalGuests} ${totalGuests === 1 ? (t('guest') || 'guest') : (t('guests') || 'guests')}`
                    + (value.infants ? `, ${value.infants} ${value.infants === 1 ? 'infant' : 'infants'}` : '')
                    + (value.pets ? `, ${value.pets} ${value.pets === 1 ? 'pet' : 'pets'}` : '')
                  : t('addGuests') || 'Add guests'}
              </span>
            </div>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        ref={contentRef}
        className="w-80 p-4 bg-background z-[100]"
        align="start"
        sideOffset={8}
        // keep these to avoid focus jank only; do NOT block outside clicks
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-4">
          {rows.map(({ key, label, desc, min, max }) => {
            const val = value[key] ?? 0;
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-muted-foreground">{desc}</div>
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
