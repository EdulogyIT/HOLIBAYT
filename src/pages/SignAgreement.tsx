import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/SignaturePad";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, FileText, CheckCircle } from "lucide-react";

export default function SignAgreement() {
  const { agreementId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signature, setSignature] = useState<string>("");

  useEffect(() => {
    if (agreementId && user) {
      fetchAgreement();
    }
  }, [agreementId, user]);

  const fetchAgreement = async () => {
    try {
      const { data: agreementData, error: agreementError } = await supabase
        .from("rental_agreements")
        .select("*")
        .eq("id", agreementId)
        .single();

      if (agreementError) throw agreementError;

      // Check if user is authorized to sign
      const isHost = user?.id === agreementData.host_user_id;
      const isTenant = user?.id === agreementData.tenant_user_id;

      if (!isHost && !isTenant) {
        toast.error("You are not authorized to sign this agreement");
        navigate("/");
        return;
      }

      setAgreement(agreementData);

      // Fetch property details
      const { data: propertyData } = await supabase
        .from("properties")
        .select("*")
        .eq("id", agreementData.property_id)
        .single();

      setProperty(propertyData);
    } catch (error) {
      console.error("Error fetching agreement:", error);
      toast.error("Failed to load agreement");
    } finally {
      setLoading(false);
    }
  };

  const handleSignature = (signatureData: string) => {
    setSignature(signatureData);
    toast.success("Signature saved");
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!signature) {
      toast.error("Please provide your signature");
      return;
    }

    setSubmitting(true);

    try {
      const signatureType = user?.id === agreement.host_user_id ? "host" : "tenant";

      const { data, error } = await supabase.functions.invoke("sign-rental-agreement", {
        body: {
          agreement_id: agreementId,
          signature_type: signatureType,
          signature_data: {
            ip_address: "", // Browser doesn't have direct access to IP
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            signature_image: signature,
          },
        },
      });

      if (error) throw error;

      toast.success("Agreement signed successfully!");
      
      // Navigate based on user role
      if (signatureType === "host") {
        navigate("/host/agreements");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error signing agreement:", error);
      toast.error("Failed to sign agreement");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!agreement || !property) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Agreement not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isHost = user?.id === agreement.host_user_id;
  const alreadySigned = isHost ? agreement.host_signed_at : agreement.tenant_signed_at;

  if (alreadySigned) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <CardTitle className="text-2xl">Agreement Already Signed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                You have already signed this agreement on{" "}
                {new Date(alreadySigned).toLocaleDateString()}
              </p>
              <Button onClick={() => navigate(isHost ? "/host/agreements" : "/profile")}>
                View Agreements
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Sign Rental Agreement</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Please review and sign the rental agreement for {property.title}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Agreement Summary */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">Agreement Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Property:</span>
                  <p className="font-medium">{property.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Monthly Rent:</span>
                  <p className="font-medium">
                    {agreement.monthly_rent} {agreement.currency}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Security Deposit:</span>
                  <p className="font-medium">
                    {agreement.deposit_amount} {agreement.currency}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Lease Duration:</span>
                  <p className="font-medium">{agreement.lease_duration_months} months</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <p className="font-medium">
                    {new Date(agreement.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <p className="font-medium">
                    {new Date(agreement.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement Document */}
            {agreement.agreement_pdf_url && (
              <div>
                <h3 className="font-semibold mb-2">Agreement Document</h3>
                <Button variant="outline" asChild>
                  <a href={agreement.agreement_pdf_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Agreement PDF
                  </a>
                </Button>
              </div>
            )}

            {/* Special Clauses */}
            {agreement.special_clauses && (
              <div>
                <h3 className="font-semibold mb-2">Special Clauses</h3>
                <div className="bg-muted/20 p-4 rounded-md text-sm">
                  {agreement.special_clauses}
                </div>
              </div>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start space-x-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I agree to the terms and conditions
                </Label>
                <p className="text-xs text-muted-foreground">
                  By signing this agreement, you confirm that you have read and understood all
                  terms and conditions, and agree to be legally bound by them.
                </p>
              </div>
            </div>

            {/* Signature Pad */}
            <div>
              <h3 className="font-semibold mb-3">Your Signature</h3>
              <SignaturePad onSave={handleSignature} disabled={!agreedToTerms} />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate(isHost ? "/host/agreements" : "/")}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !agreedToTerms || !signature}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing...
                  </>
                ) : (
                  "Sign Agreement"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
