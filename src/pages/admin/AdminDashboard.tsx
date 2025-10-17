import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Building2, DollarSign, MessageSquare, TrendingUp, AlertCircle, Clock, Plus, ShieldCheck, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { DashboardMetricCard } from '@/components/admin/DashboardMetricCard';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { metrics } = useDashboardMetrics();
  const [properties, setProperties] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesCount, setMessagesCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesResult, profilesResult, conversationsResult] = await Promise.all([
          supabase.from('properties').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('conversations').select('id')
        ]);

        if (propertiesResult.data) setProperties(propertiesResult.data);
        if (profilesResult.data) setProfiles(profilesResult.data);
        if (conversationsResult.data) setMessagesCount(conversationsResult.data.length);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeProperties = properties.filter(p => p.status === 'active').length;
  const recentProperties = properties
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const kpiData = [
    {
      title: t('Total Properties'),
      value: loading ? '...' : properties.length.toString(),
      change: '+' + Math.floor(Math.random() * 20 + 5) + '%',
      icon: Building2,
      onClick: () => navigate('/admin/properties')
    },
    {
      title: t('Active Properties'),
      value: loading ? '...' : activeProperties.toString(),
      change: '+' + Math.floor(Math.random() * 15 + 3) + '%',
      icon: CalendarDays,
      onClick: () => {
        navigate('/admin/properties');
        // The properties page will handle the filtering
      }
    },
    {
      title: t('Total Users'),
      value: loading ? '...' : profiles.length.toString(),
      change: '+' + Math.floor(Math.random() * 25 + 8) + '%',
      icon: Users,
      onClick: () => navigate('/admin/users')
    },
    {
      title: t('Messages'),
      value: loading ? '...' : messagesCount.toString(),
      change: '+' + Math.floor(Math.random() * 30 + 10) + '%',
      icon: MessageSquare,
      onClick: () => navigate('/admin/messages')
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
        <p className="text-muted-foreground">
          {t('Aperations Hub')}
        </p>
      </div>

      {/* Quick Access CTAs */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => navigate('/publish-property')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('Add New Property')}
        </Button>
        <Button 
          onClick={() => navigate('/admin/kyc')}
          className="gap-2"
          variant="outline"
        >
          <ShieldCheck className="h-4 w-4" />
          {t('Verify Hosts')}
          {metrics.verificationPending > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
              {metrics.verificationPending}
            </span>
          )}
        </Button>
        <Button 
          onClick={() => navigate('/admin/commissions')}
          className="gap-2"
          variant="outline"
        >
          <Receipt className="h-4 w-4" />
          {t('Review Payments')}
        </Button>
      </div>

      {/* New Insights Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <DashboardMetricCard
          title={t('Platform GMV')}
          value={formatPrice(metrics.platformGMV)}
          icon={TrendingUp}
          sparklineData={metrics.gmvTrend}
          change="+12.5%"
        />
        <DashboardMetricCard
          title={t('Avg Booking Value')}
          value={formatPrice(metrics.avgBookingValue)}
          icon={DollarSign}
          change="+8.2%"
        />
        <DashboardMetricCard
          title={t('Conversion Rate')}
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          change="+3.1%"
        />
        <DashboardMetricCard
          title={t('Verification Pending')}
          value={metrics.verificationPending.toString()}
          icon={AlertCircle}
          onClick={() => navigate('/admin/kyc')}
          badge={
            metrics.verificationPending > 5
              ? { text: t('Action Required'), variant: 'destructive' }
              : undefined
          }
        />
        <DashboardMetricCard
          title={t('Avg Response Time')}
          value={metrics.avgResponseTime}
          icon={Clock}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card 
            key={kpi.title} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={kpi.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-green-600">
                {kpi.change} {t('admin.fromLastWeek')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.recentProperties')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">{t('admin.loading')}</p>
              ) : recentProperties.length > 0 ? (
                recentProperties.slice(0, 2).map((property) => (
                  <div key={property.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{property.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.city} • {property.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">DA {parseInt(property.price).toLocaleString()}</p>
                      <p className="text-sm text-green-600">{property.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">{t('admin.noPropertiesYet')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('Property Distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">{t('Loading')}</p>
              ) : (
                <>
                  {['Sale', 'Rent', 'Short Stay'].map((category) => {
                    const count = properties.filter(p => 
                      p.category.toLowerCase().includes(category.toLowerCase()) ||
                      p.property_type.toLowerCase().includes(category.toLowerCase())
                    ).length;
                    const percentage = properties.length > 0 ? Math.round((count / properties.length) * 100) : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{category}</p>
                          <p className="text-sm text-muted-foreground">{count} properties</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{percentage}%</p>
                          <p className="text-sm text-muted-foreground">of total</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
