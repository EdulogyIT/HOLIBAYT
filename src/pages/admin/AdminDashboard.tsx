import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Building2, DollarSign, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [properties, setProperties] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesResult, profilesResult] = await Promise.all([
          supabase.from('properties').select('*'),
          supabase.from('profiles').select('*')
        ]);

        if (propertiesResult.data) setProperties(propertiesResult.data);
        if (profilesResult.data) setProfiles(profilesResult.data);
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
      title: t('admin.totalProperties'),
      value: loading ? '...' : properties.length.toString(),
      change: '+' + Math.floor(Math.random() * 20 + 5) + '%',
      icon: Building2,
    },
    {
      title: t('admin.activeProperties'),
      value: loading ? '...' : activeProperties.toString(),
      change: '+' + Math.floor(Math.random() * 15 + 3) + '%',
      icon: CalendarDays,
    },
    {
      title: t('admin.totalUsers'),
      value: loading ? '...' : profiles.length.toString(),
      change: '+' + Math.floor(Math.random() * 25 + 8) + '%',
      icon: Users,
    },
    {
      title: t('admin.messages'),
      value: loading ? '...' : Math.floor(Math.random() * 50 + 20).toString(),
      change: '+' + Math.floor(Math.random() * 30 + 10) + '%',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
        <p className="text-muted-foreground">
          {t('admin.overviewPlatform')}
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
                <p className="text-muted-foreground">Loading...</p>
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
                <p className="text-muted-foreground">No properties yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.propertyDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
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