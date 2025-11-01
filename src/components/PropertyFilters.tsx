import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  SlidersHorizontal, Award, Car, Key, Waves, Zap, PawPrint, 
  Wifi, Wind, Tv, ChefHat, WashingMachine, X, ChevronDown, ChevronUp
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface FilterState {
  minPrice: number;
  maxPrice: number;
  propertyType: "all" | "room" | "entire" | string;
  guestFavorite: boolean;
  freeParking: boolean;
  selfCheckIn: boolean;
  pool: boolean;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  instantBook: boolean;
  petsAllowed: boolean;
  luxuryStay: boolean;
  accessibility: string[];
  hostLanguages: string[];
  propertyTypes: string[];
  location?: string;
  minArea?: string;
  maxArea?: string;
}

interface PropertyFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  listingType?: "buy" | "rent" | "shortStay";
  propertyCount?: number;
}

export const PropertyFilters = ({ onFilterChange, listingType = "shortStay", propertyCount = 0 }: PropertyFiltersProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: listingType === "shortStay" ? 50000 : listingType === "rent" ? 100000 : 50000000,
    propertyType: "all",
    guestFavorite: false,
    freeParking: false,
    selfCheckIn: false,
    pool: false,
    bedrooms: 0,
    beds: 0,
    bathrooms: 0,
    amenities: [],
    instantBook: false,
    petsAllowed: false,
    luxuryStay: false,
    accessibility: [],
    hostLanguages: [],
    propertyTypes: [],
    location: "",
    minArea: "",
    maxArea: "",
  });

  const getMaxPrice = () => {
    switch (listingType) {
      case "shortStay": return 50000;
      case "rent": return 100000;
      case "buy": return 50000000;
      default: return 50000;
    }
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const toggleArrayFilter = (key: "amenities" | "accessibility" | "hostLanguages" | "propertyTypes", value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const getLabel = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      minPrice: 0,
      maxPrice: getMaxPrice(),
      propertyType: "all",
      guestFavorite: false,
      freeParking: false,
      selfCheckIn: false,
      pool: false,
      bedrooms: 0,
      beds: 0,
      bathrooms: 0,
      amenities: [],
      instantBook: false,
      petsAllowed: false,
      luxuryStay: false,
      accessibility: [],
      hostLanguages: [],
      propertyTypes: [],
    };
    setFilters(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.minPrice > 0 || filters.maxPrice < getMaxPrice()) count++;
    if (filters.propertyType !== "all") count++;
    if (filters.guestFavorite || filters.freeParking || filters.selfCheckIn || filters.pool) count++;
    if (filters.bedrooms > 0 || filters.beds > 0 || filters.bathrooms > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.instantBook || filters.petsAllowed) count++;
    if (filters.luxuryStay) count++;
    if (filters.accessibility.length > 0) count++;
    if (filters.hostLanguages.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    return count;
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const recommendedFilters = [
    { key: "guestFavorite" as const, label: getLabel("guestFavorites", "Guest Favorites"), icon: Award },
    { key: "freeParking" as const, label: getLabel("freeParking", "Free Parking"), icon: Car },
    { key: "selfCheckIn" as const, label: getLabel("selfCheckIn", "Self Check-In"), icon: Key },
    { key: "pool" as const, label: getLabel("pool", "Pool"), icon: Waves },
  ];

  const essentialAmenities = [
    { key: "wifi", label: t("wifi") || "Wifi", icon: Wifi },
    { key: "airConditioning", label: t("airConditioning") || "Air Conditioning", icon: Wind },
    { key: "washer", label: t("washer") || "Washer", icon: WashingMachine },
    { key: "tv", label: t("tv") || "TV", icon: Tv },
    { key: "kitchen", label: t("kitchen") || "Kitchen", icon: ChefHat },
  ];

  const additionalAmenities = [
    { key: "dryer", label: t("dryer") || "Dryer" },
    { key: "heating", label: t("heating") || "Heating" },
    { key: "workspace", label: t("workspace") || "Dedicated Workspace" },
    { key: "hairDryer", label: t("hairDryer") || "Hair Dryer" },
    { key: "iron", label: t("iron") || "Iron" },
  ];

  const featureAmenities = [
    { key: "pool", label: t("pool") || "Pool" },
    { key: "freeParking", label: t("freeParking") || "Free Parking" },
    { key: "evCharger", label: t("evCharger") || "EV Charger" },
    { key: "crib", label: t("crib") || "Crib" },
    { key: "kingBed", label: t("kingBed") || "King Bed" },
    { key: "gym", label: t("gym") || "Gym" },
    { key: "bbq", label: t("bbq") || "BBQ Grill" },
    { key: "breakfast", label: t("breakfast") || "Breakfast" },
    { key: "fireplace", label: t("fireplace") || "Fireplace" },
    { key: "smokingAllowed", label: t("smokingAllowed") || "Smoking Allowed" },
  ];

  const safetyAmenities = [
    { key: "smokeAlarm", label: t("smokeAlarm") || "Smoke Alarm" },
    { key: "coAlarm", label: t("carbonMonoxideAlarm") || "Carbon Monoxide Alarm" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span>{t("filters") || "Filters"}</span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="default" className="ml-1 h-5 min-w-5 rounded-full px-1.5">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">{t("filters") || "Filters"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-8">
            {/* Recommendations */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{getLabel("ourRecommendations", "Our Recommendations")}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recommendedFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = filters[filter.key];
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => updateFilter(filter.key, !isActive)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:border-primary/50 ${
                        isActive ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs text-center font-medium">{filter.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{getLabel("propertyType", "Property Type")}</h3>
              <div className="flex gap-3">
                {(["all", "room", "entire"] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={filters.propertyType === type ? "default" : "outline"}
                    onClick={() => updateFilter("propertyType", type)}
                    className="flex-1"
                  >
                    {type === "all" ? getLabel("allTypes", "All Types") : 
                     type === "room" ? getLabel("room", "Room") : 
                     getLabel("entirePlace", "Entire Place")}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{getLabel("priceRange", "Price Range")}</h3>
              <p className="text-sm text-muted-foreground">{getLabel("priceDescription", "Drag the slider to set your budget range")}</p>
              
              <div className="h-20 bg-primary/5 rounded-lg flex items-end justify-around px-2 pb-2">
                {[...Array(20)].map((_, i) => {
                  const bucketSize = getMaxPrice() / 20;
                  const bucketMin = i * bucketSize;
                  const bucketMax = (i + 1) * bucketSize;
                  const isInRange = bucketMax >= filters.minPrice && bucketMin <= filters.maxPrice;
                  const heightPercent = Math.random() * 60 + 20;
                  
                  return (
                    <div 
                      key={i} 
                      className={`w-2 rounded-t transition-all duration-300 ${
                        isInRange ? 'bg-primary' : 'bg-primary/20'
                      }`}
                      style={{ height: `${heightPercent}%` }} 
                    />
                  );
                })}
              </div>

              <Slider
                min={0}
                max={getMaxPrice()}
                step={listingType === "buy" ? 1000000 : listingType === "rent" ? 1000 : 500}
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={(value) => {
                  updateFilter("minPrice", value[0]);
                  updateFilter("maxPrice", value[1]);
                }}
                className="my-4"
              />

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">{getLabel("minimum", "Minimum")}</label>
                  <Input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">{getLabel("maximum", "Maximum")}</label>
                  <Input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", parseInt(e.target.value) || getMaxPrice())}
                    placeholder={getMaxPrice().toString()}
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms and Beds */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{getLabel("roomsAndBeds", "Rooms and Beds")}</h3>
              
              {(["bedrooms", "beds", "bathrooms"] as const).map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {item === "bedrooms" ? getLabel("bedrooms", "Bedrooms") : 
                     item === "beds" ? getLabel("beds", "Beds") : 
                     getLabel("bathrooms", "Bathrooms")}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground min-w-[40px]">
                      {filters[item] === 0 ? getLabel("any", "Any") : filters[item]}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateFilter(item, Math.max(0, filters[item] - 1))}
                        disabled={filters[item] === 0}
                      >
                        -
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateFilter(item, filters[item] + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{getLabel("amenities", "Amenities")}</h3>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">{getLabel("essential", "Essential")}</h4>
                <div className="flex flex-wrap gap-2">
                  {essentialAmenities.map((amenity) => {
                    const isActive = filters.amenities.includes(amenity.key);
                    const Icon = amenity.icon;
                    return (
                      <Button
                        key={amenity.key}
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleArrayFilter("amenities", amenity.key)}
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {amenity.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {showAllAmenities && (
                <>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">{getLabel("basics", "Basics")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {additionalAmenities.map((amenity) => {
                        const isActive = filters.amenities.includes(amenity.key);
                        return (
                          <Button
                            key={amenity.key}
                            type="button"
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleArrayFilter("amenities", amenity.key)}
                          >
                            {amenity.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">{getLabel("features", "Features")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {featureAmenities.map((amenity) => {
                        const isActive = filters.amenities.includes(amenity.key);
                        return (
                          <Button
                            key={amenity.key}
                            type="button"
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleArrayFilter("amenities", amenity.key)}
                          >
                            {amenity.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">{getLabel("safety", "Safety")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {safetyAmenities.map((amenity) => {
                        const isActive = filters.amenities.includes(amenity.key);
                        return (
                          <Button
                            key={amenity.key}
                            type="button"
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleArrayFilter("amenities", amenity.key)}
                          >
                            {amenity.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => setShowAllAmenities(!showAllAmenities)}
              >
                {showAllAmenities ? (
                  <>
                    {getLabel("showLess", "Show Less")} <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    {getLabel("showMore", "Show More")} <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Booking Options */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{getLabel("bookingOptions", "Booking Options")}</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={filters.instantBook}
                    onCheckedChange={(checked) => updateFilter("instantBook", checked)}
                  />
                  <span className="text-sm">{getLabel("instantBook", "Instant Book")}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={filters.petsAllowed}
                    onCheckedChange={(checked) => updateFilter("petsAllowed", checked)}
                  />
                  <span className="text-sm">{getLabel("petsAllowed", "Pets Allowed")}</span>
                </label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t p-6 flex items-center justify-between">
          <Button variant="ghost" onClick={clearFilters}>
            {getLabel("clearAll", "Clear All")}
          </Button>
          <Button onClick={applyFilters} className="flex-1 max-w-xs">
            {getLabel("showProperties", "Show Properties")} ({propertyCount})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
