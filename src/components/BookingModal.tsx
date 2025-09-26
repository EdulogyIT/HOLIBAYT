import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users, CreditCard, Clock } from 'lucide-react';
import { PaymentButton } from '@/components/PaymentButton';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format, differenceInDays, parseISO } from 'date-fns';

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
  const { formatPrice, currentCurrency } = useCurrency();
  const { isAuthenticated } = useAuth();

  // Calculate booking details
  const rawPrice = parseFloat(property.price) || 0;
  
  // Check if price seems unreasonably high (likely data error)
  const isUnreasonablePrice = rawPrice > 100000; // More than $1000 even before conversion
  
  // Convert price from cents to dollars, with fallback for unreasonable prices
  let priceInDollars;
  if (isUnreasonablePrice) {
    // Assume the price was entered as dollars instead of cents
    priceInDollars = rawPrice / 10000; // Divide by 10000 instead of 100
    console.warn(`Property ${property.id} has unreasonably high price ${rawPrice}, treating as dollars*100`);
  } else {
    priceInDollars = rawPrice / 100;
  }
  
  // Convert monthly price to nightly for short-stay bookings
  const basePrice = property.price_type === 'monthly' && property.category === 'short-stay' 
    ? priceInDollars / 30.44  // Average days per month
    : priceInDollars;
    
  const nights = checkInDate && checkOutDate ? 
    Math.max(1, differenceInDays(parseISO(checkOutDate), parseISO(checkInDate))) : 0;
  
  const subtotal = basePrice * nights;
  const bookingFee = Math.max(50, subtotal * 0.05); // 5% booking fee, minimum $50
  const securityDeposit = Math.min(500, subtotal * 0.2); // 20% security deposit, max $500
  const totalAmount = subtotal + bookingFee;

  const isFormValid = checkInDate && checkOutDate && nights > 0 && guestsCount > 0;

  const bookingData = {
    checkInDate,
    checkOutDate,
    guestsCount,
    specialRequests,
    contactPhone
  };

  const handleBookingSuccess = (paymentId: string, bookingId?: string) => {
    console.log('Booking successful:', { paymentId, bookingId });
    setOpen(false);
    // You might want to show a success message or redirect
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
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
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
                    <span>{formatPrice(basePrice)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Booking fee</span>
                    <span>{formatPrice(bookingFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Security deposit: {formatPrice(securityDeposit)} (refundable)
                    </div>
                  </div>
                </>
              )}

              {checkInDate && checkOutDate && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <strong>Stay dates:</strong><br />
                  {format(parseISO(checkInDate), 'MMM dd, yyyy')} - {format(parseISO(checkOutDate), 'MMM dd, yyyy')}
                </div>
              )}

              {isFormValid && (
                <div className="space-y-2">
                  <PaymentButton
                    propertyId={property.id}
                    paymentType="booking_fee"
                    amount={totalAmount}
                    currency={currentCurrency}
                    description={`Booking for ${property.title} (${nights} night${nights !== 1 ? 's' : ''})`}
                    bookingData={bookingData}
                    onSuccess={handleBookingSuccess}
                    className="w-full"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay {formatPrice(totalAmount)}
                  </PaymentButton>
                  
                  {securityDeposit > 0 && (
                    <PaymentButton
                      propertyId={property.id}
                      paymentType="security_deposit"
                      amount={securityDeposit}
                      currency={currentCurrency}
                      description={`Security deposit for ${property.title}`}
                      bookingData={bookingData}
                      onSuccess={handleBookingSuccess}
                      className="w-full"
                    >
                      Pay Security Deposit: {formatPrice(securityDeposit)}
                    </PaymentButton>
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