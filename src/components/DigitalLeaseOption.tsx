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
    // Navigate to agreement creation/signing page
    navigate(`/property/${propertyId}/create-agreement`);
  };

  return (
    <div className={`w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100 mb-2">
            {t('sign_lease_online') || 'Sign your rental agreement online through Holibayt'}
          </h3>
          <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
            {t('digital_lease_description') || 'Create, review, and sign your rental agreement digitally. Fast, secure, and legally binding.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('view_agreement_template') || 'View Template'}
            </Button>
            {!hasActiveAgreement && (
              <Button
                size="sm"
                onClick={handleStartAgreement}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <Edit className="w-4 h-4" />
                {t('start_agreement') || 'Start Agreement'}
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
                {t('view_active_agreement') || 'View Active Agreement'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
