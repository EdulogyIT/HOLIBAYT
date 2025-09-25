import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Home, Calendar } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !paymentId || !user || !isAuthenticated) {
        setVerificationError('Missing payment information or user not authenticated');
        setIsVerifying(false);
        return;
      }

      try {
        console.log('Verifying payment:', { sessionId, paymentId });

        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            sessionId,
            paymentId
          }
        });

        if (error) {
          throw new Error(error.message || 'Payment verification failed');
        }

        console.log('Payment verification result:', data);
        setPaymentDetails(data);

        if (data.success && data.status === 'completed') {
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          });
        }

      } catch (error) {
        console.error('Payment verification error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Verification failed';
        setVerificationError(errorMessage);
        
        toast({
          title: "Verification Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, paymentId, user, isAuthenticated, toast]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-8">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Verifying your payment...</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (verificationError || !paymentDetails?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Payment Verification Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                {verificationError || 'We couldn\'t verify your payment. Please contact support.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <Button 
                  onClick={() => navigate('/contact')}
                  variant="default"
                >
                  Contact Support
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

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
              Payment Successful!
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Thank you for your payment. Your transaction has been processed successfully.
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm">{paymentDetails.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize font-semibold text-green-600">
                    {paymentDetails.status}
                  </span>
                </div>
                {paymentDetails.sessionData?.amountTotal && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      ${(paymentDetails.sessionData.amountTotal / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                {paymentDetails.sessionData?.customerDetails?.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{paymentDetails.sessionData.customerDetails.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/bookings')}
                className="flex-1"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View My Bookings
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1"
              >
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