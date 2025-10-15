import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Scale, Check, X, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LawyerRequest {
  id: string;
  user_id: string;
  lawyer_id: string;
  property_id: string | null;
  request_type: string;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user_profile?: { name: string; email: string };
  lawyer_profile?: { full_name: string; email: string; phone: string };
  property?: { title: string };
}

const AdminLawyerRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LawyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LawyerRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('lawyer_requests')
        .select(`
          *,
          lawyers(full_name, email, phone),
          properties(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user profiles separately
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', request.user_id)
            .single();
          
          return {
            ...request,
            user_profile: profile,
            lawyer_profile: request.lawyers as any,
            property: request.properties as any,
          };
        })
      );
      
      setRequests(requestsWithProfiles as any);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (request: LawyerRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes(request.admin_notes || '');
    setDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('lawyer_requests')
        .update({
          status: actionType === 'approve' ? 'approved' : 'rejected',
          admin_notes: adminNotes,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setDialogOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" />
            Lawyer Requests
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and approve user requests to contact lawyers
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Lawyer</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user_profile?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.user_profile?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.lawyer_profile?.full_name}</div>
                    </TableCell>
                    <TableCell>
                      {request.property?.title || 'No Property'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.request_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => handleOpenDialog(request, 'approve')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleOpenDialog(request, 'reject')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(request, 'approve')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Lawyer Request
            </DialogTitle>
            <DialogDescription>
              Review the request details and {actionType === 'approve' ? 'approve' : 'reject'} the contact request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>User:</strong> {selectedRequest.user_profile?.name} ({selectedRequest.user_profile?.email})
                </p>
                <p className="text-sm">
                  <strong>Lawyer:</strong> {selectedRequest.lawyer_profile?.full_name}
                </p>
                <p className="text-sm">
                  <strong>Request Type:</strong> {selectedRequest.request_type}
                </p>
                {selectedRequest.property_id && (
                  <p className="text-sm">
                    <strong>Property:</strong> {selectedRequest.property?.title}
                  </p>
                )}
                {selectedRequest.message && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-medium mb-1">User Message:</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.message}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this request..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAction}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {actionType === 'approve' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve & Share Contact
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLawyerRequests;