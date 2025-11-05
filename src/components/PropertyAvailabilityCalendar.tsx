import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { PopoverClose } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format, eachDayOfInterval, parseISO, isSameDay, differenceInDays } from 'date-fns';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { calculateSmartPrice } from '@/utils/smartPricingCalculator';
import { toast } from 'sonner';

interface PropertyAvailabilityCalendarProps {
  propertyId: string;
  basePrice: string;
  priceType: string;
  currency?: string;
  minNights?: number;
  maxNights?: number;
  onDateSelect?: (dates: { checkIn: Date | undefined; checkOut: Date | undefined }) => void;
}

interface SeasonalPrice {
  start_date: string;
  end_date: string;
  price_per_night: number;
  season_name?: string;
  weekend_multiplier?: number;
}

interface DayPricing {
  date: Date;
  price: number;
  isSmartPrice: boolean;
  smartPriceReason?: string;
}

export const PropertyAvailabilityCalendar = ({
  propertyId,
  basePrice,
  priceType,
  currency = 'DZD',
  minNights = 1,
  maxNights = 365,
  onDateSelect
}: PropertyAvailabilityCalendarProps) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [loading, setLoading] = useState(true);
  const [dayPricing, setDayPricing] = useState<Map<string, DayPricing>>(new Map());

  useEffect(() => {
    fetchBookedDates();
    fetchSeasonalPricing();
  }, [propertyId]);

  const fetchBookedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;

      const dates: Date[] = [];
      data?.forEach(booking => {
        const start = parseISO(booking.check_in_date);
        const end = parseISO(booking.check_out_date);
        const interval = eachDayOfInterval({ start, end });
        dates.push(...interval);
      });

      setBookedDates(dates);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  const fetchSeasonalPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('property_seasonal_pricing')
        .select('*')
        .eq('property_id', propertyId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setSeasonalPrices(data || []);
    } catch (error) {
      console.error('Error fetching seasonal prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceForDate = (date: Date): string => {
    // Check if date has seasonal pricing
    const seasonalPrice = seasonalPrices.find(sp => {
      const start = parseISO(sp.start_date);
      const end = parseISO(sp.end_date);
      return date >= start && date <= end;
    });

    if (seasonalPrice) {
      return formatPrice(seasonalPrice.price_per_night.toString(), 'night', currency);
    }

    return formatPrice(basePrice, priceType, currency);
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date));
  };

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      // Validate min/max nights
      if (range.from && range.to) {
        const nights = differenceInDays(range.to, range.from);
        if (nights < minNights) {
          toast.error(`Minimum stay is ${minNights} night${minNights > 1 ? 's' : ''}`);
          return;
        }
        if (nights > maxNights) {
          toast.error(`Maximum stay is ${maxNights} nights`);
          return;
        }
      }
      
      setDateRange(range);
      if (onDateSelect) {
        onDateSelect({ checkIn: range.from, checkOut: range.to });
      }
    }
  };

  const clearDates = () => {
    setDateRange({ from: undefined, to: undefined });
    if (onDateSelect) {
      onDateSelect({ checkIn: undefined, checkOut: undefined });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="text-lg">
            {dateRange.from && dateRange.to
              ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
              : t('selectDates') || 'Select Dates'}
          </CardTitle>
          {priceType === 'night' && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-base">
                {formatPrice(basePrice, priceType, currency)}/night
              </Badge>
              <span className="text-xs text-muted-foreground">
                • {minNights} night min • {maxNights} night max
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            disabled={(date) => {
              if (date < new Date()) return true;
              if (isDateBooked(date)) return true;
              return false;
            }}
            modifiers={{
              booked: bookedDates,
            }}
            modifiersClassNames={{
              booked: 'line-through opacity-50 bg-destructive/10 cursor-not-allowed',
            }}
            className="rounded-md border-0 pointer-events-auto"
          />
          
          {/* Apply button footer - Airbnb style */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearDates}
              className="text-sm underline font-semibold"
            >
              Clear dates
            </Button>
            {(dateRange.from && dateRange.to) && (
              <>
                <span className="text-sm text-muted-foreground">
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </span>
                <PopoverClose asChild>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Apply
                  </Button>
                </PopoverClose>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Legend */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">{t('available') || 'Available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/20 line-through"></div>
              <span className="text-muted-foreground">{t('booked') || 'Booked'}</span>
            </div>
          </div>

          {seasonalPrices.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t('seasonalPricing') || 'Seasonal Pricing'}
              </p>
              <div className="space-y-2">
                {seasonalPrices.map((sp, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{sp.season_name || 'Season'}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(sp.start_date), 'MMM dd')} - {format(parseISO(sp.end_date), 'MMM dd')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-primary">{formatPrice(sp.price_per_night.toString(), 'night', currency)}</span>
                      {sp.weekend_multiplier && sp.weekend_multiplier !== 1 && (
                        <span className="text-xs text-muted-foreground block">
                          +{Math.round((sp.weekend_multiplier - 1) * 100)}% weekends
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
