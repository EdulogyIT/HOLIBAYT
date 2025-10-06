import { DayPicker, DateRange } from 'react-day-picker';
import { enUS, fr } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange: (range?: { from?: Date; to?: Date }) => void;
  allowPast?: boolean;
  className?: string;
  disabledDates?: Date[];
}

const localeMap = {
  FR: fr,
  EN: enUS,
  AR: enUS // Fallback to English for Arabic as react-day-picker doesn't have Arabic locale
};

export function DateRangePicker({ 
  value, 
  onChange, 
  allowPast = true, 
  className,
  disabledDates = []
}: DateRangePickerProps) {
  const { currentLang, t } = useLanguage();
  const today = new Date();
  
  const locale = localeMap[currentLang];

  const handleClear = () => {
    onChange(undefined);
  };

  // Convert our prop format to DayPicker's expected format
  const selectedRange: DateRange | undefined = value ? {
    from: value.from,
    to: value.to
  } : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    onChange(range ? { from: range.from, to: range.to } : undefined);
  };

  // Combine disabled dates
  const disabledMatcher = [
    ...(allowPast ? [] : [{ before: today }]),
    ...disabledDates.map(date => ({
      from: date,
      to: date
    }))
  ];

  return (
    <div className={cn("rounded-xl shadow-sm p-4 bg-background border", className)}>
      <DayPicker
        mode="range"
        selected={selectedRange}
        onSelect={handleSelect}
        locale={locale}
        weekStartsOn={0}
        showOutsideDays
        captionLayout="dropdown-buttons"
        fromYear={1900}
        toYear={2100}
        disabled={disabledMatcher}
        className="pointer-events-auto"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-1 pb-4 relative items-center",
          caption_label: "hidden",
          caption_dropdowns: "flex justify-center gap-2",
          vhidden: "hidden",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "flex justify-around mb-2",
          head_cell: "text-muted-foreground w-10 font-medium text-sm text-center",
          row: "flex justify-around w-full mt-1",
          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-middle)]:rounded-none first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          day: cn(
            "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          ),
          day_range_start: "day-range-start rounded-l-md",
          day_range_end: "day-range-end rounded-r-md",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
          day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
          day_hidden: "invisible",
          dropdown: "h-10 px-4 py-2 text-lg font-semibold bg-white dark:bg-gray-800 border-2 border-input rounded-xl hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary min-w-[140px] text-center cursor-pointer transition-all shadow-sm z-50",
          dropdown_month: "h-10 px-4 py-2 text-lg font-semibold bg-white dark:bg-gray-800 border-2 border-input rounded-xl hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary min-w-[160px] text-center cursor-pointer transition-all shadow-sm z-50",
          dropdown_year: "h-10 px-4 py-2 text-lg font-semibold bg-white dark:bg-gray-800 border-2 border-input rounded-xl hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary min-w-[120px] text-center cursor-pointer transition-all shadow-sm z-50"
        }}
        components={{
          IconLeft: ({ ...props }) => (
            <svg {...props} className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          ),
          IconRight: ({ ...props }) => (
            <svg {...props} className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          ),
        }}
      />
      
      {/* Clear button */}
      <div className="mt-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleClear}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t('clear')}
        </Button>
        
        {/* Date range display */}
        {value?.from && (
          <div className="text-xs text-muted-foreground">
            {value.from.toLocaleDateString()} {value.to && `- ${value.to.toLocaleDateString()}`}
          </div>
        )}
      </div>
    </div>
  );
}