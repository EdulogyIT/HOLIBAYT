import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users, CreditCard, Clock } from 'lucide-react';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format, differenceInDays, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();

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

  const nights =
    checkInDate && checkOutDate
      ? Math.max(1, differenceInDays(parseISO(checkOutDate), parseISO(checkInDate)))
      : 0;

  console.log('BookingModal Debug:', {
    propertyPrice: property.price,
    priceType: property.price_type,
    category: property.category,
    basePrice,
    dailyPrice,
    nights,
    subtotal: dailyPrice * nights
  });

  const subtotal = dailyPrice * nights;
  const bookingFee = Math.round(subtotal * 0.05 * 100) / 100; // 5% booking fee
  const securityDeposit = Math.round(subtotal * 0.2 * 100) / 100; // 20% security deposit
  let totalAmount = subtotal + bookingFee;

  // Apply minimum EUR constraint and round to 2 decimals
  const finalTotalAmount = Math.max(MIN_EUR, Math.round(totalAmount * 100) / 100);
  const finalSecurityDeposit = Math.max(MIN_EUR, Math.round(securityDeposit * 100) / 100);

  const isFormValid = Boolean(checkInDate && checkOutDate && nights > 0 && guestsCount > 0);
  const canPayBooking = isFormValid && finalTotalAmount >= MIN_EUR;
  const canPayDeposit = isFormValid && finalSecurityDeposit >= MIN_EUR;

  const generateBookingId = () => `bk_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const handlePayBooking = async () => {
    if (!canPayBooking) {
      alert(`Minimum payment amount is €${MIN_EUR}. Please increase nights or price.`);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          propertyId: property.id,
          paymentType: 'booking_fee',
          amount: finalTotalAmount,
          currency: 'EUR',
          description: `Booking fee for ${property.title}`,
          bookingData: {
            checkInDate,
            checkOutDate,
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

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          propertyId: property.id,
          paymentType: 'security_deposit',
          amount: finalSecurityDeposit,
          currency: 'EUR',
          description: `Security deposit for ${property.title}`,
          bookingData: {
            checkInDate,
            checkOutDate,
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in Date</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out Date</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>
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

              {checkInDate && checkOutDate && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <strong>Stay dates:</strong>
                  <br />
                  {format(parseISO(checkInDate), 'MMM dd, yyyy')} -{' '}
                  {format(parseISO(checkOutDate), 'MMM dd, yyyy')}
                </div>
              )}

              {isFormValid && (
                <div className="space-y-2">
                  <Button
                    onClick={handlePayBooking}
                    className="w-full"
                    size="lg"
                    disabled={!canPayBooking}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay {formatPrice(finalTotalAmount)}
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

              {!isFormValid && checkInDate && checkOutDate && nights <= 0 && (
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
