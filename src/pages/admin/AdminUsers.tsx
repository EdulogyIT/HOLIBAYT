import { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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

const mockUsers: AppUser[] = [
  {
    id: 'U001',
    name: 'Ahmed Benali',
    email: 'ahmed.benali@email.com',
    phone: '+213 555 123 456',
    role: 'host',
    status: 'active',
    verificationStatus: 'verified',
    joinDate: '2024-01-15',
    lastActive: '2024-01-20',
    propertyCount: 3,
    bookingCount: 45
  },
  {
    id: 'U002',
    name: 'Fatima Khediri',
    email: 'fatima.khediri@email.com',
    phone: '+213 555 234 567',
    role: 'user',
    status: 'active',
    verificationStatus: 'verified',
    joinDate: '2024-01-10',
    lastActive: '2024-01-19',
    bookingCount: 12
  },
  {
    id: 'U003',
    name: 'Youcef Meziane',
    email: 'youcef.meziane@email.com',
    role: 'host',
    status: 'pending',
    verificationStatus: 'pending',
    joinDate: '2024-01-18',
    lastActive: '2024-01-18',
    propertyCount: 1,
    bookingCount: 0
  }
];

export default function AdminUsers() {
  const { t } = useLanguage();
  const [users] = useState<AppUser[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
            <div className="text-2xl font-bold">2,543</div>
            <p className="text-xs text-muted-foreground">+18% {t('admin.thisMonth')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.activeHosts')}</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-muted-foreground">{t('admin.propertiesPublished')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.verifiedAccounts')}</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,876</div>
            <p className="text-xs text-muted-foreground">74% {t('admin.ofTotal')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.pending')}</CardTitle>
            <UserX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div>
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('admin.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
                <SelectItem value="user">{t('admin.users')}</SelectItem>
                <SelectItem value="host">{t('admin.hosts')}</SelectItem>
                <SelectItem value="admin">{t('admin.admins')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('admin.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('admin.active')}</SelectItem>
                <SelectItem value="pending">{t('admin.pending')}</SelectItem>
                <SelectItem value="suspended">{t('admin.suspended')}</SelectItem>
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
              <TableRow>
                <TableHead>{t('admin.user')}</TableHead>
                <TableHead>{t('admin.contact')}</TableHead>
                <TableHead>{t('admin.role')}</TableHead>
                <TableHead>{t('admin.status')}</TableHead>
                <TableHead>{t('admin.verification')}</TableHead>
                <TableHead>{t('admin.activity')}</TableHead>
                <TableHead>{t('admin.stats')}</TableHead>
                <TableHead>{t('admin.actions')}</TableHead>
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
                      <Button size="sm" variant="outline">
                        {t('admin.view')}
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
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
    </div>
  );
}