import { Button } from "@/components/ui/button";
import { DollarSign, Euro, Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

const CurrencySelector = () => {
  const { currentCurrency, setCurrency } = useCurrency();
  const { t } = useLanguage();
  
  const currencies = [
    { code: "USD" as Currency, name: "US Dollar", symbol: "$", Icon: DollarSign, showIcon: true },
    { code: "EUR" as Currency, name: "Euro", symbol: "€", Icon: Euro, showIcon: true },
    { code: "DZD" as Currency, name: "Algerian Dinar", symbol: "DA", Icon: null, showIcon: false }
  ];

  const currentCurrencyInfo = currencies.find(c => c.code === currentCurrency);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="font-inter font-semibold">
          {currentCurrencyInfo?.showIcon && currentCurrencyInfo.Icon ? (
            <currentCurrencyInfo.Icon className="h-5 w-5" />
          ) : (
            <span className="text-sm">{currentCurrencyInfo?.symbol}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border border-border z-50">
        <div className="px-3 py-2 text-sm font-medium text-foreground border-b">
          {t('selectCurrency') || 'Select Currency'}
        </div>
        {currencies.map((currency) => (
          <button
            key={currency.code}
            onClick={() => setCurrency(currency.code)}
            className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center justify-between ${
              currentCurrency === currency.code ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <span>{currency.name}</span>
            <span className="text-xs text-muted-foreground">{currency.symbol}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;