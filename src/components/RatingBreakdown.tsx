import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Sparkles, CheckCircle, MessageCircle, MapPin, Tag } from "lucide-react";
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
    { key: "value", label: "Value", icon: Tag, rating: categoryRatings?.value || 0 },
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Category Ratings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const percentage = (category.rating / 5) * 100;
            
            return (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <span className="text-lg font-bold">{category.rating.toFixed(1)}</span>
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