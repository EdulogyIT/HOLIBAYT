import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const paymentId = searchParams.get('payment_id');

  // Clean up pending payment when user cancels
  useEffect(() => {
    (async () => {
      if (!paymentId) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        // Delete pending payment and any associated booking
        await supabase
          .from('payments')
          .delete()
          .eq('id', paymentId)
          .eq('status', 'pending');
      } catch (error) {
        console.error('Error cleaning up cancelled payment:', error);
      }
    })();
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-600">
              Payment Cancelled
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Your payment has been cancelled and no charges were made to your account.
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-2">What happened?</h3>
              <p className="text-gray-700 mb-4">
                You chose to cancel the payment process. This is completely normal and happens sometimes.
              </p>
              
              {paymentId && (
                <div className="text-sm text-gray-600">
                  <strong>Reference:</strong> <span className="font-mono">{paymentId}</span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold mb-2">Want to try again?</h4>
              <p className="text-gray-700 text-sm">
                You can return to the property page and initiate the payment process again whenever you're ready.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate(-1)}
                variant="default"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
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