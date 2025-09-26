import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

const CurrencySelector = () => {
  const { currentCurrency } = useCurrency();
  const { t } = useLanguage();
  
  const currencies = [
    { code: "USD" as Currency, name: "US Dollar", symbol: "$" },
    { code: "EUR" as Currency, name: "Euro", symbol: "€" },
    { code: "DZD" as Currency, name: "Algerian Dinar", symbol: "DA" }
  ];

  // Note: Currency selection is now handled automatically by language selection
  // This component is for display only - currency changes with language
  const currentCurrencyInfo = currencies.find(c => c.code === currentCurrency);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="font-inter">
          <DollarSign className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border border-border">
        <div className="px-3 py-2 text-sm font-medium text-foreground">
          {t('currentCurrency')}: {currentCurrencyInfo?.name} ({currentCurrencyInfo?.symbol})
        </div>
        <div className="px-3 py-2 text-xs text-muted-foreground">
          {t('currencyChangesWithLanguage')}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;