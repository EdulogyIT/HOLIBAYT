import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { buyRentTranslations } from "@/contexts/LanguageTranslations";
import { toast } from "sonner";
import { Scale, User } from "lucide-react";

interface Lawyer {
  id: string;
  full_name: string;
  specializations: string[];
  city: string;
  experience_years: number;
  consultation_fee: number;
}

interface LawyerRequestDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LawyerRequestDialog = ({
  propertyId,
  open,
  onOpenChange,
}: LawyerRequestDialogProps) => {
  const { user } = useAuth();
  const { currentLang } = useLanguage();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<string>("");
  const [requestType, setRequestType] = useState<string>("consultation");
  const [message, setMessage] = useState("");

  const tKey = (key: string) => {
    const translations = buyRentTranslations[currentLang] || buyRentTranslations.EN;
    return translations[key] || key;
  };

  useEffect(() => {
    if (open) {
      fetchLawyers();
    }
  }, [open]);

  const fetchLawyers = async () => {
    try {
      const { data, error } = await supabase
        .from("lawyers")
        .select("*")
        .eq("verified", true)
        .eq("availability_status", "available")
        .order("experience_years", { ascending: false });

      if (error) throw error;
      setLawyers(data || []);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      toast.error("Failed to load lawyers");
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to request legal support");
      return;
    }

    if (!selectedLawyer) {
      toast.error("Please select a lawyer");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("lawyer_requests").insert({
        user_id: user.id,
        lawyer_id: selectedLawyer,
        property_id: propertyId,
        request_type: requestType,
        message: message,
        status: "pending",
      });

      if (error) throw error;

      toast.success(tKey("requestSubmitted"));
      onOpenChange(false);
      setSelectedLawyer("");
      setMessage("");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const selectedLawyerData = lawyers.find((l) => l.id === selectedLawyer);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            {tKey("legalSupportTitle")}
          </DialogTitle>
          <DialogDescription>
            {tKey("requestSubmittedDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Select Lawyer */}
          <div className="space-y-2">
            <Label>{tKey("selectLawyer")} *</Label>
            <Select value={selectedLawyer} onValueChange={setSelectedLawyer}>
              <SelectTrigger>
                <SelectValue placeholder={tKey("selectLawyerPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {lawyers.map((lawyer) => (
                  <SelectItem key={lawyer.id} value={lawyer.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{lawyer.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {lawyer.specializations.join(", ")} • {lawyer.city} •{" "}
                        {lawyer.experience_years}+ years
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Lawyer Details */}
          {selectedLawyerData && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                {selectedLawyerData.full_name}
              </h4>
              <p className="text-sm text-muted-foreground">
                Specializations: {selectedLawyerData.specializations.join(", ")}
              </p>
              <p className="text-sm">
                <strong>Consultation Fee:</strong> {selectedLawyerData.consultation_fee} DZD
              </p>
              <p className="text-xs italic text-muted-foreground">
                Contact details will be shared after admin approval
              </p>
            </div>
          )}

          {/* Request Type */}
          <div className="space-y-2">
            <Label>{tKey("requestType")} *</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">{tKey("legalConsultation")}</SelectItem>
                <SelectItem value="contract_review">{tKey("contractReview")}</SelectItem>
                <SelectItem value="property_verification">{tKey("propertyVerification")}</SelectItem>
                <SelectItem value="general">General Inquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>{tKey("additionalMessage")}</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={tKey("messagePlaceholder")}
              rows={4}
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>How it works:</strong>
            </p>
            <ol className="text-sm text-blue-800 dark:text-blue-200 list-decimal list-inside space-y-1 mt-2">
              <li>Submit your request</li>
              <li>Admin reviews and approves</li>
              <li>You receive lawyer's contact details via notification</li>
              <li>Contact the lawyer directly</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedLawyer}>
            {loading ? "Submitting..." : tKey("submitRequest")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
