import { Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GuestFavouriteBadgeProps {
  rating: number;
  reviewCount: number;
}

export const GuestFavouriteBadge = ({ rating, reviewCount }: GuestFavouriteBadgeProps) => {
  if (!rating || reviewCount < 5) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-center justify-center gap-8">
          {/* Left Laurel */}
          <div className="hidden sm:block">
            <Award className="w-16 h-16 text-primary/30" />
          </div>

          {/* Center Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 fill-primary text-primary" />
              <span className="text-6xl font-bold text-foreground">{rating.toFixed(1)}</span>
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-1">Guest favourite</h3>
            <p className="text-muted-foreground">
              One of the most loved properties on Holibayt, based on {reviewCount} reviews
            </p>
          </div>

          {/* Right Laurel */}
          <div className="hidden sm:block">
            <Award className="w-16 h-16 text-primary/30 transform scale-x-[-1]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};