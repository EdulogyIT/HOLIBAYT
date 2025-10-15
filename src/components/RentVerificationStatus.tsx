import { CheckCircle2, Shield, FileCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RentVerificationStatusProps {
  isIdVerified: boolean;
  isOwnershipVerified: boolean;
  verificationDate?: string;
  className?: string;
}

export const RentVerificationStatus = ({
  isIdVerified,
  isOwnershipVerified,
  verificationDate,
  className = ""
}: RentVerificationStatusProps) => {
  const { t } = useLanguage();

  if (!isIdVerified && !isOwnershipVerified) return null;

  return (
    <div className={`w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100 mb-3">
            {t('landlord_verification_status') || 'Landlord Verification Status'}
          </h3>
          <div className="space-y-2">
            {isIdVerified && (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span>{t('landlord_id_verified') || "Landlord's ID has been verified by Holibayt"}</span>
              </div>
            )}
            {isOwnershipVerified && (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <FileCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span>{t('ownership_documents_verified') || 'Property ownership documents verified'}</span>
              </div>
            )}
            {verificationDate && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {t('verified_on') || 'Verified on'}: {new Date(verificationDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
