import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BookingCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const isDeposit = searchParams.get('deposit') === '1';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">
            {isDeposit ? 'Deposit Payment Cancelled' : 'Booking Payment Cancelled'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {bookingId && (
            <p className="text-muted-foreground">
              Booking ID: <span className="font-mono">{bookingId}</span>
            </p>
          )}
          
          <p className="text-sm text-muted-foreground">
            {isDeposit 
              ? 'Your security deposit payment was cancelled. No charges were made.'
              : 'Your booking payment was cancelled. No charges were made to your account.'
            }
          </p>
          
          <div className="space-y-2 pt-4">
            <Button asChild className="w-full">
              <Link to="/">Return Home</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/rent">Browse Properties</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCancel;