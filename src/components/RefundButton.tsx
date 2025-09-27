import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';

interface RefundButtonProps {
  paymentId: string;
  amount: number;
  bookingDate?: string;
  onRefundSuccess?: () => void;
  className?: string;
}

export default function RefundButton({ 
  paymentId, 
  amount, 
  bookingDate, 
  onRefundSuccess,
  className = ""
}: RefundButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reason, setReason] = useState('');
  const [customAmount, setCustomAmount] = useState(amount);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const calculateRefundAmount = () => {
    if (!bookingDate) return amount;
    
    const checkInDate = new Date(bookingDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn < 24) {
      return 0; // No refund
    } else if (hoursUntilCheckIn < 168) { // Less than 7 days
      return amount * 0.5; // 50% refund
    }
    return amount; // Full refund
  };

  const expectedRefundAmount = calculateRefundAmount();

  const handleRefund = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the refund",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: {
          paymentId,
          refundAmount: customAmount,
          reason: reason.trim()
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Refund Processed",
          description: `Refund of ${formatPrice(data.refundAmount)} has been processed successfully`
        });
        
        setIsOpen(false);
        setReason('');
        onRefundSuccess?.();
      } else {
        throw new Error(data.error || 'Refund failed');
      }
    } catch (error) {
      console.error('Refund error:', error);
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRefundPolicyMessage = () => {
    if (!bookingDate) return "Standard refund policy applies";
    
    const checkInDate = new Date(bookingDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn < 24) {
      return "❌ No refund available (less than 24 hours to check-in)";
    } else if (hoursUntilCheckIn < 168) {
      return "⚠️ 50% refund available (less than 7 days to check-in)";
    }
    return "✅ Full refund available (more than 7 days to check-in)";
  };

  if (expectedRefundAmount <= 0) {
    return (
      <Button variant="outline" disabled className={className}>
        No Refund Available
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          Request Refund
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Request Refund
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Refund Policy</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {getRefundPolicyMessage()}
            </p>
            <div className="flex justify-between text-sm">
              <span>Original Amount:</span>
              <span>{formatPrice(amount)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Expected Refund:</span>
              <span>{formatPrice(expectedRefundAmount)}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="refund-amount">Refund Amount</Label>
            <Input
              id="refund-amount"
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
              max={expectedRefundAmount}
              min={0}
              step="0.01"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum refund: {formatPrice(expectedRefundAmount)}
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Refund</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you're requesting a refund..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleRefund} 
              disabled={isProcessing || !reason.trim() || customAmount <= 0}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Process Refund (${formatPrice(customAmount)})`
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}