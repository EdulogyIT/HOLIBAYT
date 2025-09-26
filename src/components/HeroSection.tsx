import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Search, MapPin, Home, Key, Bed, Calendar as CalendarIcon, Users, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import algeriaHero from "@/assets/algeria-architecture-hero.jpg";
import { DateRangePicker } from "@/components/DateRangePicker";

const HeroSection = () => {
  const { t } = useLanguage();
  const { getCurrencySymbol, formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'buy' | 'rent' | 'stay'>('stay');
  
  // Form states for validation
  const [formData, setFormData] = useState({
    location: '',
    propertyType: '',
    budget: '',
    housingType: '',
    maxRent: '',
    dateRange: undefined as { from?: Date; to?: Date } | undefined,
    travelers: ''
  });

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validation logic
  const isFormValid = () => {
    if (!formData.location.trim()) return false;
    
    switch (selectedMode) {
      case 'buy':
        return formData.propertyType !== '' && formData.budget.trim() !== '';
      case 'rent':
        return formData.housingType !== '' && formData.maxRent.trim() !== '';
      case 'stay':
        return formData.dateRange?.from && formData.dateRange?.to && formData.travelers.trim() !== '';
      default:
        return false;
    }
  };

  // Stay Date Picker Component using unified DateRangePicker
  const StayDatePicker = () => {
    return (
      <div className="flex flex-1 gap-2">
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-inter text-sm h-12",
                  !formData.dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateRange?.from ? format(formData.dateRange.from, "dd/MM/yy") : t('checkIn')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateRangePicker
                value={formData.dateRange}
                onChange={(range) => updateFormField('dateRange', range)}
                allowPast={false}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-inter text-sm h-12",
                  !formData.dateRange?.to && "text-muted-foreground"
                )}
                disabled={!formData.dateRange?.from}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateRange?.to ? format(formData.dateRange.to, "dd/MM/yy") : t('checkOut')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateRangePicker
                value={formData.dateRange}
                onChange={(range) => updateFormField('dateRange', range)}
                allowPast={false}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
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
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-inter text-sm h-10 sm:h-12 bg-background border border-input",
                      !formData.dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">{formData.dateRange?.from ? format(formData.dateRange.from, "dd/MM/yy") : t('checkIn')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DateRangePicker
                    value={formData.dateRange}
                    onChange={(range) => updateFormField('dateRange', range)}
                    allowPast={false}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-inter text-sm h-10 sm:h-12 bg-background border border-input",
                      !formData.dateRange?.to && "text-muted-foreground"
                    )}
                    disabled={!formData.dateRange?.from}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">{formData.dateRange?.to ? format(formData.dateRange.to, "dd/MM/yy") : t('checkOut')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DateRangePicker
                    value={formData.dateRange}
                    onChange={(range) => updateFormField('dateRange', range)}
                    allowPast={false}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={t('travelers')}
                  className="h-10 sm:h-12 pl-10 font-inter text-sm"
                  value={formData.travelers}
                  onChange={(e) => updateFormField('travelers', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSearch = () => {
    if (!isFormValid()) {
      return; // Don't proceed if form is invalid
    }

    // Build search parameters from form data
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
        if (formData.travelers) searchParams.append('travelers', formData.travelers);
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
        {/* Hero Content */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-foreground mb-4 leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl font-playfair font-medium text-primary mb-6 leading-tight">
              {t('heroSubtitle')}
            </p>
            <p className="text-lg md:text-xl text-muted-foreground font-inter font-light max-w-3xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
          </div>
          
          {/* Mode Selector */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex bg-card/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-1 sm:p-1.5 border border-border/30 shadow-elegant overflow-x-auto max-w-full">
              {modes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-inter font-semibold text-sm sm:text-base transition-all duration-300 min-h-[48px] sm:min-h-[56px] ${
                      selectedMode === mode.id
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="whitespace-nowrap">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Search Card */}
          <Card className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-card/90 backdrop-blur-md border-border/30 shadow-elegant rounded-2xl sm:rounded-3xl">
            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row">
              {/* Location Input */}
              <div className="flex-2 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={formData.location}
                  onChange={(e) => updateFormField('location', e.target.value)}
                  className="h-10 sm:h-12 pl-10 font-inter text-sm bg-background border border-input"
                />
              </div>
              
              {/* Dynamic Fields */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:flex-1">
                {renderSearchFields()}
              </div>
              
              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                disabled={!isFormValid()}
                className={cn(
                  "h-10 sm:h-12 px-4 sm:px-8 font-inter font-medium transition-all duration-300 w-full sm:w-auto lg:min-w-[120px]",
                  isFormValid() 
                    ? "bg-gradient-primary hover:shadow-elegant text-white" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">{t('search')}</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-playfair font-bold text-primary mb-2">10K+</div>
            <div className="text-muted-foreground font-inter text-sm md:text-base">{t('availableProperties')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-playfair font-bold text-primary mb-2">50K+</div>
            <div className="text-muted-foreground font-inter text-sm md:text-base">{t('satisfiedUsers')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-playfair font-bold text-primary mb-2">26</div>
            <div className="text-muted-foreground font-inter text-sm md:text-base">{t('wilayasCovered')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
