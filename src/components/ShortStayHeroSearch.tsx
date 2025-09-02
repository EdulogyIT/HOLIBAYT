import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Search, MapPin, Calendar as CalendarIcon, Users, Bed } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/DateRangePicker";

const ShortStayHeroSearch = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    location: '',
    dateRange: undefined as { from?: Date; to?: Date } | undefined,
    travelers: ''
  });

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.location.trim() !== '' && 
           formData.dateRange?.from && 
           formData.dateRange?.to && 
           formData.travelers.trim() !== '';
  };

  const handleSearch = () => {
    if (!isFormValid()) return;

    const searchParams = new URLSearchParams();
    if (formData.location) searchParams.append('location', formData.location);
    if (formData.dateRange?.from) searchParams.append('checkIn', formData.dateRange.from.toISOString());
    if (formData.dateRange?.to) searchParams.append('checkOut', formData.dateRange.to.toISOString());
    if (formData.travelers) searchParams.append('travelers', formData.travelers);
    
    navigate(`/short-stay?${searchParams.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-accent/10 via-background to-primary/5 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-accent/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <Bed className="h-6 w-6 text-accent" />
            <span className="text-accent font-semibold font-inter">{t('shortStay')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-foreground mb-4 leading-tight">
            {t('findPerfectStay')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-inter font-light max-w-3xl mx-auto leading-relaxed">
            {t('shortStayHeroDescription')}
          </p>
        </div>

        <Card className="max-w-6xl mx-auto p-6 md:p-8 bg-card/95 backdrop-blur-md border-border/30 shadow-elegant rounded-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Location Input */}
              <div className="flex-2 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder={t('stayDestination')}
                  value={formData.location}
                  onChange={(e) => updateFormField('location', e.target.value)}
                  className="h-14 pl-12 text-base font-inter bg-background border border-input"
                />
              </div>
              
              {/* Travelers */}
              <div className="flex-1 relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder={t('travelers')}
                  className="h-14 pl-12 text-base font-inter"
                  value={formData.travelers}
                  onChange={(e) => updateFormField('travelers', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Check In */}
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-inter text-base h-14 bg-background border border-input",
                        !formData.dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      <span>{formData.dateRange?.from ? format(formData.dateRange.from, "dd/MM/yyyy") : t('checkIn')}</span>
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
              
              {/* Check Out */}
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-inter text-base h-14 bg-background border border-input",
                        !formData.dateRange?.to && "text-muted-foreground"
                      )}
                      disabled={!formData.dateRange?.from}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      <span>{formData.dateRange?.to ? format(formData.dateRange.to, "dd/MM/yyyy") : t('checkOut')}</span>
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
              
              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                disabled={!isFormValid()}
                className={cn(
                  "h-14 px-8 font-inter font-semibold text-base transition-all duration-300 min-w-[140px]",
                  isFormValid() 
                    ? "bg-gradient-primary hover:shadow-elegant text-white" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Search className="mr-2 h-5 w-5" />
                {t('search')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ShortStayHeroSearch;