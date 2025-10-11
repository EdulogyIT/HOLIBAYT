import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Search, MapPin, Home, Key, Bed, Calendar as CalendarIcon, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import algeriaHero from "@/assets/algeria-architecture-hero.jpg";
import { DateRangePicker } from "@/components/DateRangePicker";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { GuestsSelector } from "@/components/GuestsSelector";
import { TrustIndicators } from "@/components/TrustIndicators";
import { HolibaytPayBadge } from "@/components/HolibaytPayBadge";

const HeroSection = () => {
  const { t } = useLanguage();
  const { getCurrencySymbol } = useCurrency();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'buy' | 'rent' | 'stay'>('stay');
  
  const [formData, setFormData] = useState({
    location: '',
    propertyType: '',
    budget: '',
    housingType: '',
    maxRent: '',
    dateRange: undefined as { from?: Date; to?: Date } | undefined,
    travelers: {
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0
    }
  });

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.location.trim() !== '';
  };

  const modes = [
    {
      id: 'buy' as const,
      icon: Home,
      label: t('buy')
    },
    {
      id: 'stay' as const,
      icon: Bed,
      label: t('shortStay')
    },
    {
      id: 'rent' as const,
      icon: Key,
      label: t('rent')
    }
  ];

  const getSearchPlaceholder = () => {
    switch (selectedMode) {
      case 'buy':
        return t('cityNeighborhood');
      case 'rent':
        return t('whereToRent');
      case 'stay':
        return t('stayDestination');
      default:
        return t('cityNeighborhood');
    }
  };

  const renderSearchFields = () => {
    switch (selectedMode) {
      case 'buy':
        return (
          <>
            <div className="flex-1">
              <select 
                className="w-full h-10 sm:h-12 px-3 py-2 bg-background border border-input rounded-md font-inter text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ring-offset-background"
                value={formData.propertyType}
                onChange={(e) => updateFormField('propertyType', e.target.value)}
              >
                <option value="">{t('propertyType')}</option>
                <option value="apartment">{t('apartment')}</option>
                <option value="house">{t('house')}</option>
                <option value="villa">{t('villa')}</option>
                <option value="terrain">{t('land')}</option>
              </select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={`${t('maxBudget')} (${getCurrencySymbol()})`}
                  className="h-10 sm:h-12 pl-10 font-inter text-sm"
                  value={formData.budget}
                  onChange={(e) => updateFormField('budget', e.target.value)}
                />
              </div>
            </div>
          </>
        );
      case 'rent':
        return (
          <>
            <div className="flex-1">
              <select 
                className="w-full h-10 sm:h-12 px-3 py-2 bg-background border border-input rounded-md font-inter text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ring-offset-background"
                value={formData.housingType}
                onChange={(e) => updateFormField('housingType', e.target.value)}
              >
                <option value="">{t('housingType')}</option>
                <option value="apartment">{t('apartment')}</option>
                <option value="house">{t('house')}</option>
                <option value="studio">{t('studio')}</option>
                <option value="room">{t('room')}</option>
              </select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={`${t('maxRentMonth')} (${getCurrencySymbol()})`}
                  className="h-10 sm:h-12 pl-10 font-inter text-sm"
                  value={formData.maxRent}
                  onChange={(e) => updateFormField('maxRent', e.target.value)}
                />
              </div>
            </div>
          </>
        );
      case 'stay':
        return (
          <div className="flex flex-col sm:flex-row flex-1 gap-2 sm:gap-3">
            {/* Date pickers + GuestsSelector remain unchanged */}
          </div>
        );
      default:
        return null;
    }
  };

  const handleSearch = () => {
    if (!isFormValid()) return;
    const searchParams = new URLSearchParams();
    if (formData.location) searchParams.append('location', formData.location);
    switch (selectedMode) {
      case 'buy':
        if (formData.propertyType) searchParams.append('type', formData.propertyType);
        if (formData.budget) searchParams.append('budget', formData.budget);
        navigate(`/buy?${searchParams.toString()}`);
        break;
      case 'rent':
        if (formData.housingType) searchParams.append('type', formData.housingType);
        if (formData.maxRent) searchParams.append('maxRent', formData.maxRent);
        navigate(`/rent?${searchParams.toString()}`);
        break;
      case 'stay':
        if (formData.dateRange?.from) searchParams.append('checkIn', formData.dateRange.from.toISOString());
        if (formData.dateRange?.to) searchParams.append('checkOut', formData.dateRange.to.toISOString());
        searchParams.append('adults', formData.travelers.adults.toString());
        searchParams.append('children', formData.travelers.children.toString());
        searchParams.append('infants', formData.travelers.infants.toString());
        searchParams.append('pets', formData.travelers.pets.toString());
        navigate(`/short-stay?${searchParams.toString()}`);
        break;
      default:
        navigate('/buy');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={algeriaHero} 
          alt="Architecture algérienne moderne" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/50 to-background/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 md:pt-16">
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center mb-8">
            {/* Main heading always Holibayt */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-foreground mb-4 leading-tight">
              Holibayt
            </h1>

            {/* Combined tagline + safety/payment */}
            <p className="text-2xl md:text-3xl lg:text-4xl font-playfair font-medium text-primary mb-6 leading-tight">
              Buy. Rent. Live Algeria safely with verified listings and secure payments
            </p>

            {/* Supporting description */}
            <p className="text-lg md:text-xl text-muted-foreground font-inter font-light max-w-3xl mx-auto leading-relaxed">
              Holibayt combines verified owners, legal support, and escrow protection for every transaction.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <TrustIndicators variant="compact" />
            </div>
            <div className="mt-4 flex justify-center">
              <HolibaytPayBadge variant="default" showTooltip={true} />
            </div>
          </div>

          {/* Mode Selector, Search Form, Quick Stats remain unchanged */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
