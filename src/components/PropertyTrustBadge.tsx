import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyTrustBadgeProps {
  className?: string;
}

export const PropertyTrustBadge = ({ className = "" }: PropertyTrustBadgeProps) => {
  const { t } = useLanguage();

  return (
    <div className={`w-full flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-4 py-3 sm:px-6 sm:py-4 shadow-sm hover:shadow-md transition-all min-w-0 ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-md">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-xs sm:text-sm md:text-base break-words leading-tight flex-1 min-w-0 whitespace-normal">
          {t("protectedByHolibaytPay")}
        </span>
      </div>
      <span className="text-xs sm:text-sm md:text-base text-muted-foreground leading-tight break-words flex-1 min-w-0 whitespace-normal">
        {t("securePaymentGuaranteed")}
      </span>
    </div>
  );
};
