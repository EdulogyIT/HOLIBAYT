import { FileText, Download, Edit } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleViewTemplate = () => {
    // Navigate to agreement template page
    navigate(`/rental-agreement-template`);
  };

  const handleStartAgreement = () => {
    navigate(`/host/create-agreement?propertyId=${propertyId}`);
  };

  return (
    <div className={`w-full bg-gradient-to-r from-secondary/5 to-accent/10 dark:from-secondary/10 dark:to-accent/20 border border-secondary/20 dark:border-secondary/30 rounded-xl p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg text-foreground mb-4">
            {t('sign_lease_online')}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('view_agreement_template')}
            </Button>
            {!hasActiveAgreement && (
              <Button
                size="sm"
                onClick={handleStartAgreement}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/90"
              >
                <Edit className="w-4 h-4" />
                {t('start_agreement')}
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
                {t('view_active_agreement')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
