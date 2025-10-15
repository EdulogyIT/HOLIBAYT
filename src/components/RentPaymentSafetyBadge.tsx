import { Shield, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RentPaymentSafetyBadgeProps {
  className?: string;
  monthlyRent: number;
  deposit: number;
}

export const RentPaymentSafetyBadge = ({ 
  className = "", 
  monthlyRent, 
  deposit 
}: RentPaymentSafetyBadgeProps) => {
  const { t } = useLanguage();
  const totalProtected = monthlyRent + deposit;

  return (
    <div className={`w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
            {t('rent_safety_notice_title') || 'First Month & Deposit Protected'}
          </h3>
          <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('rent_safety_notice') || "Your first month's rent and deposit are protected in escrow through Holibayt Pay™. Funds are only released to the landlord after you confirm move-in."}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400 bg-white/60 dark:bg-black/20 rounded-lg px-3 py-2 inline-flex">
            <span>{t('total_protected') || 'Total Protected'}:</span>
            <span className="text-lg">{totalProtected.toLocaleString()} DZD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
