import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');

  const [verifying, setVerifying] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!sessionId || !paymentId) {
        setErrorMsg('Missing session or payment information.');
        setVerifying(false);
        return;
      }

      // Get current JWT
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setErrorMsg('You need to be logged in to verify this payment.');
        setVerifying(false);
        return;
      }

      // Call Edge Function to verify + mark completed
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        headers: { Authorization: `Bearer ${token}` },
        body: { sessionId, paymentId },
      });

      if (error || data?.success === false) {
        setErrorMsg(data?.error || error?.message || 'Verification failed.');
        setVerifying(false);
        return;
      }

      // Success UI + redirect
      toast({
        title: 'Payment Successful!',
        description: 'Your payment has been confirmed.',
      });
      // Clean the URL so refresh doesn't re-run verification with params
      window.history.replaceState({}, '', '/payment-success');
      setVerifying(false);
      setTimeout(() => navigate('/bookings'), 5000);
    })();
  }, [sessionId, paymentId, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600">
              {verifying ? 'Finalizing Payment…' : errorMsg ? 'Payment Status' : 'Payment Successful!'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {verifying
                ? 'Please wait while we verify your payment with Stripe.'
                : errorMsg
                ? errorMsg
                : 'Thank you! Your payment is now secured in escrow.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verifying && !errorMsg && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">Your Payment is Protected</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Your funds are securely held in escrow until you complete your stay or receive your property keys.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Funds held safely by Holibayt</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Released to host after stay completion</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Easy refunds if you need to cancel</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/bookings')} className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                View My Bookings
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
