import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyTrustBadgeProps {
  className?: string;
}

export const PropertyTrustBadge = ({ className = "" }: PropertyTrustBadgeProps) => {
  const { t } = useLanguage();

  return (
    <div className={`flex flex-wrap items-center gap-2 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg px-4 py-3 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm md:text-base whitespace-nowrap">
          {t("protectedByHolibaytPay")}
        </span>
      </div>
      <span className="text-xs md:text-sm text-muted-foreground">
        {t("securePaymentGuaranteed")}
      </span>
    </div>
  );
};
