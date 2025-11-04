// src/components/short-stay/DateRangePicker.tsx
import * as React from "react";
import { DayPicker, DateRange, Matcher } from "react-day-picker";
import { enUS, fr } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange: (range?: { from?: Date; to?: Date }) => void;
  allowPast?: boolean;
  className?: string;
  disabledDates?: Date[];
  onApply?: () => void;   // use this to close popover from parent
}

const localeMap = {
  FR: fr,
  EN: enUS,
  AR: enUS, // fallback
};

export function DateRangePicker({
  value,
  onChange,
  allowPast = true,
  className,
  disabledDates = [],
  onApply,
}: DateRangePickerProps) {
  const { currentLang, t } = useLanguage();
  const locale = localeMap[currentLang];

  // normalize today to midnight
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // SSR-safe months: start with 2, adjust after mount
  const [months, setMonths] = React.useState<number>(2);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setMonths(mq.matches ? 1 : 2);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const selectedRange: DateRange | undefined = value
    ? { from: value.from, to: value.to }
    : undefined;

  const disabledMatcher: Matcher[] = [
    ...(allowPast ? [] : [{ before: today }]),
    ...disabledDates.map((d) => ({ from: d, to: d } as Matcher)),
  ];

  const handleSelect = (range: DateRange | undefined) =>
    onChange(range ? { from: range.from, to: range.to } : undefined);

  const handleClear = () => onChange(undefined);

  const hasCompleteRange = Boolean(value?.from && value?.to);

  return (
    <div
      className={cn(
        "rounded-xl shadow-sm bg-background border",
        // ensure footer never clips
        "p-3 sm:p-4 max-w-[min(92vw,720px)]",
        className
      )}
      data-testid="date-range-picker"
    >
      <DayPicker
        mode="range"
        selected={selectedRange}
        onSelect={handleSelect}
        locale={locale}
        showOutsideDays
        captionLayout={months === 1 ? "buttons" : "dropdown"}
        fromYear={1900}
        toYear={2100}
        disabled={disabledMatcher}
        numberOfMonths={months}
        className="pointer-events-auto"
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
          // If you want to guarantee mobile arrow buttons even on desktop, force captionLayout="buttons"
        }}
        classNames={{
          months: "flex flex-col sm:flex-row gap-3 sm:gap-4 sm:space-y-0",
          month: "space-y-3 w-full",
          caption: "flex justify-center pt-1 pb-3 relative items-center",
          caption_label: months === 1 ? "text-sm font-medium" : "sr-only",
          caption_dropdowns: "flex gap-2 w-full",
          vhidden: "hidden",
          nav: "flex items-center gap-1",
          nav_button: cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
            "h-10 w-10 sm:h-8 sm:w-8",
            "bg-background/80 backdrop-blur border border-input",
            "opacity-100 hover:bg-accent hover:border-accent",
            "disabled:pointer-events-none disabled:opacity-50",
            "shadow-sm"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "flex justify-around mb-2",
          head_cell: "text-muted-foreground w-10 font-medium text-sm text-center",
          row: "flex justify-around w-full mt-1",
          cell:
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-middle)]:rounded-none first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          day:
            cn(
              "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-md",
              "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            ),
          day_range_start: "day-range-start rounded-l-md",
          day_range_end: "day-range-end rounded-r-md",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today:
            "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
          day_hidden: "invisible",
          dropdown:
            "h-9 sm:h-10 px-2 sm:px-4 text-sm sm:text-base bg-white dark:bg-gray-800 border-2 border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring min-w-0",
          dropdown_month: "flex-1 min-w-0",
          dropdown_year: "w-28 sm:w-32 min-w-0",
        }}
      />

      {/* Footer: Clear + Apply + range preview */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-sm text-muted-foreground hover:text-foreground self-start"
        >
          {t("clear")}
        </Button>

        <div className="flex items-center gap-2 self-end">
          {value?.from && (
            <div className="text-xs text-muted-foreground">
              {value.from.toLocaleDateString()}{" "}
              {value.to && `- ${value.to.toLocaleDateString()}`}
            </div>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={onApply}
            disabled={!hasCompleteRange}
            className="text-sm"
          >
            {t("apply") || t("done") || "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
