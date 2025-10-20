import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Home, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { format, parseISO, addMonths } from "date-fns";
import RentPaymentModal from "@/components/RentPaymentModal";
import { toast } from "sonner";

interface RentalAgreement {
  id: string;
  property_id: string;
  host_user_id: string;
  tenant_user_id: string;
  monthly_rent: number;
  deposit_amount: number;
  start_date: string;
  end_date: string;
  lease_duration_months: number;
  status: string;
  currency: string;
  payment_terms: {
    payment_day: number;
    late_fee_percentage: number;
    grace_period_days: number;
    payment_method: string;
  };
  properties: {
    title: string;
    location: string;
    images: string[];
  };
  is_booking_only?: boolean;
}

interface RentPayment {
  id: string;
  due_date: string;
  amount: number;
  status: string;
  late_fee: number;
  payment_date: string | null;
}

const TenantAgreements = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [payments, setPayments] = useState<Record<string, RentPayment[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAgreement, setSelectedAgreement] = useState<RentalAgreement | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchAgreements();
  }, [user]);

  const fetchAgreements = async () => {
    if (!user) return;

    try {
      // Fetch both rental agreements AND rent bookings
      const [agreementsResult, bookingsResult] = await Promise.all([
        supabase
          .from('rental_agreements')
          .select(`
            *,
            properties (
              title,
              location,
              images
            )
          `)
          .eq('tenant_user_id', user.id)
          .in('status', ['active', 'pending_tenant', 'pending_host'])
          .order('created_at', { ascending: false }),
        
        supabase
          .from('bookings')
          .select(`
            *,
            properties!inner (
              title,
              location,
              images,
              category,
              price,
              price_currency,
              user_id
            )
          `)
          .eq('user_id', user.id)
          .eq('properties.category', 'rent')
          .in('status', ['pending_agreement', 'confirmed', 'payment_escrowed'])
          .order('created_at', { ascending: false })
      ]);

      const { data: agreementsData, error: agreementsError } = agreementsResult;
      const { data: bookingsData, error: bookingsError } = bookingsResult;

      if (agreementsError) throw agreementsError;
      if (bookingsError) console.error('Error fetching rent bookings:', bookingsError);

      // Combine agreements and bookings - show bookings as "pending agreement" rentals
      const combinedRentals = [
        ...(agreementsData as any || []),
        // Add rent bookings without agreements as pseudo-agreements
        ...(bookingsData || []).map(booking => {
          const property = booking.properties as any;
          return {
            id: booking.id,
            property_id: booking.property_id,
            tenant_user_id: booking.user_id,
            host_user_id: property?.user_id,
            monthly_rent: parseFloat(property?.price || '0'),
            deposit_amount: booking.security_deposit,
            start_date: booking.check_in_date,
            end_date: booking.check_out_date,
            lease_duration_months: 12,
            status: 'pending_agreement',
            currency: property?.price_currency || 'DZD',
            payment_terms: {
              payment_day: 1,
              late_fee_percentage: 5,
              grace_period_days: 3,
              payment_method: 'bank_transfer'
            },
            properties: booking.properties,
            is_booking_only: true
          };
        })
      ];

      setAgreements(combinedRentals);

      // Fetch payments for each agreement
      if (agreementsData && agreementsData.length > 0) {
        const paymentsPromises = agreementsData.map(agreement =>
          supabase
            .from('rent_payments')
            .select('*')
            .eq('agreement_id', agreement.id)
            .order('due_date', { ascending: false })
        );

        const paymentsResults = await Promise.all(paymentsPromises);
        const paymentsMap: Record<string, RentPayment[]> = {};
        
        agreementsData.forEach((agreement, index) => {
          paymentsMap[agreement.id] = paymentsResults[index].data || [];
        });

        setPayments(paymentsMap);
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
      toast.error('Failed to load rental agreements');
    } finally {
      setLoading(false);
    }
  };

  const getNextPaymentDue = (agreement: RentalAgreement): Date => {
    const today = new Date();
    const paymentDay = agreement.payment_terms.payment_day;
    const nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDay);
    
    if (nextPayment < today) {
      return new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);
    }
    return nextPayment;
  };

  const isPastDue = (dueDate: Date): boolean => {
    return dueDate < new Date();
  };

  const handlePayRent = (agreement: RentalAgreement) => {
    setSelectedAgreement(agreement);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (agreements.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No Active Rentals</h2>
            <p className="text-muted-foreground mb-6">You don't have any active rental agreements</p>
            <Button onClick={() => navigate('/rent')}>
              Browse Properties
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24 md:py-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Rentals</h1>
          <p className="text-muted-foreground">Manage your rental agreements and payments</p>
        </div>

        <div className="grid gap-6">
          {agreements.map((agreement) => {
            const nextDue = getNextPaymentDue(agreement);
            const overdue = isPastDue(nextDue);
            const agreementPayments = payments[agreement.id] || [];
            const pendingPayment = agreementPayments.find(p => p.status === 'pending');

            return (
              <Card key={agreement.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {agreement.properties.images?.[0] && (
                        <img
                          src={agreement.properties.images[0]}
                          alt={agreement.properties.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <CardTitle className="text-xl mb-2">
                          {agreement.properties.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Home className="w-4 h-4" />
                          {agreement.properties.location}
                        </div>
                        <Badge variant={agreement.status === 'active' ? 'default' : 'secondary'}>
                          {agreement.status === 'active' ? 'Active' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {agreement.monthly_rent.toLocaleString()} {agreement.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Lease Period:</span>
                        <span className="text-sm font-medium">
                          {format(parseISO(agreement.start_date), 'MMM d, yyyy')} - {format(parseISO(agreement.end_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Payment Day:</span>
                        <span className="text-sm font-medium">
                          {agreement.payment_terms.payment_day}{agreement.payment_terms.payment_day === 1 ? 'st' : agreement.payment_terms.payment_day === 2 ? 'nd' : agreement.payment_terms.payment_day === 3 ? 'rd' : 'th'} of each month
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Next Payment Due:</span>
                        <div className={`text-sm font-medium ${overdue ? 'text-destructive' : ''}`}>
                          {format(nextDue, 'MMMM d, yyyy')}
                          {overdue && (
                            <span className="ml-2 inline-flex items-center gap-1 text-destructive">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                      {pendingPayment && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Payment Processing
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Payment History */}
                  {agreementPayments.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-3">Recent Payments</h4>
                      <div className="space-y-2">
                        {agreementPayments.slice(0, 3).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg">
                            <div>
                              <span className="font-medium">
                                {format(parseISO(payment.due_date), 'MMM yyyy')}
                              </span>
                              {payment.payment_date && (
                                <span className="text-muted-foreground ml-2">
                                  • Paid on {format(parseISO(payment.payment_date), 'MMM d')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">
                                {payment.amount.toLocaleString()} {agreement.currency}
                              </span>
                              <Badge variant={
                                payment.status === 'paid' ? 'default' :
                                payment.status === 'pending' ? 'secondary' :
                                'destructive'
                              }>
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handlePayRent(agreement)}
                      disabled={agreement.status !== 'active' || !!pendingPayment}
                      className="flex-1"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {pendingPayment ? 'Payment in Progress' : 'Pay Rent Now'}
                    </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (agreement.is_booking_only) {
                        toast.info('Rental agreement pending. Host will create the agreement soon.');
                      } else {
                        navigate(`/agreement/${agreement.id}`);
                      }
                    }}
                    disabled={agreement.is_booking_only}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {agreement.is_booking_only ? 'Agreement Pending' : 'View Agreement'}
                  </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedAgreement && (
        <RentPaymentModal
          agreement={selectedAgreement}
          open={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedAgreement(null);
            fetchAgreements();
          }}
        />
      )}
    </div>
  );
};

export default TenantAgreements;
