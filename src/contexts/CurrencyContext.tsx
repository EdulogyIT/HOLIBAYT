import { createContext, useContext, useState, ReactNode } from 'react';
import { useLanguage } from './LanguageContext';

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

    // Convert from EUR (base currency) to selected display currency
    // Properties are stored in EUR by default
    const sourceCurrency = currency || 'EUR';
    
    // Convert to EUR first if source is not EUR
    let amountInEUR = numAmount;
    if (sourceCurrency === 'USD') {
      amountInEUR = numAmount / 1.08; // 1 EUR = 1.08 USD
    } else if (sourceCurrency === 'DZD') {
      amountInEUR = numAmount / 145; // 1 EUR = 145 DZD
    }
    
    // Now convert from EUR to display currency
    let convertedAmount = amountInEUR;
    if (currentCurrency === 'USD') {
      convertedAmount = amountInEUR * 1.08;
    } else if (currentCurrency === 'DZD') {
      convertedAmount = amountInEUR * 145;
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