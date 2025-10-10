import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface RatingDistributionChartProps {
  reviews: Array<{ rating: number }>;
}

export const RatingDistributionChart = ({ reviews }: RatingDistributionChartProps) => {
  if (!reviews || reviews.length === 0) return null;

  // Calculate distribution
  const distribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const total = reviews.length;

  const ratingLevels = [5, 4, 3, 2, 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Star className="w-5 h-5 fill-primary text-primary" />
          Overall Rating Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratingLevels.map((level) => {
          const count = distribution[level as keyof typeof distribution];
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={level} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-[80px]">
                  <span className="font-medium">{level} stars</span>
                </div>
                <div className="flex-1 mx-4">
                  <Progress value={percentage} className="h-2" />
                </div>
                <span className="text-muted-foreground min-w-[60px] text-right">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Based on {total} review{total !== 1 ? 's' : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
