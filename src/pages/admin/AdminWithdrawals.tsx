import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowDownToLine, CheckCircle, XCircle, Clock, User, Building2, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';

interface HostProfile {
  name: string;
  email: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  rejection_reason?: string;
  created_at: string;
  processed_at?: string;
  host_user_id: string;
  payment_account_id?: string;
  host_payment_accounts?: {
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    iban?: string;
    swift_code?: string;
  };
  host_profile?: HostProfile;
}

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          host_payment_accounts(
            bank_name,
            account_holder_name,
            account_number,
            iban,
            swift_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch host profiles separately
      if (data && data.length > 0) {
        const hostIds = [...new Set(data.map(w => w.host_user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', hostIds);
        
        const enrichedData = data.map(withdrawal => ({
          ...withdrawal,
          host_profile: profiles?.find(p => p.id === withdrawal.host_user_id)
        }));
        
        setWithdrawals(enrichedData);
      } else {
        setWithdrawals([]);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;
    
    setProcessing(true);
    try {
      // Update withdrawal request status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedWithdrawal.id);

      if (updateError) throw updateError;

      // Create notification for host
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedWithdrawal.host_user_id,
          title: 'Withdrawal Approved',
          message: `Your withdrawal request for ${formatPrice(selectedWithdrawal.amount)} has been approved and processed.`,
          type: 'withdrawal_approved',
          related_id: selectedWithdrawal.id
        });

      if (notifError) throw notifError;

      toast({
        title: "Success",
        description: "Withdrawal request approved successfully"
      });

      setShowApproveDialog(false);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to approve withdrawal request",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    try {
      // Update withdrawal request status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedWithdrawal.id);

      if (updateError) throw updateError;

      // Create notification for host
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedWithdrawal.host_user_id,
          title: 'Withdrawal Rejected',
          message: `Your withdrawal request for ${formatPrice(selectedWithdrawal.amount)} has been rejected. Reason: ${rejectionReason}`,
          type: 'withdrawal_rejected',
          related_id: selectedWithdrawal.id
        });

      if (notifError) throw notifError;

      toast({
        title: "Success",
        description: "Withdrawal request rejected"
      });

      setShowRejectDialog(false);
      setSelectedWithdrawal(null);
      setRejectionReason('');
      fetchWithdrawals();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to reject withdrawal request",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getPendingWithdrawals = () => withdrawals.filter(w => w.status === 'pending');
  const getCompletedWithdrawals = () => withdrawals.filter(w => w.status === 'completed');
  const getRejectedWithdrawals = () => withdrawals.filter(w => w.status === 'rejected');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      pending: 'outline',
      completed: 'default',
      rejected: 'destructive',
      approved: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const WithdrawalCard = ({ withdrawal }: { withdrawal: WithdrawalRequest }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{withdrawal.host_profile?.name || 'Unknown Host'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{withdrawal.host_profile?.email}</p>
            </div>
            {getStatusBadge(withdrawal.status)}
          </div>

          {/* Amount */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Withdrawal Amount</div>
            <div className="text-2xl font-bold">{formatPrice(withdrawal.amount)}</div>
          </div>

          {/* Bank Details */}
          {withdrawal.host_payment_accounts && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Payment Account</span>
              </div>
              <div className="text-sm space-y-1 ml-6">
                <p><strong>Bank:</strong> {withdrawal.host_payment_accounts.bank_name}</p>
                <p><strong>Account Holder:</strong> {withdrawal.host_payment_accounts.account_holder_name}</p>
                <p><strong>Account:</strong> ****{withdrawal.host_payment_accounts.account_number.slice(-4)}</p>
                {withdrawal.host_payment_accounts.iban && (
                  <p><strong>IBAN:</strong> {withdrawal.host_payment_accounts.iban}</p>
                )}
                {withdrawal.host_payment_accounts.swift_code && (
                  <p><strong>SWIFT:</strong> {withdrawal.host_payment_accounts.swift_code}</p>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Requested: {new Date(withdrawal.created_at).toLocaleString()}</p>
            {withdrawal.processed_at && (
              <p>Processed: {new Date(withdrawal.processed_at).toLocaleString()}</p>
            )}
          </div>

          {/* Rejection Reason */}
          {withdrawal.rejection_reason && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              <strong>Rejection Reason:</strong> {withdrawal.rejection_reason}
            </div>
          )}

          {/* Actions */}
          {withdrawal.status === 'pending' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  setSelectedWithdrawal(withdrawal);
                  setShowApproveDialog(true);
                }}
                className="flex-1 gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setSelectedWithdrawal(withdrawal);
                  setShowRejectDialog(true);
                }}
                className="flex-1 gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        <p className="text-muted-foreground">
          Review and process host payout requests
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPendingWithdrawals().length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletedWithdrawals().length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRejectedWithdrawals().length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals List */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({getPendingWithdrawals().length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({getCompletedWithdrawals().length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({getRejectedWithdrawals().length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {getPendingWithdrawals().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            getPendingWithdrawals().map(withdrawal => (
              <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {getCompletedWithdrawals().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No completed requests</p>
              </CardContent>
            </Card>
          ) : (
            getCompletedWithdrawals().map(withdrawal => (
              <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {getRejectedWithdrawals().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No rejected requests</p>
              </CardContent>
            </Card>
          ) : (
            getRejectedWithdrawals().map(withdrawal => (
              <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this withdrawal request for {formatPrice(selectedWithdrawal?.amount || 0)}?
              The host will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? 'Processing...' : 'Approve & Notify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectionReason('');
            }} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectionReason.trim()}>
              {processing ? 'Processing...' : 'Reject & Notify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
