import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Star, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/layouts/AdminLayout';

export default function AdminSuperhost() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      // Get all users who have properties
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('user_id');

      if (propError) throw propError;

      const hostIds = [...new Set(properties?.map((p) => p.user_id) || [])];

      // Get profiles for these hosts
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', hostIds);

      if (profileError) throw profileError;

      setHosts(profiles || []);
    } catch (error) {
      console.error('Error fetching hosts:', error);
      toast.error('Failed to load hosts');
    } finally {
      setLoading(false);
    }
  };

  const toggleSuperhost = async (hostId: string, currentStatus: boolean) => {
    try {
      console.log('🏆 Toggling superhost status:', { hostId, currentStatus, newStatus: !currentStatus });
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_superhost: !currentStatus })
        .eq('id', hostId);

      if (error) {
        console.error('❌ Error updating superhost status:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully');

      // Create celebratory notification for new superhost
      if (!currentStatus) {
        console.log('🎉 Creating superhost promotion notification for user:', hostId);
        
        const notificationPayload = {
          user_id: hostId,
          title: '🎉 Congratulations! You are now a Superhost!',
          message: 'You have been recognized for your exceptional hosting. Welcome to the exclusive Superhost community!',
          type: 'superhost_promotion',
          related_id: hostId
        };
        
        console.log('📤 Notification payload:', notificationPayload);
        
        const { data: notifData, error: notifError } = await supabase
          .from('notifications')
          .insert(notificationPayload)
          .select();

        if (notifError) {
          console.error('❌ Error creating superhost notification:', {
            error: notifError,
            code: notifError.code,
            message: notifError.message,
            details: notifError.details,
            payload: notificationPayload
          });
          toast.error('Superhost status updated but failed to send notification');
        } else {
          console.log('✅ Superhost notification created successfully:', notifData);
          toast.success('Host promoted to Superhost and notification sent!');
        }
      } else {
        toast.success('Superhost status removed');
      }
      
      fetchHosts();
    } catch (error) {
      console.error('❌ Error in toggleSuperhost:', error);
      toast.error('Failed to update superhost status');
    }
  };

  const filteredHosts = hosts.filter((host) =>
    host.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const superhostCount = hosts.filter((h) => h.is_superhost).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Superhost Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage superhost status for property hosts
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hosts</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hosts.length}</div>
            <p className="text-xs text-muted-foreground">Active property hosts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Superhosts</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{superhostCount}</div>
            <p className="text-xs text-muted-foreground">
              {hosts.length > 0
                ? Math.round((superhostCount / hosts.length) * 100)
                : 0}
              % of total hosts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hosts.length > 0
                ? (
                    hosts.reduce((sum, h) => sum + (h.average_rating || 0), 0) /
                    hosts.length
                  ).toFixed(2)
                : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Across all hosts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search hosts by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hosts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hosts ({filteredHosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading hosts...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Host</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHosts.map((host) => (
                  <TableRow key={host.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{host.name}</span>
                        {host.is_superhost && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{host.email}</TableCell>
                    <TableCell>
                      {host.is_superhost ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Superhost
                        </Badge>
                      ) : (
                        <Badge variant="outline">Host</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{host.average_rating?.toFixed(2) || '0.00'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{host.total_reviews || 0}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={host.is_superhost ? 'outline' : 'default'}
                        onClick={() =>
                          toggleSuperhost(host.id, host.is_superhost)
                        }
                      >
                        {host.is_superhost
                          ? 'Remove Superhost'
                          : 'Make Superhost'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}
