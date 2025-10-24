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
  Landmark,         // Terrace / Balcony / Tour Guide
  Zap,              // Microwave
  Thermometer,      // Sauna
  Accessibility,    // Wheelchair Access
  Leaf,             // Garden
  Shield,           // Bodyguard / Halal
  Broom             // Housekeeper
} from "lucide-react";

type Props = {
  onAmenityClick: (amenityKey: string) => void;
  selectedAmenity?: string;
};

export const PopularAmenities = ({ onAmenityClick, selectedAmenity }: Props) => {
  const { t } = useLanguage();
  const getTitleOrFormatted = (key: string) => {
    const translation = t(key);
    return translation === key ? formatTranslationKey(key) : translation;
  };

  // Holibayt – Services & Amenities (no coffeemaker)
  const items = useMemo(
    () => [
      // Services
      { key: "housekeeper", icon: Broom, label: "Housekeeper" },
      { key: "cook", icon: UtensilsCrossed, label: "Cook" },
      { key: "privateDriver", icon: Car, label: "Private Driver" },
      { key: "tourGuide", icon: Landmark, label: "Tour Guide" },
      { key: "bodyguard", icon: Shield, label: "Bodyguard" },
      { key: "ritualSlaughtererHalal", icon: Shield, label: "Ritual Slaughterer (Halal)" },

      // Essentials
      { key: "swimmingPool", icon: Waves, label: "Swimming Pool" },
      { key: "airConditioning", icon: Wind, label: "Air Conditioning" },
      { key: "jacuzzi", icon: Bath, label: "Jacuzzi" },
      { key: "internetAccess", icon: Wifi, label: "Internet Access" },
      { key: "washingMachine", icon: WashingMachine, label: "Washing Machine" },
      { key: "barbecue", icon: Flame, label: "Barbecue" },
      { key: "parking", icon: Car, label: "Parking" },
      { key: "dishwasher", icon: UtensilsCrossed, label: "Dishwasher" },
      { key: "terraceBalcony", icon: Landmark, label: "Terrace / Balcony" },
      { key: "microwave", icon: Zap, label: "Microwave" },
      { key: "sauna", icon: Thermometer, label: "Sauna" },
      { key: "fireplace", icon: Flame, label: "Fireplace" },
      { key: "wheelchairAccess", icon: Accessibility, label: "Wheelchair Access" },
      { key: "garden", icon: Leaf, label: "Garden" },
    ],
    []
  );

  // Rolling row with dots (pages of 6)
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 6;
  const pageCount = Math.ceil(items.length / perPage);

  const scrollTo = (p: number) => {
    setPage(p);
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: p * el.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const newPage = Math.round(el.scrollLeft / el.clientWidth);
    if (newPage !== page) setPage(newPage);
  };

  return (
    <div className="w-full py-8 bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
        <h2 className="text-3xl font-bold text-foreground mb-6 font-playfair">
          {getTitleOrFormatted("popular_amenities")}
        </h2>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="relative w-full overflow-x-auto no-scrollbar snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="flex w-full" style={{ width: `${pageCount * 100}%` }}>
            {Array.from({ length: pageCount }).map((_, i) => {
              const slice = items.slice(i * perPage, i * perPage + perPage);
              return (
                <div
                  key={i}
                  className="w-full flex-shrink-0 snap-start"
                  style={{ width: `${100 / pageCount}%` }}
                >
                  <div className="flex items-stretch gap-3">
                    {slice.map(({ key, icon: Icon, label }) => {
                      const active = selectedAmenity === key;
                      return (
                        <Card
                          key={key}
                          onClick={() => onAmenityClick(key)}
                          className={[
                            "flex-1 min-w-[170px] p-4 cursor-pointer transition-all duration-300",
                            "rounded-xl hover:shadow-lg hover:-translate-y-1",
                            active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent/50",
                          ].join(" ")}
                        >
                          <div className="flex flex-col items-center gap-2 text-center">
                            <Icon className={`h-6 w-6 ${active ? "text-primary-foreground" : "text-primary"}`} />
                            <span className={`text-sm font-medium ${active ? "text-primary-foreground" : "text-foreground"}`}>
                              {getTitleOrFormatted(label)}
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

        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${i === page ? "bg-primary" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
