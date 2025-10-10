import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HostKYCForm } from '@/components/HostKYCForm';
import { toast } from 'sonner';

export default function HostKYC() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKYCStatus();
  }, [user]);

  const fetchKYCStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('host_kyc_submissions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setKycStatus(data);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      toast.error('Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </Badge>
        );
      case 'requires_changes':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Requires Changes
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (kycStatus) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Host Verification Status</h1>
          <p className="text-muted-foreground mt-2">
            Your KYC submission status and details
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>KYC Submission</CardTitle>
              {getStatusBadge(kycStatus.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{kycStatus.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nationality</p>
                <p className="font-medium">{kycStatus.nationality}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{kycStatus.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted On</p>
                <p className="font-medium">
                  {new Date(kycStatus.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {kycStatus.status === 'approved' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Congratulations! Your KYC has been approved. You can now get verified badges on your properties.
                </AlertDescription>
              </Alert>
            )}

            {kycStatus.status === 'pending' && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Your KYC submission is under review. We'll notify you once the review is complete.
                </AlertDescription>
              </Alert>
            )}

            {kycStatus.status === 'rejected' && kycStatus.rejection_reason && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <p className="font-semibold">Rejection Reason:</p>
                  <p>{kycStatus.rejection_reason}</p>
                </AlertDescription>
              </Alert>
            )}

            {kycStatus.status === 'requires_changes' && kycStatus.admin_notes && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <p className="font-semibold">Admin Notes:</p>
                  <p>{kycStatus.admin_notes}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Get Verified as a Host</h1>
        <p className="text-muted-foreground mt-2">
          Complete your KYC verification to earn a verified badge on your properties
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your information is secure and will only be used for verification purposes. All data is encrypted and protected.
        </AlertDescription>
      </Alert>

      <HostKYCForm onSubmitSuccess={() => navigate('/host/dashboard')} />
    </div>
  );
}
