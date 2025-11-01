import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';

interface PropertyAvailabilityCalendarProps {
  propertyId: string;
  basePrice: string;
  priceType: string;
  currency?: string;
  onDateSelect?: (dates: { checkIn: Date | undefined; checkOut: Date | undefined }) => void;
}

interface SeasonalPrice {
  start_date: string;
  end_date: string;
  price_per_night: number;
  season_name?: string;
}

export const PropertyAvailabilityCalendar = ({
  propertyId,
  basePrice,
  priceType,
  currency = 'DZD',
  onDateSelect
}: PropertyAvailabilityCalendarProps) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [loading, setLoading] = useState(true);

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
      setDateRange(range);
      if (onDateSelect) {
        onDateSelect({ checkIn: range.from, checkOut: range.to });
      }
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('selectDates') || 'Select Dates'}</span>
          {priceType === 'night' && (
            <Badge variant="secondary">
              {formatPrice(basePrice, priceType, currency)}/night
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleDateSelect}
          numberOfMonths={2}
          disabled={(date) => {
            // Disable past dates
            if (date < new Date()) return true;
            // Disable booked dates
            if (isDateBooked(date)) return true;
            return false;
          }}
          modifiers={{
            booked: bookedDates,
          }}
          modifiersClassNames={{
            booked: 'line-through opacity-50 bg-destructive/10',
          }}
          className="rounded-md border"
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary"></div>
              <span>{t('available') || 'Available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive/10 line-through"></div>
              <span>{t('booked') || 'Booked'}</span>
            </div>
          </div>
          {seasonalPrices.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">{t('seasonalPricing') || 'Seasonal Pricing'}:</p>
              <div className="space-y-1">
                {seasonalPrices.map((sp, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                    <span>{sp.season_name || `${format(parseISO(sp.start_date), 'MMM dd')} - ${format(parseISO(sp.end_date), 'MMM dd')}`}</span>
                    <span className="font-medium">{formatPrice(sp.price_per_night.toString(), 'night', currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
