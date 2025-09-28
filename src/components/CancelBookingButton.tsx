import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CancelBookingButtonProps {
  bookingId: string;
  totalAmount: number;
  onCancelSuccess: () => void;
}

export const CancelBookingButton: React.FC<CancelBookingButtonProps> = ({
  bookingId,
  totalAmount,
  onCancelSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const handleCancel = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-booking', {
        body: { bookingId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Booking Cancelled",
        description: data.refundAmount > 0 
          ? `Your booking has been cancelled and ${formatPrice(data.refundAmount)} refund is being processed.`
          : "Your booking has been cancelled successfully."
      });

      onCancelSuccess();
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          Cancel Booking
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this booking? If you paid for this booking, 
            a refund of {formatPrice(totalAmount)} will be processed to your original payment method.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancel} 
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Cancelling..." : "Cancel Booking"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};