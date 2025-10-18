import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, DollarSign, Key, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import rentHeroBg from "@/assets/rent-hero-bg.jpg";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SearchVals = {
  location?: string;
  type?: string;
  maxRent?: string | number;
};

type RentHeroSearchProps = {
  onSearch?: (vals: SearchVals) => void;
};

const RentHeroSearch: React.FC<RentHeroSearchProps> = ({ onSearch }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    housingType: "",
    maxRent: "",
  });

  // Scroll detection for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(routerLocation.search);
    setFormData({
      location: urlParams.get("location") || "",
      housingType: urlParams.get("type") || "",
      maxRent: urlParams.get("maxRent") || "",
    });
  }, [routerLocation.search]);

  const updateFormField = (field: keyof typeof formData, value: string) => {
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
    if (vals.type) qs.set("type", String(vals.type));
    if (vals.maxRent) qs.set("maxRent", String(vals.maxRent));
    navigate(`/rent?${qs.toString()}`);
  };

  const handleSearch = () => {
    if (!isFormValid()) return;
    performSearch({
      location: formData.location,
      type: formData.housingType,
      maxRent: formData.maxRent,
    });
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const SearchForm = ({ compact = false }: { compact?: boolean }) => (
    <form onSubmit={onSubmit} className={cn(
      "flex gap-4",
      compact ? "flex-row items-center" : "flex-col lg:flex-row"
    )}>
      <LocationAutocomplete
        value={formData.location}
        onChange={(value) => updateFormField("location", value)}
        placeholder={t("whereToRent")}
        className={cn(
          "font-inter",
          compact ? "h-11 text-sm flex-1" : "h-14 text-base"
        )}
      />

      <Select value={formData.housingType} onValueChange={(value) => updateFormField("housingType", value)}>
        <SelectTrigger className={cn("text-sm", compact ? "h-11 w-[140px]" : "h-14 w-full text-base")}>
          <SelectValue placeholder={t("housingType")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apartment">{t("apartment")}</SelectItem>
          <SelectItem value="house">{t("house")}</SelectItem>
          <SelectItem value="studio">{t("studio")}</SelectItem>
          <SelectItem value="room">{t("room")}</SelectItem>
        </SelectContent>
      </Select>

      <div className={cn("relative", compact ? "w-[140px]" : "flex-1")}>
        <DollarSign className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          compact ? "h-4 w-4" : "h-5 w-5"
        )} />
        <Input
          type="text"
          placeholder={t("maxRentMonth")}
          className={cn(
            "pl-12 font-inter",
            compact ? "h-11 text-sm" : "h-14 text-base"
          )}
          value={formData.maxRent}
          onChange={(e) => updateFormField("maxRent", e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={!isFormValid()}
        className={cn(
          "font-inter font-semibold transition-all duration-300 flex items-center justify-center",
          compact ? "h-11 px-6 text-sm" : "h-14 px-8 text-base min-w-[140px]",
          isFormValid()
            ? "bg-gradient-primary hover:shadow-elegant text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        )}
      >
        <Search className={cn("mr-2", compact ? "h-4 w-4" : "h-5 w-5")} />
        {t("search")}
      </Button>
    </form>
  );

  return (
    <>
      {/* Sticky Search Bar */}
      <div className={cn(
        "fixed top-16 left-0 right-0 z-40 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg border-b border-border/50",
        isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Home className="h-5 w-5" />
              <span className="font-semibold text-sm">{t("rent")}</span>
            </div>
            <div className="flex-1">
              <SearchForm compact />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${rentHeroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/70 via-background/75 to-primary/65" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Key className="h-6 w-6 text-white" />
              <span className="text-white font-semibold font-inter">{t("rent")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4 leading-tight">
              {t("rentHeroHeading")}
            </h1>
          </div>

          <div className="w-full max-w-5xl mx-auto">
            <Card className="w-full p-6 md:p-8 bg-card/95 backdrop-blur-md border-border/30 shadow-elegant rounded-2xl">
              <SearchForm />
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default RentHeroSearch;
