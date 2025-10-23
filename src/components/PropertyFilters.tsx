import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Filter, Minus, Plus, Wifi, Utensils, Waves, Wind, Flame, Car, Key, Zap, PawPrint, Award, Crown } from "lucide-react";
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
  
  // NEW FILTERS - COMMON
  bhkType: string[];
  furnishing: string[];
  parking: string[];
  
  // RENT SPECIFIC
  showVisitProperties: boolean;
  availability: string;
  preferredTenants: string[];
  showLeaseOnly: boolean;
  
  // BUY SPECIFIC
  propertyStatus: string;
  newBuilderProjects: boolean;
  
  // SHORT STAY SPECIFIC
  amenities: string[];
  bookingOptions: string[];
  standoutStays: string[];
  accessibilityFeatures: string[];
  hostLanguages: string[];
  
  // LEGACY
  verifiedOnly?: boolean;
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
    
    bhkType: [],
    furnishing: [],
    parking: [],
    
    showVisitProperties: false,
    availability: "all",
    preferredTenants: [],
    showLeaseOnly: false,
    
    propertyStatus: "all",
    newBuilderProjects: false,
    
    amenities: [],
    bookingOptions: [],
    standoutStays: [],
    accessibilityFeatures: [],
    hostLanguages: [],
    
    verifiedOnly: false,
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

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
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
      
      bhkType: [],
      furnishing: [],
      parking: [],
      
      showVisitProperties: false,
      availability: "all",
      preferredTenants: [],
      showLeaseOnly: false,
      
      propertyStatus: "all",
      newBuilderProjects: false,
      
      amenities: [],
      bookingOptions: [],
      standoutStays: [],
      accessibilityFeatures: [],
      hostLanguages: [],
      
      verifiedOnly: false,
      financingAvailable: false,
      newBuild: false,
      instantBooking: false,
      depositRequired: false
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setBedroomCount(0);
    setBathroomCount(0);
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
    if (filters.bhkType.length > 0) count++;
    if (filters.furnishing.length > 0) count++;
    if (filters.parking.length > 0) count++;
    if (filters.showVisitProperties) count++;
    if (filters.availability !== "all") count++;
    if (filters.preferredTenants.length > 0) count++;
    if (filters.showLeaseOnly) count++;
    if (filters.propertyStatus !== "all") count++;
    if (filters.newBuilderProjects) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.bookingOptions.length > 0) count++;
    if (filters.standoutStays.length > 0) count++;
    if (filters.accessibilityFeatures.length > 0) count++;
    if (filters.hostLanguages.length > 0) count++;
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
    { value: 'apartment', label: t('apartment') || 'Apartment' },
    { value: 'villa', label: t('villaFilter') || 'Independent House/Villa' },
    { value: 'gated', label: 'Gated Community Villa' },
    { value: 'standalone', label: 'Standalone Building' },
  ];

  const bhkTypes = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];

  const amenitiesData = [
    { value: 'wifi', label: 'Wifi', icon: Wifi },
    { value: 'kitchen', label: 'Kitchen', icon: Utensils },
    { value: 'washingMachine', label: 'Washer', icon: Waves },
    { value: 'dryer', label: 'Dryer', icon: Wind },
    { value: 'ac', label: 'Air conditioning', icon: Flame },
    { value: 'heating', label: 'Heating', icon: Flame },
  ];

  const FiltersContent = () => (
    <div className="space-y-6 py-4">
      {/* BHK Type - FOR RENT & BUY ONLY */}
      {(listingType === 'rent' || listingType === 'buy') && (
        <>
          <div className="space-y-3">
            <Label className="text-base font-semibold">BHK Type</Label>
            <div className="flex flex-wrap gap-2">
              {bhkTypes.map((bhk) => (
                <Button
                  key={bhk}
                  variant={filters.bhkType.includes(bhk) ? "default" : "outline"}
                  onClick={() => toggleArrayFilter('bhkType', bhk)}
                  size="sm"
                  className="rounded-full"
                >
                  {bhk}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Visit Properties - RENT ONLY */}
      {listingType === 'rent' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="font-normal">Show properties where owner is hosting a visit</Label>
              <Badge variant="secondary" className="text-xs">New</Badge>
            </div>
            <Checkbox
              checked={filters.showVisitProperties}
              onCheckedChange={(checked) => handleFilterChange('showVisitProperties', checked)}
            />
          </div>
          <Separator />
        </>
      )}

      {/* Availability - RENT ONLY */}
      {listingType === 'rent' && (
        <>
          <div className="space-y-3">
            <Label className="text-base font-semibold">Availability</Label>
            <RadioGroup value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="font-normal cursor-pointer">Immediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="within15" id="within15" />
                <Label htmlFor="within15" className="font-normal cursor-pointer">Within 15 Days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="within30" id="within30" />
                <Label htmlFor="within30" className="font-normal cursor-pointer">Within 30 Days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after30" id="after30" />
                <Label htmlFor="after30" className="font-normal cursor-pointer">After 30 Days</Label>
              </div>
            </RadioGroup>
          </div>
          <Separator />
        </>
      )}

      {/* Preferred Tenants - RENT ONLY */}
      {listingType === 'rent' && (
        <>
          <div className="space-y-3">
            <Label className="text-base font-semibold">Preferred Tenants</Label>
            <div className="space-y-2">
              {['Family', 'Company', 'Bachelor Male', 'Bachelor Female'].map(tenant => (
                <div key={tenant} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.preferredTenants.includes(tenant)}
                    onCheckedChange={() => toggleArrayFilter('preferredTenants', tenant)}
                    id={tenant}
                  />
                  <Label htmlFor={tenant} className="font-normal cursor-pointer">{tenant}</Label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Type of place */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">{t('propertyType') || 'Property Type'}</Label>
        <div className="space-y-2">
          {propertyTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                checked={filters.propertyType === type.value}
                onCheckedChange={() => handleFilterChange('propertyType', type.value)}
                id={type.value}
              />
              <Label htmlFor={type.value} className="font-normal cursor-pointer">{type.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Furnishing - RENT & BUY */}
      {(listingType === 'rent' || listingType === 'buy') && (
        <>
          <div className="space-y-3">
            <Label className="text-base font-semibold">Furnishing</Label>
            <div className="space-y-2">
              {['Full', 'Semi', 'None'].map(furn => (
                <div key={furn} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.furnishing.includes(furn)}
                    onCheckedChange={() => toggleArrayFilter('furnishing', furn)}
                    id={furn}
                  />
                  <Label htmlFor={furn} className="font-normal cursor-pointer">{furn}</Label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

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

      {/* Parking - RENT & BUY */}
      {(listingType === 'rent' || listingType === 'buy') && (
        <>
          <div className="space-y-3">
            <Label className="text-base font-semibold">Parking</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.parking.includes('2wheeler')}
                  onCheckedChange={() => toggleArrayFilter('parking', '2wheeler')}
                  id="2wheeler"
                />
                <Label htmlFor="2wheeler" className="font-normal cursor-pointer">2 Wheeler</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.parking.includes('4wheeler')}
                  onCheckedChange={() => toggleArrayFilter('parking', '4wheeler')}
                  id="4wheeler"
                />
                <Label htmlFor="4wheeler" className="font-normal cursor-pointer">4 Wheeler</Label>
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Rooms and beds */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">{t('Rooms And Beds') || 'Rooms and beds'}</Label>
        
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

      {/* Amenities - SHORT STAY ONLY */}
      {listingType === 'shortStay' && (
        <>
          <Separator />
          <div className="space-y-4">
            <Label className="text-base font-semibold">Amenities</Label>
            <div className="grid grid-cols-2 gap-3">
              {amenitiesData.map((amenity) => (
                <div key={amenity.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.amenities.includes(amenity.value)}
                    onCheckedChange={() => toggleArrayFilter('amenities', amenity.value)}
                    id={amenity.value}
                  />
                  <amenity.icon className="h-4 w-4" />
                  <Label htmlFor={amenity.value} className="font-normal cursor-pointer text-sm">{amenity.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Booking Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Booking options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.bookingOptions.includes('instantBook')}
                  onCheckedChange={() => toggleArrayFilter('bookingOptions', 'instantBook')}
                  id="instantBook"
                />
                <Zap className="h-4 w-4" />
                <Label htmlFor="instantBook" className="font-normal cursor-pointer">{t('instantBooking')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.bookingOptions.includes('selfCheckIn')}
                  onCheckedChange={() => toggleArrayFilter('bookingOptions', 'selfCheckIn')}
                  id="selfCheckIn"
                />
                <Key className="h-4 w-4" />
                <Label htmlFor="selfCheckIn" className="font-normal cursor-pointer">{t('selfCheckIn')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.bookingOptions.includes('pets')}
                  onCheckedChange={() => toggleArrayFilter('bookingOptions', 'pets')}
                  id="pets"
                />
                <PawPrint className="h-4 w-4" />
                <Label htmlFor="pets" className="font-normal cursor-pointer">Allows pets</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Standout Stays */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Standout stays</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.standoutStays.includes('guestFavourite')}
                  onCheckedChange={() => toggleArrayFilter('standoutStays', 'guestFavourite')}
                  id="guestFavourite"
                />
                <Award className="h-4 w-4" />
                <Label htmlFor="guestFavourite" className="font-normal cursor-pointer">{t('guestFavourite')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.standoutStays.includes('luxe')}
                  onCheckedChange={() => toggleArrayFilter('standoutStays', 'luxe')}
                  id="luxe"
                />
                <Crown className="h-4 w-4" />
                <Label htmlFor="luxe" className="font-normal cursor-pointer">Luxe</Label>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Show Only Lease Properties - RENT ONLY */}
      {listingType === 'rent' && (
        <>
          <Separator />
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.showLeaseOnly}
              onCheckedChange={(checked) => handleFilterChange('showLeaseOnly', checked)}
              id="showLeaseOnly"
            />
            <Label htmlFor="showLeaseOnly" className="font-normal cursor-pointer">Show Only Lease Properties</Label>
          </div>
        </>
      )}
    </div>
  );

  const PremiumFiltersContent = () => (
    <div className="space-y-6 py-4">
      {/* New Builder Projects - BUY ONLY */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="font-normal">New Builder Projects</Label>
          <Badge variant="secondary" className="text-xs">Offer</Badge>
        </div>
        <Checkbox
          checked={filters.newBuilderProjects}
          onCheckedChange={(checked) => handleFilterChange('newBuilderProjects', checked)}
        />
      </div>

      <Separator />

      {/* Property Status - BUY ONLY */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Property Status</Label>
        <RadioGroup value={filters.propertyStatus} onValueChange={(value) => handleFilterChange('propertyStatus', value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="underConstruction" id="underConstruction" />
            <Label htmlFor="underConstruction" className="font-normal cursor-pointer">Under Construction</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ready" id="ready" />
            <Label htmlFor="ready" className="font-normal cursor-pointer">Ready</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t("filters")}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs for Buy page only */}
        {listingType === 'buy' ? (
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="premium">Premium Filters</TabsTrigger>
            </TabsList>
            <TabsContent value="filters">
              <FiltersContent />
            </TabsContent>
            <TabsContent value="premium">
              <PremiumFiltersContent />
            </TabsContent>
          </Tabs>
        ) : (
          <FiltersContent />
        )}

        <DialogFooter className="flex-row justify-between items-center border-t pt-4">
          <Button variant="ghost" onClick={clearFilters} className="text-sm underline">
            {t('clearAll') || 'Clear All'}
          </Button>
          <Button onClick={() => setIsOpen(false)} className="px-8">
            {t('Show Results') || 'Show Results'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFilters;
