import { TrendingUp, Star, MapPin, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";

interface LocationInsightsProps {
  zoneName?: string;
  averagePrice?: number;
  topRatedCount?: number;
  safetyScore?: number;
  className?: string;
}

export const LocationInsights = ({ 
  zoneName = "this area",
  averagePrice = 8500,
  topRatedCount = 12,
  safetyScore = 8.5,
  className = '' 
}: LocationInsightsProps) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const insights = [
    {
      icon: TrendingUp,
      label: t('averageNightlyPrice') || 'Average nightly price',
      value: formatPrice(averagePrice, 'daily', 'DZD'),
      color: 'text-primary'
    },
    {
      icon: Star,
      label: t('topRatedStaysNearby') || 'Top-rated stays nearby',
      value: `${topRatedCount}+`,
      color: 'text-amber-600 dark:text-amber-400'
    },
    {
      icon: MapPin,
      label: t('localAttractions') || 'Local attractions',
      value: t('withinMinutes') || 'Within 15 min',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Shield,
      label: t('safetyScore') || 'Safety score',
      value: `${safetyScore}/10`,
      color: 'text-green-600 dark:text-green-400',
      badge: t('holibaytIndex') || 'Holibayt Index™'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-playfair">
          <MapPin className="h-5 w-5 text-primary" />
          {t('locationInsights') || 'Location Insights'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className={`p-2 rounded-lg bg-background ${insight.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{insight.label}</p>
                  <p className="font-semibold text-foreground">{insight.value}</p>
                  {insight.badge && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {insight.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
