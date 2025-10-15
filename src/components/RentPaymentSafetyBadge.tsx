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
    <div className={`w-full bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20 dark:border-primary/30 rounded-xl p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg text-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            {t('rent_safety_notice_title')}
          </h3>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary bg-background/60 dark:bg-background/20 rounded-lg px-3 py-2 inline-flex">
            <span>{t('total_protected')}:</span>
            <span className="text-lg">{totalProtected.toLocaleString()} DZD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
