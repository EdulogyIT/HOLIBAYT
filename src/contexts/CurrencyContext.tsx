import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export type Currency = 'USD' | 'DZD' | 'EUR';

interface CurrencyContextType {
  currentCurrency: Currency;
  formatPrice: (amount: string | number, priceType?: string, currency?: string) => string;
  getCurrencySymbol: () => string;
  setCurrency: (currency: Currency) => void;
}

const currencyConfig = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    position: 'before' as const // $100
  },
  DZD: {
    symbol: 'DA',
    code: 'DZD', 
    name: 'Algerian Dinar',
    position: 'after' as const // 100 DA
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    position: 'before' as const // €100
  }
};

// Exchange rates (base: DZD)
// Admin can configure DZD to EUR rate, others are fixed
const getExchangeRates = async () => {
  try {
    const { data } = await supabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'currency_exchange_rates')
      .single();
    
    const settingValue = data?.setting_value as any;
    const dzdToEur = settingValue?.dzd_to_eur || 0.0069;
    
    return {
      DZD: 1,
      EUR: dzdToEur,
      USD: dzdToEur * 1.08 // EUR to USD is roughly 1.08
    };
  } catch {
    // Fallback to default rates
    return {
      DZD: 1,
      USD: 0.0074,
      EUR: 0.0069
    };
  }
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const { t } = useLanguage();
  
  // Independent currency selection - not tied to language
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('selectedCurrency');
      return (saved as Currency) || 'DZD';
    } catch {
      return 'DZD';
    }
  });
  
  // Store exchange rates
  const [exchangeRates, setExchangeRates] = useState({
    DZD: 1,
    USD: 0.0074,
    EUR: 0.0069
  });

  // Fetch exchange rates on mount and subscribe to changes
  useEffect(() => {
    const fetchRates = async () => {
      const rates = await getExchangeRates();
      setExchangeRates(rates);
    };
    
    fetchRates();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('currency_rate_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'platform_settings',
          filter: 'setting_key=eq.currency_exchange_rates'
        },
        () => {
          fetchRates();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setCurrency = (currency: Currency) => {
    setCurrentCurrency(currency);
    try {
      localStorage.setItem('selectedCurrency', currency);
    } catch {
      // Handle localStorage errors gracefully
    }
  };

  const formatPrice = (amount: string | number, priceType?: string, currency?: string): string => {
    let numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return '0';

    // Convert from source currency to DZD first (our base)
    const sourceCurrency = currency || 'DZD';
    let amountInDZD = numAmount;
    
    if (sourceCurrency === 'USD') {
      amountInDZD = numAmount / exchangeRates.USD;
    } else if (sourceCurrency === 'EUR') {
      amountInDZD = numAmount / exchangeRates.EUR;
    }
    
    // Now convert from DZD to display currency
    let convertedAmount = amountInDZD;
    if (currentCurrency === 'USD') {
      convertedAmount = amountInDZD * exchangeRates.USD;
    } else if (currentCurrency === 'EUR') {
      convertedAmount = amountInDZD * exchangeRates.EUR;
    }
    
    const displayCurrency = currentCurrency;
    const config = currencyConfig[displayCurrency];
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayCurrency === 'DZD' ? 0 : 2,
    }).format(convertedAmount);

    let result = '';
    if (config.position === 'before') {
      result = `${config.symbol}${formattedAmount}`;
    } else {
      result = `${formattedAmount} ${config.symbol}`;
    }

    // Add price type suffix if provided (translated)
    if (priceType === 'monthlyPrice' || priceType === 'monthly') {
      result += t('perMonth') || '/month';
    } else if (priceType === 'dailyPrice' || priceType === 'daily') {
      result += t('perDay') || '/day';
    } else if (priceType === 'weeklyPrice' || priceType === 'weekly') {
      result += t('perWeek') || '/week';
    }

    return result;
  };

  const getCurrencySymbol = (): string => {
    return currencyConfig[currentCurrency].symbol;
  };

  const contextValue: CurrencyContextType = {
    currentCurrency,
    formatPrice,
    getCurrencySymbol,
    setCurrency
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export { currencyConfig };