// src/components/ShortStayHeroSearch.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Search, Calendar, Bed, Home, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/DateRangePicker";
import { GuestsSelector } from "@/components/GuestsSelector";
import shortStayHeroBg from "@/assets/short-stay-hero-bg.jpg";
import LocationAutocomplete from "@/components/LocationAutocomplete";

type DateRange = { from?: Date; to?: Date };
type SearchVals = {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  travelers?: string | number;
  adults?: number;
  children?: number;
  infants?: number;
  pets?: number;
};

type ShortStayHeroSearchProps = {
  onSearch?: (vals: SearchVals) => void;
  onFilterClick?: () => void;
};

const parseISODate = (s?: string | null) => {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const ShortStayHeroSearch: React.FC<ShortStayHeroSearchProps> = ({ onSearch, onFilterClick }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isCompactCheckInOpen, setIsCompactCheckInOpen] = useState(false);

  const [formData, setFormData] = useState<{
    location: string;
    propertyType: string;
    dateRange: DateRange | undefined;
    guests: { adults: number; children: number; infants: number; pets: number };
  }>({
    location: "",
    propertyType: "",
    dateRange: undefined,
    guests: { adults: 1, children: 0, infants: 0, pets: 0 },
  });

  // Scroll detection for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200); // adjust threshold if you want later
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(routerLocation.search);
    const location = urlParams.get("location") || "";
    const checkIn = parseISODate(urlParams.get("checkIn"));
    const checkOut = parseISODate(urlParams.get("checkOut"));
    const adults = parseInt(urlParams.get("adults") || "1", 10);
    const children = parseInt(urlParams.get("children") || "0", 10);
    const infants = parseInt(urlParams.get("infants") || "0", 10);
    const pets = parseInt(urlParams.get("pets") || "0", 10);

    setFormData({
      location,
      propertyType: urlParams.get("type") || "",
      dateRange: checkIn || checkOut ? { from: checkIn, to: checkOut } : undefined,
      guests: { adults, children, infants, pets },
    });
  }, [routerLocation.search]);

  const updateFormField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => formData.location.trim() !== "";

  const performSearch = (vals: SearchVals) => {
    if (onSearch) {
      onSearch(vals);
      return;
    }
    const qs = new URLSearchParams();
    if (vals.location) qs.set("location", String(vals.location));
    if (formData.propertyType) qs.set("type", formData.propertyType);
    if (vals.checkIn) qs.set("checkIn", String(vals.checkIn));
    if (vals.checkOut) qs.set("checkOut", String(vals.checkOut));
    if (vals.adults) qs.set("adults", String(vals.adults));
    if (vals.children) qs.set("children", String(vals.children));
    if (vals.infants) qs.set("infants", String(vals.infants));
    if (vals.pets) qs.set("pets", String(vals.pets));
    navigate(`/short-stay?${qs.toString()}`);
  };

  const handleSearch = () => {
    if (!isFormValid()) return;
    performSearch({
      location: formData.location,
      checkIn: formData.dateRange?.from ? formData.dateRange.from.toISOString() : undefined,
      checkOut: formData.dateRange?.to ? formData.dateRange.to.toISOString() : undefined,
      adults: formData.guests.adults,
      children: formData.guests.children,
      infants: formData.guests.infants,
      pets: formData.guests.pets,
    });
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const SearchForm = ({ compact = false }: { compact?: boolean }) => {
    return (
      <form
        onSubmit={onSubmit}
        className={cn(
          "flex gap-2",
          compact 
            ? "flex-col sm:flex-row items-stretch sm:items-center" // Stack on mobile
            : "flex-col gap-4"
        )}
      >
        <LocationAutocomplete
          value={formData.location}
          onChange={(value) => updateFormField("location", value)}
          placeholder={t("stayDestination")}
          className={cn(
            "font-inter pr-3",
            compact 
              ? "h-12 text-sm w-full sm:flex-1 sm:min-w-[180px]" // Full width on mobile, flexible on desktop
              : "h-14 text-base flex-1 lg:min-w-[300px]"
          )}
        />

        {/* Compact: Date + Guests + Search + Filters in one row on mobile */}
        {compact ? (
          <div className={cn(
            "flex gap-2",
            "flex-row items-center" // Always horizontal for these controls
          )}>
            <Popover open={isCompactCheckInOpen} onOpenChange={setIsCompactCheckInOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-inter h-12 text-sm flex-1 sm:min-w-[140px] bg-background border border-input",
                    !formData.dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-xs sm:text-sm">
                    {formData.dateRange?.from && formData.dateRange?.to
                      ? `${format(formData.dateRange.from, "MMM dd")} - ${format(
                          formData.dateRange.to,
                          "MMM dd"
                        )}`
                      : "Dates"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="center" collisionPadding={10}>
                <DateRangePicker
                  value={formData.dateRange}
                  onChange={(range) => updateFormField("dateRange", range)}
                  allowPast={false}
                  onClose={() => setIsCompactCheckInOpen(false)}
                />
              </PopoverContent>
            </Popover>

            <div className="w-auto">
              <GuestsSelector
                value={formData.guests}
                onChange={(guests) => updateFormField("guests", guests)}
                keepOpen
              />
            </div>

            <Button
              type="submit"
              disabled={!isFormValid()}
              className={cn(
                "font-inter font-semibold transition-all duration-300 h-12 px-3 sm:px-6 text-sm flex-shrink-0",
                isFormValid()
                  ? "bg-gradient-primary hover:shadow-elegant text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("search")}</span>
            </Button>

            {/* Filters Button - Sticky with search bar */}
            {onFilterClick && (
              <Button
                type="button"
                variant="outline"
                onClick={onFilterClick}
                className="h-12 px-3 sm:px-4 border-2 flex-shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">{t("filters")}</span>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <GuestsSelector
                  value={formData.guests}
                  onChange={(guests) => updateFormField("guests", guests)}
                  keepOpen
                />
              </div>

              <div className="w-full lg:w-[220px]">
                <select
                  className="w-full h-14 px-4 py-3 bg-background border border-input rounded-md text-base font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ring-offset-background"
                  value={formData.propertyType}
                  onChange={(e) => updateFormField("propertyType", e.target.value)}
                >
                  <option value="">{t("propertyType")}</option>
                  <option value="apartment">{t("apartment")}</option>
                  <option value="house">{t("house")}</option>
                  <option value="villa">{t("villa")}</option>
                  <option value="studio">{t("studio")}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-inter text-base h-14 bg-background border border-input",
                        !formData.dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-3 h-5 w-5" />
                      <span>
                        {formData.dateRange?.from
                          ? format(formData.dateRange.from, "dd/MM/yyyy")
                          : t("checkIn")}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="center" collisionPadding={10}>
                    <DateRangePicker
                      value={formData.dateRange}
                      onChange={(range) => updateFormField("dateRange", range)}
                      allowPast={false}
                      onClose={() => setIsCheckInOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-inter text-base h-14 bg-background border border-input",
                        !formData.dateRange?.to && "text-muted-foreground"
                      )}
                      disabled={!formData.dateRange?.from}
                    >
                      <Calendar className="mr-3 h-5 w-5" />
                      <span>
                        {formData.dateRange?.to
                          ? format(formData.dateRange.to, "dd/MM/yyyy")
                          : t("checkOut")}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="center" collisionPadding={10}>
                    <DateRangePicker
                      value={formData.dateRange}
                      onChange={(range) => updateFormField("dateRange", range)}
                      allowPast={false}
                      onClose={() => setIsCheckOutOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </>
        )}

        {/* Non-compact: Full search button */}
        {!compact && (
          <Button
            type="submit"
            disabled={!isFormValid()}
            className={cn(
              "font-inter font-semibold transition-all duration-300 h-14 px-8 text-base min-w-[140px]",
              isFormValid()
                ? "bg-gradient-primary hover:shadow-elegant text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            <Search className="mr-2 h-5 w-5" />
            {t("search")}
          </Button>
        )}
      </form>
    );
  };

  return (
    <>
      {/* Sticky Search Bar - works on all screens now */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg border-b border-border/50",
          isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-primary">
              <Home className="h-5 w-5" />
              <span className="font-semibold text-sm">{t("shortStay")}</span>
            </div>
            <div className="flex-1 max-w-5xl">
              <SearchForm compact />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${shortStayHeroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/70 via-background/75 to-primary/65" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Bed className="h-6 w-6 text-white" />
              <span className="text-white font-semibold font-inter">{t("shortStay")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4 leading-tight">
              {t("shortStayHeroHeading") || "Book trusted short stays across Algeria"}
            </h1>
          </div>

          <div className="w-full max-w-6xl mx-auto">
            <Card className="w-full p-6 md:p-8 bg-card/95 backdrop-blur-md border-border/30 shadow-elegant rounded-2xl">
              <SearchForm />
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShortStayHeroSearch;
