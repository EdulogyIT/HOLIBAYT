import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MessageSquare, Phone, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HostDashboard() {
  const { t } = useLanguage();
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
        <h1 className="text-3xl font-bold">{t('reservations')}</h1>
        <p className="text-muted-foreground">
          {t('manageBookingsGuest')}
        </p>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">{t('today')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('upcoming')}</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                {t('todayCheckinsCheckouts')}
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
                            {reservation.type === 'check-in' ? t('checkIn') : t('checkOut')}
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
                          {t('sendMessage')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          {t('call')}
                        </Button>
                        {reservation.type === 'check-in' && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t('sendInfo')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('noCheckinsCheckoutsToday')}</p>
                  <Button className="mt-4" variant="outline">
                    {t('viewUpcoming')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('next30Days')}</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{reservation.property}</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.guest} • {reservation.dates} • {reservation.nights} {t('nights')}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium">{reservation.amount}</p>
                        <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                          {reservation.status === 'confirmed' ? t('confirmed') : t('pending')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('noUpcomingReservations')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}