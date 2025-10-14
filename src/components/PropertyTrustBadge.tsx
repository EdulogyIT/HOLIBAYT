import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyTrustBadgeProps {
  className?: string;
}

export const PropertyTrustBadge = ({ className = "" }: PropertyTrustBadgeProps) => {
  const { t } = useLanguage();

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-4 py-4 sm:px-6 sm:py-4 shadow-sm hover:shadow-md transition-all ${className}`}>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-md">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-base sm:text-lg whitespace-normal sm:whitespace-nowrap">
          {t("protectedByHolibaytPay")}
        </span>
      </div>
      <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {t("securePaymentGuaranteed")}
      </span>
    </div>
  );
};
