import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Clock, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

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
    price_currency?: string;
  };
  payments: {
    description: string;
    currency?: string;
  };
}

export default function HostPayouts() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [commissionTransactions, setCommissionTransactions] = useState<CommissionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStripeStatus();
      fetchCommissionTransactions();
    }
  }, [user]);

  useEffect(() => {
    // Handle Stripe Connect onboarding return
    const success = searchParams.get('success');
    const refresh = searchParams.get('refresh');
    
    if (success === 'true') {
      // Verify the Stripe account after successful onboarding
      const verifyAccount = async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) return;

          const { data, error } = await supabase.functions.invoke('verify-stripe-account', {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });
          
          if (error) throw error;
          
          if (data?.is_verified) {
            toast({
              title: "Stripe Connected Successfully",
              description: "Your Stripe account is verified. Automatic payouts are enabled."
            });
          } else {
            toast({
              title: "Stripe Account Connected",
              description: "Verification in progress. This may take a few moments.",
            });
          }
          
          fetchStripeStatus();
        } catch (error) {
          console.error('Error verifying Stripe account:', error);
          toast({
            title: "Connected but Verification Failed",
            description: "Please refresh the page or contact support.",
            variant: "destructive"
          });
        }
      };
      
      verifyAccount();
    } else if (refresh === 'true') {
      toast({
        title: "Please Try Again",
        description: "Complete the Stripe onboarding to enable automatic payouts.",
        variant: "destructive"
      });
    }
  }, [searchParams]);

  const fetchStripeStatus = async () => {
    try {
      const { data } = await supabase
        .from('host_payment_accounts')
        .select('stripe_account_id, is_verified')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .not('stripe_account_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If account exists but not verified, try to verify it
      if (data?.stripe_account_id && !data?.is_verified) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-stripe-account', {
              headers: {
                Authorization: `Bearer ${sessionData.session.access_token}`,
              },
            });
            
            if (!verifyError && verifyData?.is_verified) {
              setIsStripeConnected(true);
              return;
            }
          }
        } catch (verifyError) {
          console.error('Error verifying account:', verifyError);
        }
      }
      
      setIsStripeConnected(!!data?.stripe_account_id && data?.is_verified);
    } catch (error) {
      console.error('Error checking Stripe status:', error);
    }
  };

  const fetchCommissionTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_transactions')
        .select(`
          *,
          properties(title, price_currency),
          payments(description, currency)
        `)
        .eq('host_user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommissionTransactions(data || []);

      // Calculate earnings
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

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error || !sessionData.session) {
        throw new Error("Not authenticated");
      }

      const { data, error: functionError } = await supabase.functions.invoke(
        'create-connect-account',
        {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        }
      );

      if (functionError) throw functionError;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: "Error",
        description: "Failed to start Stripe onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConnectingStripe(false);
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
        <h1 className="text-3xl font-bold">Payouts & Earnings</h1>
        <p className="text-muted-foreground">
          Automatic payouts via Stripe Connect
        </p>
      </div>

      {/* Stripe Connection Status */}
      {!isStripeConnected && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Connect Your Stripe Account</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Stripe account to receive automatic payouts when guests complete bookings. 
                  Funds are typically available within 2 days.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>✓ Automatic payouts (no manual withdrawal requests)</li>
                  <li>✓ Fast transfers (2-day standard, instant available)</li>
                  <li>✓ Secure and reliable payments</li>
                  <li>✓ Direct bank deposits</li>
                </ul>
              </div>
              <Button 
                onClick={handleConnectStripe} 
                disabled={connectingStripe}
                className="gap-2"
              >
                {connectingStripe ? "Connecting..." : "Connect Stripe Account"}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isStripeConnected && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Stripe Connected</h3>
                <p className="text-sm text-green-700">
                  Your payouts are automatic. Funds are transferred when bookings are completed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalEarnings, undefined, 'EUR')}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatPrice(pendingAmount, undefined, 'EUR')}</div>
            <p className="text-xs text-muted-foreground mt-1">In active bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payout Method</CardTitle>
            <CheckCircle className={`h-4 w-4 ${isStripeConnected ? 'text-green-600' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStripeConnected ? 'Active' : 'Not Set'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isStripeConnected ? 'Automatic via Stripe' : 'Connect Stripe to enable'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="info">Payout Information</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {commissionTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm mt-1">Earnings will appear here when guests complete bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {commissionTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.properties?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total: {formatPrice(transaction.total_amount, undefined, transaction.payments?.currency || transaction.properties?.price_currency || 'EUR')} • 
                          Commission: {(transaction.commission_rate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatPrice(transaction.host_amount, undefined, transaction.payments?.currency || transaction.properties?.price_currency || 'EUR')}
                        </p>
                        <Badge 
                          variant={
                            transaction.status === 'completed' ? 'default' : 
                            transaction.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How Payouts Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Automatic Payments</h3>
                <p className="text-sm text-muted-foreground">
                  When a guest completes a booking, the platform automatically:
                </p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Deducts the platform commission (typically 15%)</li>
                  <li>Transfers your earnings directly to your Stripe account</li>
                  <li>Makes funds available within 2 business days</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payout Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  • Standard payouts: 2 business days after booking completion<br />
                  • Instant payouts: Available for eligible accounts (fees apply)<br />
                  • Monthly statements available in your Stripe Dashboard
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tax & Reporting</h3>
                <p className="text-sm text-muted-foreground">
                  All transactions are recorded in your Stripe Dashboard. You can download 
                  detailed reports for tax purposes at any time.
                </p>
              </div>

              {isStripeConnected && (
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                    Open Stripe Dashboard
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
