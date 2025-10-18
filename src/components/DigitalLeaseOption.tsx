import { FileText, Download, Edit } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatTranslationKey } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DigitalLeaseOptionProps {
  propertyId: string;
  hasActiveAgreement?: boolean;
  agreementUrl?: string;
  className?: string;
}

export const DigitalLeaseOption = ({
  propertyId,
  hasActiveAgreement = false,
  agreementUrl,
  className = ""
}: DigitalLeaseOptionProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getTitleOrFormatted = (key: string) => {
    const translation = t(key);
    return translation === key ? formatTranslationKey(key) : translation;
  };

  const handleViewTemplate = () => {
    // Navigate to agreement template page
    navigate(`/rental-agreement-template`);
  };

  const handleStartAgreement = () => {
    if (!user) {
      toast.error("Please log in to create an agreement");
      navigate("/login");
      return;
    }
    navigate(`/host/create-agreement?propertyId=${propertyId}`);
  };

  return (
    <div className={`w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-5 shadow-md ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg text-foreground mb-4">
            {getTitleOrFormatted('sign_lease_online')}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {getTitleOrFormatted('view_agreement_template')}
            </Button>
            {!hasActiveAgreement && (
              <Button
                size="sm"
                onClick={handleStartAgreement}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Edit className="w-4 h-4" />
                {getTitleOrFormatted('start_agreement')}
              </Button>
            )}
            {hasActiveAgreement && agreementUrl && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(agreementUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {getTitleOrFormatted('view_active_agreement')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
