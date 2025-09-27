import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    if (sessionId && paymentId) {
      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed successfully.",
      });
      
      // Auto-redirect to bookings after 5 seconds
      const timer = setTimeout(() => {
        navigate('/bookings');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [sessionId, paymentId, toast, navigate]);

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
              You will be redirected to your bookings page automatically in 5 seconds.
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
              <div className="space-y-3">
                {paymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-sm">{paymentId}</span>
                  </div>
                )}
                {sessionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session ID:</span>
                    <span className="font-mono text-sm">{sessionId.substring(0, 20)}...</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize font-semibold text-green-600">
                    Completed
                  </span>
                </div>
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