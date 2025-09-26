import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterState {
  location: string;
  propertyType: string;
  minPrice: number[];
  maxPrice: number[];
  bedrooms: string;
  bathrooms: string;
  minArea: string;
  maxArea: string;
}

interface PropertyFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  listingType: 'buy' | 'rent' | 'shortStay';
}

const PropertyFilters = ({ onFilterChange, listingType }: PropertyFiltersProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    propertyType: "all",
    minPrice: [0],
    maxPrice: listingType === 'buy' ? [5000000] : listingType === 'rent' ? [100000] : [50000],
    bedrooms: "all",
    bathrooms: "all",
    minArea: "",
    maxArea: ""
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      location: "",
      propertyType: "all",
      minPrice: [0],
      maxPrice: listingType === 'buy' ? [5000000] : listingType === 'rent' ? [100000] : [50000],
      bedrooms: "all",
      bathrooms: "all",
      minArea: "",
      maxArea: ""
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.propertyType && filters.propertyType !== "all") count++;
    if (filters.bedrooms && filters.bedrooms !== "all") count++;
    if (filters.bathrooms && filters.bathrooms !== "all") count++;
    if (filters.minArea) count++;
    if (filters.maxArea) count++;
    if (filters.minPrice[0] > 0) count++;
    return count;
  };

  const getPriceLabel = () => {
    switch (listingType) {
      case 'buy':
        return 'Prix (DA)';
      case 'rent':
        return 'Loyer mensuel (DA)';
      case 'shortStay':
        return 'Prix par nuit (DA)';
      default:
        return 'Prix (DA)';
    }
  };

  const getMaxPrice = () => {
    switch (listingType) {
      case 'buy':
        return 10000000;
      case 'rent':
        return 200000;
      case 'shortStay':
        return 100000;
      default:
        return 5000000;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="font-inter flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('filters') || 'Filtres'}
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
        
        {getActiveFiltersCount() > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="font-inter text-sm">
            {t('clearAll') || 'Effacer tout'}
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="border border-border">
          <CardContent className="p-6">
            {/* Filter Inputs - Better Layout */}
            <div className="space-y-4">
              {/* Row 1: Location and Property Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-inter font-medium text-sm">{t('location') || 'Location'}</Label>
                  <Input
                    placeholder={t('cityOrDistrict') || 'City or District'}
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="font-inter text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-inter font-medium text-sm">{t('propertyType') || 'Property Type'}</Label>
                  <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                    <SelectTrigger className="font-inter text-sm">
                      <SelectValue placeholder={t('selectType') || 'Select'} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      <SelectItem value="all">{t('allTypes') || 'All Types'}</SelectItem>
                      <SelectItem value="villa">{t('villaFilter') || 'Villa'}</SelectItem>
                      <SelectItem value="apartment">{t('apartment') || 'Apartment'}</SelectItem>
                      <SelectItem value="studio">{t('studio') || 'Studio'}</SelectItem>
                      <SelectItem value="duplex">{t('duplexFilter') || 'Duplex'}</SelectItem>
                      <SelectItem value="house">{t('house') || 'House'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Bedrooms and Bathrooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-inter font-medium text-sm">{t('bedrooms') || 'Bedrooms'}</Label>
                  <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                    <SelectTrigger className="font-inter text-sm">
                      <SelectValue placeholder={t('number') || 'Any'} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      <SelectItem value="all">{t('all') || 'All'}</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-inter font-medium text-sm">{t('bathrooms') || 'Bathrooms'}</Label>
                  <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange('bathrooms', value)}>
                    <SelectTrigger className="font-inter text-sm">
                      <SelectValue placeholder={t('number') || 'Any'} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      <SelectItem value="all">{t('all') || 'All'}</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-inter font-medium text-sm">{t('minArea') || 'Min Area (m²)'}</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={filters.minArea}
                    onChange={(e) => handleFilterChange('minArea', e.target.value)}
                    className="font-inter text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-inter font-medium text-sm">{t('maxArea') || 'Max Area (m²)'}</Label>
                  <Input
                    type="number"
                    placeholder="200"
                    value={filters.maxArea}
                    onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                    className="font-inter text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <Label className="font-inter font-medium text-sm">{getPriceLabel()}</Label>
              
              {/* Price Range Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Minimum Price */}
                <div className="space-y-2">
                  <Label className="font-inter text-xs text-muted-foreground">{t('minPrice') || 'Min Price'}</Label>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={getMaxPrice()}
                      step={listingType === 'buy' ? 50000 : listingType === 'rent' ? 5000 : 1000}
                      value={filters.minPrice}
                      onValueChange={(value) => handleFilterChange('minPrice', value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground font-inter mt-1">
                      <span>0 DA</span>
                      <span>{filters.minPrice[0].toLocaleString()} DA</span>
                    </div>
                  </div>
                </div>

                {/* Maximum Price */}
                <div className="space-y-2">
                  <Label className="font-inter text-xs text-muted-foreground">{t('maxPrice') || 'Max Price'}</Label>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={getMaxPrice()}
                      step={listingType === 'buy' ? 50000 : listingType === 'rent' ? 5000 : 1000}
                      value={filters.maxPrice}
                      onValueChange={(value) => handleFilterChange('maxPrice', value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground font-inter mt-1">
                      <span>0 DA</span>
                      <span>{filters.maxPrice[0].toLocaleString()} DA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyFilters;