import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { TrendingUp, DollarSign, Filter, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyPricing {
  id: string;
  title: string;
  price: string;
  price_type: string;
  price_currency: string;
  category: string;
  status: string;
  commission_rate: number;
}

export default function AdminPricing() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [properties, setProperties] = useState<PropertyPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchProperties();
  }, [filterCategory, filterStatus]);

  const fetchProperties = async () => {
    try {
      let query = supabase
        .from('properties')
        .select('id, title, price, price_type, price_currency, category, status, commission_rate')
        .order('created_at', { ascending: false });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCommissionUpdate = async (newRate: number) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ commission_rate: newRate })
        .in('id', properties.map(p => p.id));

      if (error) throw error;
      toast.success(`Updated commission rate to ${newRate * 100}% for ${properties.length} properties`);
      fetchProperties();
    } catch (error) {
      console.error('Error updating commission rates:', error);
      toast.error('Failed to update commission rates');
    }
  };

  const exportPricingData = () => {
    const csv = [
      ['Property Title', 'Price', 'Type', 'Currency', 'Category', 'Commission Rate', 'Status'],
      ...properties.map(p => [
        p.title,
        p.price,
        p.price_type,
        p.price_currency,
        p.category,
        `${p.commission_rate * 100}%`,
        p.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground">Manage property pricing and commission rates</p>
        </div>
        <Button onClick={exportPricingData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Price (DZD)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(properties.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0) / properties.length || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((properties.reduce((sum, p) => sum + p.commission_rate, 0) / properties.length || 0) * 100)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Bulk Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="short-stay">Short Stay</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bulk Update Commission</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkCommissionUpdate(0.10)}>
                  10%
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkCommissionUpdate(0.15)}>
                  15%
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkCommissionUpdate(0.20)}>
                  20%
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Pricing</CardTitle>
          <CardDescription>
            View and manage pricing for all properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {property.title}
                  </TableCell>
                  <TableCell>
                    {formatPrice(parseFloat(property.price), property.price_type, property.price_currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{property.category}</Badge>
                  </TableCell>
                  <TableCell>{Math.round(property.commission_rate * 100)}%</TableCell>
                  <TableCell>
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => window.location.href = `/property/${property.id}`}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
