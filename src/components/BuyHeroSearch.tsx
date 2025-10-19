import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, DollarSign, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import buyHeroBg from "@/assets/buy-hero-bg.jpg";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SearchVals = {
  location?: string;
  type?: string;
  budget?: string | number;
};

type BuyHeroSearchProps = {
  /** Optional: parent-controlled search handler. If omitted, this component updates the URL itself. */
  onSearch?: (vals: SearchVals) => void;
};

const BuyHeroSearch: React.FC<BuyHeroSearchProps> = ({ onSearch }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    propertyType: "",
    budget: "",
  });

  // Scroll detection for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Populate the form from URL parameters whenever the URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(routerLocation.search);
    setFormData({
      location: urlParams.get("location") || "",
      propertyType: urlParams.get("type") || "",
      budget: urlParams.get("budget") || "",
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
    if (vals.location) qs.set("location", vals.location);
    if (vals.type) qs.set("type", String(vals.type));
    if (vals.budget) qs.set("budget", String(vals.budget));
    navigate(`/buy?${qs.toString()}`);
  };

  const handleSearch = () => {
    if (!isFormValid()) return;
    performSearch({
      location: formData.location,
      type: formData.propertyType,
      budget: formData.budget,
    });
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const SearchForm = ({ compact = false }: { compact?: boolean }) => {
    return (
      <form onSubmit={onSubmit} className={cn(
        "flex gap-3",
        compact ? "flex-col sm:flex-row flex-wrap" : "flex-col lg:flex-row gap-4"
      )}>
        <LocationAutocomplete
          value={formData.location}
          onChange={(value) => updateFormField("location", value)}
          placeholder={t("cityNeighborhood")}
          className={cn(
            "font-inter px-4",
            compact ? "h-12 text-sm w-full sm:flex-1 sm:min-w-[180px]" : "h-14 text-base flex-1 lg:min-w-[300px]"
          )}
        />
        
        <Select
          value={formData.propertyType}
          onValueChange={(value) => updateFormField("propertyType", value)}
        >
          <SelectTrigger className={cn(
            "font-inter bg-background border border-input px-4",
            compact ? "h-12 text-sm w-full sm:w-auto sm:min-w-[140px]" : "h-14 text-base w-full lg:w-[220px]"
          )}>
            <SelectValue placeholder={t("propertyType")} />
          </SelectTrigger>
          <SelectContent className="z-[100] bg-background">
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            <SelectItem value="apartment">{t("apartment")}</SelectItem>
            <SelectItem value="villa">{t("villa")}</SelectItem>
            <SelectItem value="house">{t("house")}</SelectItem>
            <SelectItem value="land">{t("land")}</SelectItem>
            <SelectItem value="commercial">{t("commercial")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <Input
            type="number"
            placeholder="DA"
            value={formData.budget}
            onChange={(e) => updateFormField("budget", e.target.value)}
            className={cn(
              "font-inter bg-background border border-input px-4",
              compact ? "h-12 text-sm w-full sm:w-auto sm:min-w-[140px]" : "h-14 text-base w-full lg:w-[220px]"
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={!isFormValid()}
          className={cn(
            "font-inter font-semibold transition-all duration-300",
            compact ? "h-12 px-6 text-sm w-full sm:w-auto" : "h-14 px-8 text-base w-full lg:w-auto",
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
  };

  return (
    <>
      {/* Sticky Search Bar */}
      <div className={cn(
        "hidden sm:block fixed top-16 left-0 right-0 z-40 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg border-b border-border/50",
        isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-primary">
              <Home className="h-5 w-5" />
              <span className="font-semibold text-sm">{t("buy")}</span>
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
          style={{ backgroundImage: `url(${buyHeroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-background/75 to-secondary/65" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Home className="h-6 w-6 text-white" />
              <span className="text-white font-semibold font-inter">{t("buy")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4 leading-tight">
              {t("buyHeroHeading")}
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

export default BuyHeroSearch;
