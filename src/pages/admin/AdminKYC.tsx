import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminKYC() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_changes'>('approve');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('host_kyc_submissions')
        .select('*, profiles(name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
      toast.error('Failed to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('host_kyc_submissions')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('KYC approved successfully');
      fetchSubmissions();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC');
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const { error } = await supabase
        .from('host_kyc_submissions')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('KYC rejected');
      fetchSubmissions();
      setDialogOpen(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error('Failed to reject KYC');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'requires_changes':
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />Changes Needed</Badge>;
      default:
        return null;
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KYC Management</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve host verification submissions
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {pendingCount} Pending Review
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All KYC Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Host Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.full_name}</TableCell>
                  <TableCell>{(submission.profiles as any)?.email}</TableCell>
                  <TableCell>{submission.nationality}</TableCell>
                  <TableCell>
                    {new Date(submission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(submission.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review KYC Submission</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedSubmission.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{selectedSubmission.date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nationality</p>
                    <p className="font-medium">{selectedSubmission.nationality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedSubmission.phone_number}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>{selectedSubmission.address_line_1}</p>
                  {selectedSubmission.address_line_2 && <p>{selectedSubmission.address_line_2}</p>}
                  <p>{selectedSubmission.city}, {selectedSubmission.state} {selectedSubmission.postal_code}</p>
                  <p>{selectedSubmission.country}</p>
                </CardContent>
              </Card>

              {/* Identity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Identity Verification</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID Type</p>
                    <p className="font-medium">{selectedSubmission.id_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID Number</p>
                    <p className="font-medium">{selectedSubmission.id_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{selectedSubmission.id_expiry_date}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Bio */}
              {selectedSubmission.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedSubmission.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              {selectedSubmission.status === 'pending' && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Rejection reason (if rejecting)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedSubmission.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedSubmission.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
