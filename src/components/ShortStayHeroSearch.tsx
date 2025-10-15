import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Search, Calendar as CalendarIcon, Bed } from "lucide-react";
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
  /** Optional: parent-controlled search handler. If omitted, this component updates the URL. */
  onSearch?: (vals: SearchVals) => void;
};

const parseISODate = (s?: string | null) => {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const ShortStayHeroSearch: React.FC<ShortStayHeroSearchProps> = ({ onSearch }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

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

  // Populate from URL whenever it changes
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

  return (
    <section className="relative pb-16 md:pb-24 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${shortStayHeroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/70 via-background/75 to-primary/65" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <Bed className="h-6 w-6 text-white" />
            <span className="text-white font-semibold font-inter">{t("shortStay")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4 leading-tight">
            {t("shortStayHeroHeading") || "Book trusted short stays across Algeria"}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-inter font-light max-w-3xl mx-auto leading-relaxed">
            {t("shortStayHeroSubtitle") || "Enjoy your trip with confidence, not uncertainty."}
          </p>
        </div>

        <Card className="max-w-6xl mx-auto p-6 md:p-8 bg-card/95 backdrop-blur-md border-border/30 shadow-elegant rounded-2xl">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Location Input with Autocomplete */}
              <LocationAutocomplete
                value={formData.location}
                onChange={(value) => updateFormField("location", value)}
                placeholder={t("stayDestination")}
                className="h-14 text-base font-inter"
              />

              {/* Guests Selector */}
              <div className="flex-1">
                <GuestsSelector
                  value={formData.guests}
                  onChange={(guests) => updateFormField("guests", guests)}
                />
              </div>

              {/* Property Type */}
              <div className="flex-1">
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
              {/* Check In */}
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-inter text-base h-14 bg-background border border-input",
                        !formData.dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      <span>
                        {formData.dateRange?.from
                          ? format(formData.dateRange.from, "dd/MM/yyyy")
                          : t("checkIn")}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DateRangePicker
                      value={formData.dateRange}
                      onChange={(range) => updateFormField("dateRange", range)}
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
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-inter text-base h-14 bg-background border border-input",
                        !formData.dateRange?.to && "text-muted-foreground"
                      )}
                      disabled={!formData.dateRange?.from}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      <span>
                        {formData.dateRange?.to
                          ? format(formData.dateRange.to, "dd/MM/yyyy")
                          : t("checkOut")}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DateRangePicker
                      value={formData.dateRange}
                      onChange={(range) => updateFormField("dateRange", range)}
                      allowPast={false}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                disabled={!isFormValid()}
                className={cn(
                  "h-14 px-8 font-inter font-semibold text-base transition-all duration-300 min-w-[140px]",
                  isFormValid()
                    ? "bg-gradient-primary hover:shadow-elegant text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Search className="mr-2 h-5 w-5" />
                {t("search")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default ShortStayHeroSearch;
