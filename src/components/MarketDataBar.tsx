import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TrendingUp } from "lucide-react";

interface MarketDataBarProps {
  city: string;
  medianPrice: number;
  yearOverYearChange: number;
  currency?: string;
}

export const MarketDataBar = ({ 
  city, 
  medianPrice, 
  yearOverYearChange,
  currency = "DZD" 
}: MarketDataBarProps) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  
  const changeColor = yearOverYearChange >= 0 ? "text-green-600" : "text-red-600";
  const changeSymbol = yearOverYearChange >= 0 ? "+" : "";

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{t('medianPrice')} {city}:</span>
            <span className="font-semibold text-foreground">
              {formatPrice(medianPrice, 'total', currency)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">|</span>
            <span className={`font-semibold ${changeColor}`}>
              {changeSymbol}{yearOverYearChange}%
            </span>
            <span className="text-muted-foreground">{t('vsLastYear')}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">
              Powered by <span className="font-semibold text-primary">Holibayt Index™</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
