import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RentPaymentModalProps {
  agreement: {
    id: string;
    monthly_rent: number;
    currency: string;
    payment_terms: {
      late_fee_percentage: number;
      grace_period_days: number;
    };
    properties: {
      title: string;
    };
  };
  open: boolean;
  onClose: () => void;
}

const RentPaymentModal = ({ agreement, open, onClose }: RentPaymentModalProps) => {
  const [processing, setProcessing] = useState(false);

  const calculateLateFee = () => {
    // For now, no late fee calculation - can be enhanced later
    return 0;
  };

  const lateFee = calculateLateFee();
  const totalAmount = agreement.monthly_rent + lateFee;

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-rent-payment', {
        body: {
          agreement_id: agreement.id,
          amount: totalAmount,
          currency: agreement.currency
        }
      });

      if (error) throw error;

      if (data.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        toast.success('Redirecting to payment...');
        
        // Close modal after a brief delay
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay Rent
          </DialogTitle>
          <DialogDescription>
            Payment for {agreement.properties.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly Rent</span>
              <span className="font-medium">
                {agreement.monthly_rent.toLocaleString()} {agreement.currency}
              </span>
            </div>

            {lateFee > 0 && (
              <div className="flex justify-between items-center text-destructive">
                <span className="text-sm">Late Fee ({agreement.payment_terms.late_fee_percentage}%)</span>
                <span className="font-medium">
                  {lateFee.toLocaleString()} {agreement.currency}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Due</span>
              <span className="text-2xl font-bold">
                {totalAmount.toLocaleString()} {agreement.currency}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Secure Payment</p>
                <p className="text-blue-700">
                  Your payment will be processed securely through Stripe. The host will be notified once payment is confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods Info */}
          <div className="text-xs text-muted-foreground">
            <p>Accepted payment methods:</p>
            <p className="mt-1">• Credit/Debit Cards • Bank Transfer • Mobile Payment</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={processing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay {totalAmount.toLocaleString()} {agreement.currency}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RentPaymentModal;
