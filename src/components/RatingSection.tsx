import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Sparkles, CheckCircle, MessageCircle, MapPin, Tag, Key } from "lucide-react";

interface RatingSectionProps {
  reviews: Array<{ rating: number }>;
  categoryRatings?: {
    cleanliness?: number;
    accuracy?: number;
    checkin?: number;
    communication?: number;
    location?: number;
    value?: number;
  };
}

export const RatingSection = ({ reviews, categoryRatings }: RatingSectionProps) => {
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

  const categories = [
    { key: "cleanliness", label: "Cleanliness", icon: Sparkles, rating: categoryRatings?.cleanliness || 0 },
    { key: "accuracy", label: "Accuracy", icon: CheckCircle, rating: categoryRatings?.accuracy || 0 },
    { key: "checkin", label: "Check In", icon: Key, rating: categoryRatings?.checkin || 0 },
    { key: "communication", label: "Communication", icon: MessageCircle, rating: categoryRatings?.communication || 0 },
    { key: "location", label: "Location", icon: MapPin, rating: categoryRatings?.location || 0 },
    { key: "value", label: "Value", icon: Tag, rating: categoryRatings?.value || 0 },
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Star className="w-6 h-6 fill-primary text-primary" />
          Guest Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Overall Rating Distribution */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Overall Rating</h3>
            {ratingLevels.map((level) => {
              const count = distribution[level as keyof typeof distribution];
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={level} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 min-w-[60px]">
                      <span className="font-medium text-sm">{level}</span>
                      <Star className="w-3 h-3 fill-primary text-primary" />
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[70px] text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 text-sm text-muted-foreground">
              Based on {total} review{total !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Right Side: Category Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Category Ratings</h3>
            <div className="grid grid-cols-1 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const percentage = (category.rating / 5) * 100;
                
                return (
                  <div key={category.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{category.label}</span>
                      </div>
                      <span className="text-lg font-bold">{category.rating.toFixed(1)}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
