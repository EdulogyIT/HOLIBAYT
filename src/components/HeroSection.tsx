import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Search, MapPin, Home, Key, Bed, Calendar as CalendarIcon, Users, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import algeriaHero from "@/assets/algeria-architecture-hero.jpg";
import { DateRangePicker } from "@/components/DateRangePicker";

// Stay Date Picker Component using unified DateRangePicker
const StayDatePicker = () => {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>();

  return (
    <div className="flex flex-1 gap-2">
      <div className="flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-inter text-sm h-12",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? format(dateRange.from, "dd/MM/yy") : t('checkIn')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
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
                !dateRange?.to && "text-muted-foreground"
              )}
              disabled={!dateRange?.from}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.to ? format(dateRange.to, "dd/MM/yy") : t('checkOut')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              allowPast={false}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const [selectedMode, setSelectedMode] = useState<'buy' | 'rent' | 'stay'>('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  const modes = [
    {
      id: 'buy' as const,
      icon: Home,
      label: t('buy')
    },
    {
      id: 'rent' as const,
      icon: Key,
      label: t('rent')
    },
    {
      id: 'stay' as const,
      icon: Bed,
      label: t('shortStay')
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
              <select className="w-full px-4 py-3 bg-background border border-input rounded-md font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
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
                  placeholder={t('maxBudget')}
                  className="pl-10 font-inter text-sm"
                />
              </div>
            </div>
          </>
        );
      case 'rent':
        return (
          <>
            <div className="flex-1">
              <select className="w-full px-4 py-3 bg-background border border-input rounded-md font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
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
                  placeholder={t('maxRentMonth')}
                  className="pl-10 font-inter text-sm"
                />
              </div>
            </div>
          </>
        );
      case 'stay':
        return (
          <>
            <StayDatePicker />
            <div className="flex-1">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={t('travelers')}
                  className="pl-10 font-inter text-sm"
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleSearch = () => {
    // If there's a search query, include it as a URL parameter
    const searchParams = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    
    switch (selectedMode) {
      case 'buy':
        navigate(`/buy${searchParams}`);
        break;
      case 'rent':
        navigate(`/rent${searchParams}`);
        break;
      case 'stay':
        navigate(`/short-stay${searchParams}`);
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
          <div className="mb-8">
            <div className="inline-flex bg-card/90 backdrop-blur-md rounded-2xl p-1.5 border border-border/30 shadow-elegant">
              {modes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-xl font-inter font-semibold text-base transition-all duration-300 min-h-[56px] ${
                      selectedMode === mode.id
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="whitespace-nowrap">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Search Card */}
          <Card className="max-w-6xl mx-auto p-6 md:p-8 bg-card/90 backdrop-blur-md border-border/30 shadow-elegant rounded-3xl">
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
              {/* Location Input */}
              <div className="flex-2 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  className="pl-10 font-inter text-sm h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              {/* Dynamic Fields */}
              {renderSearchFields()}
              
              {/* Search Button */}
              <Button size="lg" className="bg-gradient-primary font-inter font-semibold hover:shadow-elegant px-6 md:px-8 h-12 whitespace-nowrap" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('search')}</span>
                <span className="sm:hidden">{t('search')}</span>
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