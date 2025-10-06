import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Home, Calendar, Users, MapPin, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

interface BookingInvitationCardProps {
  bookingId: string;
  isHost: boolean;
  onClose: () => void;
}

export const BookingInvitationCard = ({ bookingId, isHost, onClose }: BookingInvitationCardProps) => {
  const [booking, setBooking] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [guestName, setGuestName] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');

  useEffect(() => {
    const fetchDetails = async () => {
      // Fetch booking details
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingData) {
        setBooking(bookingData);

        // Fetch property details
        const { data: propertyData } = await supabase
          .from('properties')
          .select('*')
          .eq('id', bookingData.property_id)
          .single();

        setProperty(propertyData);

        // Fetch guest name
        const { data: guestProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', bookingData.user_id)
          .single();

        setGuestName(guestProfile?.name || 'Guest');

        // Fetch host name
        if (propertyData) {
          const { data: hostProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', propertyData.user_id)
            .single();

          setHostName(hostProfile?.name || 'Host');
        }
      }
    };

    fetchDetails();

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']
    });
  }, [bookingId]);

  if (!booking || !property) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-2xl w-full bg-gradient-to-br from-white via-amber-50 to-yellow-50 border-4 border-amber-300 shadow-2xl animate-scale-in relative overflow-hidden">
        {/* Decorative sparkles */}
        <div className="absolute top-4 right-4 text-yellow-400 animate-pulse">
          <Sparkles size={32} />
        </div>
        <div className="absolute top-8 left-4 text-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }}>
          <Sparkles size={24} />
        </div>
        <div className="absolute bottom-8 right-8 text-yellow-300 animate-pulse" style={{ animationDelay: '0.6s' }}>
          <Sparkles size={28} />
        </div>

        <CardContent className="p-8 relative">
          {isHost ? (
            // Host view
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full p-6 shadow-lg animate-bounce">
                  <Home className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  🎉 Yay! Booking Confirmed! 🎉
                </h2>
                <p className="text-xl text-gray-700">
                  Get ready to welcome your guest!
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 space-y-4 shadow-lg border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <p className="text-lg">
                    <span className="font-bold text-primary">{guestName}</span> is coming to stay!
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-primary" />
                  <p className="text-gray-700">{property.title}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <p className="text-gray-700">
                      <span className="font-semibold">Check-in:</span> {formatDate(booking.check_in_date)}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Check-out:</span> {formatDate(booking.check_out_date)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-200">
                  <p className="text-gray-600 italic">
                    "Prepare your property and make it shine for your special guest! ✨"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Guest view
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-full p-6 shadow-lg animate-bounce">
                  <Heart className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  🏡 Welcome Home! 🏡
                </h2>
                <p className="text-xl text-gray-700">
                  Your booking is confirmed!
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 space-y-4 shadow-lg border-2 border-primary/30">
                <p className="text-lg text-gray-700">
                  <span className="font-bold text-primary">{hostName}</span> is looking forward to hosting you!
                </p>
                
                <div className="flex items-center gap-3 justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                  <p className="text-gray-700 font-semibold">{property.title}</p>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <p className="text-gray-700">
                      <span className="font-semibold">Check-in:</span> {formatDate(booking.check_in_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <p className="text-gray-700">
                      <span className="font-semibold">Check-out:</span> {formatDate(booking.check_out_date)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-primary/20">
                  <p className="text-gray-600 italic">
                    "Your home away from home awaits! Pack your bags and get ready for an amazing stay! 🌟"
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={onClose}
            className="mt-6 w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
