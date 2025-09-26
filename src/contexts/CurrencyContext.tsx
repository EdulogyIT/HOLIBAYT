import { createContext, useContext, useState, ReactNode } from 'react';

export type Currency = 'USD' | 'DZD' | 'EUR';

interface CurrencyContextType {
  currentCurrency: Currency;
  formatPrice: (amount: string | number, priceType?: string) => string;
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
  // Independent currency selection - not tied to language
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('selectedCurrency');
      return (saved as Currency) || 'USD';
    } catch {
      return 'USD';
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

  const formatPrice = (amount: string | number, priceType?: string): string => {
    let numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return '0';

    // Assume property prices are stored in DZD (base currency)
    // Convert to target currency if different
    let convertedAmount = numAmount;
    if (currentCurrency !== 'DZD') {
      // Convert from DZD to target currency
      convertedAmount = numAmount * exchangeRates[currentCurrency];
    }

    const config = currencyConfig[currentCurrency];
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: currentCurrency === 'DZD' ? 0 : 2,
    }).format(convertedAmount);

    let result = '';
    if (config.position === 'before') {
      result = `${config.symbol}${formattedAmount}`;
    } else {
      result = `${formattedAmount} ${config.symbol}`;
    }

    // Add price type suffix if provided
    if (priceType === 'monthlyPrice' || priceType === 'monthly') {
      result += '/month';
    } else if (priceType === 'dailyPrice' || priceType === 'daily') {
      result += '/day';
    } else if (priceType === 'weeklyPrice' || priceType === 'weekly') {
      result += '/week';
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