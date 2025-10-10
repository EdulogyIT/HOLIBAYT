import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Sparkles, CheckCircle, MessageCircle, MapPin, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RatingBreakdownProps {
  averageRating: number;
  categoryRatings?: {
    cleanliness?: number;
    accuracy?: number;
    checkin?: number;
    communication?: number;
    location?: number;
    value?: number;
  };
}

export const RatingBreakdown = ({ averageRating, categoryRatings }: RatingBreakdownProps) => {
  const categories = [
    { key: "cleanliness", label: "Cleanliness", icon: Sparkles, rating: categoryRatings?.cleanliness || 0 },
    { key: "accuracy", label: "Accuracy", icon: CheckCircle, rating: categoryRatings?.accuracy || 0 },
    { key: "checkin", label: "Check-in", icon: Star, rating: categoryRatings?.checkin || 0 },
    { key: "communication", label: "Communication", icon: MessageCircle, rating: categoryRatings?.communication || 0 },
    { key: "location", label: "Location", icon: MapPin, rating: categoryRatings?.location || 0 },
    { key: "value", label: "Value", icon: DollarSign, rating: categoryRatings?.value || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Star className="w-6 h-6 fill-primary text-primary" />
          {averageRating.toFixed(1)} · Rating Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const percentage = (category.rating / 5) * 100;
            
            return (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{category.rating.toFixed(1)}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};