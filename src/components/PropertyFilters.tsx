import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Filter, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";

interface FilterState {
  location: string;
  propertyType: string;
  minPrice: number[];
  maxPrice: number[];
  bedrooms: string;
  bathrooms: string;
  minArea: string;
  maxArea: string;
  verifiedOnly?: boolean;
  furnished?: string;
  financingAvailable?: boolean;
  newBuild?: boolean;
  instantBooking?: boolean;
  depositRequired?: boolean;
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
    maxArea: "",
    verifiedOnly: false,
    furnished: "all",
    financingAvailable: false,
    newBuild: false,
    instantBooking: false,
    depositRequired: false
  });

  const [bedroomCount, setBedroomCount] = useState(0);
  const [bathroomCount, setBathroomCount] = useState(0);

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
      maxArea: "",
      verifiedOnly: false,
      furnished: "all",
      financingAvailable: false,
      newBuild: false,
      instantBooking: false,
      depositRequired: false
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
    if (filters.verifiedOnly) count++;
    if (filters.furnished && filters.furnished !== "all") count++;
    if (filters.financingAvailable) count++;
    if (filters.newBuild) count++;
    if (filters.instantBooking) count++;
    if (filters.depositRequired) count++;
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

  const incrementBedrooms = () => {
    const newCount = bedroomCount + 1;
    setBedroomCount(newCount);
    handleFilterChange('bedrooms', newCount === 0 ? 'all' : newCount.toString());
  };

  const decrementBedrooms = () => {
    const newCount = Math.max(0, bedroomCount - 1);
    setBedroomCount(newCount);
    handleFilterChange('bedrooms', newCount === 0 ? 'all' : newCount.toString());
  };

  const incrementBathrooms = () => {
    const newCount = bathroomCount + 1;
    setBathroomCount(newCount);
    handleFilterChange('bathrooms', newCount === 0 ? 'all' : newCount.toString());
  };

  const decrementBathrooms = () => {
    const newCount = Math.max(0, bathroomCount - 1);
    setBathroomCount(newCount);
    handleFilterChange('bathrooms', newCount === 0 ? 'all' : newCount.toString());
  };

  const propertyTypes = [
    { value: 'all', label: t('allTypes') || 'All Types' },
    { value: 'villa', label: t('villaFilter') || 'Villa' },
    { value: 'apartment', label: t('apartment') || 'Apartment' },
    { value: 'studio', label: t('studio') || 'Studio' },
    { value: 'duplex', label: t('duplexFilter') || 'Duplex' },
    { value: 'house', label: t('house') || 'House' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {t('filters') || 'Filters'}
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('filters') || 'Filters'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type of place */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('propertyType') || 'Type of place'}</Label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={filters.propertyType === type.value ? "default" : "outline"}
                  onClick={() => handleFilterChange('propertyType', type.value)}
                  className="rounded-full"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{getPriceLabel()}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t('minPrice') || 'Minimum'}</Label>
                <Input
                  type="number"
                  value={filters.minPrice[0]}
                  onChange={(e) => handleFilterChange('minPrice', [parseInt(e.target.value) || 0])}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t('maxPrice') || 'Maximum'}</Label>
                <Input
                  type="number"
                  value={filters.maxPrice[0]}
                  onChange={(e) => handleFilterChange('maxPrice', [parseInt(e.target.value) || getMaxPrice()])}
                  placeholder={getMaxPrice().toString()}
                />
              </div>
            </div>
            <Slider
              min={0}
              max={getMaxPrice()}
              step={listingType === 'buy' ? 50000 : listingType === 'rent' ? 5000 : 1000}
              value={[filters.minPrice[0], filters.maxPrice[0]]}
              onValueChange={(value) => {
                handleFilterChange('minPrice', [value[0]]);
                handleFilterChange('maxPrice', [value[1]]);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{filters.minPrice[0].toLocaleString()} DA</span>
              <span>{filters.maxPrice[0].toLocaleString()} DA</span>
            </div>
          </div>

          <Separator />

          {/* Rooms and beds */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{t('roomsAndBeds') || 'Rooms and beds'}</Label>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('bedrooms') || 'Bedrooms'}</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementBedrooms}
                    disabled={bedroomCount === 0}
                    className="h-8 w-8 rounded-full"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{bedroomCount === 0 ? 'Any' : bedroomCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementBedrooms}
                    className="h-8 w-8 rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>{t('bathrooms') || 'Bathrooms'}</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementBathrooms}
                    disabled={bathroomCount === 0}
                    className="h-8 w-8 rounded-full"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{bathroomCount === 0 ? 'Any' : bathroomCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementBathrooms}
                    className="h-8 w-8 rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Area */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{t('area') || 'Area'}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t('minArea') || 'Min (m²)'}</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange('minArea', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t('maxArea') || 'Max (m²)'}</Label>
                <Input
                  type="number"
                  placeholder="200"
                  value={filters.maxArea}
                  onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('location') || 'Location'}</Label>
            <Input
              placeholder={t('cityOrDistrict') || 'City or District'}
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>

          <Separator />

          {/* Advanced Filters */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{t('advancedFilters') || 'Additional filters'}</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-normal">{t('verified_only') || 'Verified only'}</Label>
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly || false}
                  onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              {listingType === 'shortStay' && (
                <div className="flex items-center justify-between">
                  <Label className="font-normal">{t('instantBooking') || 'Instant booking'}</Label>
                  <input
                    type="checkbox"
                    checked={filters.instantBooking || false}
                    onChange={(e) => handleFilterChange('instantBooking', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              )}

              {listingType === 'rent' && (
                <>
                  <div className="space-y-2">
                    <Label className="font-normal">{t('furnished') || 'Furnished'}</Label>
                    <Select value={filters.furnished || "all"} onValueChange={(value) => handleFilterChange('furnished', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('all') || 'All'}</SelectItem>
                        <SelectItem value="yes">{t('furnished') || 'Furnished'}</SelectItem>
                        <SelectItem value="semi">{t('semi_furnished') || 'Semi-Furnished'}</SelectItem>
                        <SelectItem value="no">{t('unfurnished') || 'Unfurnished'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">{t('deposit_required') || 'Deposit required'}</Label>
                    <input
                      type="checkbox"
                      checked={filters.depositRequired || false}
                      onChange={(e) => handleFilterChange('depositRequired', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </>
              )}

              {listingType === 'buy' && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">{t('financing_available') || 'Financing available'}</Label>
                    <input
                      type="checkbox"
                      checked={filters.financingAvailable || false}
                      onChange={(e) => handleFilterChange('financingAvailable', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">{t('newBuild') || 'New build'}</Label>
                    <input
                      type="checkbox"
                      checked={filters.newBuild || false}
                      onChange={(e) => handleFilterChange('newBuild', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between items-center border-t pt-4">
          <Button variant="ghost" onClick={clearFilters} className="text-sm underline">
            {t('clearAll') || 'Clear all'}
          </Button>
          <Button onClick={() => setIsOpen(false)} className="px-8">
            {t('showResults') || 'Show results'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFilters;