import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BookingSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const isDeposit = searchParams.get('deposit') === '1';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">
            {isDeposit ? 'Deposit Payment Successful!' : 'Booking Payment Successful!'}
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
              ? 'Your security deposit has been processed successfully.'
              : 'Your booking payment has been processed successfully. You will receive a confirmation email shortly.'
            }
          </p>
          
          <div className="space-y-2 pt-4">
            <Button asChild className="w-full">
              <Link to="/bookings">View My Bookings</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSuccess;