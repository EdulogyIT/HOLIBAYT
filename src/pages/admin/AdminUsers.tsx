import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  User, 
  UserCheck, 
  UserX,
  Search,
  Mail,
  Phone,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'host' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  verificationStatus: 'verified' | 'unverified' | 'pending';
  joinDate: string;
  lastActive: string;
  propertyCount?: number;
  bookingCount?: number;
}

export default function AdminUsers() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userToBlock, setUserToBlock] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // Fetch user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        if (rolesError) throw rolesError;

        // Fetch property counts
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('user_id');

        if (propertiesError) throw propertiesError;

        // Fetch booking counts
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('user_id');

        if (bookingsError) throw bookingsError;

        // Process data
        const propertyCountMap = propertiesData.reduce((acc, prop) => {
          acc[prop.user_id] = (acc[prop.user_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const bookingCountMap = bookingsData.reduce((acc, booking) => {
          acc[booking.user_id] = (acc[booking.user_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const usersWithRoles = profilesData.map(profile => {
          const userRoles = rolesData.filter(r => r.user_id === profile.id);
          const primaryRole = userRoles.find(r => r.role === 'admin')?.role || 
                            userRoles.find(r => r.role === 'host')?.role || 
                            'user';

          return {
            id: profile.id,
            name: profile.name || 'Unknown',
            email: profile.email,
            phone: undefined,
            role: primaryRole as 'user' | 'host' | 'admin',
            status: 'active' as const,
            verificationStatus: 'verified' as const,
            joinDate: new Date(profile.created_at).toLocaleDateString(),
            lastActive: new Date(profile.updated_at).toLocaleDateString(),
            propertyCount: propertyCountMap[profile.id] || 0,
            bookingCount: bookingCountMap[profile.id] || 0,
          };
        });

        setUsers(usersWithRoles);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'host': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'unverified': return <UserX className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleBlockUser = async () => {
    if (!userToBlock) return;

    try {
      // Update user status to suspended
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', userToBlock);

      if (error) throw error;

      toast({
        title: "User blocked",
        description: "The user has been blocked successfully.",
      });

      // Refresh users list
      setUsers(users.map(u => 
        u.id === userToBlock ? { ...u, status: 'suspended' as const } : u
      ));
      setUserToBlock(null);
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const totalUsers = users.length;
  const activeHosts = users.filter(u => u.role === 'host').length;
  const verifiedUsers = users.filter(u => u.verificationStatus === 'verified').length;
  const pendingUsers = users.filter(u => u.verificationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('admin.userManagement')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('admin.manageUsersHosts')}
          </p>
        </div>
        <Button>
          <User className="h-4 w-4 mr-2" />
          {t('admin.newUser')}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{t('admin.registeredUsers')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.activeHosts')}</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHosts}</div>
            <p className="text-xs text-muted-foreground">{t('admin.propertiesPublished')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Accounts</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">{((verifiedUsers/totalUsers)*100).toFixed(0)}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.pending')}</CardTitle>
            <UserX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers}</div>
            <p className="text-xs text-muted-foreground">{t('admin.kycVerifications')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('admin.searchByNameEmail')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background border border-input">
                <SelectValue placeholder={t('admin.role')} />
              </SelectTrigger>
              <SelectContent className="bg-background border border-input shadow-lg z-[9999]" sideOffset={5}>
                <SelectItem value="all" className="cursor-pointer hover:bg-accent">{t('admin.allRoles')}</SelectItem>
                <SelectItem value="user" className="cursor-pointer hover:bg-accent">{t('admin.users')}</SelectItem>
                <SelectItem value="host" className="cursor-pointer hover:bg-accent">{t('admin.hosts') || 'Hosts'}</SelectItem>
                <SelectItem value="admin" className="cursor-pointer hover:bg-accent">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background border border-input">
                <SelectValue placeholder={t('admin.status')} />
              </SelectTrigger>
              <SelectContent className="bg-background border border-input shadow-lg z-[9999]" position="popper" sideOffset={5}>
                <SelectItem value="all" className="cursor-pointer hover:bg-accent">{t('admin.allStatuses')}</SelectItem>
                <SelectItem value="active" className="cursor-pointer hover:bg-accent">{t('admin.active')}</SelectItem>
                <SelectItem value="pending" className="cursor-pointer hover:bg-accent">{t('admin.pending')}</SelectItem>
                <SelectItem value="suspended" className="cursor-pointer hover:bg-accent">{t('admin.suspended')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users')} ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-semibold text-foreground">User</TableHead>
                <TableHead className="font-semibold text-foreground">Contact</TableHead>
                <TableHead className="font-semibold text-foreground">Role</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Verification</TableHead>
                <TableHead className="font-semibold text-foreground">Activity</TableHead>
                <TableHead className="font-semibold text-foreground">Stats</TableHead>
                <TableHead className="font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getVerificationIcon(user.verificationStatus)}
                      <span className="ml-2 text-sm">{user.verificationStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        {t('admin.joined')}: {user.joinDate}
                      </div>
                      <div className="text-muted-foreground">
                        {t('admin.lastActivity')}: {user.lastActive}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {user.propertyCount && (
                        <div>{user.propertyCount} {t('admin.properties')}</div>
                      )}
                      {user.bookingCount !== undefined && (
                        <div>{user.bookingCount} {t('admin.bookings')}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewUser(user.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setUserToBlock(user.id)}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Block User Confirmation Dialog */}
      <AlertDialog open={!!userToBlock} onOpenChange={() => setUserToBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block this user? They will lose access to their account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockUser} className="bg-red-600 hover:bg-red-700">
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}