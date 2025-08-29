import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePicker } from "./DateRangePicker";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface PropertyDatePickerProps {
  onDateChange: (dates: { checkIn: Date | undefined; checkOut: Date | undefined }) => void;
}

const PropertyDatePicker = ({ onDateChange }: PropertyDatePickerProps) => {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>();

  const handleDateRangeChange = (range?: { from?: Date; to?: Date }) => {
    setDateRange(range);
    onDateChange({ 
      checkIn: range?.from, 
      checkOut: range?.to 
    });
  };

  const calculateNights = () => {
    if (dateRange?.from && dateRange?.to) {
      const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff;
    }
    return 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair">{t('stayDates')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-inter h-12",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                t('selectDates')
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              allowPast={false}
            />
          </PopoverContent>
        </Popover>

        {/* Duration Summary */}
        {dateRange?.from && dateRange?.to && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-sm font-inter text-muted-foreground">{t('stayDuration')}</div>
              <div className="text-2xl font-playfair font-bold text-primary">
                {calculateNights()} {calculateNights() === 1 ? t('night') : t('nights')}
              </div>
              <div className="text-xs font-inter text-muted-foreground">
                {t('from')} {format(dateRange.from, "dd MMM")} {t('to')} {format(dateRange.to, "dd MMM yyyy")}
              </div>
            </div>
          </div>
        )}

        {/* Quick Selection */}
        <div className="space-y-2">
          <label className="text-sm font-inter font-medium text-foreground">{t('quickSelection')}</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="font-inter text-xs"
              onClick={() => {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                handleDateRangeChange({ from: today, to: tomorrow });
              }}
            >
              {t('oneNight')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-inter text-xs"
              onClick={() => {
                const today = new Date();
                const weekLater = new Date(today);
                weekLater.setDate(today.getDate() + 7);
                handleDateRangeChange({ from: today, to: weekLater });
              }}
            >
              {t('oneWeek')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-inter text-xs"
              onClick={() => {
                const friday = new Date();
                const dayOfWeek = friday.getDay();
                const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
                if (daysUntilFriday === 0 && friday.getDay() === 5) {
                  // It's already Friday
                } else {
                  friday.setDate(friday.getDate() + daysUntilFriday);
                }
                const sunday = new Date(friday);
                sunday.setDate(friday.getDate() + 2);
                handleDateRangeChange({ from: friday, to: sunday });
              }}
            >
              {t('weekend')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-inter text-xs"
              onClick={() => {
                const today = new Date();
                const monthLater = new Date(today);
                monthLater.setMonth(today.getMonth() + 1);
                handleDateRangeChange({ from: today, to: monthLater });
              }}
            >
              {t('oneMonth')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDatePicker;