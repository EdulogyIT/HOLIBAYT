import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CreditCard, Building2, CheckCircle, AlertCircle, Trash2, DollarSign, Clock, Wallet, ArrowDownToLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentAccount {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  routing_number?: string;
  iban?: string;
  swift_code?: string;
  bank_address?: string;
  account_type: string;
  country: string;
  currency: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface CommissionTransaction {
  id: string;
  total_amount: number;
  commission_rate: number;
  commission_amount: number;
  host_amount: number;
  status: string;
  created_at: string;
  properties: {
    title: string;
  };
  payments: {
    description: string;
  };
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  rejection_reason?: string;
  created_at: string;
  processed_at?: string;
  payment_account_id?: string;
  host_payment_accounts?: {
    bank_name: string;
    account_number: string;
  };
}

export default function HostPayouts() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [commissionTransactions, setCommissionTransactions] = useState<CommissionTransaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [formData, setFormData] = useState({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    routing_number: '',
    iban: '',
    swift_code: '',
    bank_address: '',
    account_type: 'checking',
    country: 'DZ',
    currency: 'DZD'
  });

  useEffect(() => {
    if (user) {
      fetchPaymentAccounts();
      fetchCommissionTransactions();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWithdrawalRequests();
    }
  }, [user, totalEarnings]);

  const fetchPaymentAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('host_payment_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentAccounts(data || []);
    } catch (error) {
      console.error('Error fetching payment accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load payment accounts",
        variant: "destructive"
      });
    }
  };

  const fetchCommissionTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_transactions')
        .select(`
          *,
          properties(title),
          payments(description)
        `)
        .eq('host_user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCommissionTransactions(data || []);

      // Calculate earnings breakdown
      const completedEarnings = data?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.host_amount), 0) || 0;
      const pending = data?.filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + Number(t.host_amount), 0) || 0;

      setTotalEarnings(completedEarnings);
      setPendingAmount(pending);
    } catch (error) {
      console.error('Error fetching commission transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          host_payment_accounts(bank_name, account_number)
        `)
        .eq('host_user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawalRequests(data || []);

      // Calculate withdrawn and available amounts
      const withdrawn = data?.filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      setWithdrawnAmount(withdrawn);

      // Available balance = completed earnings - (completed + pending withdrawals)
      const pendingWithdrawals = data?.filter(r => r.status === 'pending' || r.status === 'approved')
        .reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      setAvailableBalance(totalEarnings - withdrawn - pendingWithdrawals);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('host_payment_accounts')
        .insert({
          user_id: user?.id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment account added successfully"
      });

      setShowAddAccount(false);
      setFormData({
        bank_name: '',
        account_holder_name: '',
        account_number: '',
        routing_number: '',
        iban: '',
        swift_code: '',
        bank_address: '',
        account_type: 'checking',
        country: 'DZ',
        currency: 'DZD'
      });
      fetchPaymentAccounts();
    } catch (error) {
      console.error('Error adding payment account:', error);
      toast({
        title: "Error",
        description: "Failed to add payment account",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('host_payment_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment account deleted successfully"
      });
      
      fetchPaymentAccounts();
    } catch (error) {
      console.error('Error deleting payment account:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment account",
        variant: "destructive"
      });
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Error",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAccountId) {
      toast({
        title: "Error",
        description: "Please select a payment account",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          host_user_id: user?.id,
          payment_account_id: selectedAccountId,
          amount: amount,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully"
      });

      setShowWithdrawModal(false);
      setWithdrawalAmount('');
      setSelectedAccountId('');
      fetchWithdrawalRequests();
      fetchCommissionTransactions();
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request",
        variant: "destructive"
      });
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading payouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payouts & Settings</h1>
        <p className="text-muted-foreground">
          Manage your payment accounts and view your earnings
        </p>
      </div>

      {/* Earnings Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed commissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatPrice(availableBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(withdrawnAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully paid out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatPrice(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">In bookings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Accounts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentAccounts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Request Button */}
      {availableBalance > 0 && paymentAccounts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Ready to withdraw {formatPrice(availableBalance)}</h3>
                <p className="text-sm text-muted-foreground">Request a payout to your bank account</p>
              </div>
              <Button onClick={() => setShowWithdrawModal(true)} className="gap-2">
                <ArrowDownToLine className="h-4 w-4" />
                Request Withdrawal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={availableBalance}
                  placeholder="Enter amount"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available balance: {formatPrice(availableBalance)}
                </p>
              </div>
              <div>
                <Label htmlFor="account">Payment Account</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bank_name} - ****{account.account_number.slice(-4)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Submit Request</Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawalAmount('');
                  setSelectedAccountId('');
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Payment Accounts</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payment Accounts</h2>
            <Button onClick={() => setShowAddAccount(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {showAddAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Add Payment Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAccount} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_holder_name">Account Holder Name</Label>
                      <Input
                        id="account_holder_name"
                        value={formData.account_holder_name}
                        onChange={(e) => setFormData({...formData, account_holder_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input
                        id="account_number"
                        value={formData.account_number}
                        onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_type">Account Type</Label>
                      <Select value={formData.account_type} onValueChange={(value) => setFormData({...formData, account_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="routing_number">Routing Number (Optional)</Label>
                      <Input
                        id="routing_number"
                        value={formData.routing_number}
                        onChange={(e) => setFormData({...formData, routing_number: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="iban">IBAN (Optional)</Label>
                      <Input
                        id="iban"
                        value={formData.iban}
                        onChange={(e) => setFormData({...formData, iban: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="swift_code">SWIFT Code (Optional)</Label>
                      <Input
                        id="swift_code"
                        value={formData.swift_code}
                        onChange={(e) => setFormData({...formData, swift_code: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DZ">Algeria</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bank_address">Bank Address (Optional)</Label>
                    <Input
                      id="bank_address"
                      value={formData.bank_address}
                      onChange={(e) => setFormData({...formData, bank_address: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Add Account</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddAccount(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {paymentAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{account.bank_name}</span>
                        {account.is_verified && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {account.account_holder_name}
                      </p>
                      <p className="text-sm font-mono">
                        ****{account.account_number.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {account.account_type} • {account.country} • {account.currency}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <h2 className="text-xl font-semibold">Withdrawal History</h2>
          
          <div className="space-y-4">
            {withdrawalRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{formatPrice(request.amount)}</span>
                        <Badge 
                          variant={
                            request.status === 'completed' ? 'default' : 
                            request.status === 'approved' ? 'secondary' :
                            request.status === 'pending' ? 'outline' : 'destructive'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      {request.host_payment_accounts && (
                        <p className="text-sm text-muted-foreground">
                          To: {request.host_payment_accounts.bank_name} - ****{request.host_payment_accounts.account_number.slice(-4)}
                        </p>
                      )}
                      {request.rejection_reason && (
                        <p className="text-sm text-destructive">
                          Rejection reason: {request.rejection_reason}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                        {request.processed_at && (
                          <span>Processed: {new Date(request.processed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {withdrawalRequests.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No withdrawal requests yet</h3>
                    <p className="text-muted-foreground">
                      Your withdrawal requests will appear here. Request a payout when you have available balance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          
          <div className="space-y-4">
            {commissionTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transaction.properties?.title}</span>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 
                                  transaction.status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.payments?.description}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span>Total: {formatPrice(transaction.total_amount)}</span>
                        <span>Commission ({(transaction.commission_rate * 100).toFixed(1)}%): {formatPrice(transaction.commission_amount)}</span>
                        <span className="font-medium">Your earnings: {formatPrice(transaction.host_amount)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {commissionTransactions.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground">
                      Your commission transactions will appear here once you start receiving bookings.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}