import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Building2, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  
  const kpiData = [
    {
      title: t('newBookings7d'),
      value: '24',
      change: '+12%',
      icon: CalendarDays,
    },
    {
      title: t('upcomingCheckins7d'),
      value: '18',
      change: '+5%',
      icon: Users,
    },
    {
      title: t('activeProperties'),
      value: '142',
      change: '+3%',
      icon: Building2,
    },
    {
      title: t('estRevenueMonth'),
      value: 'DA 2,450,000',
      change: '+18%',
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <p className="text-muted-foreground">
          {t('overviewPlatformPerformance')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-green-600">
                {kpi.change} {t('fromLastWeek')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('recentBookings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Villa in Hydra</p>
                  <p className="text-sm text-muted-foreground">Ahmed B. • 3 nights</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">DA 45,000</p>
                  <p className="text-sm text-green-600">{t('confirmed')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Apartment in Oran</p>
                  <p className="text-sm text-muted-foreground">Sarah L. • 1 week</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">DA 28,000</p>
                  <p className="text-sm text-yellow-600">{t('pending')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('topPerformingProperties')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Seaside Villa</p>
                  <p className="text-sm text-muted-foreground">Annaba</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">95% {t('occupancy')}</p>
                  <p className="text-sm text-muted-foreground">12 {t('bookings')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">City Center Loft</p>
                  <p className="text-sm text-muted-foreground">Algiers</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">87% {t('occupancy')}</p>
                  <p className="text-sm text-muted-foreground">9 {t('bookings')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}