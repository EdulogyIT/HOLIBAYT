import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLanguage } from './LanguageContext';

type Currency = 'USD' | 'DZD' | 'EUR';

interface CurrencyContextType {
  currentCurrency: Currency;
  formatPrice: (amount: string | number, priceType?: string) => string;
  getCurrencySymbol: () => string;
}

const currencyConfig = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    position: 'before' // $100
  },
  DZD: {
    symbol: 'DA',
    code: 'DZD', 
    name: 'Algerian Dinar',
    position: 'after' // 100 DA
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    position: 'before' // €100
  }
};

// Exchange rates (base: DZD)
const exchangeRates = {
  DZD: 1,
  USD: 0.0074, // 1 DZD = 0.0074 USD (approximate)
  EUR: 0.0069  // 1 DZD = 0.0069 EUR (approximate)
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const { currentLang } = useLanguage();
  
  // Map language to currency
  const getCurrencyFromLanguage = (lang: string): Currency => {
    switch (lang) {
      case 'EN': return 'USD';
      case 'FR': return 'EUR';
      case 'AR': return 'DZD';
      default: return 'DZD';
    }
  };

  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {
    return getCurrencyFromLanguage(currentLang);
  });

  // Update currency when language changes
  useEffect(() => {
    const newCurrency = getCurrencyFromLanguage(currentLang);
    setCurrentCurrency(newCurrency);
  }, [currentLang]);

  const formatPrice = (amount: string | number, priceType?: string): string => {
    let numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return '0';

    // Convert from DZD to target currency
    if (currentCurrency !== 'DZD') {
      numAmount = numAmount * exchangeRates[currentCurrency];
    }

    const config = currencyConfig[currentCurrency];
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: currentCurrency === 'DZD' ? 0 : 2,
    }).format(numAmount);

    let result = '';
    if (config.position === 'before') {
      result = `${config.symbol}${formattedAmount}`;
    } else {
      result = `${formattedAmount} ${config.symbol}`;
    }

    // Add price type suffix if provided
    if (priceType === 'monthlyPrice') {
      result += '/month';
    } else if (priceType === 'dailyPrice') {
      result += '/day';
    } else if (priceType === 'weeklyPrice') {
      result += '/week';
    }

    return result;
  };

  const getCurrencySymbol = (): string => {
    return currencyConfig[currentCurrency].symbol;
  };

  const value = {
    currentCurrency,
    formatPrice,
    getCurrencySymbol
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export { currencyConfig };
export type { Currency };