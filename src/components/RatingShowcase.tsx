import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Sparkles, CheckCircle, MessageCircle, MapPin, Tag, Key } from "lucide-react";

interface RatingShowcaseProps {
  reviews: Array<{ rating: number }>;
  averageRating: number;
  totalReviews: number;
  categoryRatings?: {
    cleanliness?: number;
    accuracy?: number;
    checkin?: number;
    communication?: number;
    location?: number;
    value?: number;
  };
  showBadge?: boolean;
}

export const RatingShowcase = ({ 
  reviews, 
  averageRating, 
  totalReviews,
  categoryRatings,
  showBadge = false 
}: RatingShowcaseProps) => {
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
    { key: "checkin", label: "Check-in", icon: Key, rating: categoryRatings?.checkin || 0 },
    { key: "communication", label: "Communication", icon: MessageCircle, rating: categoryRatings?.communication || 0 },
    { key: "location", label: "Location", icon: MapPin, rating: categoryRatings?.location || 0 },
    { key: "value", label: "Value", icon: Tag, rating: categoryRatings?.value || 0 },
  ];

  return (
    <Card className="border-2 shadow-xl overflow-hidden">
      {/* Hero Rating Section with Badge */}
      {showBadge && averageRating >= 4.5 && totalReviews >= 5 && (
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 px-6 border-b">
          {/* Decorative laurel wreaths */}
          <div className="absolute top-1/2 left-8 -translate-y-1/2 text-6xl opacity-20">🌿</div>
          <div className="absolute top-1/2 right-8 -translate-y-1/2 text-6xl opacity-20 scale-x-[-1]">🌿</div>
          
          <div className="text-center relative z-10">
            <div className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full mb-4 font-semibold text-sm shadow-lg">
              ⭐ Guest Favourite
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Star className="w-12 h-12 fill-primary text-primary" />
              <span className="text-6xl font-bold text-primary">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-muted-foreground text-lg">
              One of the most loved homes on Holibayt, according to guests
            </p>
          </div>
        </div>
      )}

      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Side: Overall Rating Distribution */}
          <div className="space-y-6">
            <div className="flex items-baseline gap-3 mb-6">
              <Star className="w-8 h-8 fill-primary text-primary" />
              <h3 className="text-3xl font-bold">{averageRating.toFixed(1)}</h3>
              <span className="text-muted-foreground text-lg">· {total} reviews</span>
            </div>

            <div className="space-y-4">
              {ratingLevels.map((level) => {
                const count = distribution[level as keyof typeof distribution];
                const percentage = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 min-w-[60px]">
                        <span className="font-semibold text-base">{level}</span>
                        <Star className="w-4 h-4 fill-primary text-primary" />
                      </div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-3" />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Category Ratings */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Category Ratings</h3>
            <div className="grid grid-cols-1 gap-6">
              {categories.map((category) => {
                const Icon = category.icon;
                const percentage = (category.rating / 5) * 100;
                
                return (
                  <div key={category.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-base">{category.label}</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">{category.rating.toFixed(1)}</span>
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
