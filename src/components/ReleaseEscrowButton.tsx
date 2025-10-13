import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReleaseEscrowButtonProps {
  bookingId: string;
  propertyTitle: string;
  onSuccess?: () => void;
}

export const ReleaseEscrowButton: React.FC<ReleaseEscrowButtonProps> = ({
  bookingId,
  propertyTitle,
  onSuccess,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const { toast } = useToast();

  const handleConfirmCompletion = async () => {
    setIsReleasing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('release-escrow', {
        headers: { Authorization: `Bearer ${token}` },
        body: {
          bookingId,
          reason: 'guest_confirmed'
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to release escrow');
      }

      toast({
        title: 'Payment Released!',
        description: `Payment for "${propertyTitle}" has been released to the host. Thank you for confirming!`,
      });

      setIsConfirmOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error releasing escrow:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to release payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsConfirmOpen(true)}
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Confirm Completion
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Stay Completion</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                By confirming completion, you're indicating that your stay was satisfactory and the payment
                will be released to the host.
              </p>
              <p className="text-sm font-medium">
                Property: {propertyTitle}
              </p>
              <p className="text-xs text-muted-foreground">
                Once confirmed, this action cannot be undone. If you have any issues with your stay,
                please contact support before confirming.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReleasing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCompletion}
              disabled={isReleasing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isReleasing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm & Release Payment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
