import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, isWeekend, parseISO } from 'date-fns';

interface PricingBreakdown {
  nights: number;
  basePrice: number;
  nightlyRates: { date: string; rate: number; isWeekend: boolean }[];
  subtotal: number;
  lengthOfStayDiscount: { amount: number; percent: number; type: string } | null;
  earlyBirdDiscount: { amount: number; percent: number } | null;
  lastMinuteDiscount: { amount: number; percent: number } | null;
  promotionalDiscount: { amount: number; percent: number } | null;
  cleaningFee: number;
  extraGuestFee: number;
  petFee: number;
  securityDeposit: number;
  serviceFee: number;
  serviceFeePercent: number;
  taxAmount: number;
  taxRate: number;
  totalBeforeTax: number;
  total: number;
  savings: number;
}

export const calculateBookingPrice = async (
  propertyId: string,
  checkInDate: Date,
  checkOutDate: Date,
  guestCount: number,
  petCount: number = 0
): Promise<PricingBreakdown> => {
  try {
    // 1. Fetch property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('price, commission_rate')
      .eq('id', propertyId)
      .maybeSingle();

    if (propertyError || !property) {
      console.error('Property fetch error:', propertyError);
      throw new Error('Property not found');
    }

    const basePrice = parseFloat(property.price);
    const commissionRate = property.commission_rate || 0.15;

    // 2. Calculate nights
    const nights = differenceInDays(checkOutDate, checkInDate);
    if (nights < 1) throw new Error('Invalid date range');

    // 3. Fetch seasonal pricing
    const { data: seasonalPrices } = await supabase
      .from('property_seasonal_pricing')
      .select('*')
      .eq('property_id', propertyId)
      .order('start_date');

    // 4. Fetch pricing fees
    const { data: fees } = await supabase
      .from('pricing_fees')
      .select('*')
      .eq('property_id', propertyId)
      .maybeSingle();

    // 5. Fetch active pricing rules
    const { data: rules } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true);

    // 6. Calculate nightly rates with seasonal and weekend adjustments
    const nightlyRates: { date: string; rate: number; isWeekend: boolean }[] = [];
    let subtotal = 0;

    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkInDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const isWeekendDay = isWeekend(currentDate);

      // Find applicable seasonal price
      let nightRate = basePrice;
      const applicableSeason = seasonalPrices?.find(
        (season) =>
          dateStr >= season.start_date && dateStr <= season.end_date
      );

      if (applicableSeason) {
        nightRate = parseFloat(applicableSeason.price_per_night.toString());
        
        // Apply weekend multiplier if it's a weekend
        if (isWeekendDay && applicableSeason.weekend_multiplier) {
          nightRate *= parseFloat(applicableSeason.weekend_multiplier.toString());
        }
      }

      nightlyRates.push({ date: dateStr, rate: nightRate, isWeekend: isWeekendDay });
      subtotal += nightRate;
    }

    // 7. Apply length-of-stay discounts
    let lengthOfStayDiscount = null;
    const lengthRule = rules?.find(
      (r) => r.rule_type === 'length_discount' && nights >= (r.conditions as any)?.min_nights
    );
    if (lengthRule) {
      const discountAmount = (subtotal * lengthRule.discount_percent) / 100;
      lengthOfStayDiscount = {
        amount: discountAmount,
        percent: lengthRule.discount_percent,
        type: (lengthRule.conditions as any)?.type || 'length',
      };
      subtotal -= discountAmount;
    }

    // 8. Apply early bird discount
    let earlyBirdDiscount = null;
    const daysUntilCheckIn = differenceInDays(checkInDate, new Date());
    const earlyBirdRule = rules?.find(
      (r) =>
        r.rule_type === 'early_bird' &&
        daysUntilCheckIn >= (r.conditions as any)?.days_in_advance
    );
    if (earlyBirdRule) {
      const discountAmount = (subtotal * earlyBirdRule.discount_percent) / 100;
      earlyBirdDiscount = {
        amount: discountAmount,
        percent: earlyBirdRule.discount_percent,
      };
      subtotal -= discountAmount;
    }

    // 9. Apply last-minute discount
    let lastMinuteDiscount = null;
    const lastMinuteRule = rules?.find(
      (r) =>
        r.rule_type === 'last_minute' &&
        daysUntilCheckIn <= (r.conditions as any)?.days_before_checkin
    );
    if (lastMinuteRule) {
      const discountAmount = (subtotal * lastMinuteRule.discount_percent) / 100;
      lastMinuteDiscount = {
        amount: discountAmount,
        percent: lastMinuteRule.discount_percent,
      };
      subtotal -= discountAmount;
    }

    // 10. Apply promotional discount (date-specific)
    let promotionalDiscount = null;
    const promoRule = rules?.find((r) => {
      if (r.rule_type !== 'promotion') return false;
      if (!r.start_date || !r.end_date) return false;
      const today = new Date().toISOString().split('T')[0];
      return today >= r.start_date && today <= r.end_date;
    });
    if (promoRule) {
      const discountAmount = (subtotal * promoRule.discount_percent) / 100;
      promotionalDiscount = {
        amount: discountAmount,
        percent: promoRule.discount_percent,
      };
      subtotal -= discountAmount;
    }

    // 11. Add cleaning fee
    const cleaningFee = fees?.cleaning_fee ? parseFloat(fees.cleaning_fee.toString()) : 0;

    // 12. Add extra guest fee
    const extraGuestThreshold = fees?.extra_guest_threshold || 2;
    const extraGuestFee =
      guestCount > extraGuestThreshold && fees?.extra_guest_fee
        ? (guestCount - extraGuestThreshold) * parseFloat(fees.extra_guest_fee.toString())
        : 0;

    // 13. Add pet fee
    const petFee =
      petCount > 0 && fees?.pet_fee
        ? petCount * parseFloat(fees.pet_fee.toString())
        : 0;

    // 14. Calculate service fee (commission)
    const serviceFee = subtotal * commissionRate;

    // 15. Calculate tax
    const taxRate = fees?.tax_rate ? parseFloat(fees.tax_rate.toString()) : 0;
    const totalBeforeTax = subtotal + cleaningFee + extraGuestFee + petFee + serviceFee;
    const taxAmount = (totalBeforeTax * taxRate) / 100;

    // 16. Security deposit (not added to total, held separately)
    const securityDeposit = fees?.security_deposit ? parseFloat(fees.security_deposit.toString()) : 0;

    // 17. Calculate total
    const total = totalBeforeTax + taxAmount;

    // 18. Calculate total savings
    const savings =
      (lengthOfStayDiscount?.amount || 0) +
      (earlyBirdDiscount?.amount || 0) +
      (lastMinuteDiscount?.amount || 0) +
      (promotionalDiscount?.amount || 0);

    return {
      nights,
      basePrice,
      nightlyRates,
      subtotal,
      lengthOfStayDiscount,
      earlyBirdDiscount,
      lastMinuteDiscount,
      promotionalDiscount,
      cleaningFee,
      extraGuestFee,
      petFee,
      securityDeposit,
      serviceFee,
      serviceFeePercent: commissionRate * 100,
      taxAmount,
      taxRate,
      totalBeforeTax,
      total,
      savings,
    };
  } catch (error) {
    console.error('Error calculating booking price:', error);
    throw error;
  }
};
