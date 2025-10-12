import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface LocationInsightsProps {
  zoneName?: string;
  averagePrice?: number;
  topRatedCount?: number;
  safetyScore?: number;
  className?: string;
}

export const LocationInsights: React.FC<LocationInsightsProps> = ({
  zoneName,
  averagePrice,
  topRatedCount,
  safetyScore,
  className = ""
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // Simplified to 3 key insights
  const insights = [
    {
      icon: TrendingUp,
      label: t('averagePrice') || 'Average Price',
      value: averagePrice ? formatPrice(averagePrice) : 'N/A',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      icon: Star,
      label: t('topRated') || 'Top Rated',
      value: topRatedCount ? `${topRatedCount}+` : 'N/A',
      bgColor: 'bg-gold/10',
      iconColor: 'text-gold'
    },
    {
      icon: Shield,
      label: t('safetyScore') || 'Safety Score',
      value: safetyScore ? `${safetyScore}/100` : 'N/A',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary'
    }
  ];

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-cream to-background shadow-elegant ${className}`}>
      <CardContent className="p-6 space-y-6">
        {/* Header with Holibayt Index Badge */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            {zoneName ? `${zoneName}` : t('locationInsights') || 'Location Insights'}
          </h3>
          <Badge variant="default" className="bg-gradient-primary text-white font-semibold px-3 py-1">
            Holibayt Index™
          </Badge>
        </div>

        {/* Insights Grid - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-background/50 hover:bg-background transition-all duration-300 hover:shadow-md"
              >
                <div className={`${insight.bgColor} ${insight.iconColor} p-3 rounded-full mb-3`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {insight.label}
                </div>
                <div className="text-xl font-bold text-foreground">
                  {insight.value}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
