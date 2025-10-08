import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, DollarSign, Phone, Mail, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  user_id: string;
  status: string;
  booking_fee: number;
  security_deposit: number;
  total_amount: number;
  special_requests: string | null;
  contact_phone: string | null;
  created_at: string;
  properties: {
    id: string;
    title: string;
    city: string;
    district: string;
    category: string;
    images: string[];
  };
  payments: {
    currency: string;
  };
  guest?: {
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export default function HostBookings() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      // Get all bookings for host's properties
      const { data: hostProperties, error: propsError } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id);

      if (propsError) throw propsError;

      const propertyIds = hostProperties?.map(p => p.id) || [];

      if (propertyIds.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties(id, title, city, district, category, images),
          payments(currency)
        `)
        .in('property_id', propertyIds)
        .order('check_in_date', { ascending: false });

      if (error) throw error;

      // Fetch guest profiles separately
      if (data) {
        const userIds = [...new Set(data.map(b => b.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .in('id', userIds);

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const bookingsWithGuests = data.map(booking => ({
          ...booking,
          guest: profilesMap.get(booking.user_id)
        }));

        setBookings(bookingsWithGuests);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => 
      b.check_in_date >= today && 
      b.status !== 'cancelled'
    );
  };

  const getPastBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => 
      b.check_out_date < today || 
      b.status === 'completed'
    );
  };

  const getCancelledBookings = () => {
    return bookings.filter(b => b.status === 'cancelled');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      confirmed: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
      pending: 'outline'
    };
    
    const labels: Record<string, string> = {
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      pending: 'Pending'
    };

    const variant = variants[status] || 'outline';
    const label = labels[status] || status;

    return (
      <Badge variant={variant}>
        {label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Property Image */}
          <div className="w-full md:w-48 h-40 flex-shrink-0">
            <img 
              src={booking.properties.images?.[0] || '/placeholder.svg'} 
              alt={booking.properties.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Booking Details */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{booking.properties.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.properties.city}{booking.properties.district && `, ${booking.properties.district}`}</span>
                </div>
              </div>
              {getStatusBadge(booking.status)}
            </div>

            {/* Guest Info */}
            {booking.guest && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{booking.guest.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{booking.guest.email}</span>
                </div>
                {booking.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{booking.contact_phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">{formatDate(booking.check_in_date)}</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="font-medium">{formatDate(booking.check_out_date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {calculateNights(booking.check_in_date, booking.check_out_date)} nights
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {booking.guests_count} {booking.guests_count === 1 ? 'guest' : 'guests'}
                </span>
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="text-sm">
                <p className="text-muted-foreground">
                  <strong>Special Requests:</strong> {booking.special_requests}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {formatPrice(Number(booking.total_amount), booking.payments?.currency || 'DZD')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/property/${booking.properties.id}`)}
                >
                  View Property
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => navigate(`/messages?conversation=${booking.id}`)}
                >
                  Contact Guest
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">
          Manage all your property bookings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUpcomingBookings().length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPastBookings().length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCancelledBookings().length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({getUpcomingBookings().length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({getPastBookings().length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({getCancelledBookings().length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {getUpcomingBookings().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No upcoming bookings</p>
                <p className="text-sm text-muted-foreground">
                  New bookings will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            getUpcomingBookings().map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {getPastBookings().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No past bookings</p>
                <p className="text-sm text-muted-foreground">
                  Completed bookings will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            getPastBookings().map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {getCancelledBookings().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No cancelled bookings</p>
                <p className="text-sm text-muted-foreground">
                  Cancelled bookings will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            getCancelledBookings().map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
