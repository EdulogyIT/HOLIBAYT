import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MessageSquare, Phone, CheckCircle } from 'lucide-react';

export default function HostDashboard() {
  const todayReservations = [
    {
      id: '1',
      type: 'check-in',
      property: 'Seaside Villa',
      guest: 'Ahmed Benzema',
      time: '15:00',
      status: 'confirmed',
    },
    {
      id: '2',
      type: 'check-out',
      property: 'City Apartment',
      guest: 'Sarah Mansouri',
      time: '11:00',
      status: 'pending',
    },
  ];

  const upcomingReservations = [
    {
      id: '3',
      property: 'Mountain Cabin',
      guest: 'Yacine Brahim',
      dates: 'Dec 15-18, 2024',
      nights: 3,
      amount: 'DA 28,500',
      status: 'confirmed',
    },
    {
      id: '4',
      property: 'Beach House',
      guest: 'Amina Larbi',
      dates: 'Dec 20-25, 2024',
      nights: 5,
      amount: 'DA 75,000',
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservations</h1>
        <p className="text-muted-foreground">
          Manage your property bookings and guest communications
        </p>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Today's Check-ins & Check-outs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayReservations.length > 0 ? (
                <div className="space-y-4">
                  {todayReservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={reservation.type === 'check-in' ? 'default' : 'secondary'}>
                            {reservation.type === 'check-in' ? 'Check-in' : 'Check-out'}
                          </Badge>
                          <span className="font-medium">{reservation.property}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reservation.guest} • {reservation.time}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        {reservation.type === 'check-in' && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Send Info
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No check-ins or check-outs today</p>
                  <Button className="mt-4" variant="outline">
                    View Upcoming
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Next 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{reservation.property}</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.guest} • {reservation.dates} • {reservation.nights} nights
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium">{reservation.amount}</p>
                        <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                          {reservation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming reservations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}