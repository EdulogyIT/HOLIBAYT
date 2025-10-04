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
  Building2, 
  MapPin, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Plus,
  Download,
  FileText,
  FileSpreadsheet,
  Check,
  X,
  Ban,
  Award
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToPDF, exportToWord } from '@/utils/exportData';
import { BadgeManagementDialog } from '@/components/admin/BadgeManagementDialog';


export default function AdminProperties() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.category?.includes(typeFilter);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeProperties = properties.filter(p => p.status === 'active').length;
  const pendingProperties = properties.filter(p => p.status === 'pending').length;
  const suspendedProperties = properties.filter(p => p.status === 'suspended').length;

  const handleView = (propertyId: string) => {
    window.open(`/property/${propertyId}`, '_blank');
  };

  const handleEdit = (propertyId: string) => {
    navigate(`/edit-property/${propertyId}`);
  };

  const handleDeleteClick = (propertyId: string) => {
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
  };

  const handleBadgeClick = (property: any) => {
    setSelectedProperty(property);
    setBadgeDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete);

      if (error) throw error;

      toast.success('Property deleted successfully');
      setProperties(properties.filter(p => p.id !== propertyToDelete));
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    } finally {
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleApprove = async (propertyId: string) => {
    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) {
        console.error('Property not found:', propertyId);
        toast.error('Property not found');
        return;
      }

      console.log('Starting approval for property:', {
        id: property.id,
        title: property.title,
        owner_id: property.user_id,
        current_status: property.status
      });

      // Update property status
      const { error: updateError } = await supabase
        .from('properties')
        .update({ status: 'active' })
        .eq('id', propertyId);

      if (updateError) {
        console.error('Error updating property status:', updateError);
        throw updateError;
      }

      console.log('Property status updated to active, now creating notification...');

      // Create notification for the property owner
      const notificationPayload = {
        user_id: property.user_id,
        title: 'Property Approved',
        message: `Your property "${property.title}" has been approved and is now live!`,
        type: 'property_approval',
        related_id: propertyId
      };

      console.log('Inserting notification with payload:', notificationPayload);

      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationPayload)
        .select();

      if (notificationError) {
        console.error('❌ NOTIFICATION INSERT FAILED:', {
          error: notificationError,
          code: notificationError.code,
          message: notificationError.message,
          details: notificationError.details,
          hint: notificationError.hint,
          payload: notificationPayload
        });
        toast.warning('Property approved but failed to send notification');
      } else {
        console.log('✅ Notification created successfully:', notificationData);
        toast.success('Property approved and host notified');
      }

      setProperties(properties.map(p => 
        p.id === propertyId ? { ...p, status: 'active' } : p
      ));
    } catch (error) {
      console.error('Error in handleApprove:', error);
      toast.error('Failed to approve property');
    }
  };

  const handleReject = async (propertyId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return;

      // Update property status
      const { error } = await supabase
        .from('properties')
        .update({ status: 'suspended' })
        .eq('id', propertyId);

      if (error) throw error;

      console.log('Property rejected, creating notification for user:', property.user_id);

      // Create notification for the property owner
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: property.user_id,
          title: 'Property Rejected',
          message: `Your property "${property.title}" was rejected. Reason: ${reason}`,
          type: 'property_rejection',
          related_id: propertyId
        })
        .select();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        console.error('Notification details:', {
          user_id: property.user_id,
          property_id: propertyId,
          property_title: property.title,
          reason: reason
        });
        toast.warning('Property rejected but failed to send notification');
      } else {
        console.log('Notification created successfully:', notificationData);
        toast.success('Property rejected and host notified');
      }

      setProperties(properties.map(p => 
        p.id === propertyId ? { ...p, status: 'suspended' } : p
      ));
    } catch (error) {
      console.error('Error rejecting property:', error);
      toast.error('Failed to reject property');
    }
  };

  const handleExport = (format: 'excel' | 'pdf' | 'word') => {
    if (filteredProperties.length === 0) {
      toast.error('No properties to export');
      return;
    }

    // Prepare data for export
    const exportData = filteredProperties.map(property => ({
      'Property ID': property.id.slice(0, 8),
      'Title': property.title,
      'Category': property.category,
      'City': property.city,
      'Location': property.location,
      'Owner': property.contact_name,
      'Price': `${property.price} DA`,
      'Status': property.status || 'active',
      'Created Date': new Date(property.created_at).toLocaleDateString(),
      'Property Type': property.property_type,
      'Area': property.area,
      'Bedrooms': property.bedrooms || 'N/A',
      'Bathrooms': property.bathrooms || 'N/A',
    }));

    const filename = `properties_export_${new Date().toISOString().split('T')[0]}`;
    const title = 'Properties Export Report';

    try {
      switch (format) {
        case 'excel':
          exportToExcel(exportData, filename);
          toast.success('Exported to Excel successfully');
          break;
        case 'pdf':
          exportToPDF(exportData, filename, title);
          toast.success('PDF export initiated - check your print dialog');
          break;
        case 'word':
          exportToWord(exportData, filename, title);
          toast.success('Exported to Word successfully');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all properties on the platform
          </p>
        </div>
        <div className="flex space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('word')}>
                <FileText className="h-4 w-4 mr-2" />
                Export to Word
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Property
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : properties.length}</div>
            <p className="text-xs text-muted-foreground">Total registered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : activeProperties}</div>
            <p className="text-xs text-muted-foreground">{properties.length > 0 ? Math.round((activeProperties/properties.length)*100) : 0}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Building2 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : pendingProperties}</div>
            <p className="text-xs text-muted-foreground">Needs validation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Building2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : suspendedProperties}</div>
            <p className="text-xs text-muted-foreground">Issues detected</p>
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
                placeholder="Search by title, owner or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sale">For Sale</SelectItem>
                <SelectItem value="Rent">For Rent</SelectItem>
                <SelectItem value="Short Stay">Short Stay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({filteredProperties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading properties...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{property.title}</div>
                        <div className="text-sm text-muted-foreground">ID: {property.id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{property.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {property.city}
                      </div>
                    </TableCell>
                    <TableCell>{property.contact_name}</TableCell>
                    <TableCell>{property.price} DA</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(property.status || 'active')}>
                        {property.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                     <TableCell>
                      <div className="flex space-x-2">
                        {property.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(property.id)}
                              title="Approve Property"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleReject(property.id)}
                              title="Reject Property"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {property.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-orange-600 hover:text-orange-700"
                            onClick={() => handleReject(property.id)}
                            title="Suspend Property"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                         )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleBadgeClick(property)}
                          title="Manage Badges"
                        >
                          <Award className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleView(property.id)}
                          title="View Property"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEdit(property.id)}
                          title="Edit Property"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(property.id)}
                          title="Delete Property"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property
              and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Badge Management Dialog */}
      {selectedProperty && (
        <BadgeManagementDialog
          isOpen={badgeDialogOpen}
          onClose={() => setBadgeDialogOpen(false)}
          propertyId={selectedProperty.id}
          currentBadges={{
            is_hot_deal: selectedProperty.is_hot_deal || false,
            is_verified: selectedProperty.is_verified || false,
            is_new: selectedProperty.is_new || false,
          }}
          onUpdate={() => {
            // Refresh properties list
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}