import { School, Bus, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "./ui/badge";

interface NeighborhoodInsightsProps {
  city: string;
  location: string;
  district?: string;
}

export const NeighborhoodInsights = ({
  city,
  location,
  district
}: NeighborhoodInsightsProps) => {
  const { t } = useLanguage();

  const facilities = [
    { icon: School, label: t("schoolsNearby"), distance: "500m" },
    { icon: Bus, label: t("publicTransport"), distance: "200m" },
    { icon: ShoppingCart, label: t("shoppingCenters"), distance: "1km" }
  ];

  const neighborhoodDescription = t("neighborhoodDescriptionTemplate").replace('{{location}}', district || city);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("neighborhoodInsights")}</h2>
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {t("verifiedLocation")}
        </Badge>
      </div>

      <p className="text-muted-foreground leading-relaxed">
        {neighborhoodDescription}
      </p>

      {/* Nearby Facilities */}
      <div className="grid md:grid-cols-3 gap-4">
        {facilities.map((facility, idx) => {
          const Icon = facility.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{facility.label}</span>
                <span className="text-sm text-muted-foreground">{facility.distance}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
