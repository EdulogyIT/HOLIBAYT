import * as React from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { enUS, fr } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange: (range?: { from?: Date; to?: Date }) => void;
  allowPast?: boolean;
  className?: string;
  disabledDates?: Date[];
  onClose?: () => void;
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
  onClose,
}: DateRangePickerProps) {
  const { currentLang, t } = useLanguage();
  const today = new Date();
  const locale = localeMap[currentLang];

  // responsive: 1 month on mobile, 2 on >= sm
  const [months, setMonths] = React.useState<number>(
    typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches ? 1 : 2
  );
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

  const disabledMatcher = [
    ...(allowPast ? [] : [{ before: today }]),
    ...disabledDates.map((date) => ({ from: date, to: date })),
  ];

  const handleSelect = (range: DateRange | undefined) =>
    onChange(range ? { from: range.from, to: range.to } : undefined);

  const handleClear = () => onChange(undefined);

  return (
    <div className={cn("rounded-xl shadow-sm p-3 sm:p-4 bg-background border", className)}>
      <DayPicker
        mode="range"
        selected={selectedRange}
        onSelect={handleSelect}
        locale={locale}
        weekStartsOn={0}
        showOutsideDays
        /** Use buttons on mobile (1 month) for arrow navigation, dropdown on desktop (2 months) */
        captionLayout={months === 1 ? "buttons" : "dropdown"}
        fromYear={1900}
        toYear={2100}
        disabled={disabledMatcher}
        /** responsive months */
        numberOfMonths={months}
        className="pointer-events-auto"
        classNames={{
          months:
            "flex flex-col sm:flex-row gap-3 sm:gap-4 sm:space-y-0",
          month: "space-y-3 w-full",
          caption: "flex justify-start pt-1 pb-3 items-center",
          caption_label: "sr-only",
          caption_dropdowns: "flex gap-2 w-full",
          vhidden: "hidden",
          /** nav classes are kept but not rendered because captionLayout='dropdown' */
          nav: "hidden",
          nav_button: "hidden",
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
          /** compact dropdowns on mobile, larger on sm+ */
          dropdown:
            "h-9 sm:h-10 px-2 sm:px-4 text-sm sm:text-base bg-white dark:bg-gray-800 border-2 border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring min-w-0",
          dropdown_month: "flex-1 min-w-0",
          dropdown_year: "w-28 sm:w-32 min-w-0",
        }}
      />

      {/* Clear + Done buttons + range preview */}
      <div className="mt-3 sm:mt-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t("clear")}
        </Button>

        <div className="flex items-center gap-2">
          {value?.from && (
            <div className="text-xs text-muted-foreground">
              {value.from.toLocaleDateString()}{" "}
              {value.to && `- ${value.to.toLocaleDateString()}`}
            </div>
          )}
          {onClose && (
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="text-sm"
            >
              {t("done")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
