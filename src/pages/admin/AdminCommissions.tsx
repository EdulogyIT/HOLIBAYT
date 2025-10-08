import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Home, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CommissionData {
  id: string;
  total_amount: number;
  commission_rate: number;
  commission_amount: number;
  host_amount: number;
  status: string;
  created_at: string;
  properties: {
    id: string;
    title: string;
  };
  payments: {
    currency: string;
  };
  host_profile: {
    name: string;
    email: string;
  } | null;
}

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [completedCommissions, setCompletedCommissions] = useState(0);
  const [pendingCommissions, setPendingCommissions] = useState(0);

  useEffect(() => {
    fetchCommissions();
  }, [timeFilter]);

  const fetchCommissions = async () => {
    try {
      let query = supabase
        .from('commission_transactions')
        .select(`
          *,
          properties!inner(id, title),
          payments!inner(currency),
          host_profile:profiles!commission_transactions_host_user_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false});

      // Apply time filter
      if (timeFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        if (timeFilter === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (timeFilter === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (timeFilter === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else if (timeFilter === 'year') {
          startDate.setFullYear(now.getFullYear() - 1);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setCommissions(data || []);

      // Calculate totals
      const total = data?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
      const completed = data?.filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
      const pending = data?.filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

      setTotalCommissions(total);
      setCompletedCommissions(completed);
      setPendingCommissions(pending);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // Group by property
  const commissionsByProperty = commissions.reduce((acc, commission) => {
    const propertyId = commission.properties?.id || 'unknown';
    if (!acc[propertyId]) {
      acc[propertyId] = {
        propertyTitle: commission.properties?.title || 'Unknown Property',
        total: 0,
        count: 0,
        commissions: []
      };
    }
    acc[propertyId].total += Number(commission.commission_amount);
    acc[propertyId].count += 1;
    acc[propertyId].commissions.push(commission);
    return acc;
  }, {} as Record<string, any>);

  const propertyStats = Object.entries(commissionsByProperty)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commission Earnings</h1>
          <p className="text-muted-foreground">
            Track platform commissions from bookings
          </p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommissions, 'USD')}</div>
            <p className="text-xs text-muted-foreground mt-1">All transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(completedCommissions, 'USD')}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid out to platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingCommissions, 'USD')}</div>
            <p className="text-xs text-muted-foreground mt-1">In active bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total bookings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="properties">By Property</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No commission transactions found
                </div>
              ) : (
                <div className="space-y-4">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{commission.properties?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Host: {commission.host_profile?.name || commission.host_profile?.email || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(commission.created_at).toLocaleDateString()} • 
                          Rate: {(commission.commission_rate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Total: {formatCurrency(commission.total_amount, commission.payments?.currency)}
                        </p>
                        <p className="font-bold text-lg text-green-600">
                          {formatCurrency(commission.commission_amount, commission.payments?.currency)}
                        </p>
                        <Badge 
                          variant={
                            commission.status === 'completed' ? 'default' : 
                            commission.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Properties by Commission</CardTitle>
            </CardHeader>
            <CardContent>
              {propertyStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No property data available
                </div>
              ) : (
                <div className="space-y-4">
                  {propertyStats.map(([propertyId, stats], index) => (
                    <div key={propertyId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{stats.propertyTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {stats.count} {stats.count === 1 ? 'booking' : 'bookings'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">
                          {formatCurrency(stats.total, 'USD')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Avg: {formatCurrency(stats.total / stats.count, 'USD')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
