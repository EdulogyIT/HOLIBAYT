import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardMetricCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  onClick?: () => void;
  badge?: {
    text: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  sparklineData?: number[];
}

export function DashboardMetricCard({
  title,
  value,
  change,
  icon: Icon,
  onClick,
  badge,
  sparklineData,
}: DashboardMetricCardProps) {
  return (
    <Card 
      className={`transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge variant={badge.variant} className="text-xs">
              {badge.text}
            </Badge>
          )}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        )}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-3 h-8 flex items-end gap-0.5">
            {sparklineData.map((val, idx) => {
              const maxVal = Math.max(...sparklineData);
              const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-primary/20 rounded-sm transition-all hover:bg-primary/40"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
