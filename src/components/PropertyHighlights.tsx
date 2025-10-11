import { Bed, Bath, Maximize, Home, Shield, Trees, Waves, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyHighlightsProps {
  bedrooms?: string;
  bathrooms?: string;
  area: string;
  features?: {
    private_garden?: boolean;
    sea_view?: boolean;
    verified_owner?: boolean;
  };
  category: string;
}

export const PropertyHighlights = ({
  bedrooms,
  bathrooms,
  area,
  features,
  category
}: PropertyHighlightsProps) => {
  const { t } = useLanguage();

  const highlights = [
    bedrooms && {
      icon: Bed,
      label: t("bedrooms"),
      value: bedrooms
    },
    bathrooms && {
      icon: Bath,
      label: t("bathrooms"),
      value: bathrooms
    },
    {
      icon: Maximize,
      label: "m²",
      value: area
    },
    features?.private_garden && {
      icon: Trees,
      label: t("privateGarden"),
      value: null
    },
    features?.sea_view && {
      icon: Waves,
      label: t("seaView"),
      value: null
    },
    features?.verified_owner && {
      icon: Shield,
      label: t("verifiedOwner"),
      value: null
    }
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {highlights.map((highlight, idx) => {
        if (!highlight) return null;
        const Icon = highlight.icon;
        
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              {highlight.value && (
                <span className="text-lg font-semibold">{highlight.value}</span>
              )}
              <span className="text-sm text-muted-foreground">{highlight.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
