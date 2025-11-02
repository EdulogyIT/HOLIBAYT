import { supabase } from '@/integrations/supabase/client';
import { addDays, differenceInDays, isWeekend } from 'date-fns';

interface SmartPricingResult {
  smartPrice: number;
  reason: string;
  discountPercent?: number;
  surgePercent?: number;
}

export const calculateSmartPrice = async (
  propertyId: string,
  date: Date,
  basePrice: number
): Promise<SmartPricingResult> => {
  try {
    // Fetch smart pricing settings
    const { data: settings } = await supabase
      .from('smart_pricing_settings')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_enabled', true)
      .single();

    if (!settings) {
      return { smartPrice: basePrice, reason: 'Smart pricing disabled' };
    }

    let adjustedPrice = basePrice;
    let reason = '';
    let discountPercent = 0;
    let surgePercent = 0;

    // Calculate occupancy rate for ±7 days window
    if (settings.consider_occupancy) {
      const weekBefore = addDays(date, -7);
      const weekAfter = addDays(date, 7);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'payment_escrowed'])
        .gte('check_in_date', weekBefore.toISOString())
        .lte('check_out_date', weekAfter.toISOString());

      const totalDays = 14;
      const bookedDays = bookings?.length || 0;
      const occupancyRate = (bookedDays / totalDays) * 100;

      if (occupancyRate >= 70) {
        // High demand - increase price
        const increase = settings.aggressiveness_level === 'aggressive' ? 30 : 
                        settings.aggressiveness_level === 'moderate' ? 20 : 10;
        surgePercent = increase;
        adjustedPrice *= (1 + increase / 100);
        reason = 'High demand';
      } else if (occupancyRate <= 30) {
        // Low demand - decrease price
        const decrease = settings.aggressiveness_level === 'aggressive' ? 20 : 
                        settings.aggressiveness_level === 'moderate' ? 15 : 10;
        discountPercent = decrease;
        adjustedPrice *= (1 - decrease / 100);
        reason = 'Low occupancy discount';
      }
    }

    // Last-minute discount (within 7 days)
    const daysUntilDate = differenceInDays(date, new Date());
    if (daysUntilDate <= 7 && daysUntilDate >= 0) {
      const lastMinuteDiscount = 15;
      discountPercent = Math.max(discountPercent, lastMinuteDiscount);
      adjustedPrice = basePrice * (1 - lastMinuteDiscount / 100);
      reason = reason ? `${reason} + Last-minute deal` : 'Last-minute deal';
    }

    // Weekend surge pricing
    if (settings.consider_seasonality && isWeekend(date)) {
      const weekendSurge = 15;
      surgePercent += weekendSurge;
      adjustedPrice *= (1 + weekendSurge / 100);
      reason = reason ? `${reason} + Weekend` : 'Weekend premium';
    }

    // Apply min/max bounds
    adjustedPrice = Math.max(settings.min_price, Math.min(settings.max_price, adjustedPrice));

    return {
      smartPrice: Math.round(adjustedPrice * 100) / 100,
      reason: reason || 'Standard pricing',
      discountPercent: discountPercent > 0 ? discountPercent : undefined,
      surgePercent: surgePercent > 0 ? surgePercent : undefined,
    };
  } catch (error) {
    console.error('Error calculating smart price:', error);
    return { smartPrice: basePrice, reason: 'Error in calculation' };
  }
};
