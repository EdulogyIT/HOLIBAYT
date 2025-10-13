import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
        .select('*, profiles!host_kyc_submissions_user_id_fkey(name, email)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching KYC submissions:', error);
        toast.error('Failed to load KYC submissions');
        return;
      }
      
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
      
      // Step 1: Get the submission to find user_id
      const { data: submission, error: fetchError } = await supabase
        .from('host_kyc_submissions')
        .select('user_id')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;
      if (!submission) throw new Error('Submission not found');

      // Step 2: Update KYC submission status
      const { error: kycError } = await supabase
        .from('host_kyc_submissions')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
        })
        .eq('id', submissionId);

      if (kycError) throw kycError;

      // Step 3: Update profile to mark host as verified
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          id_verified: true,
          verified_host: true,
          kyc_approved_at: new Date().toISOString(),
        })
        .eq('id', submission.user_id);

      if (profileError) throw profileError;

      toast.success('KYC approved successfully! Host is now verified.');
      fetchSubmissions();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC: ' + (error as Error).message);
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

  const handleRequestChanges = async (submissionId: string) => {
    if (!adminNotes.trim()) {
      toast.error('Please provide notes for requested changes');
      return;
    }

    try {
      const { error } = await supabase
        .from('host_kyc_submissions')
        .update({
          status: 'requires_changes',
          admin_notes: adminNotes,
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Changes requested');
      fetchSubmissions();
      setDialogOpen(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to request changes');
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
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading KYC submissions..." />
      </div>
    );
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
                    placeholder={
                      actionType === 'reject' 
                        ? "Rejection reason..." 
                        : actionType === 'request_changes'
                        ? "Notes for requested changes..."
                        : "Admin notes (optional)..."
                    }
                    value={actionType === 'reject' ? rejectionReason : adminNotes}
                    onChange={(e) => 
                      actionType === 'reject' 
                        ? setRejectionReason(e.target.value) 
                        : setAdminNotes(e.target.value)
                    }
                  />
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActionType('request_changes');
                        handleRequestChanges(selectedSubmission.id);
                      }}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Request Changes
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setActionType('reject');
                        handleReject(selectedSubmission.id);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setActionType('approve');
                        handleApprove(selectedSubmission.id);
                      }}
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
