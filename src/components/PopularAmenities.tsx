// src/components/PopularAmenities.tsx
import { useMemo, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { formatTranslationKey } from "@/lib/utils";
import {
  Waves,            // Swimming Pool
  Wind,             // Air Conditioning
  Bath,             // Jacuzzi
  Wifi,             // Internet Access
  WashingMachine,   // Washing Machine
  Flame,            // Barbecue / Fireplace
  Car,              // Parking / Private Driver
  UtensilsCrossed,  // Cook / Dishwasher
  Landmark,         // Terrace / Balcony / Tour Guide (best available)
  Zap,              // Microwave
  Thermometer,      // Sauna
  Wheelchair,       // Wheelchair Access
  Leaf,             // Garden
  Shield,           // Bodyguard / Halal (badge-like)
  Broom             // Housekeeper
} from "lucide-react";

interface PopularAmenitiesProps {
  onAmenityClick: (amenityKey: string) => void;
  selectedAmenity?: string;
}

export const PopularAmenities = ({ onAmenityClick, selectedAmenity }: PopularAmenitiesProps) => {
  const { t } = useLanguage();

  const getTitleOrFormatted = (key: string) => {
    const translation = t(key);
    return translation === key ? formatTranslationKey(key) : translation;
  };

  // Holibayt – Services & Amenities (rolling)
  const items = useMemo(
    () => [
      // Types of Personalized Services
      { key: "housekeeper", icon: Broom, labelKey: "Housekeeper" },
      { key: "cook", icon: UtensilsCrossed, labelKey: "Cook" },
      { key: "privateDriver", icon: Car, labelKey: "Private Driver" },
      { key: "tourGuide", icon: Landmark, labelKey: "Tour Guide" },
      { key: "bodyguard", icon: Shield, labelKey: "Bodyguard" },
      { key: "ritualSlaughtererHalal", icon: Shield, labelKey: "Ritual Slaughterer (Halal)" },

      // Essential Filters
      { key: "swimmingPool", icon: Waves, labelKey: "Swimming Pool" },
      { key: "airConditioning", icon: Wind, labelKey: "Air Conditioning" },
      { key: "jacuzzi", icon: Bath, labelKey: "Jacuzzi" },
      { key: "internetAccess", icon: Wifi, labelKey: "Internet Access" },
      { key: "washingMachine", icon: WashingMachine, labelKey: "Washing Machine" },
      { key: "barbecue", icon: Flame, labelKey: "Barbecue" },
      { key: "parking", icon: Car, labelKey: "Parking" },
      { key: "dishwasher", icon: UtensilsCrossed, labelKey: "Dishwasher" },
      { key: "terraceBalcony", icon: Landmark, labelKey: "Terrace / Balcony" },
      { key: "microwave", icon: Zap, labelKey: "Microwave" },
      { key: "sauna", icon: Thermometer, labelKey: "Sauna" },
      { key: "fireplace", icon: Flame, labelKey: "Fireplace" },
      { key: "wheelchairAccess", icon: Wheelchair, labelKey: "Wheelchair Access" },
      { key: "garden", icon: Leaf, labelKey: "Garden" },
    ],
    []
  );

  // --- Rolling carousel (snap + dots) ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const chipsPerPage = 6; // how many cards visible per "page"
  const pageCount = Math.ceil(items.length / chipsPerPage);

  const scrollTo = (p: number) => {
    setPage(p);
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: p * el.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const newPage = Math.round(el.scrollLeft / el.clientWidth);
    if (newPage !== page) setPage(newPage);
  };

  return (
    <div className="w-full py-10 bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
        <h2 className="text-3xl font-bold text-foreground mb-6 font-playfair">
          {getTitleOrFormatted("popular_amenities")}
        </h2>

        {/* Rolling container */}
        <div
          ref={containerRef}
          onScroll={onScroll}
          className="relative w-full overflow-x-auto no-scrollbar snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="flex w-full" style={{ width: `${pageCount * 100}%` }}>
            {Array.from({ length: pageCount }).map((_, i) => {
              const slice = items.slice(i * chipsPerPage, i * chipsPerPage + chipsPerPage);
              return (
                <div
                  key={i}
                  className="w-full flex-shrink-0 snap-start"
                  style={{ width: `${100 / pageCount}%` }}
                >
                  <div className="flex items-stretch gap-3">
                    {slice.map(({ key, icon: Icon, labelKey }) => {
                      const isActive = selectedAmenity === key;
                      return (
                        <Card
                          key={key}
                          onClick={() => onAmenityClick(key)}
                          className={[
                            "flex-1 min-w-[170px] p-4 cursor-pointer transition-all duration-300",
                            "hover:shadow-lg hover:-translate-y-1",
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-lg"
                              : "bg-card hover:bg-accent/50",
                          ].join(" ")}
                        >
                          <div className="flex flex-col items-center gap-2 text-center">
                            <Icon className={`h-6 w-6 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                            <span className={`text-sm font-medium ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                              {getTitleOrFormatted(labelKey)}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to amenities page ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={[
                "h-2.5 w-2.5 rounded-full",
                i === page ? "bg-primary" : "bg-muted-foreground/30",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
