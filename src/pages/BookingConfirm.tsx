import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, CreditCard, MapPin, Home, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { calculateBookingPrice } from '@/utils/pricingCalculator';

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string;
  price_type: string;
  price_currency?: string;
  images: string[];
  category: string;
}

export default function BookingConfirm() {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [pricingBreakdown, setPricingBreakdown] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Get booking context from URL
  const checkInDate = searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : undefined;
  const checkOutDate = searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : undefined;
  const guestsCount = parseInt(searchParams.get('guests') || '1');
  const petsCount = parseInt(searchParams.get('pets') || '0');

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  useEffect(() => {
    if (property && checkInDate && checkOutDate && guestsCount) {
      calculatePricing();
    }
  }, [property, checkInDate, checkOutDate, guestsCount, petsCount]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pricing using comprehensive calculator
  const calculatePricing = async () => {
    if (!property || !checkInDate || !checkOutDate) return;

    setPricingLoading(true);
    try {
      const breakdown = await calculateBookingPrice(
        property.id,
        checkInDate,
        checkOutDate,
        guestsCount,
        petsCount
      );
      setPricingBreakdown(breakdown);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      toast({
        variant: 'destructive',
        title: 'Pricing Error',
        description: 'Unable to calculate pricing. Please try again.',
      });
    } finally {
      setPricingLoading(false);
    }
  };

  const propertyCurrency = property?.price_currency || 'EUR';

  const handlePayBooking = async () => {
    if (!property || !checkInDate || !checkOutDate || !pricingBreakdown) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          propertyId: property.id,
          paymentType: 'booking_fee',
          amount: pricingBreakdown.total,
          currency: propertyCurrency,
          description: `Booking fee for ${property.title}`,
          bookingData: {
            checkInDate: format(checkInDate, 'yyyy-MM-dd'),
            checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
            guestsCount,
            specialRequests,
            contactPhone,
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Unable to process payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p>{t('loading')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p>Property not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Confirm and Pay</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Login */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      1
                    </span>
                    Log in or sign up
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        You need to be logged in to complete your booking
                      </p>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                          size="lg"
                        >
                          Continue
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/register?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                          size="lg"
                        >
                          Sign up
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium">{user?.email}</p>
                        <p className="text-sm text-muted-foreground">Logged in</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Trip Details */}
              {isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        2
                      </span>
                      Trip details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Contact Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+213 555 123 456"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="requests">Special Requests (Optional)</Label>
                      <Textarea
                        id="requests"
                        placeholder="Any special requests..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment */}
              {isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        3
                      </span>
                      Pay with Stripe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handlePayBooking}
                      size="lg"
                      className="w-full"
                      disabled={isProcessing || !pricingBreakdown || pricingLoading}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : pricingLoading ? 'Calculating...' : `Pay ${formatPrice(pricingBreakdown?.total || 0, undefined, propertyCurrency)}`}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold">{property.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {property.city}, {property.location}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {checkInDate && checkOutDate
                          ? `${format(checkInDate, 'MMM dd')} - ${format(checkOutDate, 'MMM dd, yyyy')}`
                          : 'Dates not selected'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{guestsCount} guest{guestsCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {pricingBreakdown && !pricingLoading && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        {/* Base Pricing */}
                        <div className="flex justify-between text-sm">
                          <span>
                            {formatPrice(pricingBreakdown.basePrice, undefined, propertyCurrency)} × {pricingBreakdown.nights} night{pricingBreakdown.nights !== 1 ? 's' : ''}
                          </span>
                          <span>{formatPrice(pricingBreakdown.subtotal + (pricingBreakdown.savings || 0), undefined, propertyCurrency)}</span>
                        </div>

                        {/* Discounts */}
                        {pricingBreakdown.lengthOfStayDiscount && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Length of stay discount ({pricingBreakdown.lengthOfStayDiscount.percent}%)</span>
                            <span>-{formatPrice(pricingBreakdown.lengthOfStayDiscount.amount, undefined, propertyCurrency)}</span>
                          </div>
                        )}
                        {pricingBreakdown.earlyBirdDiscount && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Early bird discount ({pricingBreakdown.earlyBirdDiscount.percent}%)</span>
                            <span>-{formatPrice(pricingBreakdown.earlyBirdDiscount.amount, undefined, propertyCurrency)}</span>
                          </div>
                        )}
                        {pricingBreakdown.lastMinuteDiscount && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Last minute discount ({pricingBreakdown.lastMinuteDiscount.percent}%)</span>
                            <span>-{formatPrice(pricingBreakdown.lastMinuteDiscount.amount, undefined, propertyCurrency)}</span>
                          </div>
                        )}
                        {pricingBreakdown.promotionalDiscount && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Promotional discount ({pricingBreakdown.promotionalDiscount.percent}%)</span>
                            <span>-{formatPrice(pricingBreakdown.promotionalDiscount.amount, undefined, propertyCurrency)}</span>
                          </div>
                        )}

                        {/* Fees */}
                        {pricingBreakdown.cleaningFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Cleaning fee</span>
                            <span>{formatPrice(pricingBreakdown.cleaningFee, undefined, propertyCurrency)}</span>
                          </div>
                        )}
                        {pricingBreakdown.extraGuestFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Extra guest fee</span>
                            <span>{formatPrice(pricingBreakdown.extraGuestFee, undefined, propertyCurrency)}</span>
                          </div>
                        )}
                        {pricingBreakdown.petFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Pet fee</span>
                            <span>{formatPrice(pricingBreakdown.petFee, undefined, propertyCurrency)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Service fee</span>
                          <span>{formatPrice(pricingBreakdown.serviceFee, undefined, propertyCurrency)}</span>
                        </div>
                        {pricingBreakdown.taxAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Taxes ({pricingBreakdown.taxRate}%)</span>
                            <span>{formatPrice(pricingBreakdown.taxAmount, undefined, propertyCurrency)}</span>
                          </div>
                        )}
                      </div>

                      {/* Total Savings Badge */}
                      {pricingBreakdown.savings > 0 && (
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-green-700 dark:text-green-400 font-medium text-center">
                            You're saving {formatPrice(pricingBreakdown.savings, undefined, propertyCurrency)}!
                          </p>
                        </div>
                      )}

                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(pricingBreakdown.total, undefined, propertyCurrency)}</span>
                      </div>

                      {/* Security Deposit (separate) */}
                      {pricingBreakdown.securityDeposit > 0 && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Security Deposit (refundable)</span>
                            <span className="font-medium">{formatPrice(pricingBreakdown.securityDeposit, undefined, propertyCurrency)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Held in escrow, refunded after checkout</p>
                        </div>
                      )}
                    </>
                  )}

                  {pricingLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
