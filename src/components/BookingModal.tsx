import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users, CreditCard, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format, differenceInDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DateRangePicker } from './DateRangePicker';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookingModalProps {
  property: {
    id: string;
    title: string;
    price: string;
    price_type: string;
    category: string;
  };
  trigger?: React.ReactNode;
}

export const BookingModal: React.FC<BookingModalProps> = ({ property, trigger }) => {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>();
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const { formatPrice, currentCurrency } = useCurrency();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch booked dates when modal opens
  useEffect(() => {
    if (open) {
      fetchBookedDates();
    }
  }, [open, property.id]);

  const fetchBookedDates = async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', property.id)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;

      // Generate all dates between check-in and check-out for each booking
      const allBookedDates: Date[] = [];
      bookings?.forEach((booking) => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        
        for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
          allBookedDates.push(new Date(d));
        }
      });

      setBookedDates(allBookedDates);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch booking availability",
        variant: "destructive"
      });
    }
  };

  // Check if dates are available before payment (secondary check)
  const checkDateAvailability = async () => {
    if (!dateRange?.from || !dateRange?.to) return false;
    
    setIsCheckingAvailability(true);
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', property.id)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;

      const selectedCheckIn = dateRange.from;
      const selectedCheckOut = dateRange.to;

      const hasConflict = bookings?.some(booking => {
        const bookingCheckIn = new Date(booking.check_in_date);
        const bookingCheckOut = new Date(booking.check_out_date);
        
        return (
          (selectedCheckIn >= bookingCheckIn && selectedCheckIn < bookingCheckOut) ||
          (selectedCheckOut > bookingCheckIn && selectedCheckOut <= bookingCheckOut) ||
          (selectedCheckIn <= bookingCheckIn && selectedCheckOut >= bookingCheckOut)
        );
      });

      return !hasConflict;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // ---- Stripe constraints ----
  const MIN_EUR = 1; // Reduced minimum to allow small payments

  // Calculate booking details - treat property price as EUR only
  const basePrice = Number(property.price) || 0;

  // Convert monthly/weekly price to nightly when short-stay
  let dailyPrice = basePrice;
  if (property.price_type === 'monthly' && property.category === 'short-stay') {
    dailyPrice = basePrice / 30.44;
  } else if (property.price_type === 'weekly' && property.category === 'short-stay') {
    dailyPrice = basePrice / 7;
  }

  // Calculate nights between dates (difference in days)
  const nights =
    dateRange?.from && dateRange?.to
      ? Math.max(1, differenceInDays(dateRange.to, dateRange.from))
      : 0;

  const subtotal = dailyPrice * nights;
  const bookingFee = Math.round(subtotal * 0.05 * 100) / 100; // 5% booking fee
  const securityDeposit = Math.round(subtotal * 0.2 * 100) / 100; // 20% security deposit
  let totalAmount = subtotal + bookingFee;

  // Apply minimum EUR constraint and round to 2 decimals
  const finalTotalAmount = Math.max(MIN_EUR, Math.round(totalAmount * 100) / 100);
  const finalSecurityDeposit = Math.max(MIN_EUR, Math.round(securityDeposit * 100) / 100);

  const isFormValid = Boolean(dateRange?.from && dateRange?.to && nights > 0 && guestsCount > 0);
  const canPayBooking = isFormValid && finalTotalAmount >= MIN_EUR;
  const canPayDeposit = isFormValid && finalSecurityDeposit >= MIN_EUR;

  const generateBookingId = () => `bk_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const handlePayBooking = async () => {
    if (!canPayBooking) {
      alert(`Minimum payment amount is €${MIN_EUR}. Please increase nights or price.`);
      return;
    }

    // Check date availability before proceeding
    const isAvailable = await checkDateAvailability();
    if (!isAvailable) {
      alert('Sorry, these dates are no longer available. Please select different dates.');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          propertyId: property.id,
          paymentType: 'booking_fee',
          amount: finalTotalAmount,
          currency: currentCurrency,
          description: `Booking fee for ${property.title}`,
          bookingData: {
            checkInDate: format(dateRange.from!, 'yyyy-MM-dd'),
            checkOutDate: format(dateRange.to!, 'yyyy-MM-dd'),
            guestsCount,
            specialRequests,
            contactPhone,
          }
        }
      });
      
      if (error) {
        console.error('Payment creation error:', error);
        alert(`Payment failed: ${error.message || 'Unknown error'}`);
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('No redirect URL received from payment provider');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert(`Payment failed: ${err.message || 'Network error'}`);
    }
  };

  const handlePayDeposit = async () => {
    if (!canPayDeposit) {
      alert(`Minimum deposit amount is €${MIN_EUR}.`);
      return;
    }

    // Check date availability before proceeding
    const isAvailable = await checkDateAvailability();
    if (!isAvailable) {
      alert('Sorry, these dates are no longer available. Please select different dates.');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          propertyId: property.id,
          paymentType: 'security_deposit',
          amount: finalSecurityDeposit,
          currency: currentCurrency,
          description: `Security deposit for ${property.title}`,
          bookingData: {
            checkInDate: format(dateRange.from!, 'yyyy-MM-dd'),
            checkOutDate: format(dateRange.to!, 'yyyy-MM-dd'),
            guestsCount,
            specialRequests,
            contactPhone,
          }
        }
      });
      
      if (error) {
        console.error('Deposit payment error:', error);
        alert(`Deposit payment failed: ${error.message || 'Unknown error'}`);
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('No redirect URL received from payment provider');
      }
    } catch (err) {
      console.error('Deposit payment error:', err);
      alert(`Deposit payment failed: ${err.message || 'Network error'}`);
    }
  };

  const defaultTrigger = (
    <Button size="lg" className="w-full">
      <Calendar className="w-4 h-4 mr-2" />
      Book Now
    </Button>
  );

  if (!isAuthenticated) {
    return (
      <Button size="lg" className="w-full" onClick={() => alert('Please log in to make a booking')}>
        <Calendar className="w-4 h-4 mr-2" />
        Book Now
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Book {property.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking Form */}
          <div className="space-y-4">
            <div>
              <Label>Select Dates</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Select check-in and check-out dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    allowPast={false}
                    disabledDates={bookedDates}
                  />
                </PopoverContent>
              </Popover>
              {bookedDates.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Unavailable dates are disabled in the calendar
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Contact Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="requests">Special Requests (Optional)</Label>
              <Textarea
                id="requests"
                placeholder="Any special requests or requirements..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nights > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>
                      {formatPrice(dailyPrice)} × {nights} night{nights !== 1 ? 's' : ''}
                    </span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Booking fee</span>
                    <span>{formatPrice(bookingFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(finalTotalAmount)}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Security deposit: {formatPrice(finalSecurityDeposit)} (refundable)
                    </div>
                  </div>
                </>
              )}

              {dateRange?.from && dateRange?.to && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <strong>Stay dates:</strong>
                  <br />
                  {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                  {format(dateRange.to, 'MMM dd, yyyy')}
                </div>
              )}

              {isFormValid && (
                <div className="space-y-2">
                  <Button
                    onClick={handlePayBooking}
                    className="w-full"
                    size="lg"
                    disabled={!canPayBooking || isCheckingAvailability}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isCheckingAvailability ? 'Checking availability...' : `Pay ${formatPrice(finalTotalAmount)}`}
                  </Button>
                  {!canPayBooking && (
                    <div className="text-xs text-muted-foreground">
                      Minimum charge is €{MIN_EUR}. Increase price/nights to proceed.
                    </div>
                  )}

                  {securityDeposit > 0 && (
                    <>
                      <Button
                        onClick={handlePayDeposit}
                        variant="outline"
                        className="w-full"
                        size="lg"
                        disabled={!canPayDeposit}
                      >
                        Pay Security Deposit: {formatPrice(finalSecurityDeposit)}
                      </Button>
                      {!canPayDeposit && (
                        <div className="text-xs text-muted-foreground">
                          Minimum charge is €{MIN_EUR} for deposits as well.
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {!isFormValid && dateRange?.from && dateRange?.to && nights <= 0 && (
                <div className="text-red-600 text-sm">
                  Please select valid dates (check-out must be after check-in).
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
