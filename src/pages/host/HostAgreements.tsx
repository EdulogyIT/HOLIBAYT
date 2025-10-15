import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Agreement {
  id: string;
  property_id: string;
  lease_duration_months: number;
  start_date: string;
  monthly_rent: number;
  deposit_amount: number;
  currency: string;
  status: string;
  created_at: string;
  agreement_pdf_url: string | null;
  property: {
    title: string;
    city: string;
  };
}

const HostAgreements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAgreements();
    }
  }, [user]);

  const fetchAgreements = async () => {
    try {
      const { data, error } = await supabase
        .from('rental_agreements')
        .select(`
          *,
          property:properties(title, city)
        `)
        .eq('host_user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgreements(data || []);
    } catch (error) {
      console.error('Error fetching agreements:', error);
      toast.error('Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      pending_tenant: { variant: "secondary", label: "Awaiting Tenant" },
      pending_host: { variant: "secondary", label: "Awaiting Your Signature" },
      active: { variant: "default", label: "Active" },
      completed: { variant: "outline", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      terminated: { variant: "destructive", label: "Terminated" }
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rental Agreements</h1>
          <p className="text-muted-foreground mt-2">
            Manage your rental agreements and leases
          </p>
        </div>
      </div>

      {agreements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Agreements Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create rental agreements for your properties
            </p>
            <Button onClick={() => navigate('/host/listings')}>
              Go to Listings
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {agreements.map((agreement) => (
            <Card key={agreement.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        {agreement.property?.title || 'Property'}
                      </h3>
                      {getStatusBadge(agreement.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {agreement.property?.city || 'N/A'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-semibold">
                          {format(new Date(agreement.start_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-semibold">{agreement.lease_duration_months} months</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Rent</p>
                        <p className="font-semibold">
                          {agreement.monthly_rent.toLocaleString()} {agreement.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deposit</p>
                        <p className="font-semibold">
                          {agreement.deposit_amount.toLocaleString()} {agreement.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {agreement.agreement_pdf_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(agreement.agreement_pdf_url!, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => navigate(`/host/agreements/${agreement.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostAgreements;
