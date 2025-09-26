import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, DollarSign, Key } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import rentHeroBg from "@/assets/rent-hero-bg.jpg";

type SearchVals = {
  location?: string;
  type?: string;
  maxRent?: string | number;
};

type RentHeroSearchProps = {
  /** Optional: parent-controlled search handler. If omitted, component updates the URL itself. */
  onSearch?: (vals: SearchVals) => void;
};

const RentHeroSearch: React.FC<RentHeroSearchProps> = ({ onSearch }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const [formData, setFormData] = useState({
    location: "",
    housingType: "",
    maxRent: "",
  });

  // Populate from URL whenever it changes
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

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${rentHeroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background/60 to-primary/70" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <Key className="h-6 w-6 text-white" />
            <span className="text-white font-semibold font-inter">{t("rent")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4 leading-tight">
            {t("findPerfectRental")}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-inter font-light max-w-3xl mx-auto leading-relaxed">
            {t("rentHeroDescription")}
          </p>
        </div>

        <Card className="max-w-5xl mx-auto p-6 md:p-8 bg-card/95 backdrop-blur-md border-border/30 shadow-elegant rounded-2xl">
          <form onSubmit={onSubmit} className="flex flex-col lg:flex-row gap-4">
            {/* Location Input */}
            <div className="flex-[2] relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder={t("whereToRent")}
                value={formData.location}
                onChange={(e) => updateFormField("location", e.target.value)}
                className="h-14 pl-12 text-base font-inter bg-background border border-input"
              />
            </div>

            {/* Housing Type */}
            <div className="flex-1">
              <select
                className="w-full h-14 px-4 py-3 bg-background border border-input rounded-md text-base font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ring-offset-background"
                value={formData.housingType}
                onChange={(e) => updateFormField("housingType", e.target.value)}
              >
                <option value="">{t("housingType")}</option>
                <option value="apartment">{t("apartment")}</option>
                <option value="house">{t("house")}</option>
                <option value="studio">{t("studio")}</option>
                <option value="room">{t("room")}</option>
              </select>
            </div>

            {/* Max Rent */}
            <div className="flex-1 relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder={t("maxRentMonth")}
                className="h-14 pl-12 text-base font-inter"
                value={formData.maxRent}
                onChange={(e) => updateFormField("maxRent", e.target.value)}
              />
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              disabled={!isFormValid()}
              className={cn(
                "h-14 px-8 font-inter font-semibold text-base transition-all duration-300 min-w-[140px] flex items-center justify-center",
                isFormValid()
                  ? "bg-gradient-primary hover:shadow-elegant text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              <Search className="mr-2 h-5 w-5" />
              {t("search")}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default RentHeroSearch;
