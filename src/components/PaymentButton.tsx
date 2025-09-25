import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  propertyId: string;
  paymentType: 'booking_fee' | 'security_deposit' | 'earnest_money' | 'property_sale';
  amount: number;
  currency: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  bookingData?: {
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    specialRequests?: string;
    contactPhone?: string;
  };
  onSuccess?: (paymentId: string, bookingId?: string) => void;
  onError?: (error: string) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  propertyId,
  paymentType,
  amount,
  currency,
  description,
  className,
  children,
  bookingData,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const getPaymentTypeLabel = () => {
    switch (paymentType) {
      case 'booking_fee':
        return 'Pay Booking Fee';
      case 'security_deposit':
        return 'Pay Security Deposit';
      case 'earnest_money':
        return 'Pay Earnest Money';
      case 'property_sale':
        return 'Complete Purchase';
      default:
        return 'Pay Now';
    }
  };

  const handlePayment = async () => {
    if (!user || !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating payment for:', { propertyId, paymentType, amount, currency });

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          propertyId,
          paymentType,
          amount,
          currency,
          description,
          bookingData
        }
      });

      if (error) {
        console.error('Payment creation error:', error);
        throw new Error(error.message || 'Failed to create payment');
      }

      if (!data?.url) {
        throw new Error('No payment URL received');
      }

      console.log('Payment created successfully:', data);

      // Open Stripe Checkout in a new tab
      const checkoutWindow = window.open(data.url, '_blank');
      
      if (!checkoutWindow) {
        // Fallback: redirect in current tab if popup was blocked
        window.location.href = data.url;
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(data.paymentId, data.bookingId);
      }

      toast({
        title: "Payment Initiated",
        description: "You've been redirected to Stripe Checkout to complete your payment.",
      });

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || !user}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          {children || `${getPaymentTypeLabel()} - ${formatPrice(amount)}`}
        </>
      )}
    </Button>
  );
};